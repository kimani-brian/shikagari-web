<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# shikagari-web

Kenya car marketplace — Next.js App Router frontend for external Go API. No monorepo, no backend in this repo.

## Stack
- Next.js `16.2.1` App Router, React `19.2.4`, TypeScript strict (`ES2017`, `bundler`, `strict: true`), Tailwind `3.4.14`.
- `reactCompiler: true` in `next.config.ts` (`babel-plugin-react-compiler@1.0.0`) — do not add `memo`/`useMemo`/`useCallback` for perf only.
- Path alias `@/*` → `src/*` (`tsconfig.json:21`). Axios for HTTP, Radix UI + `lucide-react` + `react-hot-toast`.

## Commands
- `npm run dev` — dev server `http://localhost:3000`
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — ESLint flat config (`eslint.config.mjs`: `next/core-web-vitals` + `next/typescript`, ignores `.next/**`, `out/**`, `build/**`, `next-env.d.ts`)
- No test runner, no CI, no `opencode.json` — do not assume `npm test`.

## Env — required
- `NEXT_PUBLIC_API_URL` in `.env.local` (e.g. `http://localhost:8080/api/v1`). `src/lib/config.ts:1` throws at import if missing; trailing slash stripped, `API_ORIGIN` derived by removing `/api/v1`, `isServer` guards SSR.
- Backend is external Go service on `:8080` — no mock. All `src/lib/api.ts` calls fail after 15s timeout if unreachable.

## Architecture
- `src/app/layout.tsx:24` — root layout wraps everything in `AuthProvider` + `Navbar`/`Footer` + `Toaster` (`react-hot-toast` top-right).
- Route groups: `(auth)/login`, `(auth)/register` (no URL prefix); `dashboard/*` (`admin`, `inbox`, `listings`, `profile`) client-protected via `AuthContext`; `listings/`, `dealers/`, `sellers/profile/new`, `about/`.
- `src/contexts/AuthContext.tsx` — client-only, hydrates from `localStorage` keys `shikagari_token`/`shikagari_user` inside `useEffect`. Use `useAuth()` only inside `AuthProvider`. `refreshUser()` hits `GET /users/me`.
- `src/lib/api.ts` — axios on `API_BASE_URL` (15s timeout); request interceptor injects `Bearer` token only on client; 401 clears storage and redirects to `/login` if not already there.
- `src/types/index.ts` — single source for `User` (`buyer|seller|admin`), `ListingCard`/`ListingDetail`, `DealerProfile`/`PrivateSellerProfile`, `Inquiry`, `APIResponse`/`PaginationMeta`.
- `src/hooks/` — `useListings`/`useListing`/`useMyListings` (`useListings.ts`), `useDebounce`, `useAdminProfiles`.
- `src/lib/utils.ts:4` — `cn()` (`clsx` + `tailwind-merge`), `formatKES()`, `formatMileage()`, `timeAgo()`.

## Styling
- `tailwind.config.ts:5` content scans only `src/pages/**`, `src/components/**`, `src/app/**` — classes elsewhere are purged.
- Theme: `ink` palette (50-950) + `border: #e5e5e5`; fonts `Inter` + `Material Symbols Outlined` via `@import` in `src/app/globals.css:1`; shadows `card`/`nav`; animations `fade-up`/`fade-in`.
- Use `cn()` for merging. `darkMode: "class"` set but no toggle wired (`next-themes` installed, no `next.config.ts` setup).
- `globals.css:9` sets `--nav-height: 64px`; `layout.tsx:62` offsets `<main>` with `pt-[var(--nav-height)]`.

## Gotchas
- `src/hooks/useListings.ts:43` — `JSON.stringify(filters)` in dep array is intentional (avoids referential-equality loops); do not refactor to raw object.
- All `localStorage`/`window` access must be client-guarded (`isServer` from `src/lib/config.ts:15` or inside `useEffect`) — SSR will crash otherwise.
- `CLAUDE.md` just re-exports `AGENTS.md` (`@AGENTS.md`) — edit only `AGENTS.md`.

