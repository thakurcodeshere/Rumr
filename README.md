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
[![License](https://img.shields.io/badge/License-MIT-white?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)

</div>

---

## ⚡ Executive Summary

**Rumr** is a topic-first social mesh and anonymous debate network built to address swipe fatigue and superficial profiling. Traditional platforms force users to judge staged selfies and corporate bios; Rumr matches people strictly on **shared curiosities, intellectual friction, and unhinged takes**—preserving anonymity until progressive mutual consent.

---

## 🌐 Live Deployments & Endpoints

| Platform | URL | Description |
| :--- | :--- | :--- |
| **Live Web Application** | **[rumr-sigma.vercel.app](https://rumr-sigma.vercel.app/)** | Instant Browser Web App (Mobile, Tablet & Desktop). |
| **Dedicated Landing Website** | **[rumr-sigma.vercel.app/landing.html](https://rumr-sigma.vercel.app/landing.html)** | Standalone product discovery website with browser launch links & telemetry. |
| **GitHub Repository** | **[github.com/thakurcodeshere/Rumr](https://github.com/thakurcodeshere/Rumr)** | Master codebase, issues, and documentation. |

---

## 🧠 Core Philosophy: The Clean Chaos System

```
  ┌────────────────────────────────────────────────────────┐
  │ 01. Topic > Person        Matching on thoughts, not faces. │
  │ 02. ≤ 3 Words Constraint  Hard token limits stop slander.  │
  │ 03. 3-Layer Unmasking     Consent-governed identity reveal.│
  │ 04. Ephemeral Telemetry   Local state & decay management.  │
  └────────────────────────────────────────────────────────┘
```

1. **Topic-First Matching**: Users react to specific, high-friction debate nodes in their locality. You match with individuals who share deep philosophical alignment or compelling contrarian tension.
2. **The ≤ 3-Word Hard Constraint**: All user-created topic nodes are restricted to 3 words or fewer (*e.g., "Office Politics", "AI Layoffs Reality", "Ghosting Culture"*). Real-time topic moderation helps prevent targeted slander and transforms toxic impulses into structured debates.
3. **Progressive Mutual Unmasking**: Identity is unlocked through a bilateral 3-step consent protocol:
   - **Layer 1 (Signals)**: Demographic signals (City & Professional Domain).
   - **Layer 2 (Resonance)**: Personal tagline, worldview quote, and Chaos Index compatibility score.
   - **Layer 3 (Reveal)**: Full portrait, verified name, and direct communication channels.

---

## 🛠️ Feature Matrix & Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                RUMR ENGINE                                   │
├──────────────────────┬────────────────────────┬──────────────────────────────┤
│ 1. DISCOVERY FEED    │ 2. TOPIC CREATOR       │ 3. MATCHES MATRIX            │
│ 4-Vector Similarity  │ ≤ 3-Word Guard Rail    │ Shared Affinity Overlaps     │
│ Demographic Sliders  │ Geospatial broadcast   │ Instant Tunnel Initiator     │
├──────────────────────┼────────────────────────┼──────────────────────────────┤
│ 4. ENCRYPTED CHATS   │ 5. AUDIO DEBATES       │ 6. DUAL-PROFILE "ME"         │
│ 3-Stage Unmasking    │ Interactive debate room│ Chaos Profile (Resonance)    │
│ Ephemeral Decay (~5m)│ Audio stage & moderation│ Settings & Local Data Control│
└──────────────────────┴────────────────────────┴──────────────────────────────┘
```

### 1. Topic-First Discovery Engine
- **Algorithmic Selectors**: Choose between 4 distinct similarity modes (*Exact Match, Related Topics, Balanced Chaos, Exploratory Contrarian*).
- **Proximity & Demographic Bounds**: Dual age-range sliders (18–45+), gender affinity toggles, and customizable radius filters (Nearby, City, Global).

### 2. Match Reveal Experience
- Double-tilted holographic card reveal screen with glitched avatar mask, `[SYNC_ESTABLISHED]` beacon, handle, and real-time topic overlap chips.

### 3. Match List & Active Topic Tunnels
- Dedicated inbox listing all mutual topic connections with compatibility scores, unmasking stage badges, and message previews.
- Instant transition to ephemeral 1-on-1 tunnels with decay timers.

### 4. Interactive 3-Layer Mutual Unmasking Protocol
- Dedicated step-by-step consent modal (`MutualUnmaskingModal.tsx`) allowing users to progressively authorize each layer of identity reveal.
- Final unlocked moment renders the full **Identity Decrypted Card** with verified badges, match metrics, revealed interests, and contact options.

### 5. Dual-Profile "Me" Architecture
- **Tab 1: Chaos Profile**: Displays user age badge, connection counters, active rumors index, ≤ 3-word topic injector, and locked topic vault.
- **Tab 2: Profile Settings**: Global discovery radius, Ghost Mode broadcasting toggle, Account Dynamics, Blocked Entities, and Terminate Session.

### 6. Dedicated Standalone Marketing Landing Website
- Responsive HTML5 / Tailwind marketing website served at `/landing.html` complete with App Store / Google Play store badges, telemetry tickers, architectural essays, and functional contact forms.

---

## 💻 Tech Stack & Production Infrastructure
 
### Core Runtime & Edge Hosting
- **Source Control & CI/CD**: GitHub Actions (`.github/workflows/ci.yml`) — Automated build, lint & test pipeline
- **Frontend & Edge Hosting**: Vercel Serverless Platform (`vercel.json`) — Security headers, edge proxy & asset caching
- **Primary Database & Auth**: Supabase PostgreSQL (`hjqkfxwkfctrivfftmwv`) — 17 production relational tables & RLS policies
- **DNS, CDN & Security**: Cloudflare (`wrangler.toml`) — Edge security proxy, HSTS, CSP & CDN acceleration

### Real-Time & Ephemeral State
- **WebRTC Audio Infrastructure**: LiveKit Cloud (`livekit-server-sdk`) — Token issuance & real-time audio debate podiums
- **Presence & Cache**: Upstash Redis (`@upstash/redis`) — Ephemeral presence tracking, debate stage listeners, and low-latency cache (`PONG` verified)
- **Scheduled & Background Jobs**: Upstash QStash (`@upstash/qstash`) — Automated webhook execution for ephemeral message decay

### Communications, Observability & Design
- **Transactional Email**: Resend (`resend`) — Clean Chaos branded OTP verification codes and unmasking notifications
- **Crash & Error Tracking**: Sentry (`@sentry/node`, `@sentry/react`) — Dual-layer error capture & telemetry
- **UI Prototyping & Generation**: Lovable (`081632bf-91f0-4def-b0d4-6618eefad592`) — Clean Chaos design system knowledge synchronization

---

## 📁 Repository Structure

```
Rumr/
├── public/
│   ├── landing.html              # Standalone marketing landing website
│   └── favicon.svg               # Brand favicon
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.tsx     # Sticky navigation with mobile toggle & landing links
│   │   │   └── BottomNav.tsx     # 5-tab Brutalist bottom bar (Discover, Topics, Matches, Chats, Me)
│   │   └── ui/
│   │       ├── BrutalistButton.tsx        # High-contrast brutalist action buttons
│   │       ├── BrutalistCard.tsx          # Hard-offset shadow cards
│   │       ├── BrutalistBadge.tsx         # Neon tag chips
│   │       ├── DiscoveryFiltersModal.tsx  # Merged demographic & algorithm modal
│   │       ├── EncryptedMatchModal.tsx    # Holographic post-match reveal screen
│   │       ├── MutualUnmaskingModal.tsx   # 3-step progressive consent modal
│   │       └── IdentityDecryptedModal.tsx # Full verified profile reveal sheet
│   ├── views/
│   │   ├── FeedView.tsx          # Card deck & discussions feed
│   │   ├── TopicsView.tsx        # ≤ 3-word creator & hot debate radar
│   │   ├── MatchesView.tsx       # Affinity matrix & match list
│   │   ├── ChatView.tsx          # Encrypted 1-on-1 topic tunnels & inbox
│   │   ├── ProfileView.tsx       # Dual Chaos Profile vs Settings
│   │   ├── RoomsView.tsx         # Interactive audio debate rooms
│   │   └── LandingWebsiteView.tsx# Embedded marketing site view
│   ├── lib/
│   │   ├── store.tsx             # Reactive global state engine
│   │   └── mock-data.ts          # Seed data for topics, rumors & matches
│   ├── App.tsx                   # Main router & device frame wrapper
│   └── main.tsx                  # Application entry point
├── landing.html                  # Root landing page mirror
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript compiler configuration
├── vite.config.ts                # Vite build and server config
├── CODE_OF_CONDUCT.md            # Contributor & user community covenant
├── SECURITY.md                   # Vulnerability disclosure & privacy policy
└── LICENSE                       # MIT Open Source License
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)

### 1. Clone the repository
```bash
git clone https://github.com/thakurcodeshere/Rumr.git
cd Rumr
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.  
To view the standalone marketing website, navigate to [http://localhost:5173/landing.html](http://localhost:5173/landing.html).

### 4. Build for production
```bash
npm run build
```

---

## 🛡️ Security & Privacy Covenant

Rumr operates under privacy-first principles:
- Location parameters are handled locally for radius matching.
- User photos and full names remain private until bilateral mutual consent.
- 1-on-1 chats support ephemeral message decay timers.
- Read our [SECURITY.md](SECURITY.md) for vulnerability disclosure guidelines and privacy practices.

---

## 📜 Code of Conduct & License

- **Community Guidelines**: See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
- **License**: Released under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with Clean Chaos • Topic-First Social Mesh</sub>
</div>

