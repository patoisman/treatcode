# Treatcode

**Pay Now, Buy Later.** Treatcode is a fintech web app where users make small recurring
deposits via GoCardless Direct Debit, build up a wallet balance, then redeem it for retail
gift vouchers (ASOS, Nike, Zara, Amazon, and more). No credit, no debt.

## Stack

- **React 19** + **Vite** + **TypeScript** (strict)
- **Tailwind CSS v4** (no `tailwind.config.js`) with OKLCH design tokens
- **ShadCN / Radix UI** primitives
- **TanStack Query** for server state
- **React Router v6**
- **Supabase** — Auth, Postgres (RLS), Edge Functions
- **GoCardless** — Direct Debit mandates, subscriptions, and payments

## Architecture

Feature-based structure — all business logic lives in feature modules, pages are thin composers.

```
src/
├── pages/              # Route-level pages — thin composers only (no business logic)
├── features/           # Feature modules: components/, hooks/, queryKeys.ts, types.ts
│   ├── auth/           # Sign in/up, Google Identity, password reset, email confirmation
│   ├── onboarding/     # Pledge step + state machine (new → pledge_set → setup_complete)
│   ├── directdebit/    # GoCardless mandate & subscription setup/management
│   ├── wallet/         # Balance + ledger
│   ├── deposits/       # Deposit history
│   ├── vouchers/       # Brand catalogue + redemptions
│   ├── admin/          # Redemption fulfilment panel
│   ├── legal/          # Privacy / Terms content
│   └── session-lock/   # Inactivity lock (5-min lock / 30-min logout)
├── components/
│   ├── ui/             # ShadCN primitives — do not edit
│   ├── common/         # Shared cross-feature components
│   └── layout/         # AppLayout, Header, Footer, ProtectedRoute, AdminRoute
├── lib/                # supabase client, query client, formatters, utils
└── types/              # database.types.ts — generated from Supabase, never hand-edited

supabase/
├── functions/          # Edge functions (mirrored from the live project)
└── migrations/         # SQL migrations (mirrored from the live project)
```

The backend (Supabase project + GoCardless integration) is provisioned separately; this repo
is the frontend plus version-controlled copies of the edge functions and migrations.

## Getting started

Prerequisites: **Node 20+** and npm.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# then fill in the values (see below)

# 3. Run the dev server
npm run dev
```

### Environment variables

| Variable | Where to find it |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (anon/publishable key) |
| `VITE_GOOGLE_CLIENT_ID` | Google Cloud Console → Credentials → OAuth client ID |

See [`.env.example`](./.env.example) for the template. `.env*` files are gitignored — never
commit real keys.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

## Deployment

The app is a static SPA backed by Supabase — deploy `dist/` to any static host
(Vercel, Netlify, Cloudflare Pages). Build command: `npm run build`, output dir: `dist`.

After deploying, configure the production domain in each provider, or auth and payment
redirects will fail:

- **Supabase → Auth → URL Configuration** — add the domain to **Site URL** and **Redirect URLs**
  (otherwise email confirmation and password-reset links break).
- **Google Cloud Console → OAuth client** — add the domain to **Authorized JavaScript origins**.
- **GoCardless** — ensure the `redirect_uri` for `/wallet/setup/callback` matches the domain.

> **Note for testers:** Treatcode handles real Direct Debit mandates. Confirm whether the
> GoCardless integration is pointed at the **sandbox** or **live** environment before inviting
> testers — sandbox is strongly recommended for open testing so no real money moves.
