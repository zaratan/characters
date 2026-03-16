# CLAUDE.md

## Project Overview

**vampire-char** — A Next.js web application for creating and managing Vampire: The Masquerade character sheets. Full-stack app with real-time collaboration, authentication, and a serverless database.

## Tech Stack

- **Framework**: Next.js 14.2 (Pages Router)
- **Language**: TypeScript 5.9 (strict mode disabled)
- **UI**: React 18.2, Styled-Components 5.3, Tailwind CSS 3.1
- **State Management**: React Context API (21 context files in `contexts/`)
- **Data Fetching**: SWR 1.3
- **Database**: PostgreSQL (Neon via Vercel Postgres) — `pg` driver, raw SQL
- **Auth**: NextAuth.js v4 (`next-auth`) — Email magic link (Resend) + GitHub OAuth
- **Real-time**: Pusher (WebSocket-based live updates)
- **Package Manager**: Yarn

## Commands

```bash
yarn dev          # Start development server
yarn build        # Production build
yarn start        # Start production server
yarn lint         # Run ESLint on the entire project
```

## Project Structure

```
components/           # React components
  sections/           # Page sections (Abilities, Attributes, Disciplines, etc.)
  icons/              # SVG icon components
  line/               # Line-based UI components (dots, text inputs)
  config/             # Configuration UI components
  no-ssr/             # Client-side only components (Pusher listeners)
contexts/             # React Context providers (21 files, one per domain)
lib/                  # Database & auth infrastructure
  pool.ts             # Shared pg Pool (serverless-optimized, max:1)
  db.ts               # Database access layer (all SQL centralized here)
  auth-adapter.ts     # Custom NextAuth PostgreSQL adapter
pages/                # Next.js pages
  api/                # API routes
    auth/             # NextAuth endpoints ([...nextauth].ts)
    data/             # Data endpoints
    vampires/         # Vampire CRUD operations
  vampires/           # Dynamic character sheet pages
hooks/                # Custom React hooks (useSave, useScroll, etc.)
helpers/              # Utility functions (fetcher, pex calculations, pusher)
migrations/           # PostgreSQL schema migrations (node-pg-migrate)
types/                # TypeScript type definitions (VampireType, MeType, etc.)
data/                 # Static JSON data (disciplines, combo disciplines)
defaultData/          # Default character templates (vampire, ghoul, human, darkAge, victorian)
styles/               # Global styles, theme provider (light/dark mode)
public/               # Static assets (fonts, images)
```

## Code Conventions

### Naming
- **Components**: PascalCase (`Sheet.tsx`, `ActionsFooter.tsx`)
- **Context files**: PascalCase with `Context` suffix (`DisciplinesContext.tsx`)
- **Hooks**: camelCase with `use` prefix (`useSave.ts`)
- **Type files**: PascalCase with `Type` suffix (`VampireType.ts`)
- **Helpers**: camelCase (`fetcher.ts`, `pusherClient.ts`)

### Patterns
- State management via React Context (not Redux/Zustand) — each domain has its own context
- Immer for immutable state updates inside contexts
- SWR for all server data fetching with automatic caching
- Dynamic imports with `next/dynamic` for client-only components (no-ssr pattern)
- Styled-components with a theme provider for theming; Tailwind for utility classes
- API routes are RESTful under `pages/api/`

### Formatting & Linting
- **ESLint** extends: `next/core-web-vitals`, `prettier`, `plugin:prettier/recommended`
- **Prettier** rules: single quotes, trailing commas (es5), 80 char print width, semicolons
- **Pre-commit hook** (Husky + lint-staged): auto-fixes lint issues on staged `.js/.jsx/.ts/.tsx` files
- **Pre-push hook**: runs full `yarn lint`

### TypeScript
- Strict mode is **disabled** — the codebase uses loose typing
- Target: ES5, Module: ESNext
- Incremental compilation enabled

## Environment Variables

Copy `.env.sample` to `.env.local` and fill in values:

| Variable | Purpose |
|----------|---------|
| `POSTGRES_URL` | PostgreSQL connection string (pooled URL in prod via Neon pgbouncer) |
| `NEXTAUTH_SECRET` | NextAuth session encryption (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | App URL (`http://localhost:3000` in dev) |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret |
| `RESEND_API_KEY` | Resend API key for email magic links |
| `EMAIL_FROM` | Sender address for magic links (domain must be verified in Resend) |
| `PUSHER_APP_ID` | Pusher app ID |
| `NEXT_PUBLIC_PUSHER_KEY` | Pusher public key (exposed to client) |
| `PUSHER_SECRET` | Pusher secret key |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher cluster region |
| `BASE_URL` | Application base URL |

## Key Architectural Notes

- **No test suite** — there are no tests or test runner configured
- **Deployment** — hosted on Vercel (`.vercel` in `.gitignore`)
- **Real-time collaboration** — Pusher enables multiple users to edit the same character sheet simultaneously
- **Character types** — supports Vampire, Ghoul, Human, Dark Ages, and Victorian era templates in `defaultData/`
- **Experience points** — custom PEX (experience) calculation logic lives in `helpers/pex.ts`

## External Dependency: wod.zaratan.fr

This app relies on **[wod.zaratan.fr](https://wod.zaratan.fr)**, a companion World of Darkness reference site (also by zaratan), for two things:

1. **Discipline reference links** — Every discipline in `data/disciplines.json` has a `url` field pointing to `https://wod.zaratan.fr/powers/<discipline-name>`. These links are displayed in the character sheet UI so players can look up discipline details. Combo disciplines are linked to `https://wod.zaratan.fr/powers/combo#power-<slug>` (built dynamically in `pages/api/data/disciplines.ts`).

2. **Advantages & Flaws API** — `DataContext.tsx` fetches advantage/flaw data directly from `https://wod.zaratan.fr/api/characters/adv_flaws` via SWR. This is a live external API call, not a local data file. The response provides names, URLs, and level arrays used to populate the character sheet's advantages and flaws sections.
