# Contributing to TASKTIME

First off — thank you for taking the time to contribute! 🎉

Whether you're fixing a bug, adding a feature, improving docs, or just giving feedback, every contribution makes TASKTIME better for everyone. This document explains how to contribute effectively.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Before You Start](#before-you-start)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Code Style](#code-style)
- [Pull Request Guidelines](#pull-request-guidelines)
- [What We Will Accept](#what-we-will-accept)
- [What We Won't Accept](#what-we-wont-accept)

---

## Code of Conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). By participating you agree to abide by its terms. Please treat everyone with respect.

---

## Before You Start

- Search [existing issues](https://github.com/sh1vam-03/tasktime/issues) to make sure your bug/feature isn't already reported or in progress.
- For large changes (new screens, new API modules, architecture changes), open a [Discussion](https://github.com/sh1vam-03/tasktime/discussions) first to align on approach before writing code.
- Small fixes (typos, minor bugs, documentation) can go straight to a Pull Request.

---

## How to Contribute

### Reporting Bugs

Open a [new issue](https://github.com/sh1vam-03/tasktime/issues/new) and include:

- **Title** — clear, one-line description of the problem
- **Platform** — Web / Android (what version?)
- **Steps to reproduce** — numbered list, exact steps
- **Expected behavior** — what should happen
- **Actual behavior** — what actually happens
- **Screenshots or logs** — if applicable
- **Device/OS info** — for mobile bugs (e.g., Samsung Galaxy S21, Android 13)

The more specific you are, the faster we can fix it.

---

### Suggesting Features

Open a [Discussion](https://github.com/sh1vam-03/tasktime/discussions/new?category=ideas) and describe:

- **The problem** — what frustrates you or what's missing
- **Your proposed solution** — how you'd like it to work
- **Alternatives considered** — other approaches you thought of
- **Who benefits** — which users would use this

---

### Pull Requests

```bash
# 1. Fork the repository on GitHub
# Go to https://github.com/sh1vam-03/tasktime and click Fork

# 2. Clone your fork locally
git clone https://github.com/YOUR_USERNAME/tasktime.git
cd tasktime

# 3. Add the original repo as upstream
git remote add upstream https://github.com/sh1vam-03/tasktime.git

# 4. Create a feature branch off develop (not main)
git checkout -b feature/your-feature-name

# 5. Make your changes
# Write clean code, test your changes, add comments

# 6. Stage and commit
git add .
git commit -m "Add: description of what you added"

# 7. Keep your branch up to date before opening PR
git fetch upstream
git rebase upstream/develop

# 8. Push to your fork
git push origin feature/your-feature-name

# 9. Open a Pull Request on GitHub
# Base: develop  ←  Compare: your branch
```

---

## Development Setup

See the [Getting Started](README.md#-getting-started) section in the README for detailed setup instructions for backend, web frontend, and mobile app.

**Quick summary:**

```bash
# Backend
cd backend && npm install && cp .env.example .env && npm run dev

# Web
cd frontend && npm install && cp .env.example .env.local && npm run dev

# Mobile
cd app && npm install && cp .env.example .env && npx react-native run-android
```

---

## Branch Naming

Use kebab-case. Be specific.

| Type | Pattern | Good example | Bad example |
|------|---------|--------------|-------------|
| New feature | `feature/name` | `feature/push-notifications` | `feature/notifs` |
| Bug fix | `bugfix/name` | `bugfix/otp-not-expiring` | `bugfix/fix` |
| Urgent fix | `hotfix/name` | `hotfix/auth-token-crash` | `hotfix/crash` |
| Documentation | `docs/name` | `docs/api-auth-examples` | `docs/update` |
| Refactor | `refactor/name` | `refactor/task-service-cleanup` | `refactor/code` |

---

## Commit Messages

Follow this format:

```
Type: Short description (max 72 characters)

Optional longer explanation of WHY this change was made,
not just what was done. Wrap at 72 characters.

Closes #123  ← reference issues if applicable
```

**Types:**

| Type | When to use |
|------|-------------|
| `Add:` | New file, feature, or component |
| `Fix:` | Bug fix |
| `Update:` | Modify existing functionality |
| `Remove:` | Delete code or files |
| `Docs:` | Documentation only |
| `Refactor:` | Code restructure, no behavior change |
| `Style:` | Formatting, whitespace, no logic change |
| `Test:` | Adding or fixing tests |

**Good examples:**
```
Add: password strength meter to RegisterScreen
Fix: OTP timer not resetting after resend
Update: AI stream error handling to show user-friendly message
Docs: add API request/response examples for /auth/login
```

**Bad examples:**
```
fix bug
update stuff
WIP
asdfgh
```

---

## Code Style

### General

- Use meaningful, descriptive names for variables, functions, and files
- Keep functions small and focused — one function does one thing
- Add comments for non-obvious logic, not for everything
- No `console.log` in production code — remove before committing
- Handle errors properly — never silently swallow errors

### JavaScript / React Native

```js
// ✅ Good
const handleTaskCreate = async (taskData) => {
    try {
        const { data } = await createTask(taskData);
        addTask(data.task);
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to create task');
    }
};

// ❌ Bad
const create = async (d) => {
    const r = await createTask(d);  // no error handling
    addTask(r.data.task);
};
```

### File Structure

- Follow the existing folder structure exactly
- New screens go in the relevant `screens/` subfolder
- New API calls go in the existing `api/` files or a new `feature.api.js`
- Shared components go in `components/common/`
- New hooks go in `hooks/`

### React Native Specific

- Always use `SafeAreaView` for screens
- Use `KeyboardAvoidingView` on forms
- Use `react-native-mmkv` for storage, not `AsyncStorage`
- Use the existing `ThemeContext` — don't hardcode colors
- Use existing `C` and `RADIUS` tokens from `_authShared.js` in auth screens

---

## Pull Request Guidelines

Your PR description must include:

```markdown
## What does this PR do?
Clear one-paragraph summary of the change.

## Why is this change needed?
The problem it solves or the feature it adds.

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactor
- [ ] Other: ___

## Screenshots (for UI changes)
Before | After

## Testing done
How did you test this? On which device/emulator?

## Checklist
- [ ] Code follows project style guidelines
- [ ] I have tested on Android
- [ ] No console.log left in code
- [ ] I have updated documentation if needed
```

---

## What We Will Accept

- ✅ Bug fixes with clear reproduction steps
- ✅ Performance improvements with measurable impact
- ✅ New features aligned with the product roadmap
- ✅ Documentation improvements
- ✅ Code quality improvements (refactoring, better error handling)
- ✅ Accessibility improvements
- ✅ New language translations

---

## What We Won't Accept

- ❌ Breaking changes without prior discussion
- ❌ Removing existing features without strong justification
- ❌ PRs with no description
- ❌ Code that doesn't follow the existing style
- ❌ Adding dependencies without discussion (especially large ones)
- ❌ Committing `.env` files, API keys, or keystores

---

## Questions?

If you're unsure about anything, open a [Discussion](https://github.com/sh1vam-03/tasktime/discussions) and ask. We're happy to help.

Thank you for contributing to TASKTIME! 🙏