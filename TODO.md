# TODO — Modernisation vampire-char

## Phase 1 — Fixes critiques (qualité immédiate)

- [x] **Refactor `helpers/fetcher.ts`** — Vérifier `res.ok`, gérer les erreurs HTTP (4xx/5xx), wrapper le `.json()` dans un try/catch
- [x] **Double-submit `app/new/page.tsx`** — Ajouter un state `isLoading`, désactiver le bouton pendant la requête
- [x] **Try/catch manquants sur les appels fetcher** :
  - [x] `components/config/ConfigDangerousSection.tsx` (destroy + debounce)
  - [x] `components/config/ConfigAccessSection.tsx` (debounce)
  - [x] `components/config/ConfigPreferencesSection.tsx` (debounce)
  - [x] `components/sections/Mind.tsx` (2 debounce callbacks)
  - [x] `components/Health.tsx` (debounce)
  - [x] `hooks/useSave.ts` (action)
- [x] **Fuite mémoire Pusher** (`contexts/SystemContext.tsx`) — Ajouter `client.disconnect()` et unbind des listeners dans le cleanup du `useEffect`
- [x] **Feedback utilisateur en cas d'erreur** — `ToastContext` + toast d'erreur dans tous les composants (Health, Mind, ConfigAccess, ConfigPreferences, useSave)
- [x] **Race condition `SectionsContext.tsx`** — Ne pas écraser le state local si l'utilisateur a des modifications en cours
- [x] **`JSON.stringify()` dans les deps useEffect** (`SectionsContext`, `AccessesContext`, `Health`) — Remplacé par `isEqual` (lodash) ou `useMemo`
- [x] **Supprimer les `console.log`** dans `AutoCompleteInput.tsx` (lignes 71, 255)
- [x] **Try/catch `fs.readFileSync`** dans `app/api/data/disciplines/route.ts`
- [x] **Accessibilité** — Remplacer les `<a onClick>` / `<div role="button">` par des `<button>` dans `ErrorPage.tsx` et `Nav.tsx`

## Phase 2 — Tooling moderne

- [x] **ESLint 9 flat config** — Migré vers `eslint.config.mjs`
  - [x] `typescript-eslint` unifié via `eslint-config-next/typescript`
  - [x] `eslint-config-prettier` v10 + `eslint-plugin-prettier` v5
  - [x] `consistent-type-imports` et `consistent-type-definitions` configurés
- [x] **Prettier 3** — v3.8.1
- [x] **Husky 9** — v9.1.7, format simplifié
- [x] **lint-staged** — v16.2.7
- [x] **Script `format:check`** — `prettier --check .`
- [x] **Script `typecheck`** — `tsc --noEmit`
- [x] **Script `check`** — `yarn build && yarn lint && yarn typecheck && yarn format:check && yarn test`
- [x] **Pre-push hook** — Lance build + lint + typecheck + format:check + test

## Phase 3 — CI/CD (GitHub Actions)

- [x] **`.github/workflows/ci.yml`** — Pipeline sur les PRs vers `main`, 4 jobs parallèles :
  - [x] Job `lint-typecheck` : install → lint → typecheck → format:check
  - [x] Job `test` : install → vitest run
  - [x] Job `build` : install → build (avec service Postgres pour migrations)
  - [x] Job `migration-check` : vérifie que les migrations PR s'appliquent sur le schéma main
  - [ ] Job `e2e` : à ajouter en Phase 5 (Playwright)
- [x] **`.github/workflows/claude.yml`** — Claude interactif via `@claude` dans issues/PRs

## Phase 4 — Tests unitaires (Vitest + RTL)

- [ ] **Config Vitest** — Ajouter `jsdom` environment, setup file avec `@testing-library/jest-dom`
- [ ] **Dépendances** — Ajouter `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
- [ ] **Tests helpers** :
  - [ ] `helpers/fetcher.ts` (le nouveau avec gestion d'erreur)
  - [ ] `helpers/pex.ts` (calculs d'XP)
  - [ ] `helpers/pusherClient.ts`
- [ ] **Tests hooks** :
  - [ ] `hooks/useSave.ts`
  - [ ] `hooks/useScroll.ts`
  - [ ] `hooks/useKeyboardShortcut.ts`
- [ ] **Tests composants critiques** :
  - [ ] Formulaire de création de personnage (`app/new/`)
  - [ ] Sections de la fiche (Attributes, Abilities, Disciplines)
  - [ ] Config sections (Access, Dangerous, Preferences)
  - [ ] Nav, ErrorPage
- [ ] **Tests contextes** :
  - [ ] Logique de merge/update dans les principaux contextes
- [ ] **Tests API routes** :
  - [ ] CRUD vampires (`app/api/vampires/`)
  - [ ] Route disciplines (`app/api/data/disciplines/`)

## Phase 5 — Tests E2E (Playwright)

- [ ] **Setup Playwright** — `playwright.config.ts` avec :
  - [ ] Projet Desktop Chrome
  - [ ] Projet Mobile Chrome (Pixel 5)
  - [ ] Web server : `yarn dev` sur `localhost:3000`
  - [ ] Retries (2 en CI), HTML reporter, trace on first retry
- [ ] **Dépendances** — `@playwright/test`, `@axe-core/playwright`
- [ ] **Tests flows principaux** :
  - [ ] Création d'un personnage (tous les templates)
  - [ ] Édition d'une fiche (attributs, abilities, disciplines)
  - [ ] Configuration d'un personnage (accès, préférences, suppression)
  - [ ] Navigation (home, fiche, config, profil)
  - [ ] Authentification (login/logout)
- [ ] **Tests accessibilité** — Audit axe-core sur chaque page principale
- [ ] **Script** — Ajouter `yarn test:e2e` et `yarn test:e2e:ui` dans package.json

## Phase 6 — Upgrades majeures

- [ ] **Next.js 15** — Migrer depuis 14.2 (vérifier les breaking changes App Router)
- [ ] **React 19** — Migrer depuis 18.2 (nouveau modèle de refs, use(), etc.)
- [ ] **Auth.js v5** (next-auth 5) — Réécrire `lib/auth.ts` et `lib/auth-adapter.ts` (API très différente)
- [ ] **styled-components 6** — Migrer (changements SSR, suppression de `@types/styled-components`)
- [ ] **Tailwind CSS 4** — Migrer depuis 3.1 (nouvelle config, CSS-first)
- [ ] **immer 10** — Vérifier la compatibilité avec les contextes existants
- [ ] **pusher-js 8** — Vérifier les breaking changes
- [ ] **Yarn → pnpm** (optionnel) — Aligner avec arkham-proba pour la cohérence

## Référence : configs arkham-proba à réutiliser

- `.github/workflows/ci.yml` — Structure des 3 jobs parallèles
- `.github/workflows/claude-code-review.yml` — Config exacte réutilisable
- `.github/workflows/claude.yml` — Config exacte réutilisable
- `.husky/pre-push` — Liste des checks complète
- `eslint.config.mjs` (packages/web) — Base pour la flat config ESLint
- `playwright.config.ts` (packages/web) — Base pour la config Playwright
- `vitest.config.ts` (packages/web) — Base pour la config Vitest avec jsdom
- `.prettierrc` / `.prettierignore` — Adapter les règles
