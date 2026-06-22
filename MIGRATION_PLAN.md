# Treatcode V2 — UI Migration Plan

Migrating the Treatcode UI/UX from V1 (CRA + Tailwind v3) to V2 (Vite + React 19 + TypeScript + Tailwind v4 + shadcn/ui).

**Goal:** A pixel-faithful design migration. No live backend — dummy data throughout — but architecture is structured so wiring Supabase back in is surgical (swap mock hooks for real ones).

---

## Status Legend
- `[ ]` — Not started
- `[x]` — Complete
- `[~]` — In progress

---

## Phase 0 — Foundation

> Everything the rest of the app depends on. Must be done before any page work.

- [x] **Color system** — Replace default shadcn neutral palette in `src/index.css` with Treatcode banking theme (OKLCH values, see table below)
- [x] **Font** — Swap Geist for the Consolas monospace stack in `@theme` and `@layer base`
- [x] **Install dependencies** — `react-router-dom`, `@tanstack/react-query`, `date-fns`
- [x] **Install shadcn components** — `card`, `input`, `label`, `badge`, `table`, `dialog`, `sheet`, `alert-dialog`, `radio-group`, `select`, `separator`, `sonner`, `tabs`
- [x] **Folder structure** — Created `src/pages/`, `src/components/layout/`, `src/components/features/`, `src/components/icons/`, `src/hooks/`, `src/context/`, `src/types/`, `src/data/`
- [x] **Types** — `src/types/index.ts` with shared interfaces (User, Account, Transaction, Deposit, Redemption, Brand)
- [x] **Dummy data** — `src/data/dummy.ts` with realistic mock fixtures for all data types
- [x] **Brands catalog** — `src/data/brands.ts`
- [x] **Mock auth context** — `src/context/AuthContext.tsx` shaped identically to how a real Supabase auth context would look; toggle `isAuthenticated` via a dev flag
- [x] **`useAuth` hook** — `src/hooks/useAuth.ts`
- [x] **`useIsMobile` hook** — `src/hooks/useIsMobile.ts`
- [x] **`cn` utility** — already at `src/lib/utils.ts` ✓
- [x] **`GoogleIcon` component** — `src/components/icons/GoogleIcon.tsx` (inline SVG, no react-icons)
- [x] **Router setup** — `src/main.tsx` with `BrowserRouter` + `QueryClientProvider` + `AuthProvider`; `src/App.tsx` with lazy-loaded routes + skeleton page stubs

---

## Phase 1 — Layout Shell

> Shared chrome used by every page.

- [x] **Header** — `src/components/layout/Header.tsx`
  - Fixed top, `z-50`, glass: `bg-background/80 backdrop-blur-xs border-b border-border/50`
  - Logo: Gift icon + gradient text (`from-primary to-purple-600 bg-clip-text text-transparent`)
  - Reads auth state directly from `useAuth()` — no props needed
  - Desktop nav: authenticated (Welcome name, Admin btn, Dashboard btn, Sign Out) vs guest (Sign In, Get Started)
  - Mobile nav: Sheet (slide-in drawer) with same items
- [x] **Footer** — `src/components/layout/Footer.tsx`
  - Full-width `bg-primary text-primary-foreground`
  - Logo left, nav links center, legal right
  - Responsive stacked on mobile
- [x] **AppLayout** — `src/components/layout/AppLayout.tsx`
  - Wraps pages with Header + gradient page background
- [x] **ProtectedRoute** — `src/components/layout/ProtectedRoute.tsx`
  - Reads from `useAuth`; redirects to `/auth` if not authenticated
  - Shows spinner while `isLoading`

---

## Phase 2 — Public Pages

- [x] **Landing page** — `src/pages/Index.tsx`
  - Hero section: badge pill, H1 with primary span, checkmarks, subtext, CTA button
  - Concept section: 2-col grid (copy + mock UI cards)
  - "Your money your rules" section: 3-card grid (Stash It, Watch It Grow, Redeem Instantly)
  - Retailers section: brand grid (8 cards, hover to primary color)
  - Social proof / CTA section: icon flow + secondary CTA
  - Footer
- [x] **Auth page** — `src/pages/Auth.tsx`
  - Centered card, max-w-md, no nav header
  - Logo + tagline above card
  - Login / Signup toggle (single form, state-driven)
  - Gradient primary submit button
  - Divider + Google OAuth button (GoogleIcon inline SVG)
  - sonner toasts replace V1 toast hook
- [x] **ForgotPassword page** — `src/pages/ForgotPassword.tsx`
  - Two states: email form / confirmation (with CheckCircle)
  - Back to sign in link
- [x] **ResetPassword page** — `src/pages/ResetPassword.tsx`
  - Two states: password form / success
  - Password + confirm password fields, min-length validation
- [x] **NotFound page** — `src/pages/NotFound.tsx`
  - Branded 404, link back to home

---

## Phase 3 — Dashboard Pages

- [x] **Dashboard** — `src/pages/Dashboard.tsx`
- [x] **Deposits page** — `src/pages/Deposits.tsx`
- [x] **DepositsHistory component** — `src/components/features/DepositsHistory.tsx`
- [x] **Redemptions page** — `src/pages/Redemptions.tsx`
- [x] **RedemptionsHistory component** — `src/components/features/RedemptionsHistory.tsx`
- [x] **DirectDebit page** — `src/pages/DirectDebit.tsx`
- [x] **DirectDebitSetup component** — `src/components/features/DirectDebitSetup.tsx`
- [x] **DirectDebitStatus component** — `src/components/features/DirectDebitStatus.tsx`

---

## Phase 4 — Admin Page

- [x] **Admin page** — `src/pages/Admin.tsx`
  - Stats row: 4 count cards (All / Pending / Fulfilled / Cancelled)
  - Table: Requested date, User email, Brand, Amount, Status badge, Actions
  - Pending row actions: Fulfill button + Cancel button (destructive outline)
  - Fulfilled/Cancelled rows: show fulfilled_at / cancelled_at date
  - Fulfill Dialog: voucher code (required, mono font) + instructions textarea (sent to user) + admin notes textarea (internal)
  - Cancel AlertDialog: cancellation reason input (optional) + amount-refund notice
  - After mock action: `queryClient.setQueryData` updates the cache in place so the table reflects the change immediately
  - Admin guard: redirects to /dashboard if `user.is_admin === false`
  - Toggle: set `MOCK_IS_ADMIN = true` in `src/context/AuthContext.tsx` to test this page

---

## Design System Reference

### Color Tokens (V1 → V2)

All V1 colors were defined as HSL CSS variables. V2 uses OKLCH in `:root`. The mapping below gives OKLCH equivalents — these are the values to set in `src/index.css` under `:root`.

| Token | V1 HSL | V2 OKLCH | Notes |
|-------|---------|----------|-------|
| `--primary` | `hsl(211 89% 26%)` | `oklch(0.38 0.14 248)` | Banking blue |
| `--primary-foreground` | `hsl(0 0% 100%)` | `oklch(1 0 0)` | White |
| `--secondary` | `hsl(211 25% 88%)` | `oklch(0.90 0.02 247)` | Light blue-gray |
| `--secondary-foreground` | `hsl(211 89% 26%)` | `oklch(0.38 0.14 248)` | Same as primary |
| `--accent` | `hsl(142 76% 36%)` | `oklch(0.58 0.18 152)` | Trust green |
| `--accent-foreground` | `hsl(0 0% 100%)` | `oklch(1 0 0)` | White |
| `--background` | `hsl(220 13% 95%)` | `oklch(0.96 0.006 247)` | Off-white blue-gray |
| `--foreground` | `hsl(222 47% 11%)` | `oklch(0.18 0.04 252)` | Very dark blue |
| `--card` | `hsl(0 0% 100%)` | `oklch(1 0 0)` | Pure white |
| `--card-foreground` | `hsl(222 47% 11%)` | `oklch(0.18 0.04 252)` | Same as foreground |
| `--muted` | `hsl(211 25% 88%)` | `oklch(0.90 0.02 247)` | Same as secondary |
| `--muted-foreground` | `hsl(215 16% 47%)` | `oklch(0.56 0.04 250)` | Mid blue-gray |
| `--destructive` | `hsl(0 84% 60%)` | `oklch(0.63 0.22 27)` | Red |
| `--border` | `hsl(214 32% 91%)` | `oklch(0.92 0.01 247)` | Light border |
| `--input` | `hsl(214 32% 91%)` | `oklch(0.92 0.01 247)` | Input border |
| `--ring` | `hsl(211 89% 26%)` | `oklch(0.38 0.14 248)` | Focus ring |
| `--radius` | `0.5rem` | `0.5rem` | Unchanged |

> OKLCH values are perceptual approximations. Fine-tune in the browser with DevTools after applying.

### Dark Mode Tokens

| Token | Value |
|-------|-------|
| `--background` | `oklch(0.14 0.02 252)` (very dark blue) |
| `--foreground` | `oklch(0.97 0 0)` |
| `--card` | `oklch(0.19 0.02 252)` |
| `--primary` | `oklch(0.97 0 0)` (inverts to near-white) |
| `--primary-foreground` | `oklch(0.18 0.04 252)` |
| `--accent` | `oklch(0.30 0.03 252)` |
| `--accent-foreground` | `oklch(0.97 0 0)` |
| `--border` | `oklch(1 0 0 / 10%)` |
| `--input` | `oklch(1 0 0 / 15%)` |

### Typography

```css
/* In @theme inline */
--font-sans: 'Consolas', 'Monaco', 'Lucida Console', monospace;
--font-mono: 'Consolas', 'Monaco', 'Lucida Console', monospace;

/* In @layer base */
body { @apply font-sans; }
h1, h2, h3, h4, h5, h6 { font-weight: 600; }
```

Heading scale used in V1:
- Hero H1: `text-4xl sm:text-5xl md:text-6xl font-bold`
- Page title H1: `text-3xl font-bold`
- Section H2: `text-3xl md:text-4xl font-bold`
- Subsection H2: `text-xl font-semibold`
- Card title: `text-lg font-semibold` (via `<CardTitle>`)
- Balance display: `text-3xl md:text-4xl font-bold text-primary`
- Labels: `text-sm font-medium text-muted-foreground uppercase tracking-wider`

---

## Tailwind v3 → v4 Class Mapping

These are the utility class changes to apply everywhere in V2 (do not use v3 names):

| v3 | v4 | Appears in V1? |
|----|-----|----------------|
| `shadow-sm` | `shadow-xs` | Yes (brand cards, footer pill) |
| `shadow` (bare) | `shadow-sm` | No |
| `rounded-sm` | `rounded-xs` | No |
| `rounded` (bare) | `rounded-sm` | No |
| `blur-sm` | `blur-xs` | No |
| `backdrop-blur-sm` | `backdrop-blur-xs` | Yes (header) |
| `outline-none` | `outline-hidden` | Via shadcn components |
| `ring` (bare, focus) | `ring-3` | Via shadcn components |
| `bg-gradient-to-*` | `bg-linear-to-*` | Yes (hero, auth page) |
| `!flex` etc. | `flex!` etc. | — |
| `bg-[--var]` | `bg-(--var)` | — |
| `flex-shrink-*` | `shrink-*` | — |
| `flex-grow-*` | `grow-*` | — |
| `overflow-ellipsis` | `text-ellipsis` | — |

**Important:** In v4, `border` bare class defaults to `currentColor` (not gray-200). Always pair with `border-border` or a specific color.

**Gradients rename:** `bg-gradient-to-br` → `bg-linear-to-br`, `bg-gradient-to-r` → `bg-linear-to-r`, etc.

**Hover on touch:** v4 wraps hover in `@media (hover: hover)` automatically. No action needed, just be aware.

**Custom utilities:** Use `@utility` instead of `@layer utilities { }`.

---

## Folder Structure

```
src/
├── components/
│   ├── ui/                    # shadcn — never edit directly
│   ├── icons/
│   │   └── GoogleIcon.tsx     # inline SVG, avoids react-icons dependency
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── AppLayout.tsx
│   │   └── ProtectedRoute.tsx
│   └── features/
│       ├── DepositsHistory.tsx
│       ├── RedemptionsHistory.tsx
│       ├── DirectDebitSetup.tsx
│       └── DirectDebitStatus.tsx
├── context/
│   └── AuthContext.tsx
├── data/
│   ├── dummy.ts               # mock fixtures
│   └── brands.ts              # brand catalog
├── hooks/
│   ├── useAuth.ts
│   └── useIsMobile.ts
├── lib/
│   └── utils.ts               # cn() — exists ✓
├── pages/
│   ├── Index.tsx
│   ├── Auth.tsx
│   ├── ForgotPassword.tsx
│   ├── ResetPassword.tsx
│   ├── Dashboard.tsx
│   ├── Deposits.tsx
│   ├── Redemptions.tsx
│   ├── DirectDebit.tsx
│   ├── Admin.tsx
│   └── NotFound.tsx
└── types/
    └── index.ts
```

---

## shadcn Components to Install

```bash
npx shadcn@latest add card input label badge table dialog sheet alert-dialog radio-group select separator sonner tabs
```

- [x] `button` — already installed
- [ ] `card` ✓
- [ ] `input` ✓
- [ ] `label` ✓
- [ ] `badge` ✓
- [ ] `table` ✓
- [ ] `dialog` ✓
- [ ] `sheet` ✓
- [ ] `alert-dialog` ✓
- [ ] `radio-group` ✓
- [ ] `select` ✓
- [ ] `separator` ✓
- [ ] `sonner` ✓
- [ ] `tabs` ✓

---

## npm Packages to Install

```bash
npm install react-router-dom @tanstack/react-query date-fns
```

- [ ] `react-router-dom` — routing
- [ ] `@tanstack/react-query` — data fetching shape (even with dummy data)
- [ ] `date-fns` — date formatting

> No `react-icons`. The Google brand icon (used once on the Auth page) will be a small inline SVG component at `src/components/icons/GoogleIcon.tsx`. If more brand icons are needed later, add `react-icons` then.

---

## Notes & Decisions

1. **Monospace font everywhere** — Consolas is not on Google Fonts (the V1 import URL was broken). In V2, rely on the system font stack: `Consolas, Monaco, Lucida Console, monospace`. This works on Windows/Mac. No external import needed.

2. **Mock auth toggle** — `AuthContext` exposes `isAuthenticated: boolean`. Set it to `true` by default for dashboard testing, `false` to test the public/landing experience. Later replaced with real Supabase session logic.

3. **React Query with dummy data** — Use `useQuery` with `queryFn: async () => DUMMY_DATA`. This means every page already has the right loading/error/data shape. Swapping in a real Supabase call is one line.

4. **shadcn style** — V2 uses `radix-nova` (V1 used `new-york`). This affects component visuals slightly. Accept the difference — it's a modern update, not a regression.

5. **No `tailwind.config.ts`** — V2 is pure CSS config via `@theme` in `index.css`. Do not create a tailwind.config.ts.

6. **`bg-gradient-to-*` → `bg-linear-to-*`** — This is a required rename in v4. Every gradient background in V1 must use the new name in V2.

7. **Gradient logo text** — V1 uses `bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent`. In v4: `bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent`. Same pattern, just rename.

8. **`backdrop-blur-sm` → `backdrop-blur-xs`** — Used on the header glass effect.

9. **Sidebar tokens** — Keep the sidebar CSS variables in the theme (shadcn needs them) even though V2 doesn't use a sidebar. They're in the default shadcn template and harmless.

10. **Admin page access** — In mock mode, expose an `isAdmin` flag in the auth context that can be toggled. Protected by `ProtectedRoute` checking `isAdmin`.
