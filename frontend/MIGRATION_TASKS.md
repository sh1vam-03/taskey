# Frontend Migration Tasks (Vite → Next.js)

## Phase 0 – Preparation
- [x] Verify frontend.backup is not modified
- [x] Confirm Next.js uses Pages Router
- [x] Confirm no react-router dependency exists
- [x] Add frontend.backup to .gitignore

## Phase 1 – Route Mapping
- [x] Identify all public routes (home, about, contact)
- [x] Identify all auth routes (login, signup, forgot)
- [x] Identify all dashboard routes
- [x] Create matching files in frontend/src/pages

## Phase 2 – Page Scaffolding
- [x] Create pages/index.js
- [x] Create pages/login.js
- [x] Create pages/signup.js
- [x] Create pages/forgot-password.js
- [x] Create pages/dashboard/index.js
- [x] Create pages/dashboard/today.js
- [x] Create pages/dashboard/weekly.js
- [x] Create pages/dashboard/monthly.js
- [x] Create pages/dashboard/streaks.js

## Phase 3 – Component Migration
- [x] Migrate Navbar → components/common/Navbar.jsx
- [x] Migrate Footer → components/common/Footer.jsx (Skipped: Not found in backup)
- [x] Migrate Sidebar → components/dashboard/Sidebar.jsx
- [x] Migrate StatCard → components/dashboard/StatCard.jsx
- [x] Migrate CalendarGrid → components/dashboard/CalendarGrid.jsx
- [x] Remove react-router imports from all components

## Phase 4 – Auth Context
- [x] Create context/AuthContext.jsx
- [x] Wrap _app.js with AuthProvider
- [x] Replace useNavigate with next/router

## Phase 5 – API Layer
- [x] Create services/api.js with axios
- [x] Replace VITE_API_URL with NEXT_PUBLIC_API_URL
- [x] Migrate dashboard.services.js logic (Skipped: Empty file)

## Phase 6 – Route Protection
- [x] Create components/common/ProtectedRoute.jsx
- [x] Wrap dashboard pages with ProtectedRoute

## Phase 7 – Styling & Assets
- [x] Move assets to frontend/public (Skipped: Empty)
- [x] Update img src paths
- [x] Verify globals.css is loaded

## Phase 8 – Cleanup
- [x] Run npm run dev successfully
- [x] Remove unused imports
- [x] Ensure no Vite references remain
- [x] Report remaining TODOs

## Phase 9 – Page Implementation
- [x] Implement Home page using Navbar + home sections
- [x] Implement Login page using auth components
- [x] Implement Signup page using auth components
- [x] Implement Forgot Password page
- [x] Implement Dashboard layout (Sidebar + content area)
- [x] Wire dashboard navigation links

## Phase 10 – Dashboard Data Wiring
- [x] Connect dashboard overview to API
- [x] Load Today / Weekly / Monthly data dynamically
- [x] Handle loading & error states
- [x] Ensure empty states are user-friendly

## Phase 11 – Auth Flow Completion
- [x] Implement login API call
- [x] Store auth token securely
- [x] Restore auth on page refresh
- [x] Redirect after login/logout
- [x] Protect dashboard routes fully

## Phase 12 – UX & Polish
- [ ] Add loading indicators
- [ ] Add basic form validation
- [ ] Add error messages from API
- [ ] Improve dashboard responsiveness
- [ ] Remove console logs

## Phase 13 – Final Validation
- [ ] npm run dev works without warnings
- [ ] All routes navigable
- [ ] No unused files remain
- [ ] Code follows consistent style
- [ ] Summarize known limitations
