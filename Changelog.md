# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.2] - 2026-02-18

### Added

- **Store admin – Check farmer mobile** – `useCheckFarmerMobileNumber` hook to check if a farmer already exists by mobile number (POST `/farmer-storage-link/check`), with error handling and toasts
- **Store admin – Link farmer to store** – `useLinkFarmerAndColdStorage` hook to link an existing farmer to the current cold storage (POST `/farmer-storage-link/link-farmer-to-store`), with status-specific error messages
- **Farmer types** – Types for check-mobile and link-farmer-to-store APIs: `CheckFarmerMobileInput`, `CheckFarmerMobileApiResponse`, `CheckFarmerMobileResponseFarmer`, `LinkFarmerToStoreInput`, `LinkFarmerToStoreApiResponse`, and related response types

### Changed

- **Add farmer modal** – Two-step flow: debounced mobile check (with spinner) to detect existing farmers; if farmer exists, show “Link to this store” with account number and cost-per-bag; if not, keep existing quick-add form; uses `useCheckFarmerMobileNumber` and `useLinkFarmerAndColdStorage`; validation and used-account-number handling for link flow

---

## [0.4.1] - 2026-02-18

### Added

- **Farmer report PDF** – `FarmerReportPdf` component for stock-ledger style reports (incoming/outgoing gate passes, size columns, company/farmer/store-admin details)
- **Farmer profile – View Stock Ledger** – Button on farmer profile to generate and open the farmer report PDF in a new tab, with loading state (spinner) and success/error toasts

### Changed

- **Root layout** – Maintenance mode disabled; app renders normal `<Outlet/>` again instead of maintenance screen
- **Incoming / Outgoing gate-pass PDFs** – Footer logo uses fixed Coldop branding URL instead of conditional cold-storage image
- **Farmer profile** – "View Stock Ledger" button shows spinner while PDF is generating; minor UI tweaks (cursor-pointer on action buttons, date-range "to" label removed)

---

## [0.4.0] - 2026-02-17

### Added

- **Store admin app** – Full store-admin dashboard with authenticated layout and sidebar navigation
- **Daybook** – Daybook view with incoming/outgoing gate-pass cards, detail rows, and search
- **Incoming / Outgoing** – Routes and forms for incoming and outgoing gate passes with create/edit flows
- **People** – People management with farmer list and per-farmer storage link detail (`/people/$farmerStorageLinkId`)
- **My Finances** – Finances dashboard (balance sheet, vouchers, ledgers)
- **Analytics** – Analytics route and storage summary
- **Edit history** – Edit history view and `useGetEditHistory` integration
- **Services** – Incoming/outgoing gate-pass hooks, accounting (vouchers, ledgers, balance sheet), analytics, preferences, and store-admin functions (daybook search, farmers, gate passes, voucher number, edit history)
- **UI components** – Alert dialog, badge, calendar, chart, checkbox, collapsible, command, data-table, dialog, item, pagination, popover, progress, spinner, table, tabs
- **PDF** – PDF utilities/module
- **Types** – `farmer.ts`, `ledger.ts`
- **Zustand** – Demo store (`useBearStore`) and zustand route

### Changed

- **Router** – Removed standalone `src/router.tsx`; routing driven by file-based route tree
- **Routes** – Removed `about`, `case-studies`, `faq`, `support`; index and store-admin routes updated; new authenticated child routes: `analytics`, `daybook`, `edit-history`, `incoming`, `my-finances`, `outgoing`, `people`
- **App / main** – App layout and main entry updated for new structure and auth context
- **Daybook** – Expanded daybook component with new subcomponents and cards
- **Auth** – Store admin login/logout hooks refactored; authenticated layout and login route adjustments
- **UI** – Updates to avatar, button, dropdown-menu, empty, field, input, label, separator, sheet, sidebar, skeleton, sonner, tooltip; `lib/utils` tweaks
- **Dependencies** – Added TanStack Form, Table, React PDF, axios, cmdk, date-fns, react-day-picker, recharts, usehooks-ts, zod, zustand; lockfile updated

### Removed

- **Routes** – `src/router.tsx`, `about`, `case-studies`, `faq`, `support`

---

## [0.3.2] - 2026-02-17

### Changed

- **.gitignore** – Added `.cursor` so Cursor IDE metadata is not tracked.

---

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
