# Roadmap de modernisation technique

> Dernière mise à jour : 2026-03-24
> Scope : améliorations techniques uniquement, pas de changements produit.

---

## Tier 1 — Faire maintenant (~3-4 jours)

### 1. Performance React : Compiler + quick fixes

**Pourquoi :** Le React Compiler (déjà configuré mais désactivé) automatise la memoization. L'activer est le levier perf #1. Quelques fixes manuels sont des prérequis ou des compléments nécessaires.

| #   | Tâche                                           | Effort    | Détail                                                                                                                                                                                                        |
| --- | ----------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1a  | Fix `JSON.stringify` dans les dependency arrays | 15min     | `hooks/useStateWithTracker.ts` — 2 occurrences. Anti-pattern qui sérialise à chaque render et confond le compiler. Remplacer par deep comparison custom ou `useDeepCompareEffect`. **Prérequis au compiler.** |
| 1b  | Audit des `eslint-disable` sur les hooks rules  | 1-2h      | Recenser et corriger les patterns non-idiomatiques qui empêchent le compiler de fonctionner.                                                                                                                  |
| 1c  | Activer les règles ESLint du React Compiler     | 1-2 jours | 4 règles désactivées dans `eslint.config.mjs` avec TODO. Fixer les violations, activer le compiler, mesurer l'impact.                                                                                         |
| 1d  | `useMemo` sur les context values                | 1-2h      | 19 contextes sur 22 créent un nouvel objet `value` à chaque render sans `useMemo`. Le compiler ne garantit pas de mémoriser ces values — fix manuel nécessaire.                                               |

### 2. Fix fonctionnel : debounce sur useSave

**Pourquoi :** Un double-clic rapide ou deux tabs simultanées peuvent envoyer deux PUT en même temps. C'est un bug de fiabilité, pas juste de la perf.

| #   | Tâche                                        | Effort | Détail                                                                                                  |
| --- | -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------- |
| 2a  | Ajouter debounce/deduplication sur `useSave` | 30min  | `hooks/useSave.ts` — Debounce de 300-500ms. Attention au délai perceptible en collaboration temps réel. |

### 3. Migration TypeScript 6.0

**Pourquoi :** TS 6.0 est sorti et supprime/déprécie des options utilisées par le projet. C'est un passage obligé avant TS 7.0 (rewrite natif en Go, prévu dans quelques mois). TS 7.0 supprimera tout ce qui est déprécié en 6.0.

| #   | Tâche                                     | Effort | Détail                                                                                                                                                                  |
| --- | ----------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3a  | `target: "es5"` → `"es2025"`              | 30min  | **ES5 est supprimé dans TS 6.0.** Passer à `es2025` (nouveau défaut). Supprimer `downlevelIteration` si présent.                                                        |
| 3b  | Ajouter `types: ["node"]` explicite       | 5min   | **Le défaut passe de "tous les @types" à `[]`.** Sans ça, `@types/node` et `@types/react` ne seront plus résolus.                                                       |
| 3c  | Rendre `strict: false` explicite          | 5min   | **Le défaut passe à `strict: true`.** Déjà explicite dans le tsconfig actuel, mais vérifier que rien ne casse.                                                          |
| 3d  | Supprimer `esModuleInterop: true`         | 5min   | **Déprécié en 6.0** (toujours activé implicitement). Supprimer aussi `allowSyntheticDefaultImports` si présent.                                                         |
| 3e  | Supprimer `lib: ["dom.iterable"]`         | 5min   | **`dom` inclut maintenant `dom.iterable` nativement.** Simplifier la config.                                                                                            |
| 3f  | Remplacer `onKeyPress` → `onKeyDown`      | 1h     | Déprécié dans React 19 + DOM spec. 7 fichiers touchés : `Line.tsx`, `Dot.tsx`, `Square.tsx`, `Glyph.tsx`, `Nav.tsx`, `ColumnTitleWithOptions.tsx`, `ActionsFooter.tsx`. |
| 3g  | Remplacer `FormEvent` déprécié            | 30min  | `app/new/page.tsx`, `components/sections/Infos.tsx` — utiliser le type correct.                                                                                         |
| 3h  | Supprimer `GlobalStyle.ts` (fichier mort) | 5min   | Importe `styled-components` qui n'est plus dans les dépendances. Vestige de la migration Tailwind.                                                                      |

### 4. Quick fixes divers

| #   | Tâche                                            | Effort | Détail                                                                                                                                                    |
| --- | ------------------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4a  | Fix import lodash dans `ConfigAccessSection.tsx` | 5min   | `import { concat, isEqual } from 'lodash'` tire tout le bundle lodash. Passer en imports individuels (`lodash/concat`, `lodash/isEqual`).                 |
| 4b  | Fixer les ~17 `any` explicites                   | 1-2h   | Le chiffre initial de 12,600 inclut probablement `node_modules`. Les vrais `any` dans le code source sont ~17 occurrences. Quick win pour la type safety. |

---

## Tier 2 — Quand tu as le temps (~3-4 jours)

### 5. Sécurité & robustesse API

**Pourquoi :** Les endpoints d'écriture acceptent du JSON arbitraire sans validation. Le PUT passe les données directement à `db.vampires.update()`. C'est un vrai trou de sécurité même sur un side project.

| #   | Tâche                                  | Effort       | Détail                                                                                                                   |
| --- | -------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| 5a  | Validation des inputs API avec Valibot | 1-2 jours    | Ajouter des schémas de validation sur les endpoints POST/PUT/PATCH. Valibot plutôt que Zod : plus léger, tree-shakeable. |
| 5b  | Error handling structuré côté API      | demi-journée | Distinguer 400/403/404/500 au lieu de tout catch en 500. Ajouter un Error Boundary React global au niveau layout.        |

### 6. Accessibilité (a11y)

**Pourquoi :** Vrais bugs d'accessibilité identifiés, pas du nice-to-have.

| #   | Tâche                                  | Effort | Détail                                                                                |
| --- | -------------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| 6a  | Labels sur les form inputs             | 1h     | `LineInput`, `AutoCompleteInput` — pas de `<label>` associé.                          |
| 6b  | Fixer `aria-checked`                   | 30min  | `Dot.tsx` utilise `aria-checked="full"` — invalide, doit être `true`/`false`/`mixed`. |
| 6c  | Labels accessibles sur `role="button"` | 1h     | `DotSeparator` et 8 autres éléments avec `role="button"` sans `aria-label`.           |
| 6d  | ARIA live regions pour les erreurs     | 1h     | Les messages d'erreur (toasts) ne sont pas annoncés aux lecteurs d'écran.             |

### 7. Monitoring minimal

| #   | Tâche                        | Effort | Détail                                                                                    |
| --- | ---------------------------- | ------ | ----------------------------------------------------------------------------------------- |
| 7a  | Installer Sentry (free tier) | 30min  | Error tracking en production. Permet aussi de mesurer l'impact des optimisations de perf. |

---

## Tier 3 — Effort continu (en arrière-plan)

### 8. TypeScript strictness progressif

**Pourquoi :** `strict: false` est un choix assumé, mais on peut progresser sans big bang.

| #   | Tâche                        | Approche                                                                                               |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| 8a  | Activer `noImplicitAny`      | Vérifier d'abord combien de violations ça génère. Si < 50, le faire. Sinon, fixer fichier par fichier. |
| 8b  | Réduire les `any` implicites | Chaque PR devrait améliorer le typage des fichiers touchés. Commencer par `lib/` et `helpers/`.        |

### 9. Supprimer lodash

**Pourquoi :** 5 imports lodash, tous remplaçables par des APIs natives.

| Import            | Remplacement                                         |
| ----------------- | ---------------------------------------------------- |
| `lodash/some`     | `Array.prototype.some`                               |
| `lodash/isEqual`  | Custom deep equal ou `structuredClone` + comparaison |
| `lodash/throttle` | Hook custom ou micro-lib                             |
| `lodash/concat`   | Spread operator `[...a, ...b]`                       |

---

## Ne pas faire

| Item                                                                                   | Raison                                                                                                                                                                                                                                     |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **React.memo manuel** (Line, Dot, AttributeLine)                                       | Le React Compiler le fait automatiquement. Ajouter du memo manuel par-dessus = deux couches redondantes.                                                                                                                                   |
| **useMemo sur calculs légers** (Fuse index sur ~50 items, tri de ~20 personnages, PEX) | Optimisation prématurée non mesurée. Profiler d'abord si un problème est ressenti.                                                                                                                                                         |
| **Refactor useSave → PATCH partiel**                                                   | Trop risqué sans couverture de tests solide. Le PUT complet marche. Le PATCH partiel introduit des problèmes de concurrence avec Pusher (optimistic locking nécessaire). À reconsidérer si les tests d'intégration couvrent le cycle save. |
| **Refactor provider nesting** (15+ providers)                                          | Purement cosmétique. Zéro impact runtime. Un `composeProviders()` ajoute de l'indirection pour un gain visuel.                                                                                                                             |
| **TypeScript strict: true** (big bang)                                                 | Effort disproportionné pour un projet solo. Préférer l'approche progressive (Tier 3).                                                                                                                                                      |
| **Prepared statements PostgreSQL**                                                     | Sur Neon serverless avec `max:1` et cold starts, le cache de plans est souvent perdu. Gain marginal.                                                                                                                                       |
| **NextAuth v4 → v5**                                                                   | Breaking changes majeurs, l'adapter custom doit être réécrit. v4 fonctionne parfaitement avec Next.js 16. Reporter indéfiniment sauf CVE critique.                                                                                         |
| **Structured logging**                                                                 | Sentry couvre le besoin. Le structured logging est de l'outillage d'équipe.                                                                                                                                                                |
| **Lighthouse CI / Web Vitals monitoring**                                              | Overkill pour un side project. Lancer Lighthouse manuellement quand nécessaire.                                                                                                                                                            |

---

## Dépendances entre tâches

```
1a (fix JSON.stringify) ──prérequis──→ 1c (React Compiler)
1b (audit eslint-disable) ──prérequis──→ 1c (React Compiler)
1c (React Compiler) ──rend obsolète──→ React.memo manuel
3a-3e (migration TS 6.0) ──prérequis──→ 8a (noImplicitAny) et futur TS 7.0
3a (target es2025) ──bloquant──→ upgrade TypeScript 6.0
5a (validation Valibot) ──prérequis si──→ refactor useSave (si un jour envisagé)
7a (Sentry) ──permet de mesurer──→ impact de 1c, 1d, 2a
```

### Note sur TypeScript 7.0

TS 7.0 (rewrite natif en Go, ~10x plus rapide) est annoncé pour les prochains mois. Tout ce qui est déprécié en 6.0 avec `"ignoreDeprecations": "6.0"` sera **supprimé** en 7.0. La migration TS 6.0 (section 3) prépare directement le terrain pour 7.0.

---

## Notes des reviewers

- **Architecte** : insiste sur le monitoring en amont pour mesurer l'impact de chaque phase. Le refactor useSave est faisable mais nécessite des tests d'intégration préalables et un mécanisme d'optimistic locking pour la collaboration temps réel.
- **Lead engineer** : le Tier 1 seul donne 80% du bénéfice pour 20% de l'effort. Le chiffre de 12,600 `any` est erroné (inclut node_modules). NextAuth v5 = risque maximal pour bénéfice minimal.
