# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] - 2026-02-17

### Fixed

- **Store admin auth context** – Resolved `TypeError: Cannot read properties of undefined (reading 'isAuthenticated')` in route `beforeLoad` by providing router context from the auth store: router now receives `context.auth` from an `InnerApp` wrapper that reads `useStore` and passes `{ auth: { isAuthenticated, admin, token } }` into `RouterProvider`. Added optional chaining (`context.auth?.isAuthenticated`) in login and authenticated routes as a guard, and `router.invalidate()` after login/logout so route loaders see the updated auth state.

---

## [0.3.0] - 2026-02-17

### Added

- **TanStack Router** – File-based routing with `@tanstack/react-router` and `@tanstack/router-plugin` (Vite)
- **Router setup** – `src/router.tsx` with `createRouter`, type registration; `src/main.tsx` uses `RouterProvider`
- **Routes** – `src/routes/__root.tsx` (layout + devtools), `index`, `about`, `faq`, `case-studies`, `support`, `store-admin/login`
- **Route tree** – Generated `src/routeTree.gen.ts` (plugin regenerates on dev/build)
- **.vscode/settings.json** – Read-only and exclude `routeTree.gen.ts` from search/watcher per TanStack Router docs
- **Dependencies** – `@tanstack/react-router`, `@tanstack/react-router-devtools`, `@tanstack/react-query`; dev: `@tanstack/router-plugin`

### Changed

- **vite.config.ts** – Added `tanstackRouter` plugin (before React plugin) with `target: 'react'`, `autoCodeSplitting: true`
- **src/main.tsx** – Replaced direct `<App />` with `<RouterProvider router={router} />`

---

## [0.2.0] - 2025-02-17

### Added

- **shadcn/ui** – UI component system (new-york style) with Radix UI, Lucide icons, and `@/components` / `@/lib` aliases
- **Tailwind CSS v4** – Upgraded to Tailwind v4 with `@tailwindcss/vite` plugin
- **Path aliases** – `@/*` → `./src/*` in Vite and TypeScript
- **Prettier** – `.prettierrc` and `.prettierignore` for code formatting
- **Husky** – Git hooks setup (`.husky/`), with `.husky/_` ignored
- **Netlify** – `netlify.toml` with SPA redirects for deployment
- **`src/lib/utils.ts`** – Shared utilities (e.g. `cn` for class merging)
- **components.json** – shadcn/ui configuration

### Changed

- **.gitignore** – Added entries for Husky and env files (`.env`, `.env.local`, `.env.*.local`)
- **tsconfig / tsconfig.app.json** – Path mappings and config updates for aliases and app build
- **vite.config.ts** – Tailwind plugin and `@` path alias
- **src/index.css** – Tailwind and theme variables for shadcn/ui

### Dependencies

- New: `@tailwindcss/vite`, `tailwindcss`, `class-variance-authority`, `clsx`, `lucide-react`, `radix-ui`, `tailwind-merge`
- New dev: `shadcn`, `tw-animate-css`
