# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.16] - 2026-03-25

### Added

- **Transfer history** – Transfer history page loads transfer stock gate passes from `GET /transfer-stock` via `useGetTransferStockGatePasses`, with loading and error states, empty state, and `TransferStockGatePassCard` for each record (from/to farmers, items, linked incoming/outgoing gate passes).
- **Transfer stock query keys** – `transferStockGatePassKeys.list()` for list query invalidation and prefetch alongside existing create keys.

### Changed

- **Daybook & types** – Daybook and `useGetDaybook` types support `Incoming-transfer` and `Outgoing-transfer` alongside `RECEIPT` / `DELIVERY`; incoming and outgoing gate pass cards show a transfer label on the bags badge when applicable.
- **Farmer profile** – Combined gate pass list preserves API `type` instead of normalizing to RECEIPT/DELIVERY; stock summary table and breakdown dialog treat `Incoming-transfer` like receipts for quantity aggregation; rendering uses `IncomingGatePassCard` for both RECEIPT and Incoming-transfer entries.
- **Farmer gate passes** – `useGetFarmerGatePasses` routes `Incoming-transfer` entries to the incoming list.

---

## [0.4.15] - 2026-03-18

### Removed

- **Transfer stock** – Removed transfer stock UI, routes, and API hooks (`/store-admin/transfer-stock`, `/store-admin/transfer-stock-history`); Daybook and navigation no longer link to transfer stock flows.

### Added

- **Form keyboard flow** – `useEnterToNext` / `focusNextInForm` (`src/hooks/use-enter-to-next.ts`): Enter advances to the next focusable field in the same form without submitting; textareas keep newline on Enter (Shift+Enter or remarks field uses explicit next-focus).
- **Incoming gate pass form** – Form uses Enter-to-next; moving to step 2 scrolls to top and focuses the first chamber field; remarks textarea Enter moves to next field.
- **SearchSelector** – Optional `openOnFocus` (default `true`): when focusing the trigger via keyboard (e.g. Tab), the list opens so the search field is ready; mouse open/close behavior preserved; trigger uses `type="button"`.

### Changed

- **DatePicker** – Accepts both `dd.mm.yyyy` and `YYYY-MM-DD`; normalizes display and value on blur; placeholder documents both formats; calendar button is `type="button"` with `aria-label="Open calendar"`.
- **Incoming create – Summary sheet** – Create only runs after explicit confirmation in the summary sheet (fixes accidental submit on first Review); guard against double final submit while create is in flight; closing the sheet resets confirm state.
- **Incoming summary sheet** – Opening the sheet focuses "Create Gate Pass" (or Cancel if disabled); primary button supports keyboard activation via Enter.

---

## [0.4.14] - 2026-03-16

### Added

- **Transfer stock between farmers** – New `TransferStockForm` under Daybook lets store admins move stock from one farmer to another using existing incoming gate passes; includes farmer search selector, per-gate-pass quantity allocation, and a confirmation summary sheet before creating the transfer.
- **Transfer stock routes & history** – New `/store-admin/transfer-stock` screen for creating transfers and `/store-admin/transfer-stock-history` for viewing past transfers with paging and filters; accessible from Daybook actions and the user menu.

### Changed

- **Navigation – Daybook & history** – Daybook navigation now treats `/store-admin/transfer-stock` as part of the Daybook section; app top bar includes a "Transfer Stock" entry under the user menu for quick access.

---

## [0.4.13] - 2026-03-06

### Added

- **Stock summary – All / Owned / Farmer tabs** – Analytics storage summary table and farmer profile stock summary table now show three filter tabs ("All", "Owned", "Farmer") when `shouldShowSpecialFields(admin?.mobileNumber)` is true; "All" shows combined data, "Owned" and "Farmer" show data from gate passes with the corresponding stock filter
- **Analytics summary API – stockFilter** – `useGetStorageSummary` supports optional `stockFilter: true` to fetch summary grouped by stock filter (OWNED / FARMER); by-filter request is only made when filter tabs are visible (`enabled` option)
- **Storage summary types** – `StockSummaryByFilterData`, `GetStorageSummaryByFilterApiResponse`, and overloaded `useGetStorageSummary` return types for correct typing of default vs by-filter responses

### Changed

- **Analytics page** – Fetches by-filter summary when special fields are shown and passes it to `StorageSummaryTable` for Owned/Farmer tab data
- **Farmer stock summary table** – Filters `incomingEntries` by `stockFilter === 'OWNED'` or `'FARMER'` when Owned/Farmer tab is selected; breakdown dialog uses filtered entries

---

## [0.4.12] - 2026-03-05

### Added

- **Incoming gate pass – Edit with farmer link** – Edit incoming form and update API now support optional `farmerStorageLinkId` in the payload so incoming gate passes can be associated with a farmer–storage link when editing

### Changed

- **Payment reminder toaster** – Toast is now one-time per session (tracked via sessionStorage), auto-dismisses after 30 seconds, and can be closed by the user; no longer persists indefinitely
- **Sonner toaster** – Global toaster now shows a close button on toasts

---

## [0.4.11] - 2026-02-26

### Added

- **Edit history – Special fields** – Edit history snapshot types and UI now include `customMarka` and `stockFilter`; snapshot summary shows custom marka and stock only when `shouldShowSpecialFields(admin?.mobileNumber)` is true

### Changed

- **Daybook incoming card** – Stock filter badge moved from detail rows to the badge row next to status; layout uses flex-wrap and justify-end for badges
- **Farmer report PDF** – Full layout support for special-fields mode: receipt/delivery tables show Custom Marka column and optional grouping when store admin is allowed; farmer profile passes store admin so PDF respects special-fields visibility
- **Daily report PDF** – Minor alignment with special-fields handling
- **Farmer profile** – Passes store admin (mobileNumber) to FarmerReportPdf for special-fields-aware farmer report

---

## [0.4.10] - 2026-02-25

### Added

- **Special fields configuration** – `src/lib/special-fields.ts`: centralized allowed mobile numbers and `shouldShowSpecialFields(mobileNumber)` for custom marka, stock filter, and PDF special-layout visibility

### Changed

- **Incoming form & daybook card** – Replaced inline allowed-numbers check with `shouldShowSpecialFields(admin?.mobileNumber)` from `@/lib/special-fields`
- **Daily report PDF** – Accepts optional `admin` prop; when admin mobile is allowed, receipt/delivery tables show "Custom Marka" column and rows include custom marka; G.TOTAL column hidden when special fields are shown
- **Farmer report PDF** – Store admin now includes `mobileNumber` so PDF can show custom marka column for allowed admins
- **Get reports dialog** – Passes admin (mobileNumber) to DailyReportPdf for special-fields-aware layout
- **Farmer profile** – Passes store admin mobile number to FarmerReportPdf for special-fields visibility

---

## [0.4.9] - 2026-02-25

### Added

- **Incoming gate pass – Stock filter & custom marka** – Optional "Stock Filter" (OWNED/FARMER) and "Custom Marka" fields on incoming create/edit forms, visible only for specific admin mobile numbers; daybook incoming card shows Stock and uses custom marka as Lot No when set; create/update APIs and daybook types include `stockFilter` and `customMarka`

---

## [0.4.8] - 2026-02-19

### Added

- **Outgoing summary sheet – Extraction location** – Allocations table now shows an "Extraction location" column (chamber - floor - row) for each size row, with formatted display and fallback "—" when empty

### Changed

- **PDF reports – Location format** – Daily report and farmer report PDFs now display location as hyphen-separated `(chamber-floor-row)`, e.g. `(1-2-1)` instead of space-separated
- **Outgoing summary sheet** – Switched to semantic theme tokens (foreground, muted-foreground, border, muted) for consistent theming and dark/light support

---

## [0.4.7] - 2026-02-19

### Added

- **Advanced Analytics – Location drill-down** – Location tab: view unique chambers, then select a chamber to see floors (with checkboxes), then “View orders” to see orders table; **Current / Initial** quantity tabs above Location/Farmer so all quantities (chamber totals, floor totals, table) follow the selected type
- **Chamber & floor aggregations** – Each chamber card shows aggregated total (current or initial quantity) for that chamber; floors view shows chamber total and per-floor totals next to each floor
- **Object.groupBy types** – `src/object-groupby.d.ts` type declaration for ES2024 `Object.groupBy` used in analytics grouping

### Changed

- **Advanced Analytics – Location tab** – Replaced flat chamber list with drill-down: chambers → floors (multi-select) → orders table; orders table columns: IGP #, Date, Variety, Farmer, Row, Bag, quantity (Chamber and Floor columns removed as they are fixed by the drill-down selection)

---

## [0.4.6] - 2026-02-19

### Added

- **Ledger balance computation** – `computeLedgerBalancesFromVouchers` in `src/services/accounting/computeLedgerBalances.ts` computes closing balance per ledger from opening balance and vouchers (Asset/Expense: opening + debits − credits; Liability/Income/Equity: opening − debits + credits)
- **Ledger types & chart of accounts** – `chartOfAccounts`, `LEDGER_OPTIONS`, and related types in `src/types/ledger.ts` for structured subType and category options (Fixed Assets, Current Assets, Direct/Operating/Non-Operating Expenses, etc.)

### Changed

- **Balance sheet** – Uses `computeLedgerBalancesFromVouchers` for all ledger balances (stock in hand, sales, purchases, equity, liabilities, assets) so totals are consistent with voucher data
- **Closing balances tab** – Uses computed balances from vouchers instead of `balance`/`closingBalance` on ledger
- **Trading & P&L** – Uses computed ledger balances for sales, purchases, and other income/expense totals
- **Ledger create / edit forms** – Sub type and category are now SearchSelector dropdowns driven by `LEDGER_OPTIONS`; type change clears subType and category; category options depend on selected subType
- **Ledger view tab** – Aligned with computed balance logic where relevant
- **Voucher hooks** – `useCreateVoucher`, `useUpdateVoucher`, `useDeleteVoucher` invalidate ledgers query on success so balance sheet and related views refresh
- **Store admin** – `useLinkFarmerAndColdStorage` and `useQuickAddFarmer` invalidate farmers/ledgers as needed
- **Sell potato form** – Minor updates for consistency

---

## [0.4.5] - 2026-02-18

### Changed

- **Preferences types** – Added `labourCost: number` to `Preferences` interface in `src/types/preferences.ts` to align with backend Mongoose model

---

## [0.4.4] - 2026-02-18

### Added

- **Analytics – Variety breakdown** – New route and screen at `/store-admin/analytics/variety-breakdown`; storage summary table cells are clickable and navigate with `variety` and `bagSize`; variety breakdown shows size-wise distribution chart, farmer-wise share chart, and farmer quantity table (current/initial/outgoing tabs); uses `useVarietyBreakdown` and new components under `variety-breakdown/` (SizeWiseDistributionChart, FarmerWiseShareChart, FarmerQuantityTable)

### Changed

- **Analytics** – Storage summary table supports optional `onCellClick(variety, bagSize)`; analytics page wires cell click to navigate to variety breakdown; variety distribution accepts `quantityType` prop to align with analytics mode (current/initial/outgoing)

---

## [0.4.3] - 2026-02-18

### Added

- **Daybook – Get reports** – Get reports dialog with date range and “group by farmers” option; fetches report data via `useGetReports` and opens daily report PDF in a new tab, with loading/success/error toasts
- **Daily report PDF** – `DailyReportPdf` component for date-range daily reports (incoming/outgoing rows, size columns, receipt/delivery tables, optional farmer-grouped layout)
- **Analytics** – `useGetReports` hook for GET `/analytics/get-reports` with types for report data (flat and grouped by farmer); `useVarietyBreakdown` hook for variety breakdown

### Changed

- **Daybook** – Integrated Get reports dialog (button to open dialog and generate/view daily report PDF)

---

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
