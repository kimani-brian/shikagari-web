<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# shikagari-web

## Stack
- Next.js `16.2.1` App Router, React `19.2.4`, TypeScript strict (`ES2017`, `bundler` resolution), Tailwind `3.4.14`.
- `reactCompiler: true` in `next.config.ts` (`babel-plugin-react-compiler@1.0.0`) — do not add manual `memo`/`useMemo`/`useCallback` purely for perf.
- Path alias `@/*` → `src/*` (`tsconfig.json:21`).

## Commands
- `npm run dev` — Next dev server on `http://localhost:3000`
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — ESLint flat config (`eslint.config.mjs`): `next/core-web-vitals` + `next/typescript`, ignores `.next/**`, `out/**`, `build/**`, `next-env.d.ts`
- No test runner, no CI, no `opencode.json` — do not assume `npm test` or workflows exist.

## Env — required
- `NEXT_PUBLIC_API_URL` must be set in `.env.local` (e.g. `http://localhost:8080/api/v1`). `src/lib/config.ts:1` throws at import if missing; trailing slash is stripped, `API_ORIGIN` derives by removing `/api/v1`.
- Backend is external (Go service on `:8080`). No mock — dev requires the API running or all `src/lib/api.ts` calls fail (15s timeout).

## Architecture
- `src/app/` — App Router; route groups: `(auth)/login`, `(auth)/register`, `dashboard/*` (admin/inbox/listings/profile), `listings/`, `dealers/`, `sellers/`. `src/app/layout.tsx:24` wraps app in `AuthProvider` + `Navbar`/`Footer` and `react-hot-toast` `Toaster`.
- `src/components/` — `cars/`, `layout/`, `search/`, `ui/` (`Button`, `Input`, `Badge`, `Skeleton`, `Pagination`), `shared/`.
- `src/contexts/AuthContext.tsx` — client-only auth; hydrates from `localStorage` keys `shikagari_token` / `shikagari_user`. Use `useAuth()` inside `AuthProvider`.
- `src/lib/api.ts` — axios instance on `API_BASE_URL`; request interceptor injects `Bearer` token only on client (`isServer` guard); 401 response clears storage and redirects to `/login` if not already there.
- `src/lib/utils.ts` — `cn()`, `formatKES()`, `formatMileage()`, `timeAgo()`.
- `src/types/index.ts` — single source for `User`, `ListingCard`/`ListingDetail`, `DealerProfile`/`PrivateSellerProfile`, `Inquiry`, `APIResponse`/`PaginationMeta`.
- `src/hooks/` — `useListings`/`useListing`/`useMyListings` (`useListings.ts`), `useDebounce`, `useAdminProfiles`.

## Tailwind / Styling
- `tailwind.config.ts` content only scans `src/pages/**`, `src/components/**`, `src/app/**` — classes outside these are purged.
- Custom brand palette (`brand` 50-950, `navy`, `gold`, `surface`), fonts `DM Sans` (sans) + `Sora` (display) loaded via `@import` in `src/app/globals.css:1`, custom shadows (`card`, `nav`, `blue`) and animations (`fade-up`, `fade-in`, `shimmer`). Use `cn()` from `src/lib/utils.ts:4` for merging.
- `darkMode: "class"` but no theme toggle wired yet; `next-themes` is installed, `next.config.ts` has no extra setup.

## Gotchas
- `src/hooks/useListings.ts:43` uses `JSON.stringify(filters)` in dep array — do not refactor to raw object without handling referential equality.
- All `localStorage` access must be client-guarded (`isServer` or inside `useEffect`) — SSR will crash otherwise.
- `globals.css` sets `--nav-height: 68px` and `layout.tsx` offsets `main` with `pt-[var(--nav-height)]`.
