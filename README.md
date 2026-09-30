# RUMR — Topic-First Social Mesh & Anonymous Discovery Network

<div align="center">

```
  ██████╗ ██╗   ██╗███╗   ███╗██████╗ 
  ██╔══██╗██║   ██║████╗ ████║██╔══██╗
  ██████╔╝██║   ██║██╔████╔██║██████╔╝
  ██╔══██╗██║   ██║██║╚██╔╝██║██╔══██╗
  ██║  ██║╚██████╔╝██║ ╚═╝ ██║██║  ██║
  ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝
```

**Don't swipe on people. Swipe on topics.**

[![Live Web App](https://img.shields.io/badge/Live%20App-Vercel-ccff00?style=for-the-badge&logo=vercel&logoColor=black)](https://rumr-sigma.vercel.app/)
[![Landing Page](https://img.shields.io/badge/Marketing%20Site-Live-a855f7?style=for-the-badge&logo=globe&logoColor=white)](https://rumr-sigma.vercel.app/landing.html)
[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-Passing%20(52%20Tests)-00c853?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/thakurcodeshere/Rumr/actions)
[![License](https://img.shields.io/badge/License-MIT-white?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![DPDP](https://img.shields.io/badge/DPDP%202023-Compliant-00e5ff?style=for-the-badge&logo=shield&logoColor=black)](SECURITY.md)

</div>

---

## ⚡ Executive Summary

**Rumr** is a topic-first social mesh and anonymous debate network built to address swipe fatigue, superficial profiling, and algorithmic echo chambers. 

Traditional social and dating platforms force people to evaluate staged selfies, corporate bios, and manufactured personas. Rumr flips the paradigm: users connect strictly based on **shared curiosities, intellectual friction, and unfiltered takes**—preserving absolute anonymity until progressive, bilateral mutual consent is established.

Built under the **Clean Chaos** design philosophy, Rumr provides a browser-first, zero-app-store web app with native mobile and tablet geolocation radar, live WebRTC audio debate podiums, verified rumor whisper decryption, and full DPDP (Digital Personal Data Protection Act) compliance.

---

## 🌐 Live Deployments & Endpoints

| Platform / Service | URL / Endpoint | Description |
| :--- | :--- | :--- |
| **Live Web Application** | **[rumr-sigma.vercel.app](https://rumr-sigma.vercel.app/)** | Instant Browser Web App across Mobile (360px+), Tablet & Desktop. Zero App Store friction. |
| **Dedicated Landing Website** | **[rumr-sigma.vercel.app/landing.html](https://rumr-sigma.vercel.app/landing.html)** | Standalone product marketing site with live metrics, architectural dispatches, and interactive modals. |
| **Production Health Sentinel** | **[`/api/health`](https://rumr-sigma.vercel.app/api/health)** | Unified 10-layer infrastructure status (Database, Redis, LiveKit, QStash, Resend, Sentry). |
| **Fail-Closed Readiness Probe** | **[`/api/ready`](https://rumr-sigma.vercel.app/api/ready)** | Automated probe reporting database latency and connection viability. |
| **GitHub Repository** | **[github.com/thakurcodeshere/Rumr](https://github.com/thakurcodeshere/Rumr)** | Master codebase, CI/CD pipelines, migration scripts, and documentation. |

---

## 🧠 Core Philosophy: The Clean Chaos System

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │ 01. Topic > Person        Match on thoughts and friction, not faces.  │
  │ 02. ≤ 3 Words Constraint  Hard token limits stop slander & distill takes│
  │ 03. 3-Layer Unmasking     Consent-governed bilateral identity reveal.  │
  │ 04. Ephemeral Telemetry   Zero-knowledge local state & auto message decay│
  └────────────────────────────────────────────────────────────────────────┘
```

1. **Topic-First Matching**: Users react to specific debate vectors and hot topics within their locality. You match with individuals who share deep philosophical alignment or compelling contrarian tension.
2. **The ≤ 3-Word Hard Constraint**: All user-created topic nodes are restricted to 3 words or fewer (*e.g., "Office Politics", "AI Layoffs Reality", "Ghosting Culture"*). Real-time token moderation stops targeted slander, transforming volatile impulses into structured debates.
3. **Progressive Mutual Unmasking Protocol**: Identity is never exposed upfront. It is unlocked strictly through a bilateral 3-stage quarantine consent handshake:
   - **Layer 1 (Signals)**: Demographic indicators (City & Professional Domain).
   - **Layer 2 (Resonance)**: Personal tagline, worldview quote, and Chaos Index compatibility score.
   - **Layer 3 (Reveal)**: Full portrait, verified handle/name, and direct communication channels.
4. **Zero-Knowledge Privacy & DPDP Compliance**: Radius filtering is processed locally or at the edge. Messages auto-decay with strict TTL (~5 minutes), and users retain immediate one-click rights to JSON data portability and irreversible erasure.

---

## 🛠️ Feature Matrix & Architecture Breakdown

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   RUMR ENGINE                                   │
├──────────────────────┬────────────────────────┬─────────────────────────────────┤
│ 1. DISCOVER FEED     │ 2. TOPICS & RUMRS      │ 3. MATCHES MATRIX               │
│ • 4-Vector Similarity│ • Topics & Audio Rooms │ • Overlapping Affinity Cards    │
│ • Proximity Sliders  │ • Rumrs & Whispr Leaks │ • Compatibility Percentiles     │
│ • Holographic Reveal │ • ≤ 3-Word Injector    │ • Direct Tunnel Launcher        │
├──────────────────────┼────────────────────────┼─────────────────────────────────┤
│ 4. ENCRYPTED CHAT    │ 5. AUDIO DEBATE STAGES │ 6. DUAL PROFILE "ME"            │
│ • Match List Inbox   │ • LiveKit WebRTC Rooms │ • Chaos Resonance Profile       │
│ • Pinned 3-Layer UI  │ • Host/Speaker Podium  │ • DPDP Privacy & Erasure Suite  │
│ • Ephemeral Auto-Decay│ • Redis Presence Ping │ • Browser Location Radar        │
└──────────────────────┴────────────────────────┴─────────────────────────────────┘
```

### 1. Browser-First Onboarding Pipeline
- **Zero App Store Barrier**: Instant onboarding directly in the browser with native mobile & tablet responsiveness.
- **Gmail OTP Authentication**: Streamlined verification code dispatch (with zero-config fallback bypass `482910` for offline dev/test).
- **Native Geolocation Permission Radar**: In-browser geolocation prompt with fallback city selector for location-sensitive debate matching without invasive tracking.
- **Collision-Proof Handle Generator**: Generates unique, non-colliding pseudonyms (`@anonymous_ghost_*`) preventing database unique constraint collisions.

### 2. Discover Feed Deck (Tab 1)
- **4-Vector Similarity Engine**: Switch dynamically between matching algorithms:
  - `Exact Match`: High-affinity debaters subscribed to the exact same topics.
  - `Related Topics`: Thematic adjacency within complementary domains.
  - `Balanced Chaos`: Curated mix of shared views and unexpected contrasts.
  - `Exploratory Contrarian`: Dialed-up ideological friction for vigorous intellectual debate.
- **Demographic & Proximity Filters**: Dual age sliders (18–45+), gender affinity toggles, and radius bounds (Nearby, City, Global).
- **Holographic Post-Match Reveal**: Holographic card with glitched avatar mask, `[SYNC_ESTABLISHED]` beacon, match score, and shared topic tags.
- **Sentinel AI Nudge**: Real-time modal warnings on volatile interactions to keep debates productive.

### 3. Topics & Rumrs Matrix (Tab 2)
- **Segment 1: Topics and Rooms**:
  - Live topic radar displaying active debater counts and heat scores.
  - Audience gating and capacity limits on debate nodes.
  - One-click topic subscription and direct access to live discussion stages.
- **Segment 2: Rumrs and Whispr**:
  - Verified community leaks and rumors from tech hubs, corporate environments, and social spheres.
  - Cryptographic blur overlay with progressive text decryption.
  - Binary community voting mechanism: `AGREE` vs `DEBATE`.
- **Custom Topic Node Injector**:
  - Hard ≤ 3-word validation engine.
  - Category assignment (*Tech, Workplace, Startups, Social, Spicy*).
  - Target destination selector (`Topics and Rooms` vs `Rumrs and Whispr`).

### 4. Matches Matrix (Tab 3)
- **Affinity Overview**: Centralized index of all mutual topic connections.
- **Resonance Indicators**: Displays compatibility percentages, shared topic chips, and current unmasking stages (Stage 0 to 3).
- **Instant Tunnel Initiator**: One-click transition into active encrypted 1-on-1 chat tunnels.

### 5. Encrypted Chat Frame & Pinned Unmasking
- **Match List Inbox**: Fast switching across all active conversations directly from the chat screen.
- **Pinned Mutual Identity Unmasking Block**: Pinned to the top of the chat view with a 3-step progress bar and interactive trigger.
- **Interactive 3-Layer Unmasking Modal (`MutualUnmaskingModal.tsx`)**: Progressive bilateral consent flow enforcing quarantine until both parties agree to reveal each layer.
- **Identity Decrypted Screen (`IdentityDecryptedModal.tsx`)**: Full decrypted card rendering verified handles, real portraits, demographic tags, and contact links upon reaching bilateral Stage 3 consent.
- **Ephemeral Message Auto-Decay**: Chat messages feature an automatic ~5-minute decay TTL, purged by background scheduled jobs.

### 6. LiveKit WebRTC Audio Debate Rooms (`RoomsView`)
- **Live Debate Podiums**: Real-time multi-user audio rooms powered by LiveKit Cloud WebRTC.
- **Stage Hierarchy**: Delineates Host, Speakers, and Listeners.
- **Hardware Integration**: Live microphone mute/unmute toggling with participant state broadcast.
- **Presence Engine**: Sub-millisecond participant presence tracking backed by Upstash Redis.

### 7. Dual-Profile "Me" Architecture (Tab 4)
- **Chaos Profile (Resonance)**: Visualizes user age badge, verified handle, connection counters, active rumors index, chaos score gauge, topic vault, and custom topic injector.
- **Profile Settings & Privacy Control**:
  - Global discovery radius adjustments.
  - Ghost Mode broadcasting toggle.
  - Blocked entity management.
  - **DPDP 2023 Compliance Center**: Instant JSON data portability export and permanent one-click Right to Erasure / Account Termination.

### 8. Dedicated Marketing Landing Website
- Standalone HTML5 / Tailwind marketing page served at `/landing.html` and embedded in the app.
- Features product showcase, live metrics tickers, store availability badges, architectural dispatches, and responsive legal modals.

---

## 💻 Tech Stack & Production Infrastructure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRODUCTION STACK OVERVIEW                         │
├─────────────────────┬──────────────────────────┬────────────────────────────┤
│ RUNTIME & FRAMEWORK │ PERSISTENCE & STORAGE    │ REAL-TIME & EPHEMERAL      │
│ • React 18.3.1      │ • Supabase PostgreSQL    │ • LiveKit Cloud (WebRTC)   │
│ • TypeScript 5.5.3  │ • SQLite WAL (Local/Test)│ • Upstash Redis (Presence) │
│ • Vite 5.4.3        │ • 17 Relational Tables   │ • Upstash QStash (Decay)   │
├─────────────────────┼──────────────────────────┼────────────────────────────┤
│ SECURITY & EDGE     │ COMMS & OBSERVABILITY    │ QUALITY & CI/CD            │
│ • Vercel Edge Server│ • Resend (Transactional) │ • GitHub Actions CI        │
│ • Cloudflare CDN    │ • Sentry Node & React    │ • Vitest (52 Tests Passed) │
│ • DPDP 2023 Shield  │ • Zero-Knowledge Crypto  │ • Concurrently & TSX       │
└─────────────────────┴──────────────────────────┴────────────────────────────┘
```

### Core Architecture Highlights

| Layer | Technology | Role & Implementation |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18 + TypeScript 5 + Vite** | Modular, type-safe client with Framer Motion animations and Neo-Brutalist design tokens. |
| **Dual Database Layer** | **Supabase PostgreSQL + SQLite WAL** | Abstracted through a unified `DatabaseAdapter`. Uses Supabase (17 tables, RLS) in production and SQLite WAL locally for zero-config dev/testing. |
| **Real-Time Audio** | **LiveKit Cloud WebRTC** | Signed cryptographic room tokens (`livekit-server-sdk`) enabling low-latency multi-speaker debate stages. |
| **Presence & Cache** | **Upstash Redis** | Sub-millisecond participant presence tracking and distributed state caching. |
| **Scheduled Jobs** | **Upstash QStash** | Automated background webhooks triggering ephemeral message decay and inactive participant pruning. |
| **Transactional Email** | **Resend** | Clean Chaos branded OTP verification emails and identity reveal alerts. |
| **Observability & Error Sentinel** | **Sentry (`@sentry/node`, `@sentry/react`)** | Dual-layer error capture, performance profiling, and fail-closed telemetry. |
| **Serverless Edge Entrypoint** | **Vercel Serverless (`/api/index.ts`)** | Clean serverless routing eliminating 405 Method Not Allowed errors across edge hosts. |
| **Edge Security & CDN** | **Cloudflare (`wrangler.toml`)** | Strict transport security (HSTS), Content Security Policy (CSP), and permission policies. |

---

## 📁 Repository Structure

```
Rumr/
├── .github/
│   └── workflows/
│       └── ci.yml                 # Automated CI/CD pipeline (Build, Typecheck, Test)
├── api/
│   └── index.ts                   # Vercel serverless function entrypoint
├── docs/
│   └── DB_MIGRATION_AUDIT.md      # Gate 1 database migration inventory & safety contract
├── public/
│   ├── landing.html               # Standalone marketing landing website
│   └── favicon.svg                # Brand icon
├── server/
│   ├── config.ts                  # Centralized configuration & environment loader
│   ├── index.ts                   # Express application & production sentinel healthcheck
│   ├── db/
│   │   ├── database.ts            # Factory providing Supabase or SQLite adapter
│   │   ├── interface.ts           # Unified typed DatabaseAdapter contract
│   │   ├── sqlite-db.ts           # Local SQLite implementation (WAL mode)
│   │   ├── supabase-db.ts         # Production Supabase PostgreSQL adapter
│   │   ├── supabase-migration.sql # 17 relational tables, indexes & RLS policies
│   │   ├── schema.sql             # Relational SQLite schema definition
│   │   └── seed.ts                # Test and development seed dataset
│   ├── middleware/
│   │   └── auth.ts                # JWT authentication & session resolution
│   ├── routes/
│   │   ├── auth.ts                # Gmail OTP, handle generator & onboarding
│   │   ├── chat.ts                # Ephemeral chat message dispatch & decay purge
│   │   ├── discovery.ts           # 4-vector similarity matching & swipe engine
│   │   ├── matches.ts             # Mutual affinity pairs & active channels
│   │   ├── rooms.ts               # LiveKit token issuance & room participation
│   │   ├── rumors.ts              # Rumr whisper leaks, decrypt & voting
│   │   ├── topics.ts              # ≤ 3-word topic taxonomy & subscriptions
│   │   ├── unmask.ts              # Bilateral 3-layer progressive unmasking
│   │   ├── users.ts               # Profile settings, DPDP export & erasure
│   │   └── jobs.ts                # QStash webhooks for ephemeral decay
│   └── services/
│       ├── email.ts               # Resend OTP dispatch service
│       ├── livekit.ts             # WebRTC token generator
│       ├── qstash.ts              # Scheduled job webhook trigger
│       ├── redis.ts               # Upstash Redis presence & ping
│       └── sentry.ts              # Observability & exception logging
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.tsx      # Top bar with location radar & landing link
│   │   │   ├── BottomNav.tsx      # Streamlined 4-tab navigation (Discover, Topics, Matches, Me)
│   │   │   └── MobileFrameShell.tsx # Responsive fit-to-screen viewport wrapper
│   │   └── ui/
│   │       ├── BrutalistButton.tsx # Neo-brutalist action buttons
│   │       ├── BrutalistCard.tsx   # Hard-offset shadow cards
│   │       ├── BrutalistBadge.tsx  # Neon tag chips
│   │       ├── BrowserLocationModal.tsx # Native geolocation permission modal
│   │       ├── DiscoveryFiltersModal.tsx # Merged algorithm & demographic preferences
│   │       ├── EncryptedMatchModal.tsx   # Post-match reveal screen
│   │       ├── MutualUnmaskingModal.tsx  # 3-step progressive consent modal
│   │       └── IdentityDecryptedModal.tsx # Full decrypted identity sheet
│   ├── views/
│   │   ├── OnboardingView.tsx     # Modern browser-first onboarding pipeline
│   │   ├── FeedView.tsx           # Discover deck & 4-vector matching
│   │   ├── TopicsView.tsx         # Topics & Rooms vs Rumrs & Whispr
│   │   ├── MatchesView.tsx        # Mutual affinity matrix & chat trigger
│   │   ├── ChatView.tsx           # Pinned 3-layer unmasking & ephemeral tunnel
│   │   ├── RoomsView.tsx          # LiveKit WebRTC audio debate podiums
│   │   ├── ProfileView.tsx        # Dual Chaos Profile vs DPDP Settings
│   │   └── LandingWebsiteView.tsx # Embedded marketing website view
│   ├── lib/
│   │   ├── api.ts                 # Strongly-typed client API SDK
│   │   ├── store.tsx              # Reactive state management
│   │   └── mock-data.ts           # Seed fixtures and baseline catalog
│   ├── App.tsx                    # Route switcher & location listener
│   └── main.tsx                   # Client entrypoint
├── tests/
│   ├── auth.test.ts               # OTP verification & collision-proof handles
│   ├── chat.test.ts               # Ephemeral message creation & decay
│   ├── discovery.test.ts          # 4-vector similarity algorithm
│   ├── dpdp.test.ts               # Data export & right to erasure
│   ├── gate1-database.test.ts     # Database adapter interface compliance
│   ├── production-stack.test.ts   # Redis, LiveKit, QStash, Resend, Sentry
│   ├── topics.test.ts             # ≤ 3-word rule & subscription counts
│   └── unmask.test.ts             # Bilateral 3-stage unmasking quarantine
├── landing.html                   # Root landing page mirror
├── package.json                   # Project dependencies & scripts
├── tsconfig.json                  # Strict TypeScript configuration
├── vercel.json                    # Edge routing, headers & serverless rewrites
├── wrangler.toml                  # Cloudflare edge proxy & CDN rules
└── vitest.config.ts               # Vitest runner configuration
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (`v18.0.0` or higher, v20 recommended)
- [npm](https://www.npmjs.com/) (`v9.0.0` or higher)

### 1. Clone the repository
```bash
git clone https://github.com/thakurcodeshere/Rumr.git
cd Rumr
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the sample environment variables:
```bash
cp .env.example .env
```
*(The codebase runs seamlessly out-of-the-box in local development with SQLite fallback, mock LiveKit tokens, and simulated Redis pings if external credentials are not set).*

### 4. Run Development Environment
You can run the frontend and backend concurrently:
```bash
# Run both full-stack server and Vite client concurrently
npm run dev:all

# OR run frontend client only
npm run dev

# OR run Express backend server only
npm run server
```

- Open **[http://localhost:5173](http://localhost:5173)** to access the Rumr Web Application.
- Open **[http://localhost:5173/landing.html](http://localhost:5173/landing.html)** to view the standalone marketing website.
- Backend API runs on **[http://localhost:3001](http://localhost:3001)**.

### 5. Run Verification Test Suite
```bash
npm test
```
Executes all **8 test suites (52 tests)** verifying database adapters, auth, similarity matching, unmasking quarantine, ephemeral decay, DPDP compliance, and production stack integrations.

### 6. Build for Production
```bash
npm run build
```
Typechecks the entire repository with `tsc` and generates the optimized production bundle with `vite build`.

---

## 🧪 Automated Test Verification Matrix

All 8 core domains are validated with 100% pass rates across 52 automated Vitest test cases:

```
Test Files  8 passed (8)
     Tests  52 passed (52)
  Duration  ~50s
```

| Test Suite | Spec File | Key Assertions Verified |
| :--- | :--- | :--- |
| **Production Stack** | `tests/production-stack.test.ts` | Upstash Redis `PONG` & presence, LiveKit WebRTC tokens, QStash decay webhook, Resend OTP dispatch, Sentry error capture, unified `/api/health` 10-layer report. |
| **Database Adapter** | `tests/gate1-database.test.ts` | Validates typed `DatabaseAdapter` contract across users, topics, rumors, matches, and chats with strict relational integrity. |
| **Authentication & Auth** | `tests/auth.test.ts` | Gmail OTP dispatch, token consumption, rate limiting, and collision-proof handle assignment. |
| **Topics & Word Limits** | `tests/topics.test.ts` | Enforces the strict ≤ 3-word rule, handles search and category filters, and manages subscriber counts. |
| **Ephemeral Chat** | `tests/chat.test.ts` | Ephemeral message insertion, decay timestamp calculation, and automatic expiry purge. |
| **3-Layer Unmasking** | `tests/unmask.test.ts` | Bilateral quarantine consent, progressive stage progression (1 to 3), and mutual authorization locks. |
| **DPDP Compliance** | `tests/dpdp.test.ts` | Data Portability JSON export, immediate cascade Right to Erasure, and audit log tracking. |
| **Discovery Feed** | `tests/discovery.test.ts` | 4-vector similarity ranking, distance calculations, and bidirectional swipe-to-match handshake. |

---

## 🛡️ Security, Privacy Covenant & DPDP 2023

Rumr is architected around the **Digital Personal Data Protection (DPDP) Act 2023** and strict privacy-by-design standards:

1. **Zero-Knowledge Location Matching**: User coordinates are processed locally or coarse-grained at the edge; exact GPS coordinates are never broadcast or exposed.
2. **Progressive Unmasking Quarantine**: User photos, real names, and external handles remain encrypted and inaccessible until **both** users independently consent to Layer 3 reveal.
3. **Automated Ephemeral Decay**: 1-on-1 chat records automatically expire after ~5 minutes. Background scheduled jobs purge expired content permanently.
4. **Data Portability**: Users can export their entire digital footprint (topics, resonance tags, matches, transaction history) as a formatted JSON document at any time.
5. **Right to Erasure**: One-click account termination triggers a complete cascading purge of user records, credentials, and message histories across all tables.
6. **Vulnerability Disclosure**: Read our [SECURITY.md](SECURITY.md) for vulnerability disclosure guidelines and security practices.

---

## 📜 Community & License

- **Code of Conduct**: See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community debate rules and safety guidelines.
- **License**: Released under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with Clean Chaos • Topic-First Social Mesh • Anti-Superficial Discovery</sub>
</div>
