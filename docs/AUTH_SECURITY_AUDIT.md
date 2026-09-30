# Rumr Production Gate 2A: Authentication, Sessions & Secrets Security Audit

**Document:** `docs/AUTH_SECURITY_AUDIT.md`  
**Target:** Rumr Production Identity & Authentication Mesh  
**Status:** COMPLETE (Gate 2A Acceptance Baseline)  
**Author:** Antigravity Autonomous Security Governor  

---

## Executive Summary

This security audit inspects Rumr's end-to-end authentication architecture, session management, secret handling, and identity lifecycles across backend routes, middleware, database adapters, services, frontend store, and UI views.

The audit identifies **6 critical security vulnerabilities** in the current implementation that block production launch:
1. **Hardcoded OTP Development Bypass (`482910`):** Present in `server/routes/auth.ts`, permitting arbitrary unauthorized login for demo/dev accounts.
2. **OTP Exposure in Response & Console:** The raw OTP code is returned in the API response under `dev_code` and logged via `console.log` in `server/routes/auth.ts` and `server/services/email.ts`.
3. **Hardcoded Fallback JWT Secret:** `server/config.ts` falls back to `'rumr-cryptographic-mesh-secret-key-2026-dpdp-ready'` if `process.env.JWT_SECRET` is unset.
4. **Resend Email Delivery Failure Masking:** In `server/services/email.ts`, if Resend dispatch fails or is unconfigured, it logs the code and returns `success: true, simulated: true`, allowing phantom auth sessions without real delivery.
5. **Lack of Invalidation on Superseded OTPs & Missing Verification Rate Limiting:** Requesting a second OTP leaves the first active in the database; failed verification attempts do not rate-limit by email; `/verify-otp` has no route-level rate limiter.
6. **Frontend Pre-populated Email & Error Masking:** `OnboardingView.tsx` pre-populates `alex.cipher@gmail.com` and provides a 1-tap demo shortcut; `src/lib/store.tsx` sets `isRegistered(true)` on API catch blocks.

---

## 1. Comprehensive 14-Point Authentication Audit

### 1. OTP Generation
- **Current Implementation:**
  - File: `server/routes/auth.ts` (Line 29)
  - Code: `const code = Math.floor(100000 + Math.random() * 900000).toString();`
- **Flaws Identified:**
  - Uses `Math.random()`, which is a pseudo-random number generator (PRNG) that is not cryptographically secure and is vulnerable to seed prediction.
- **Remediation Required:**
  - Replace with Node.js crypto module: `crypto.randomInt(100000, 1000000).toString()`.

### 2. OTP Persistence
- **Current Implementation:**
  - File: `server/routes/auth.ts` (Lines 30-41)
  - Tables: `auth_otps` (`id`, `email`, `otp_code_hash`, `expires_at`, `consumed`, `attempts`, `created_at`).
  - Hashing: `hashOtp(code)` calculates SHA-256 hex digest: `crypto.createHash('sha256').update(code).digest('hex')`.
- **Flaws Identified:**
  - While raw codes are hashed before storing in `auth_otps`, there is no HMAC keying or salt per tenant, though SHA-256 for short-lived 6-digit codes is standard if combined with attempt limiting and rate limiting.
  - Old active OTP records for the same email are NOT invalidated or marked superseded when a new OTP is generated. Multiple unexpired codes could theoretically exist concurrently.
- **Remediation Required:**
  - When creating a new OTP, mark all existing active OTP records for that email as consumed/invalidated (`invalidateActiveOtps(cleanEmail)`), enforcing **at most one active OTP per email**.

### 3. OTP Delivery
- **Current Implementation:**
  - File: `server/services/email.ts` (Lines 28-83)
  - Integration: Resend API client (`resend.emails.send`).
- **Flaws Identified:**
  - If Resend is unconfigured or returns an error, line 80-82 catches the error, logs the plaintext code to console, and returns `{ success: true, simulated: true }`.
  - Line 45 in `server/routes/auth.ts` logs `[RUMR_AUTH_SENTINEL] Verification code for ${cleanEmail}: ${code}`.
  - Line 53 in `server/routes/auth.ts` returns `dev_code: isDevOrDemo ? code : undefined` in the HTTP response JSON.
- **Remediation Required:**
  - Completely eliminate `dev_code` from the response JSON.
  - Completely eliminate all `console.log` statements containing raw OTPs or verification codes.
  - In production (`NODE_ENV === 'production'` or `VERCEL=1`), if Resend is unconfigured or email delivery fails, the transaction must fail, the created OTP must be deleted/invalidated, and an HTTP 502/503 error returned.

### 4. OTP Verification
- **Current Implementation:**
  - File: `server/routes/auth.ts` (Lines 61-91)
  - Endpoint: `POST /api/auth/verify-otp`
- **Flaws Identified:**
  - Lines 75-78 contain the development backdoor:
    ```typescript
    const isDevBypass = (!isSmtpConfigured || CONFIG.NODE_ENV !== 'production' || cleanEmail.includes('alex.cipher') || cleanEmail.includes('demo')) && cleanCode === '482910';
    const isValid = (otpRecord && otpRecord.otp_code_hash === codeHash) || isDevBypass;
    ```
  - If `otpRecord.attempts` has already reached or exceeded the maximum allowed attempts (e.g., 5), `findLatestActive` still returns it because the query only filters by `consumed = 0 AND expires_at > now()`.
- **Remediation Required:**
  - Delete `isDevBypass` and `482910` completely.
  - Enforce maximum attempts: if `otpRecord.attempts >= 5`, reject with `429 Too Many Attempts` and mark the OTP record as consumed.
  - Timing-safe comparison: use `crypto.timingSafeEqual()` for hash verification to prevent side-channel timing attacks.

### 5. Session / Token Creation
- **Current Implementation:**
  - File: `server/middleware/auth.ts` (Lines 39-41)
  - Method: `jwt.sign(payload, CONFIG.JWT_SECRET, { expiresIn: '30d' })`
  - Payload: `{ userId: string, handle: string, isGuest: boolean }`
- **Flaws Identified:**
  - `CONFIG.JWT_SECRET` falls back to `'rumr-cryptographic-mesh-secret-key-2026-dpdp-ready'`.
  - Token payload lacks issued-at explicit validation and session version / token revocation identifier.
- **Remediation Required:**
  - Require high-entropy `JWT_SECRET` (minimum 32 bytes/characters). Fail closed if absent in production.

### 6. Token Validation
- **Current Implementation:**
  - File: `server/middleware/auth.ts` (Lines 62-88)
  - Flow: Extracts Bearer token -> `jwt.verify(token, CONFIG.JWT_SECRET)` -> Queries database: `await db.users.findById(payload.userId)`.
- **Flaws Identified:**
  - If a user was deleted (e.g., under DPDP Right to Be Forgotten), `requireAuth` properly rejects with `401 USER_NOT_FOUND`.
  - Signature validation is checked by `jwt.verify`.
  - Malformed tokens properly throw and are caught as `INVALID_TOKEN`.

### 7. User Creation
- **Current Implementation:**
  - File: `server/routes/auth.ts` (Lines 93-124)
  - If `db.users.findByEmail(cleanEmail)` returns null, a new user is created with `is_verified: 1`, `is_guest: 0`, and a randomized anonymous handle.
- **Flaws Identified:**
  - User creation is atomic and respects database constraints.
  - Default chaos index: 88; default radius: 50km.

### 8. Guest Handling
- **Current Implementation:**
  - File: `server/routes/auth.ts` (Lines 150-196)
  - Endpoint: `POST /api/auth/guest`
  - Creates a guest record with `email: null`, `is_guest: 1`, and issues a 24h JWT.
  - Middleware: `requireRegistered` checks `req.user.is_guest === 1` and returns `403 GUEST_RESTRICTION`.
- **Flaws Identified:**
  - Guest records are created in `users` table with `is_guest: 1`.
  - Transition from guest to registered user: Currently, when a user verifies an email via `/verify-otp`, a separate user record is retrieved or created. If an existing guest user enters their email, the client simply replaces their token with the registered token.

### 9. Logout
- **Current Implementation:**
  - File: `server/routes/auth.ts` (Lines 306-308)
  - Code: `authRouter.post('/logout', (req, res) => { res.json({ success: true, message: 'Session terminated...' }); });`
  - Client: `src/lib/api.ts` removes `rumr_token` from `localStorage`.
- **Flaws Identified:**
  - The server does not maintain a token blacklist or revocation record in Redis. A stolen JWT remains valid until its 30-day expiration if intercepted.
- **Remediation Required:**
  - Provide server-side session termination via Redis token revocation blocklist when Redis is active, with TTL matching the token's remaining lifetime.

### 10. Protected Routes
- **Current Implementation:**
  - All mutating routes (`/api/users/me`, `/api/discovery/swipe`, `/api/chat/*`, `/api/unmask/*`, `/api/rooms/*`, `/api/boosts/purchase`, `/api/safety/*`) use `requireAuth`.
  - Routes requiring verified identity use `requireRegistered`.
  - All routes derive the acting user ID from `req.user!.id`, never trusting user-supplied body parameters.

### 11. Rate Limiting
- **Current Implementation:**
  - File: `server/middleware/rate-limiter.ts`
  - Uses an in-memory `Map` keyed by `${ip}:${req.path}`.
- **Flaws Identified:**
  - In-memory rate limiting is ephemeral and resets on serverless cold starts.
  - Rate limiting is only applied to `/send-otp` by IP (max 5 requests per 10 minutes).
  - `/send-otp` is NOT rate limited by target email (an attacker could spam multiple IPs targeting a single victim's inbox).
  - `/verify-otp` has NO endpoint rate limiting.
- **Remediation Required:**
  - Connect rate limiting to `redisService` (with in-memory fallback).
  - Enforce email-based rate limits (max 3 OTP requests per email per 15 minutes).
  - Enforce verification rate limits (max 5 failed attempts per OTP code, max 10 verification attempts per IP per 10 minutes).

### 12. Expiration
- **Current Implementation:**
  - Configured in `server/config.ts`: `OTP_EXPIRY_SECONDS: 600` (10 minutes).
  - Checked in database query: `gt('expires_at', nowIso)`.
- **Status:**
  - Expiration logic is functionally sound in queries.

### 13. Replay Prevention
- **Current Implementation:**
  - In `server/routes/auth.ts` line 89: `await db.authOtps.markConsumed(otpRecord.id)`.
  - Sets `consumed: 1`. Subsequent verification attempts fail because `findLatestActive` requires `consumed = 0`.
- **Status:**
  - Replay prevention for a single verified code is functional.

### 14. Error Handling
- **Current Implementation:**
  - Catches errors and forwards to `next(err)`.
- **Flaws Identified:**
  - Generic errors in `emailService.sendOtpEmail` were caught and suppressed, pretending success.
- **Remediation Required:**
  - Propagate delivery errors so the client receives an honest `EMAIL_DELIVERY_FAILED` status.

---

## 2. Static Keyword Search & Classification Table

Every requested keyword was searched across the entire repository. The classifications are documented below:

| Keyword | File Location | Line(s) | Classification | Description & Action Required |
| :--- | :--- | :---: | :--- | :--- |
| `482910` | `server/routes/auth.ts` | 75, 77 | **REAL PRODUCTION VIOLATION** | Hardcoded OTP fallback bypass. **Must be completely eliminated.** |
| `482910` | `tests/unmask.test.ts` | 14, 84 | **TEST-ONLY** | Vitest test helper payload. Update test setup to use token generator. |
| `482910` | `tests/topics.test.ts` | 11 | **TEST-ONLY** | Vitest test helper payload. Update test setup to use token generator. |
| `482910` | `tests/dpdp.test.ts` | 11 | **TEST-ONLY** | Vitest test helper payload. Update test setup to use token generator. |
| `482910` | `tests/discovery.test.ts` | 13 | **TEST-ONLY** | Vitest test helper payload. Update test setup to use token generator. |
| `482910` | `tests/chat.test.ts` | 13, 75 | **TEST-ONLY** | Vitest test helper payload. Update test setup to use token generator. |
| `dev_code` | `server/routes/auth.ts` | 53 | **REAL PRODUCTION VIOLATION** | API response returns raw OTP code. **Must be completely eliminated.** |
| `dev_code` | `src/lib/api.ts` | 103 | **REAL PRODUCTION VIOLATION** | Frontend API client type definition for `dev_code`. Eliminate field. |
| `dev_code` | `src/views/OnboardingView.tsx` | 123-124, 139-140 | **REAL PRODUCTION VIOLATION** | Auto-populates OTP from API response. **Must be completely eliminated.** |
| `dev_code` | `tests/auth.test.ts` | 22, 40 | **TEST-ONLY** | Asserts `dev_code` returned. Update to test via mock dispatch capture. |
| `alex.cipher` | `server/routes/auth.ts` | 48, 77 | **REAL PRODUCTION VIOLATION** | Special-case bypass condition for demo account. **Must be completely eliminated.** |
| `alex.cipher` | `src/views/OnboardingView.tsx` | 73, 134 | **REAL PRODUCTION VIOLATION** | Default initial email state and 1-tap shortcut. **Must be sanitized to `''`.** |
| `alex.cipher` | `src/views/ProfileView.tsx` | 405, 580 | **REAL PRODUCTION VIOLATION** | Hardcoded fallback for user email. Sanitize to user email or placeholder. |
| `rumr-cryptographic-...` | `server/config.ts` | 12 | **REAL PRODUCTION VIOLATION** | Hardcoded JWT fallback secret. **Eliminate fallback; fail closed in production.** |
| `rumr-cryptographic-...` | `.env.example` | 8 | **DOCUMENTATION** | Sample environment key in `.env.example`. |
| `OTP Logging` | `server/routes/auth.ts` | 45 | **REAL PRODUCTION VIOLATION** | `console.log` logs raw OTP to stdout. **Must be removed.** |
| `OTP Logging` | `server/services/email.ts` | 81 | **REAL PRODUCTION VIOLATION** | `console.log` logs raw OTP to stdout. **Must be removed.** |

---

## 3. Architectural Decision: Custom Rumr Auth vs. Supabase Auth

The prompt requires an objective architectural comparison between retaining/hardening Rumr's custom authentication mechanism vs. replacing it with Supabase Auth:

| Dimension | Hardened Custom Rumr Auth (Recommended) | Supabase Auth Migration |
| :--- | :--- | :--- |
| **Authentication Flow** | `POST /send-otp` -> Resend -> HMAC stored in `auth_otps` -> `POST /verify-otp` -> custom JWT. | `supabase.auth.signInWithOtp()` -> Supabase GoTrue sends email -> GoTrue session/JWT. |
| **Database Schema Impact** | **0 changes** to existing 17 public tables. Verified Gate 1.1 structure remains 100% intact. | **Severe Breaking Changes:** `users.id` would need to change from `TEXT` to `UUID REFERENCES auth.users(id)`. Foreign keys in all 16 dependent tables would need cascading migration. |
| **Guest / Anonymous Mesh Model** | **Native & Seamless:** Instant guest records created in `users` (`is_guest: 1`) with 24h JWT. Upgrades smoothly to verified user. | **Complex:** Requires configuring Supabase anonymous auth provider, handling GoTrue identity linking, and complex session swaps. |
| **Security Properties** | High-entropy crypto PRNG (`crypto.randomInt`), SHA-256 HMAC hash persistence, single active OTP invariant, attempt limiting (5), rate limiting via Redis, strict fail-closed JWT. | Standard GoTrue security, but requires managing external redirect URLs, dashboard email SMTP config, and GoTrue rate limits. |
| **Route & Middleware Impact** | **0 changes** to route contracts or middleware conventions (`req.user.id`). | Requires rewriting all route middleware to validate Supabase JWTs (via JWKS or Supabase JWT secret) and mapping UUIDs. |
| **Local Dev & Testing (CI)** | **Fully Self-Contained:** Runs offline with SQLite and Vitest without external Docker or GoTrue containers. | **Heavy CI Dependency:** Requires running local Supabase CLI with GoTrue Docker container or live network dependency for every unit test. |
| **Migration Risk & Cost** | **Low:** Hardening 4 localized files (`auth.ts`, `auth.middleware.ts`, `config.ts`, `email.ts`). | **Extremely High:** Full rewrite of auth, schema, 16 tables, 10 route files, client API, and store. |

### Architectural Verdict & Recommendation:
> **Retain and harden the existing Custom Rumr Auth architecture.**  
> Rumr's product premise relies heavily on anonymous mesh handles, progressive quarantine unmasking, and ephemeral guest interactions that map directly into its custom relational schema. Replacing this with Supabase Auth would introduce massive schema upheaval across 16 tables with zero additional security benefit over a properly hardened custom JWT + Resend OTP implementation.

---

## 4. Gate 2 Hardening Roadmap

### Phase 2B: Remove All OTP Bypasses & Leaks
- Eradicate `482910` and `isDevBypass` from `server/routes/auth.ts`.
- Remove `dev_code` from server response, client API types, and `OnboardingView.tsx`.
- Remove `alex.cipher@gmail.com` pre-population and 1-tap demo shortcut from `OnboardingView.tsx`.
- Remove all `console.log` statements that output raw OTP codes or emails.

### Phase 2C & 2D: Secure OTP Lifecycle & Real Resend Delivery
- Use `crypto.randomInt(100000, 1000000)` for cryptographically secure OTP generation.
- Enforce **supersession**: when an OTP is requested for an email, any existing unconsumed OTP for that email is immediately marked consumed/invalidated.
- Enforce **attempt limit**: max 5 failed verification attempts per OTP; upon 5th failure, OTP is marked consumed/expired.
- Require live Resend delivery in production. If Resend fails or is unconfigured in production, fail closed with HTTP 502 without creating an active OTP.

### Phase 2E: Comprehensive Rate Limiting
- Enforce IP-based rate limiting on `/send-otp` (max 5 per 10m) and `/verify-otp` (max 10 per 10m).
- Enforce email-based rate limits on `/send-otp` (max 3 per 15m) using `redisService` (with in-memory fallback for local dev).

### Phase 2F & 2G: JWT Secret & Session Hardening
- In `server/config.ts`, enforce that in production (`NODE_ENV === 'production'` or `VERCEL=1`), `JWT_SECRET` must exist, must NOT match the fallback string, and must be at least 32 characters. Fail closed immediately with fatal startup error if invalid.
- Add server-side logout token invalidation in Redis.

### Phase 2H & 2K: Authorization Boundaries & Frontend State Purity
- Verify acting user is derived strictly from `req.user.id`.
- In `src/lib/store.tsx`, remove fake fallback `setIsRegistered(true)` on API catch blocks. Ensure API failure leaves user in unauthenticated state.

### Phase 2L - 2N: Comprehensive Test Suite & Build Verification
- Update Vitest suites to use programmatic token creation helpers instead of the `482910` backdoor.
- Add security test matrix covering expired OTP, wrong OTP, exceeded attempts, superseded OTP, missing JWT secret, malformed token, and unauthorized cross-user access.
- Execute `npm test` and `npm run build`.
