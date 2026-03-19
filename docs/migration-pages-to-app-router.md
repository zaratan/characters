# Migration Pages Router → App Router (Next.js 14)

> **Contexte** : Pages Router est en maintenance. Les nouvelles features Next.js (Server Components, Streaming, Partial Prerendering) sont exclusives à App Router. Le projet est petit (4 routes de pages, 9 API routes, 21 contexts) — c'est le bon moment pour migrer.
> **Stratégie** : migration incrémentale. Next.js supporte la coexistence `pages/` + `app/`. On migre route par route, on valide, puis on supprime `pages/`.
> **Rollback** : tant que `pages/` existe, on peut revenir en arrière en supprimant `app/`. Zéro risque.

---

## 1. Vue d'ensemble

### Ce qui change

| Avant                                                       | Après                                                                        |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `pages/` directory                                          | `app/` directory                                                             |
| `_app.tsx` + `_document.js`                                 | `app/layout.tsx` (Server Component) + `app/providers.tsx` (`'use client'`)   |
| `getStaticProps` / `getStaticPaths`                         | `generateStaticParams` + Server Components async + `export const revalidate` |
| `next/head`                                                 | `export const metadata` / `generateMetadata()`                               |
| `router.isFallback`                                         | `loading.tsx` (Suspense boundary)                                            |
| `NextApiRequest` / `NextApiResponse`                        | `Request` / `NextResponse` (Route Handlers)                                  |
| `useRouter` from `next/router`                              | `useRouter` from `next/navigation` + `useParams()`                           |
| `getServerSession(req, res, authOptions)`                   | `getServerSession(authOptions)` (sans req/res dans Route Handlers)           |
| styled-components SSR via `_document.js` `ServerStyleSheet` | styled-components registry (`useServerInsertedHTML`)                         |
| `_document.js` : `<Html lang="fr">`, Google Fonts link      | `app/layout.tsx` : `<html lang="fr">`, Google Fonts link (ou `next/font`)    |

### Ce qui ne change pas

- **PostgreSQL** — `lib/db.ts`, `lib/pool.ts`, `lib/auth-adapter.ts` sont inchangés
- **NextAuth v4** — on reste sur v4, `getServerSession` fonctionne dans les Route Handlers App Router
- **Les 21 contexts** — même code, on ajoute juste `'use client'` en première ligne
- **Tous les components** — idem, `'use client'` où nécessaire
- **SWR** — même pattern, juste le placement du `SWRConfig` bouge
- **Pusher** — aucun changement
- **Styled-components + Tailwind** — le code de styling ne change pas, seul le setup SSR change
- **Next.js 14 + React 18** — on ne monte pas de version majeure dans cette migration

### Décisions prises

**Rester sur Next.js 14 + React 18.** App Router est stable et complet sur Next 14. Next 15 requiert React 19, ce qui casse `styled-components` v5 et `react-use` v17. Upgrader Next 15 + React 19 sera une migration séparée.

**Rester sur NextAuth v4.** `getServerSession(authOptions)` fonctionne dans les Route Handlers App Router (sans `req`/`res`). Auth.js v5 est un rewrite majeur en beta depuis 2+ ans, avec un custom adapter PostgreSQL et des callbacks `session` custom (`isAdmin`) à adapter. Le bénéfice (`auth()` au lieu de `getServerSession`) ne justifie pas le risque. Migration v5 en effort séparé si nécessaire.

### Note sur la coexistence `pages/` + `app/`

Pendant la migration, les deux coexistent. Les routes dans `pages/` utilisent `_app.tsx`. Les routes dans `app/` utilisent `layout.tsx`. Les deux doivent fournir les mêmes providers. Une route ne peut pas exister dans les deux — il faut supprimer côté `pages/` avant de créer côté `app/` (ou inversement).

> **Attention** : `pages/api/` et `app/api/` ne peuvent pas avoir de routes en conflit. Supprimer le fichier `pages/api/` avant de créer l'équivalent `app/api/`.

---

## 2. Phases de migration

### Phase 1 : Infrastructure — Layout + Registry + Extractions + `'use client'` (~1h30) ✅ DONE

**Objectif** : poser les fondations App Router sans migrer aucune page. L'app continue de tourner depuis `pages/`.

> **Retour d'expérience** :
>
> - Next.js 14 force `strictNullChecks: true` dans `tsconfig.json` dès que le répertoire `app/` existe. Cela a exposé ~8 erreurs TS préexistantes qu'il a fallu corriger (`ActionsFooter.tsx`, `AutoCompleteInput.tsx`, `Nav.tsx`, pages dynamiques).
> - Le sélecteur `#__next` dans `GlobalStyle.ts` doit rester tant que `pages/` est actif — le retirer casse le `height: 100%` du layout. Le supprimer seulement en Phase 4 (cleanup).
> - styled-components v5 supporte bien le pattern registry (`ServerStyleSheet` + `useServerInsertedHTML`), mais `clearTag()` n'est pas dans les types — nécessite un `as any`.
> - `app/layout.tsx` utilise un `<link>` Google Fonts avec `eslint-disable @next/next/no-page-custom-font` car les composants référencent la font par nom (`'Bilbo Swash Caps'`). Migration vers `next/font` possible mais hors scope.

**Scope** :

1. **Extraire `TextFallback`** de `pages/new.tsx` vers `styles/TextFallback.ts` (ou `components/TextFallback.ts`). Ce composant styled est importé par `pages/vampires/[id]/config.tsx` et `components/config/ConfigAccessSection.tsx` — si on ne l'extrait pas, la migration de `new.tsx` cassera ces imports.

2. **Extraire les helpers de data-fetching** (`fetchVampireFromDB` de `pages/api/vampires.ts`, `fetchOneVampire` de `pages/api/vampires/[id].ts`) vers `lib/queries.ts`. Ces fonctions sont des wrappers autour de `db.vampires.*` et sont importées par les pages dans `getStaticProps`. En App Router, les Server Components appelleront `db.*` directement, mais pendant la coexistence, les pages dans `pages/` ont besoin que ces imports fonctionnent indépendamment des fichiers API routes.

3. **Créer `app/layout.tsx`** — Server Component avec :
   - `<html lang="fr">` (migré depuis `_document.js`)
   - Google Fonts link (migré depuis `_document.js`) — ou mieux, utiliser `next/font/google` pour `Bilbo Swash Caps`
   - `export const metadata` (titre, viewport — migrés depuis `_app.tsx` `<Head>`)
   - Wrapping : `StyledComponentsRegistry` → `Providers` → `{children}`

4. **Créer `app/providers.tsx`** (`'use client'`) — reproduit la chaîne de providers de `_app.tsx` : ThemeContextProvider → ThemeProvider → SessionProvider → SWRConfig → GlobalStyle → SystemProvider → MeProvider

5. **Créer `app/lib/registry.tsx`** — styled-components SSR registry avec `useServerInsertedHTML`. Remplace le `ServerStyleSheet` + `getInitialProps` de `_document.js`.

6. **Ajouter `'use client'`** aux 21 fichiers de contexte + `styles/Theme.tsx`

7. **Mettre à jour `styles/GlobalStyle.ts`** : remplacer `#__next` par `body` dans les sélecteurs

> **Attention styled-components v5** : vérifier que styled-components 5.3 supporte le pattern `useServerInsertedHTML` registry. La doc officielle Next.js utilise styled-components v6. Si v5 ne fonctionne pas, il faudra upgrader vers v6 (breaking changes : transient props `$prefix`, changements dans `.attrs()`). Tester en Phase 1 avant de continuer.

**Risque** : Faible. Aucune page ne tourne depuis `app/` à ce stade. L'ajout de `'use client'` aux contextes est rétrocompatible avec Pages Router. L'extraction de `TextFallback` et des helpers est un refactoring interne sans changement de comportement.

**Validation** :

- `yarn dev` + `yarn build` — l'app fonctionne identiquement depuis `pages/`
- Vérifier que `TextFallback` s'affiche correctement dans `/vampires/[id]/config` et `ConfigAccessSection`
- Vérifier qu'il n'y a pas de FOUC en hard refresh (tester la registry styled-components sur une route `app/` de test si besoin)

---

### Phase 2 : Migration des API Routes (~1h)

**Objectif** : convertir les 9 routes de `pages/api/` vers `app/api/` (Route Handlers).

**Scope** (pour chaque route) :

- `NextApiRequest`/`NextApiResponse` → `Request`/`NextResponse`
- `req.query.id` → paramètre de segment dynamique `params.id`
- `req.body` → `await request.json()`
- `res.status(X).json(Y)` → `NextResponse.json(Y, { status: X })`
- `req.method` dispatch → exports nommés (`GET`, `POST`, `PATCH`, `DELETE`)
- `getServerSession(req, res, authOptions)` → `getServerSession(authOptions)` (NextAuth v4 dans Route Handlers)

**Routes à migrer** (9) :

| Source                                      | Destination                                     | Méthodes  |
| ------------------------------------------- | ----------------------------------------------- | --------- |
| `pages/api/auth/[...nextauth].ts`           | `app/api/auth/[...nextauth]/route.ts`           | GET, POST |
| `pages/api/vampires.ts`                     | `app/api/vampires/route.ts`                     | GET       |
| `pages/api/vampires/create.ts`              | `app/api/vampires/create/route.ts`              | POST      |
| `pages/api/vampires/[id].ts`                | `app/api/vampires/[id]/route.ts`                | GET       |
| `pages/api/vampires/[id]/update.ts`         | `app/api/vampires/[id]/update/route.ts`         | PATCH     |
| `pages/api/vampires/[id]/update_partial.ts` | `app/api/vampires/[id]/update_partial/route.ts` | PATCH     |
| `pages/api/vampires/[id]/delete.ts`         | `app/api/vampires/[id]/delete/route.ts`         | DELETE    |
| `pages/api/data/disciplines.ts`             | `app/api/data/disciplines/route.ts`             | GET       |
| `pages/api/users.ts`                        | `app/api/users/route.ts`                        | GET       |

> **Opportunité** : on pourrait consolider `update`, `update_partial` et `delete` dans un seul `app/api/vampires/[id]/route.ts` avec `PATCH` et `DELETE` comme exports séparés. Ça simplifierait l'arborescence API. À décider au moment de l'exécution.

> **Note NextAuth v4 dans Route Handlers** : `getServerSession(authOptions)` fonctionne sans `req`/`res` dans les Route Handlers Next.js. C'est la solution supportée par NextAuth v4 pour App Router. Les 7 routes avec auth (`vampires.ts`, `create.ts`, `[id].ts`, `update.ts`, `update_partial.ts`, `delete.ts`, `users.ts`) utilisent ce pattern. La route `disciplines.ts` n'a pas d'auth.

**Risque** : Faible. Transformation mécanique, le code métier (`db.*`) ne change pas.

**Validation** :

- Tester chaque endpoint via l'UI : list, get, create, update, update_partial, delete, disciplines, users
- Tester les triggers Pusher après mutations (create/update/delete envoient des events Pusher)
- Tester l'auth : accès non-authentifié retourne 401, `isAdmin` fonctionne

---

### Phase 3 : Migration des Pages (~2h)

**Objectif** : migrer les 4 routes de pages vers `app/`. Ordre : du plus simple au plus complexe.

**Principe général** : chaque page est splitée en un Server Component (fetch initial + metadata) et un Client Component (interactivité + SWR + contexts).

#### 3a. `pages/new.tsx` → `app/new/page.tsx` (~15 min)

Page entièrement client (formulaire, useState, useRouter). Juste `'use client'` + changer l'import `useRouter` de `next/router` vers `next/navigation`. `TextFallback` est déjà extrait (Phase 1).

**Risque** : Très faible.

#### 3b. `pages/index.tsx` → `app/page.tsx` (~30 min)

- Server Component : remplace `getStaticProps` — appelle `db.vampires.list()` directement, exporte `revalidate = 600`
- Client Component : reçoit `initialData` en prop, utilise SWR avec `fallbackData`, Pusher listener en `dynamic` import
- `next/head` → `export const metadata` dans le Server Component

> **Attention SWR** : `revalidateOnMount: true` (déjà présent dans le code) est essentiel pour que le client fetch des données fraîches. Avec App Router, le caching serveur (Router Cache, Full Route Cache) interagit avec le cache SWR côté client. Tester qu'une fiche créée/modifiée apparaît bien dans la liste après navigation.

**Risque** : Faible.

#### 3c. `pages/vampires/[id].tsx` → `app/vampires/[id]/page.tsx` (~45 min)

La page la plus complexe — ISR + fallback + SWR + DataProvider + Sheet avec 15+ contexts.

- Server Component : `generateStaticParams()` remplace `getStaticPaths`, `export const revalidate = 1`, `export const dynamicParams = true` (équivalent `fallback: true`)
- Client Component : reçoit les données initiales, wraps DataProvider + PusherSheetListener + Sheet
- Créer `loading.tsx` — remplace `router.isFallback` (Suspense boundary automatique)
- Le cas `notFound` : utiliser `redirect('/new')` dans le Server Component (pas `notFound()` — le comportement actuel est une redirection, pas une 404)
- **Accès fiches privées** : le Server Component doit appeler `getServerSession(authOptions)` pour vérifier l'accès aux fiches privées avant de passer les données au Client Component

> **Attention `Sheet.tsx`** : utilise `<Head><title>{name} - Char</title></Head>` pour le titre dynamique. En App Router, utiliser `useEffect(() => { document.title = ... })` dans le Client Component (le titre change avec SWR, donc `generateMetadata` ne suffit pas).

> **Attention Pusher** : vérifier que les soft navigations App Router remontent bien les listeners Pusher. Le `dynamic` import avec `{ ssr: false }` pour `PusherSheetListener` fonctionne toujours dans les Client Components App Router.

**Risque** : Moyen. Tester : accès direct par URL, navigation client, fallback sur un ID inconnu (doit afficher `loading.tsx` puis la fiche), mise à jour en temps réel Pusher, accès fiche privée par un non-éditeur (doit être bloqué).

#### 3d. `pages/vampires/[id]/config.tsx` → `app/vampires/[id]/config/page.tsx` (~30 min)

Même pattern que 3c mais plus simple (moins de contexts). Même split Server/Client. Créer `loading.tsx` aussi.

**Risque** : Faible (si 3c est validé, 3d est identique).

#### Fichiers App Router supplémentaires à créer

- `app/not-found.tsx` — page 404 globale (App Router convention)
- `app/error.tsx` — page d'erreur globale (`'use client'`, wraps le composant d'erreur existant si présent)

**Validation globale Phase 3** :

- Navigation complète : home → créer un perso → voir la fiche → configurer → supprimer
- Temps réel Pusher (édition simultanée sur deux onglets)
- Hard refresh sur chaque page (pas de FOUC, données correctes)
- Deep link vers un vampire qui n'a pas été pré-généré (teste `dynamicParams` + `loading.tsx`)
- Accès fiche privée par un non-éditeur
- Vérifier que `router.query.id` → `useParams().id` fonctionne dans tous les Client Components

---

### Phase 4 : Cleanup (~30 min)

**Objectif** : supprimer `pages/`, nettoyer.

**Scope** :

- Supprimer tout le répertoire `pages/` (4 pages + `_app.tsx` + `_document.js` + 9 API routes)
- Supprimer `reportWebVitals` (actuellement juste un `console.log` — si besoin, remplacer par `useReportWebVitals` dans un Client Component)
- Supprimer `lib/queries.ts` si les Server Components appellent `db.*` directement (les helpers extraits en Phase 1 ne servent plus)
- `yarn build` + `yarn lint`
- Mettre à jour `CLAUDE.md` pour refléter la nouvelle structure (`app/` au lieu de `pages/`)

**Risque** : Faible. Tout est déjà validé à ce stade.

**Validation** : `yarn build` propre, `yarn lint` propre, smoke test complet.

---

## 3. Points d'attention transverses

### Styled-components + App Router

Le plus gros piège. Sans la registry (`useServerInsertedHTML`), le premier rendu serveur provoque un flash de contenu non stylé (FOUC). Le `compiler.styledComponents` dans `next.config.js` ne suffit plus seul — la registry est **obligatoire**.

`_document.js` utilise actuellement le pattern `ServerStyleSheet` + `getInitialProps` pour le SSR styled-components. Ce pattern n'existe pas en App Router — il est remplacé par la registry.

Tester impérativement en hard refresh (pas juste en navigation client).

> **Compatibilité styled-components v5** : la doc officielle Next.js pour le registry utilise styled-components v6. Si v5 ne supporte pas `useServerInsertedHTML`, il faudra upgrader vers v6. C'est un risque à valider dès Phase 1 — si l'upgrade v6 est nécessaire, prévoir du temps supplémentaire pour adapter les transient props (`$prefix`) et les éventuels changements d'API `.attrs()`.

### Server Components vs Client Components

L'objectif n'est **pas** de transformer les composants existants en Server Components. Tout le front actuel reste client-rendered. Les seuls vrais Server Components sont les "shells" de pages qui fetch les données initiales et les passent aux Client Components.

> **Règle** : ne jamais utiliser styled-components dans un Server Component. Si quelqu'un essaie, ça échouera silencieusement. Tout composant utilisant styled-components doit être dans un fichier `'use client'`.

### `useRouter` — deux modules différents

`next/router` (Pages Router) et `next/navigation` (App Router) exportent tous les deux `useRouter`, mais avec des APIs différentes. En App Router :

- `router.push()` / `router.replace()` — même API
- `router.query` — **n'existe plus**, utiliser `useParams()` pour les segments dynamiques (`id`)
- `router.isFallback` — **n'existe plus**, utiliser `loading.tsx`

Fichiers impactés : `pages/vampires/[id].tsx`, `pages/vampires/[id]/config.tsx`, `components/Sheet.tsx`, `components/config/ConfigDangerousSection.tsx`.

### SWR `fallbackData` dans App Router

Le pattern actuel : `getStaticProps` fournit `initialData` → SWR l'utilise comme `fallbackData`. En App Router : le Server Component fetch les données → les passe en prop au Client Component → SWR les utilise comme `fallbackData`. Le pattern est identique en effet, mais le caching App Router (Router Cache, Full Route Cache) ajoute une couche. S'assurer que `revalidateOnMount: true` est bien présent pour que le client re-fetch toujours.

### Provider chain — duplication temporaire

Pendant la coexistence, `pages/_app.tsx` et `app/providers.tsx` fournissent la même chaîne de providers. Si on ajoute un provider pendant la migration, il faut l'ajouter aux deux endroits. C'est temporaire — Phase 4 terminée, `_app.tsx` est supprimé.

---

## 4. Estimation de l'effort

| Phase                                  | Effort    | Complexité | Risque |
| -------------------------------------- | --------- | ---------- | ------ |
| Phase 1 — Infrastructure + extractions | ~1h30     | Faible     | Faible |
| Phase 2 — API Routes                   | ~1h       | Faible     | Faible |
| Phase 3 — Pages (4 routes)             | ~2h       | Moyenne    | Moyen  |
| Phase 4 — Cleanup                      | ~30 min   | Faible     | Faible |
| Tests manuels end-to-end               | ~30 min   | —          | —      |
| **Total**                              | **~5h30** |            |        |

---

## 5. Fichiers impactés (résumé)

### À créer

| Fichier                                         | Rôle                                                                       | Phase |
| ----------------------------------------------- | -------------------------------------------------------------------------- | ----- |
| `styles/TextFallback.ts`                        | Composant styled extrait de `pages/new.tsx`                                | 1     |
| `lib/queries.ts`                                | Helpers data-fetching extraits des API routes                              | 1     |
| `app/layout.tsx`                                | Layout racine (Server Component, metadata, html/body, registry, providers) | 1     |
| `app/providers.tsx`                             | Wrapper providers (`'use client'`)                                         | 1     |
| `app/lib/registry.tsx`                          | Styled-components SSR registry                                             | 1     |
| `app/api/auth/[...nextauth]/route.ts`           | NextAuth v4 Route Handler                                                  | 2     |
| `app/api/vampires/route.ts`                     | List vampires                                                              | 2     |
| `app/api/vampires/[id]/route.ts`                | Get vampire                                                                | 2     |
| `app/api/vampires/create/route.ts`              | Create vampire                                                             | 2     |
| `app/api/vampires/[id]/update/route.ts`         | Update vampire                                                             | 2     |
| `app/api/vampires/[id]/update_partial/route.ts` | Partial update                                                             | 2     |
| `app/api/vampires/[id]/delete/route.ts`         | Delete vampire                                                             | 2     |
| `app/api/data/disciplines/route.ts`             | Disciplines data                                                           | 2     |
| `app/api/users/route.ts`                        | Users list                                                                 | 2     |
| `app/page.tsx`                                  | Home (Server Component)                                                    | 3     |
| `app/new/page.tsx`                              | Formulaire création                                                        | 3     |
| `app/vampires/[id]/page.tsx`                    | Fiche personnage (Server Component)                                        | 3     |
| `app/vampires/[id]/loading.tsx`                 | Fallback ISR                                                               | 3     |
| `app/vampires/[id]/config/page.tsx`             | Config personnage (Server Component)                                       | 3     |
| `app/vampires/[id]/config/loading.tsx`          | Fallback ISR                                                               | 3     |
| `app/not-found.tsx`                             | Page 404 globale                                                           | 3     |
| `app/error.tsx`                                 | Page d'erreur globale                                                      | 3     |

### À modifier

| Fichier                                        | Modification                                                              | Phase |
| ---------------------------------------------- | ------------------------------------------------------------------------- | ----- |
| 21 contexts                                    | Ajouter `'use client'`                                                    | 1     |
| `styles/GlobalStyle.ts`                        | `#__next` → `body`                                                        | 1     |
| `styles/Theme.tsx`                             | Ajouter `'use client'`                                                    | 1     |
| `pages/new.tsx`                                | Retirer `TextFallback`, importer depuis `styles/`                         | 1     |
| `pages/vampires/[id]/config.tsx`               | Importer `TextFallback` depuis `styles/`                                  | 1     |
| `components/config/ConfigAccessSection.tsx`    | Importer `TextFallback` depuis `styles/`                                  | 1     |
| `pages/index.tsx`                              | Importer helpers depuis `lib/queries.ts`                                  | 1     |
| `pages/vampires/[id].tsx`                      | Importer helpers depuis `lib/queries.ts`                                  | 1     |
| `components/Sheet.tsx`                         | `next/head` → `document.title`, `useRouter` → `next/navigation`           | 3     |
| `components/config/ConfigDangerousSection.tsx` | `useRouter` → `next/navigation`                                           | 3     |
| `package.json`                                 | Rien pour cette migration (on reste sur Next 14 + React 18 + NextAuth v4) | —     |
| `CLAUDE.md`                                    | Refléter la nouvelle structure `app/`                                     | 4     |

### À supprimer (Phase 4)

- `pages/_app.tsx`
- `pages/_document.js`
- `pages/index.tsx`
- `pages/new.tsx`
- `pages/vampires/[id].tsx`
- `pages/vampires/[id]/config.tsx`
- Tout `pages/api/` (9 fichiers)
- `lib/queries.ts` (si les Server Components appellent `db.*` directement)

---

## 6. Migrations futures (hors scope)

Ces migrations sont orthogonales et peuvent être faites indépendamment après celle-ci :

| Migration                                       | Effort estimé | Dépendances                                                        |
| ----------------------------------------------- | ------------- | ------------------------------------------------------------------ |
| NextAuth v4 → v5 (Auth.js)                      | ~2-3h         | Adapter le custom adapter PostgreSQL, tester magic link + GitHub   |
| Next.js 14 → 15 + React 18 → 19                 | ~1-2h         | styled-components v5 → v6, vérifier `react-use` compat, SWR compat |
| Google Fonts link → `next/font/google`          | ~15 min       | Aucune                                                             |
| `next/dynamic` Pusher → `React.lazy` + Suspense | ~15 min       | Aucune                                                             |
