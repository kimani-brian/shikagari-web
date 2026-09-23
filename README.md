# ShikaGari — Find Your Perfect Car in Kenya

Kenya's trusted car marketplace. Browse thousands of verified listings from dealers and private sellers across Nairobi, Mombasa, Kisumu and beyond. Built with Next.js 16 App Router.

Live marketplace features: search & filtering, verified seller badges, dealer/private seller profiles, listings, inquiries, and admin approval flows.

## Stack

- **Framework:** Next.js `16.2.1` (App Router), React `19.2.4`
- **Language:** TypeScript strict (`ES2017`, `bundler` resolution)
- **Styling:** Tailwind CSS `3.4.14`, `clsx` + `tailwind-merge` (`cn()` helper)
- **Compiler:** React Compiler enabled (`reactCompiler: true` in `next.config.ts` via `babel-plugin-react-compiler@1.0.0`)
- **HTTP:** `axios` with `Bearer` token interceptor (`src/lib/api.ts`)
- **UI:** Radix UI (`dialog`, `select`, `slot`), `lucide-react`, `react-hot-toast`, `next-themes`
- **Path alias:** `@/*` → `src/*`

## Prerequisites

- Node.js 18+ / npm
- Running backend API (Go service, default `http://localhost:8080`) — no mock, all data comes from the API

## Getting Started

1. **Install**

   ```bash
   npm install
   ```

2. **Env** — create `.env.local` in the project root:

   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
   ```

   > Required. `src/lib/config.ts` throws at import if missing. Trailing slash is stripped; `API_ORIGIN` is derived by removing `/api/v1`. See `src/lib/config.ts:1`.

3. **Run dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Next dev server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint flat config (`eslint.config.mjs` — `next/core-web-vitals` + `next/typescript`) |

No test runner or CI is configured.

## Project Structure

```
src/
  app/                  # App Router
    (auth)/login        # login
    (auth)/register     # registration
    page.tsx            # homepage (hero, categories, featured, cities)
    listings/           # browse + [id] detail
    dealers/            # dealer directory + profile creation
    sellers/profile/new # private seller onboarding
    dashboard/          # authenticated area
      admin/            # admin + verified sellers
      inbox/            # inquiries
      listings/         # my listings (new, [id]/edit)
      profile/          # user profile
    about/              # about page
    layout.tsx          # root layout — AuthProvider + Navbar/Footer + Toaster
    globals.css         # Tailwind + --nav-height: 68px
  components/
    cars/               # CarCard, CarGrid
    layout/             # Navbar, Footer, PageWrapper
    search/             # SearchBar, FilterSidebar
    ui/                 # Button, Input, Badge, Skeleton, Pagination
    shared/             # LoadingSpinner, VerifiedBadge, EmptyState
  contexts/
    AuthContext.tsx     # client-only auth, hydrates from localStorage
  hooks/
    useListings.ts      # useListings / useListing / useMyListings
    useDebounce.ts
    useAdminProfiles.ts
  lib/
    config.ts           # API_BASE_URL, API_ORIGIN, isServer
    api.ts              # axios instance (15s timeout)
    utils.ts            # cn(), formatKES(), formatMileage(), timeAgo()
  types/
    index.ts            # User, ListingCard/Detail, Dealer/PrivateSeller, Inquiry, APIResponse
```

Route groups: `(auth)` is a group without URL prefix. `dashboard/*` is protected client-side via `AuthContext`.

## Environment

| Variable | Required | Example | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:8080/api/v1` | Exposed to browser; must end with `/api/v1` |

Backend must be reachable or every `src/lib/api.ts` request fails after 15s.

## Auth & API

- **Storage:** `localStorage` keys `shikagari_token` / `shikagari_user` (`src/contexts/AuthContext.tsx`). Hydrated in `useEffect`; always guard with `isServer` or `useEffect` for SSR.
- **Axios:** Request interceptor injects `Authorization: Bearer <token>` only on client (`src/lib/api.ts:13`). 401 response clears storage and redirects to `/login` unless already there.
- **Roles:** `buyer` | `seller` | `admin` (`src/types/index.ts:18`). Buyers can request private-seller approval (national ID + location) on the homepage; dealers have separate `business_reg_no` / `kra_pin` flow.
- **Listings API:** `GET /listings?search=&location=&make=&...&page=&per_page=` with `PaginationMeta`; `GET /listings/:id`; `GET /listings/me` for seller dashboard.

## Styling

- Tailwind `content` scans only `src/pages`, `src/components`, `src/app` (`tailwind.config.ts:5`) — classes elsewhere are purged.
- Design tokens: `brand` (50–950, blue scale), `navy`, `gold`, `surface`; fonts `DM Sans` (sans) + `Sora` (display) via `@import` in `globals.css:1`; shadows `card`/`card-hover`/`nav`/`blue`; animations `fade-up`/`fade-in`/`shimmer`.
- Use `cn()` from `src/lib/utils.ts:4` for class merging.
- `darkMode: "class"` is set but no toggle is wired yet (`next-themes` installed).

## Gotchas

- `useListings` uses `JSON.stringify(filters)` as dep (`src/hooks/useListings.ts:43`) — intentional to avoid referential-equality loops.
- `next.config.ts` has `reactCompiler: true` — avoid manual `memo`/`useMemo`/`useCallback` for perf only.
- `globals.css` defines `--nav-height: 68px`; `layout.tsx` offsets `<main>` with `pt-[var(--nav-height)]`.

## Learn More

- [Next.js Docs](https://nextjs.org/docs)
- `node_modules/next/dist/docs/` — local guide for this Next.js version (has breaking changes vs older training data; see `AGENTS.md`)

## Deploy

Standard Next.js build:

```bash
npm run build && npm start
```

Set `NEXT_PUBLIC_API_URL` in your hosting env (Vercel, etc.). No extra `next.config.ts` setup required.
