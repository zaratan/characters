# CLAUDE.md

## Project Overview

**vampire-char** — A Next.js web application for creating and managing Vampire: The Masquerade character sheets. Full-stack app with real-time collaboration, authentication, and a serverless database.

## Tech Stack

- **Framework**: Next.js 12.2.3 (Pages Router)
- **Language**: TypeScript 4.7 (strict mode disabled)
- **UI**: React 18.2, Styled-Components 5.3, Tailwind CSS 3.1
- **State Management**: React Context API (21 context files in `contexts/`)
- **Data Fetching**: SWR 1.3
- **Database**: FaunaDB (serverless)
- **Auth**: Auth0 (`@auth0/nextjs-auth0`)
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
pages/                # Next.js pages
  api/                # API routes
    auth/             # Auth0 endpoints
    data/             # Data endpoints
    vampires/         # Vampire CRUD operations
  vampires/           # Dynamic character sheet pages
hooks/                # Custom React hooks (useSave, useMe, useScroll, etc.)
helpers/              # Utility functions (fetcher, pex calculations, pusher)
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
| `FAUNADB_SECRET_KEY` | FaunaDB database access |
| `PUSHER_APP_ID` | Pusher app ID |
| `NEXT_PUBLIC_PUSHER_KEY` | Pusher public key (exposed to client) |
| `PUSHER_SECRET` | Pusher secret key |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher cluster region |
| `BASE_URL` | Application base URL |
| `AUTH0_DOMAIN` | Auth0 domain |
| `AUTH0_CLIENT_ID` | Auth0 client ID |
| `AUTH0_CLIENT_SECRET` | Auth0 client secret |

## Key Architectural Notes

- **No test suite** — there are no tests or test runner configured
- **No CI/CD pipeline** — no GitHub Actions; likely deployed via Vercel
- **Real-time collaboration** — Pusher enables multiple users to edit the same character sheet simultaneously
- **Character types** — supports Vampire, Ghoul, Human, Dark Ages, and Victorian era templates in `defaultData/`
- **Experience points** — custom PEX (experience) calculation logic lives in `helpers/pex.ts`
