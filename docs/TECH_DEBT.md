# Tech Debt & Cleanup Log

## 🔴 Critical Issues (Must Fix)
- [ ] **Missing UI**: No frontend component calls `behaviorService.upsertBehavior`. User cannot log mood/focus.
- [ ] **Validation**: Ensure `BehaviorModal` handles 403 "Limit Reached" error.

## 🟠 Improvements (Should Fix)
- [ ] **API**: `contactForm.actions.js` was using a simulated delay; now uses `publicService`. We should remove the old file if it's no longer needed or fully refactor it.
- [ ] **Loading States**: `BehaviorPage` loading state is basic. Could be smoother.
- [ ] **Empty States**: Dashboard might look empty for new users.

## 🟢 Cleanup Candidates
- [ ] Check for unused "shadcn" components that were installed but not used.
- [ ] Console logs in production code (e.g. `console.error` in try/catch blocks should be logged to a service or handled gracefully).
