# Changelog

All notable changes to this project are documented in this file.

## [0.5.1] - 2026-06-21

Shared daybook navigation, sidebar active-state fixes, and transfer matrix stock-level indicators.

### Added

- Shared `DaybookBackButton` on incoming create/edit, outgoing create, transfer stock create, and incoming edit history pages.
- Transfer gate pass matrix slot stock levels (`full`, `depleted`, `critical`) with color-coded buttons and disabled empty slots.
- Matrix slot display shows current vs initial bag counts (`current / initial`).

### Changed

- Sidebar Daybook nav stays active on `/incoming`, `/outgoing`, and `/transfer` routes.
- Incoming edit history page header layout aligned with other daybook sub-pages.
- Transfer and outgoing forms: section label renamed from "Storage gate passes" to "Incoming gate pass".

## [0.5.0] - 2026-06-21

Outgoing and transfer-stock gate pass flows, incoming edit API integration, edit-history auditing, and Vitest test infrastructure.

### Added

- Outgoing gate pass creation at `/outgoing` with farmer selection, transfer allocation matrix, review sheet, and `/outgoing-gate-pass/` API wiring.
- Outgoing daybook card actions: inline edit sheet, null/void with confirmation, transfer-type badges, and order detail display.
- Incoming gate pass update API integration on shared `IncomingForm` edit mode (`PATCH /incoming-gate-pass/:id`).
- Incoming edit history page at `/incoming/edit-history` with paginated audit list and formatted field-level before/after values.
- Transfer stock creation wired to `/transfer-stock` API with summary sheet and `AllocationReviewByVariety` for review.
- `useIncomingGatePassesByFarmerLink` hook to load storage gate passes from live incoming records for transfer and outgoing forms.
- `TransferGatePassBadge` and transfer-type helpers on incoming and outgoing daybook cards.
- Vitest + Testing Library setup (`test`, `test:watch` scripts, `src/test/setup.ts`, shared `test-utils`).
- Component and payload mapper tests for incoming, outgoing, transfer-stock, finances, and people flows.

### Changed

- Daybook toolbar: add outgoing, transfer stock, and edit-history actions via dropdown menu.
- Outgoing gate pass card rebuilt with expand/collapse, ERP formatting, and edit/null mutations.
- Incoming gate pass card relocated under `features/daybook`; transfer allocation badges on transfer-type entries.
- Transfer stock form loads storage passes from API-backed incoming gate passes; schema and matrix utilities extended for create payload.
- Incoming create/edit payload mappers updated for API field alignment.
- Topbar title resolution for outgoing and incoming edit-history routes.
- `form-utils`: `normalizeUppercase` helper.

### Notes

- Outgoing detail route (`/outgoing/:id`) and outgoing edit history page are route stubs for future work.

## [0.4.0] - 2026-06-20

Incoming gate pass create and edit flows, shared form infrastructure, and list pagination improvements across daybook and finances.

### Added

- Shared `IncomingForm` for create and edit modes with review sheet, farmer combobox, and preference-driven commodity, marka, and stock-filter fields.
- Incoming gate pass creation wired to `/incoming-gate-pass/` API with payload mapping and daybook query invalidation.
- Edit incoming gate pass page at `/incoming/:id` that hydrates form values from the daybook cache via `find-incoming-daybook-entry`.
- Next gate pass number hook and API helper for auto-assigning incoming receipt numbers on create.
- `ListPaginationFooter` and `PageSizeSelect` shared components with page-size control and compact pagination UI.
- Daybook page-size URL param (`limit`: 10, 50, 100) and row range summary in the list footer.
- Preferences form fields for labour cost, stock filter (enable + options), and marka type.
- Shared `form-utils` (`numericInputProps`, `parseOptionalNumber`) and `gate-pass-number` utilities.
- Incoming quantities location completion tracking with apply-to-all from the first complete row.
- Cursor rule `form-fields.mdc` documenting canonical form field patterns.

### Changed

- Create incoming form refactored onto shared `IncomingForm`; quantities section rebuilt with preference-ordered bag sizes and improved validation.
- Daybook incoming cards link to the edit route; topbar resolves titles for incoming detail paths.
- Ledger and voucher table pagination consolidated onto `ListPaginationFooter`.
- Finance and people dialogs aligned with default input sizing and shared numeric helpers.
- ERP style guide updated for form field defaults and numeric field conventions.
- Dependency: `@tanstack/zod-form-adapter`.

### Notes

- Edit incoming submit is UI-complete; update API integration is deferred (review logs payload for now).

## [0.3.0] - 2026-06-19

Daybook wired to live gate-pass data with search and filters, plus people registration and profile improvements.

### Added

- Daybook list and search API hooks with URL-driven pagination, type filter (all/incoming/outgoing), sort order, and search-by field (gate pass, manual parchi, marka, remarks).
- Incoming and outgoing gate pass cards with expandable detail, ERP-style numeric formatting, and loading skeletons.
- Daybook search domain layer (`search.ts`, `types.ts`, `format.ts`) and debounced receipt-number input hook.
- Farmer profile page at `/people/:id` with cost-per-bag display and contact details from route search params.
- Shared `SettingsBackButton` on Profile and Preferences pages for navigation back to Settings.

### Changed

- Daybook page rebuilt from placeholder tab to live paginated list with refresh, error, and empty states.
- Post-login, sidebar, and finances-disabled redirects now use shared `DEFAULT_DAYBOOK_SEARCH` params.
- Quick-register farmer API aligned to `/farmer-storage-link/quick-register-farmer` response shape.
- Add farmer form: optional account number (auto-assign when blank), name/address length validation, and finance fields hidden when `showFinances` preference is off.
- People list toolbar simplified; farmer cards pass `costPerBag` to the profile route.
- Farmer and storage-link types extended for quick-register payload and response.

### Removed

- Placeholder `incoming-tab` daybook component and generic `person-detail-page` in favor of the new daybook and farmer profile implementations.

## [0.2.0] - 2026-06-19

Finances module expansion with full ledger and voucher management, client-side financial reporting, and supporting UI improvements.

### Added

- Ledger and voucher create, edit, and delete flows with confirmation dialogs and React Query mutations.
- Financial Statements tab with balance sheet and trading profit & loss views derived from ledger and voucher data.
- Closing Balances tab grouped by ledger type with balance sheet summary totals.
- Per-ledger statement page at `/finances/ledgers/:id` with period-scoped running balances.
- Finances domain layer for ledger classification, balance computation, and report assembly (with unit tests).
- Shared finances utilities for chart of accounts, currency formatting, and report date ranges.
- Period filter (today, this week, this month, this year, all time) on report tabs via URL search params.
- `AlertDialog` UI component for destructive confirmations.

### Changed

- Ledger and voucher tables wired to live API data with row actions, improved columns, and ERP-style numeric formatting.
- Add/edit ledger and voucher forms aligned with updated schemas, combobox search, and calendar date picking.
- Finances page tab layout with mobile-friendly icons and report context provider.
- Topbar title resolution for ledger detail routes.
- Searchable combobox and calendar components refined for form use in data-entry flows.
- Incoming and transfer-stock form schemas adjusted for consistency with shared validation patterns.
- TypeScript config paths updated for finances feature modules.
- Dependency bumps: `@tanstack/react-router`, `lucide-react`, and `@babel/core`.

## [0.1.0] - 2026-06-17

This is the first stable ERP release for the Kapur Cold Storage frontend.

### Added

- Stable authenticated application shell with sidebar and topbar navigation.
- Route support for Daybook, Incoming, Storage, Grading, Transfer, Analytics, People, Finances, and Settings.
- Centralized auth session stores for login state, preferences, cold storage context, and store admin context.
- Session lifecycle helpers for login/logout state persistence and cleanup.

### Changed

- Daybook feature structure updated to route-driven tabs and improved page composition.
- Form flows for incoming and storage operations aligned with shared API client and router context behavior.
- Environment, provider, and API client wiring refined for reliable authenticated navigation and data access.

### Notes

- Version `0.1.0` is marked as the first stable baseline for future incremental releases.
