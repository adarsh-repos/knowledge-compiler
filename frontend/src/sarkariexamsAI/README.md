# SarkariExamsAI

AI-powered preparation platform for Indian government exams (BPSC, UPSC, State PCS, SSC, RRB, Banking…).

The product philosophy is **One Goal → One Screen → One Decision** — the opposite of the cluttered lists, tables, grids and tabs found in typical Indian ed-tech apps. Every screen answers exactly one question and offers (mostly) one primary action.

---

## Web + Mobile strategy

This is a **single responsive React + MUI codebase shipped as an installable PWA**, instead of two separate apps. This is a deliberate decision:

- **MUI is web-only** — it does not run on React Native — so a shared codebase with MUI is the only way to guarantee a single, identical design system across web and mobile.
- The layout **adapts by breakpoint**: an ultra-thin bottom tab bar on mobile, a slim floating dock on desktop.
- A **web app manifest + service worker** make it installable ("Add to Home Screen") and give it an app-like, offline-capable shell on phones.
- The business-logic layer (Redux + sagas + the `data/` API layer) is cleanly separated from UI, so a future native (React Native) shell could reuse it with minimal changes.

> If a true native app becomes a hard requirement later, the migration path is: keep `src/app`, `src/features/*/state`, and `src/data`, and re-skin the `pages/` + `components/` layers in React Native.

---

## Tech stack

| Concern | Choice |
| --- | --- |
| Build tool | Vite |
| UI library | React 18 + TypeScript |
| Component/design system | MUI v6 (`@mui/material`, `@mui/icons-material`) |
| Styling engine | Emotion (via MUI) + custom theme tokens |
| State management | Redux Toolkit |
| Side effects | redux-saga |
| Routing | react-router-dom v6 |
| Animations | framer-motion |
| Fonts | Inter (`@fontsource/inter`) |
| Mobile | PWA (manifest + service worker) |

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173 (also exposed on your LAN for phone testing)
```

Other scripts:

```bash
npm run build      # type-check (tsc -b) + production build to /dist
npm run preview    # preview the production build
npm run typecheck  # type-check only
```

### Testing on a real phone

`vite.config.ts` sets `server.host: true`, so `npm run dev` prints a `Network:` URL (e.g. `http://192.168.x.x:5173`). Open that on a phone on the same Wi-Fi, then use the browser's **Add to Home Screen** to install it as an app.

---

## Architecture (modular by feature)

Each feature is a self-contained module that owns its UI **and** its slice of state. Cross-feature wiring happens only in two places: `app/rootReducer.ts` and `app/rootSaga.ts`.

```
src/
├── app/                     # Store wiring
│   ├── store.ts             # configureStore + saga middleware
│   ├── rootReducer.ts       # registers every feature reducer
│   ├── rootSaga.ts          # forks every feature saga
│   └── hooks.ts             # typed useAppDispatch / useAppSelector
├── theme/                   # Design system
│   ├── tokens.ts            # raw design tokens (colors, radius, type, motion)
│   ├── theme.ts             # buildTheme(mode) -> MUI theme
│   └── ColorModeProvider.tsx# dark/light context, persisted to localStorage
├── components/
│   ├── layout/              # AppLayout, BottomNav, DesktopDock, navConfig
│   └── ui/                  # SectionCard, Pill, PageContainer, CircularMastery, ModeToggle
├── data/
│   ├── types.ts             # shared domain types
│   └── mockApi.ts           # simulated backend (swap for real endpoints here)
├── routes/AppRoutes.tsx     # route table
└── features/
    ├── landing/             # marketing landing page (/)
    ├── dashboard/           # Screen 1  (/dashboard)
    ├── learn/               # Screen 2  (/learn)
    ├── practice/            # Screen 3  (/practice)
    ├── analysis/            # Screen 4  (/analysis)
    ├── navigator/           # Screen 5  (/navigator)
    └── profile/             # Screen 6  (/profile — onboarding)
```

A typical feature module:

```
features/practice/
├── pages/PracticePage.tsx
└── state/
    ├── practiceSlice.ts     # Redux Toolkit slice (reducers + actions)
    └── practiceSaga.ts      # watcher saga -> calls data/mockApi
```

### Data flow

`Page → dispatch(action) → saga (side effect via data/mockApi) → dispatch(success) → slice → selector → Page`.

All async lives in sagas; components stay declarative. To connect a real backend, edit only `src/data/mockApi.ts`.

---

## Design system

Tokens live in `src/theme/tokens.ts` and feed `buildTheme(mode)`:

- **Backgrounds:** Zinc-950 (dark) / Slate-50 (light)
- **Cards:** Zinc-900 with a subtle 1px Zinc-800 border (dark)
- **Typography:** Inter — high-contrast headings (Zinc-50), muted body (Zinc-400)
- **Primary accent:** Violet-600 (action / focus)
- **Mastery/success:** Emerald-500 · **Attention:** Amber-500
- **Motion:** subtle fade/slide transitions on every screen change

Dark mode is the default; users toggle via the icon in the header (persisted to `localStorage`).

### Shared primitives

- `SectionCard` — the one elegant container (no nested cards), with an optional violet `glow` for "recommended action" blocks.
- `Pill` — uppercase, letter-spaced section eyebrow.
- `PageContainer` — centers content, applies safe-area padding (PWA notches), reserves space for the nav, and runs the mount transition.
- `CircularMastery` — animated circular percentage indicator.

---

## Screens

| # | Route | Question it answers | Primary action |
| --- | --- | --- | --- |
| — | `/` | "Why should I use this?" | Start Preparing |
| 1 | `/dashboard` | "What should I do now?" | Continue Mission |
| 2 | `/learn` | "Can I understand it?" | Continue to Practice |
| 3 | `/practice` | "Can I do it?" | Submit → Next |
| 4 | `/analysis` | "Am I getting closer?" | Start Target Practice |
| 5 | `/navigator` | "Where do I go if stuck?" | Ask the Navigator |
| 6 | `/profile` | "How does it know what I need?" | Begin Assessment |

Navigation between the five active views uses a persistent bottom tab bar (mobile) / floating dock (desktop). The landing and onboarding screens render full-bleed without the nav.

---

## Notes & next steps

- `data/mockApi.ts` returns seeded content with simulated latency. Replace with real API calls (the saga signatures won't change).
- Auth is stubbed — "Sign In" routes straight into the app for now.
- The "Sheet architecture" idea (e.g. opening Practice as an overlay from the Dashboard's "Revision Due") is a good next enhancement; the modular pages make this straightforward via MUI `Drawer`/`Dialog`.
