# Frontend Refactor Tasks (App Router Migration)

## Phase A — App Router Bootstrap
- [x] Install TypeScript & types
- [x] Create `src/app/`
- [x] Move `styles/globals.css` → `src/app/global.css`
- [x] Create root `src/app/layout.tsx` (Providers + HTML/Body)
- [x] Create root `src/app/page.tsx` (Landing Page)
- [x] Delete `src/pages` directory (Moved to `src/pages_backup`)

## Phase B — Route Grouping
- [x] Create `(marketing)` group
  - [x] Move About (`pages/about.js`) → `(marketing)/about/page.tsx`
  - [x] Move Contact (`pages/contact.js`) → `(marketing)/contact/page.tsx`
  - [x] Create `(marketing)/layout.tsx`
- [x] Create `(auth)` group
  - [x] Move Login (`pages/login.js`) → `(auth)/login/page.tsx`
  - [x] Move Signup (`pages/signup.js`) → `(auth)/signup/page.tsx`
  - [x] Move Forgot Password (`pages/forgot-password.js`) → `(auth)/forgot-password/page.tsx`
  - [x] Create `(auth)/layout.tsx`
- [x] Create `(dashboard)` group
  - [x] Move Dashboard (`pages/dashboard/index.js`) → `(dashboard)/page.tsx`
  - [x] Create `(dashboard)/layout.tsx` (Sidebar integration)
  - [x] Migrate sub-pages (today, weekly, monthly, streaks) to `(dashboard)/*/page.tsx`

## Phase C — Component Re-organization
- [x] Create `src/components/ui`
- [x] Move shared UI components → `src/components/ui` (None found, created `components/layout` for Navbar)
- [x] Move page-specific UI → `_components` in respective routes (Dashboard components moved)
- [x] Create `src/features/auth` and move logic (AuthContext, ProtectedRoute)
- [x] Create `src/features/contact-form` (if applicable) (Not needed yet)

## Phase D — Imports & Aliases
- [x] Configure `tsconfig.json` paths (`@/*`)
- [x] Update all imports to use aliases
- [x] Ensure `next.config.mjs` (or `.ts`) is correct (Using default Next.js config)

## Phase E — Validation
- [x] Verify `npm run dev` starts successfully
- [x] verify all routes load correctly
- [x] Ensure clean console
- [x] Verify folder structure matches target
