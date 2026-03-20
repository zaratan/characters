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

- [x] **Config Vitest** — jsdom via directive per-file, setup file, `@vitejs/plugin-react`
- [x] **Dépendances** — `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `@testing-library/dom`, `jsdom`, `@vitejs/plugin-react`
- [x] **Tests helpers** (72 + 8 + 8 + 4 = 92 tests) :
  - [x] `helpers/pex.ts` (72 tests — toutes les fonctions + edge cases)
  - [x] `helpers/fetcher.ts` (8 tests — FetchError, success, erreurs, double failure)
  - [x] `helpers/pusherClient.ts` (8 tests)
  - [x] `helpers/pusherServer.ts` (4 tests)
- [x] **Tests hooks** (10 tests) :
  - [x] `hooks/useKeyboardShortcut.ts` (4 tests — async import, bind/unbind)
  - [x] `hooks/useScroll.ts` (6 tests — fake timers, scroll events)
  - ~~`hooks/useSave.ts`~~ — skippé (16 context mocks, aucune logique de branchement)
- [x] **Tests composants critiques** (10 tests) :
  - [x] Formulaire de création de personnage `app/new/` (7 tests)
  - [x] `ErrorPage` (3 tests)
  - ~~Sections, Config, Nav~~ — trop couplés aux contextes, couvert par E2E Phase 5
- ~~**Tests contextes**~~ — conteneurs d'état sans logique métier isolable
- [x] **Tests API routes** (28 tests) :
  - [x] CRUD vampires `app/api/vampires/[id]` (16 tests — GET/PUT/PATCH/DELETE + auth/permissions)
  - [x] Création `app/api/vampires/create` (8 tests — templates, types, edge cases)
  - [x] Route disciplines `app/api/data/disciplines` (4 tests — intégration légère)
- [x] **Fix typo** `clacPexDiffTrueFaith` → `calcPexDiffTrueFaith` (pex.ts + Faith.tsx)

## Phase 5 — Tests E2E (Playwright)

- [x] **Setup Playwright** — `playwright.config.ts` avec :
  - [x] Projet Desktop Chrome
  - [x] Projet Mobile Chrome (Pixel 5)
  - [x] Web server : `yarn dev` sur `localhost:3000` (local), `yarn start` (CI)
  - [x] Retries (2 en CI), HTML reporter, trace on first retry
- [x] **Dépendances** — `@playwright/test`, `@axe-core/playwright`
- [x] **Migration `owner_id`** — FK CASCADE sur `vampires` pour simplifier le cleanup E2E
- [x] **Fixtures E2E** — Auth (seed DB + cookie), DB helpers (seedUser, seedCharacter, cleanup)
- [x] **Tests flows principaux** :
  - [x] Création d'un personnage (tous les templates — 6 combos type×era)
  - [x] Édition d'une fiche (mode jeu/édition, attributs, save/rollback, génération, thaumaturgie)
  - [x] Configuration d'un personnage (accès, préférences, suppression, permissions)
  - [x] Navigation (home, fiche, config, profil)
  - [x] Authentification (login/logout, onboarding gate)
- [x] **Tests accessibilité** — Audit axe-core sur chaque page principale (5 pages)
- [x] **Script** — `yarn test:e2e` et `yarn test:e2e:ui` dans package.json
- [x] **CI** — Job `e2e` dans `.github/workflows/ci.yml` (needs lint+test, PostgreSQL, Chromium)
- [x] **Bug fix** — `Health.tsx` : `isExtraBruisable` → `isExtraBruisable.value` pour le calcul de l'offset
- [x] **Amélioration** — Debounce auto-save réduit de 2000ms → 500ms (santé, volonté, sang)

## Phase 5b — Corrections accessibilité (axe-core)

Violations actuellement exclues des tests E2E, à corriger :

- [ ] `color-contrast` — Contraste texte/fond insuffisant
- [ ] `list` / `listitem` — Structure `<ul>/<li>` incorrecte dans certains composants
- [ ] `aria-allowed-role` — Rôles ARIA sur des éléments qui ne les supportent pas
- [ ] `heading-order` — Hiérarchie des headings (sauts de niveaux h1→h3)
- [ ] `region` — Contenu hors landmark ARIA

## Phase 6 — Upgrades majeures

- [ ] **Next.js 15 => 16** — Migrer depuis 14.2 (vérifier les breaking changes App Router)
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
