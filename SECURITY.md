# RUMR Security Policy & Cryptographic Protocols

Rumr Cryptographic Systems, Inc. takes the security and privacy of our topic-first social mesh seriously. We are committed to maintaining the highest standards of data minimization, zero-knowledge telemetry, and compliance with the **Digital Personal Data Protection (DPDP) Act 2023** and international data sovereignty mandates.

---

## 🛡️ Supported Versions & Vulnerability Tiers

Security patches and hotfixes are applied to the latest production builds on Vercel and master branch releases:

| Version | Status | Security Updates |
| :--- | :--- | :--- |
| **v2.4.x (Latest)** | Supported | Active SLA (24h Triage / 72h Remediation) |
| **v2.3.x** | Supported | Critical Vulnerability Backports Only |
| **< v2.0.0** | Unsupported | Deprecated (Upgrade to Latest Build) |

---

## 🔐 Cryptographic Architecture & Privacy Assurances

### 1. The Zero-Knowledge Discovery Model
- **Unhashed Data Quarantine**: Browsing telemetry, skipped cards, and preliminary deck filters are processed in local memory and are never persisted in cleartext on central relational databases.
- **SHA-256 Vector Indexing**: Topic nodes and debate affinity vectors are hashed and indexed without linking to real-world phone identifiers until progressive consent is established.

### 2. 3-Layer Mutual Consent & Unmasking Isolation
- Cleartext portraits and full legal names remain quarantined behind asymmetric cryptographic handshakes.
- Neither participant's biometric or demographic metadata is transmitted to the peer client until both parties independently sign their respective consent milestones in `MutualUnmaskingModal`.

### 3. Ephemeral Communication Decay
- 1-on-1 topic debate messages in `ChatView` are subject to automated decay timers (~5 minutes).
- Session keys are purged upon chat termination or when an entity initiates a `Terminate Session` / `Ghost Mode` action in `ProfileView`.

### 4. DPDP Act 2023 & IT Act Compliance
- **Data Principal Rights**: Users retain unconditional rights to summary data export, key deletion, and automated profile erasure.
- **Grievance Redressal**: All privacy inquiries and erasure requests are handled within statutory time limits under Section 13 of the DPDP Act 2023.

---

## 🚨 Reporting a Vulnerability

We welcome reports from independent security researchers, cryptanalysts, and white-hat hackers. If you believe you have discovered a vulnerability, cryptographic leak, or authentication bypass, please follow our responsible disclosure guidelines.

### Reporting Channels
- **Primary Security Email**: [security@rumr.network](mailto:security@rumr.network)
- **Trust & Safety Operations**: [intel@rumr.network](mailto:intel@rumr.network)
- **PGP Key Fingerprint**: `F4A8 99B2 01CD 45E9 7780 1204 CCFF 00A8 55F7 2026`

### Information to Include in Your Report
1. **Description**: A clear summary of the vulnerability (e.g., identity deanonymization, vector injection, token leak).
2. **Steps to Reproduce**: Proof-of-concept (PoC) scripts, network captures, or step-by-step reproduction instructions.
3. **Impact Assessment**: Potential risk to user privacy, cryptographic integrity, or service availability.
4. **Affected Components**: Specific endpoints, React components, or smart contracts/APIs involved.

---

## ⏱️ Response Timelines & SLAs

- **Initial Acknowledgment**: Within **24 hours** of submission.
- **Triage & Validation**: Within **48 hours**.
- **Remediation & Patch Deployment**: Within **72 to 120 hours** depending on severity.
- **Public Disclosure**: Coordinated disclosure scheduled after the security patch is verified and deployed live.

---

## ⚖️ Safe Harbor for Security Researchers

Rumr Cryptographic Systems will **not** pursue legal action against researchers who:
- Engage in good-faith testing to improve platform security.
- Avoid accessing, modifying, or destroying other users' private data or cleartext identity keys.
- Avoid executing denial-of-service (DoS/DDoS) attacks against production infrastructure.
- Provide sufficient time for remediation prior to public disclosure.

---

<div align="center">
  <sub>Rumr Security Operations • Cyber City, Gurgaon & San Francisco • security@rumr.network</sub>
</div>
