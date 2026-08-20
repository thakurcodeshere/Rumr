# Rumr: Figma Connection & Screenframe Decision Guide

This guide details how to connect the **Rumr** codebase to Figma, import all screens and design tokens, and select the optimal screenframe for design and development.

---

## 1. Screenframe Decision Matrix

| Device Frame | Frame Size (px) | Aspect Ratio | Safe Area (Top / Bottom) | Best Suited For |
| :--- | :--- | :--- | :--- | :--- |
| **iPhone 16 Pro** *(Recommended)* | **393 × 852** | 19.5:9 | 59px / 34px | **Primary Figma Target**: Current standard for flagship iOS social apps with Dynamic Island. |
| **iPhone 14 / 15** | **390 × 844** | 19.5:9 | 47px / 34px | **Legacy iOS Baseline**: Broadest compatibility across older iPhone templates in Figma. |
| **Google Pixel 8 / 9** | **412 × 915** | 20:9 | 48px / 24px | **Android Primary**: High aspect ratio, wide viewport for spacious text density. |
| **Samsung Galaxy S24** | **360 × 780** | 19.5:9 | 40px / 24px | **Android Compact**: Ensures UI doesn't clip on narrower Android viewports. |
| **iPhone SE (3rd Gen)** | **375 × 667** | 16:9 | 20px / 0px | **Minimum Viewport Check**: Ensures card heights and buttons fit on small screens. |

### Recommended Decision:
> **Set your primary Figma Frame to `393 × 852` (iPhone 16 Pro)** with **Auto-Layout enabled (Fill Container)**. 
> This guarantees pixel-perfect density for modern iOS devices while fluidly shrinking down to 360px and 390px.

---

## 2. Connecting Codebase Screens to Figma

You have three automated ways to connect this codebase to Figma:

### Method A: 1-Click HTML to Figma Vector Import (`html.to.design` Plugin)
This method converts live HTML/Tailwind screens into fully editable Figma vector layers with native Auto-Layout.

1. **Start the local Rumr server**:
   ```bash
   npm run dev
   ```
   *(Server starts at `http://localhost:5173`)*
2. **Open Figma**:
   - Create a new design file in Figma.
   - Go to **Plugins** -> Search for **`html.to.design`** (or install from Figma Community).
3. **Import Live Screens**:
   - In `html.to.design`, select **"Import from URL"**.
   - Enter `http://localhost:5173` or any specific screen file from `public/screens/` (e.g. `http://localhost:5173/screens/01_enter_verification_code.html`).
   - Select your target device frame: **iPhone 16 Pro (393px)** or **iPhone 14 (390px)**.
   - Click **Import**.
   - ✨ Figma will generate a complete frame with editable typography, vectors, and auto-layout!

---

### Method B: Sync Design Tokens (`Tokens Studio for Figma` / Figma Variables)

All brand tokens (Colors, Typography, Spacing, Shadows, Border Radii) are exported in standard W3C format:
- JSON File: [`tokens/figma-tokens.json`](file:///C:/Users/AI/Rumr/tokens/figma-tokens.json)
- CSS Variables: [`tokens/tokens.css`](file:///C:/Users/AI/Rumr/tokens/tokens.css)

#### How to import into Figma:
1. Open the **Tokens Studio for Figma** plugin.
2. Click **Settings** -> **Load from JSON** / **Import Token Set**.
3. Select or paste the contents of `tokens/figma-tokens.json`.
4. Click **Apply to Document**.
5. All Figma Local Variables and Color/Text Styles will automatically populate:
   - **`color/void-black`** (`#070707`)
   - **`color/toxic-lime`** (`#ccff00`)
   - **`color/electric-purple`** (`#a855f7`)
   - **`color/electric-lilac`** (`#ddb7ff`)
   - **`font/serif`** (*Playfair Display*)
   - **`font/mono`** (*JetBrains Mono*)
   - **`font/sans`** (*Inter*)

---

### Method C: Visual Sequence Canvas (66 Screens)

If you prefer placing all 66 generated Stitch screens into your Figma canvas for flow mapping:
1. Open [`public/screens_workspace.html`](file:///C:/Users/AI/Rumr/public/screens_workspace.html) or run `npm run dev` and open `http://localhost:5173/screens_workspace.html`.
2. This displays all 66 screens arranged chronologically (Boot, Onboarding, Topics Setup, Discovery, Matching, Chat, Profile, Boost, Safety).
3. You can copy the images or HTML chunks directly into your Figma workspace.

---

## 3. Directory Structure for Screens & Tokens

```
c:/Users/AI/Rumr/
├── tokens/
│   ├── figma-tokens.json      # Figma Tokens Studio & Variables definition
│   ├── tokens.css             # CSS variables matching Figma tokens
│   └── screens-manifest.json  # Catalog metadata for all 66 screens
├── public/
│   ├── screens/               # 66 standalone HTML files for Figma import
│   ├── tokens/                # Browser-accessible token endpoints
│   └── screens_workspace.html # 66-screen master visual canvas
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── FigmaToolbar.tsx       # Live Screenframe Switcher & Figma Bridge
│   │       └── MobileFrameShell.tsx   # Dynamic Frame Renderer (393px, 390px, etc.)
│   ├── lib/
│   │   ├── frame-specs.ts     # Screen dimension specs & aspect ratios
│   │   └── store.tsx          # State management & Figma copy actions
│   └── views/                 # Interactive React views
└── FIGMA_SETUP_GUIDE.md       # This guide
```
