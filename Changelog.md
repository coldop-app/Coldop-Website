# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
