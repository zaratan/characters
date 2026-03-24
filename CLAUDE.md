# CLAUDE.md

## Project Overview

**vampire-char** — A Next.js web application for creating and managing Vampire: The Masquerade character sheets. Full-stack app with real-time collaboration, authentication, and a serverless database.

## Tech Stack

- **Framework**: Next.js 16 (App Router — fully migrated)
- **Language**: TypeScript 5 (strict mode disabled)
- **UI**: React 19, Tailwind CSS 4, CSS Modules (for complex selectors)
- **State Management**: React Context API (21 context files in `contexts/`)
- **Data Fetching**: SWR 2
- **Database**: PostgreSQL (Neon via Vercel Postgres) — `pg` driver, raw SQL
- **Auth**: NextAuth.js v4 (`next-auth`) — Email magic link (Resend) + GitHub OAuth
- **Real-time**: Pusher (WebSocket-based live updates)
- **Testing**: Vitest (unit), Playwright (E2E + visual regression), @testing-library/react
- **Package Manager**: pnpm

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint on the entire project
pnpm test         # Run Vitest unit tests
pnpm test:e2e     # Run Playwright E2E tests
pnpm test:e2e:ui  # Run Playwright with UI
```

## Project Structure

```
components/           # React components
  sections/           # Page sections (Abilities, Attributes, Disciplines, etc.)
  icons/              # SVG icon components
  line/               # Line-based UI components (dots, text inputs)
  config/             # Configuration UI components
  no-ssr/             # Client-side only components (Pusher listeners)
  *.module.css        # CSS Modules for complex component styles
contexts/             # React Context providers (21 files, one per domain)
lib/                  # Database & auth infrastructure
  pool.ts             # Shared pg Pool (serverless-optimized, max:1)
  db.ts               # Database access layer (all SQL centralized here)
  auth.ts             # NextAuth authOptions + getSession() helper
  auth-adapter.ts     # Custom NextAuth PostgreSQL adapter
  queries.ts          # DB query wrappers (vampires list, users list, etc.)
  providers.tsx       # Client-side context providers (Session, SWR, Theme, etc.)
app/                  # App Router (Next.js 16) — routing only
  layout.tsx          # Root layout (metadata, providers, globals.css)
  page.tsx            # Home page (server component → HomeClient)
  new/                # Create character page
  vampires/[id]/      # Character sheet + config pages
  api/                # Route Handlers
    auth/             # NextAuth endpoints
    data/             # Data endpoints (disciplines)
    vampires/         # Vampire CRUD: list, create, [id] (GET/PUT/PATCH/DELETE)
    users/            # Users list
components/pages/     # Client components for App Router pages (HomeClient, SheetClient, ConfigClient)
hooks/                # Custom React hooks (useSave, useScroll, etc.)
helpers/              # Utility functions (fetcher, pex calculations, pusher, classNames)
migrations/           # PostgreSQL schema migrations (node-pg-migrate)
types/                # TypeScript type definitions (VampireType, MeType, etc.)
data/                 # Static JSON data (disciplines, combo disciplines)
defaultData/          # Default character templates (vampire, ghoul, human, darkAge, victorian)
styles/               # Shared UI components (Lines, Texts, Titles, Sections, Items) + globals.css
public/               # Static assets (fonts, images)
e2e/                  # Playwright E2E tests (tests, fixtures, helpers)
```

## Code Conventions

### Naming

- **Components**: PascalCase (`Sheet.tsx`, `ActionsFooter.tsx`)
- **Context files**: PascalCase with `Context` suffix (`DisciplinesContext.tsx`)
- **Hooks**: camelCase with `use` prefix (`useSave.ts`)
- **Type files**: PascalCase with `Type` suffix (`VampireType.ts`)
- **Helpers**: camelCase (`fetcher.ts`, `pusherClient.ts`)
- **CSS Modules**: ComponentName.module.css, co-located with the component

### Patterns

- State management via React Context (not Redux/Zustand) — each domain has its own context
- SWR for all server data fetching with automatic caching
- Dynamic imports with `next/dynamic` for client-only components (no-ssr pattern)
- **Styling**: Three-tier approach:
  - Tailwind CSS utility classes for simple layout/spacing/typography
  - CSS Modules (`.module.css`) for complex patterns (sibling selectors, SVG animations, `any-hover`, nested selectors)
  - CSS custom properties (`:root` / `.dark`) in `globals.css` for theme tokens
- **Dark mode**: Class-based via `@custom-variant dark` in Tailwind v4. `ThemeContext` toggles `.dark` on `<html>`. CSS custom properties switch automatically.
- `helpers/classNames.ts` for conditional class composition
- API routes are RESTful Route Handlers under `app/api/` (GET/PUT/PATCH/DELETE)
- Server/client component split: server component pages fetch data + pass to `'use client'` components with SWR `fallbackData`
- `app/` directory contains **only routing files** (pages, layouts, route handlers, loading). All other code lives at root level.

### Formatting & Linting

- **ESLint** extends: `next/core-web-vitals`, `prettier`, `plugin:prettier/recommended`
- **Prettier** rules: single quotes, trailing commas (es5), 80 char print width, semicolons
- **Pre-commit hook** (Husky + lint-staged): auto-fixes lint issues on staged `.js/.jsx/.ts/.tsx` files
- **Pre-push hook**: runs full `pnpm lint`

### TypeScript

- Strict mode is **disabled** — the codebase uses loose typing
- Target: ES5, Module: ESNext
- Incremental compilation enabled

## Environment Variables

Copy `.env.sample` to `.env.local` and fill in values:

| Variable                     | Purpose                                                               |
| ---------------------------- | --------------------------------------------------------------------- |
| `POSTGRES_URL`               | PostgreSQL connection string (pooled URL in prod via Neon pgbouncer)  |
| `NEXTAUTH_SECRET`            | NextAuth session encryption (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL`               | App URL (`http://localhost:3000` in dev)                              |
| `GITHUB_CLIENT_ID`           | GitHub OAuth app client ID                                            |
| `GITHUB_CLIENT_SECRET`       | GitHub OAuth app client secret                                        |
| `RESEND_API_KEY`             | Resend API key for email magic links                                  |
| `EMAIL_FROM`                 | Sender address for magic links (domain must be verified in Resend)    |
| `PUSHER_APP_ID`              | Pusher app ID                                                         |
| `NEXT_PUBLIC_PUSHER_KEY`     | Pusher public key (exposed to client)                                 |
| `PUSHER_SECRET`              | Pusher secret key                                                     |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher cluster region                                                 |
| `BASE_URL`                   | Application base URL                                                  |

## Key Architectural Notes

- **Testing** — Vitest for unit tests, Playwright for E2E (6 spec files + visual regression screenshots)
- **Deployment** — hosted on Vercel (`.vercel` in `.gitignore`)
- **Real-time collaboration** — Pusher enables multiple users to edit the same character sheet simultaneously
- **Character types** — supports Vampire, Ghoul, Human, Dark Ages, and Victorian era templates in `defaultData/`
- **Experience points** — custom PEX (experience) calculation logic lives in `helpers/pex.ts`

## External Dependency: wod.zaratan.fr

This app relies on **[wod.zaratan.fr](https://wod.zaratan.fr)**, a companion World of Darkness reference site (also by zaratan), for two things:

1. **Discipline reference links** — Every discipline in `data/disciplines.json` has a `url` field pointing to `https://wod.zaratan.fr/powers/<discipline-name>`. These links are displayed in the character sheet UI so players can look up discipline details. Combo disciplines are linked to `https://wod.zaratan.fr/powers/combo#power-<slug>` (built dynamically in `app/api/data/disciplines/route.ts`).

2. **Advantages & Flaws API** — `DataContext.tsx` fetches advantage/flaw data directly from `https://wod.zaratan.fr/api/characters/adv_flaws` via SWR. This is a live external API call, not a local data file. The response provides names, URLs, and level arrays used to populate the character sheet's advantages and flaws sections.
