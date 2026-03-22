# Migration Styled-Components → Tailwind CSS

> **Contexte** : Le projet utilise styled-components (v5/v6) avec 123 composants stylés répartis dans 44 fichiers. Tailwind v4 est déjà importé (`globals.css`) mais pas activement utilisé. styled-components impose un runtime CSS-in-JS, un setup SSR fragile (`registry.tsx`), et va à contre-courant de la direction Next.js (qui pousse CSS Modules / Tailwind). L'objectif est de migrer vers du pur Tailwind avec `dark:` pour le thème.
> **Stratégie** : migration incrémentale. styled-components et Tailwind coexistent sans conflit. On migre phase par phase, on valide visuellement (tests E2E Playwright existants + screenshots), puis on supprime styled-components.
> **Rollback** : chaque phase est indépendante. On peut s'arrêter à n'importe quelle phase et avoir une app fonctionnelle.

---

## 1. Vue d'ensemble

### Ce qui change

| Avant                                                 | Après                                                            |
| ----------------------------------------------------- | ---------------------------------------------------------------- |
| `styled-components` runtime (16 KB gzipped)           | Tailwind compile-time (CSS statique ~5-10 KB gzipped)            |
| `lib/registry.tsx` (SSR styled-components)            | Supprimé — Tailwind n'a pas besoin de SSR setup                  |
| `styles/Theme.tsx` (`lightTheme`/`darkTheme` objects) | Supprimé — couleurs Tailwind directes + `dark:` variant          |
| `StyledThemeProvider` wrapping l'arbre React          | Classe `.dark` sur `<html>`, toggleé par `ThemeContext`          |
| `props.theme.*` (87 accès)                            | Classes Tailwind directes (`bg-white dark:bg-neutral-800`, etc.) |
| 123 styled component definitions                      | Classes Tailwind + quelques CSS modules pour cas complexes       |
| `createGlobalStyle` (fonts, resets, animations)       | Contenu déplacé dans `globals.css`                               |

### Ce qui ne change pas

- **PostgreSQL** — `lib/db.ts`, `lib/pool.ts` inchangés
- **NextAuth v4** — aucun impact
- **Les 21 contexts** — même code (sauf `ThemeContext` légèrement modifié et `ToastContext` migré)
- **SWR** — aucun changement
- **Pusher** — aucun changement
- **Les tests E2E Playwright** — servent de filet de sécurité + ajout de screenshots visuels

### Décisions prises

**100% Tailwind, pas de styled-components résiduel.** Garder même un seul styled-component impose de conserver la dépendance entière, le SSR registry, et le plugin SWC. Le bénéfice est nul pour une migration partielle. Les cas complexes (animations SVG, sélecteurs siblings) utilisent des CSS modules ou du CSS dans `globals.css`, pas styled-components.

**`dark:` partout, pas de CSS custom properties pour le thème.** Chaque élément porte ses classes light et dark explicitement (`bg-white dark:bg-neutral-800`). Plus verbeux mais 100% idiomatique Tailwind, zéro indirection, tout visible dans le markup. `ThemeContext` toggle la classe `.dark` sur `<html>`.

**Helper `classNames` maison, pas de clsx.** Un helper de 5 lignes copié depuis arkham-proba (`helpers/classNames.ts`) pour composer les classes conditionnelles. Zéro dépendance externe.

**Breakpoints custom, pas les defaults Tailwind.** Le codebase utilise ~10 breakpoints spécifiques. Les mapper aux defaults Tailwind (640, 768, 1024...) changerait subtilement le layout. On définit des breakpoints custom dans `@theme`.

---

## 2. Inventaire actuel

### Statistiques

| Métrique                               | Valeur                                             |
| -------------------------------------- | -------------------------------------------------- |
| Fichiers avec styled-components        | 44                                                 |
| Styled component definitions           | 123                                                |
| Types d'éléments HTML/SVG utilisés     | 21 (`span`, `div`, `input`, `button`, etc.)        |
| Accès au thème (`props.theme.*`)       | 87                                                 |
| Media queries                          | 39 instances, ~10 breakpoints distincts            |
| Keyframes                              | 2 (`slideIn`/`slideOut` toasts, `fill-stroke` SVG) |
| `createGlobalStyle`                    | 1 (fonts, resets, animations)                      |
| `styled(Component)` wrappers           | 6                                                  |
| Composants avec props typés dynamiques | 5                                                  |

### Fichiers par zone

**`styles/` (11 fichiers — composants partagés) :**
`GlobalStyle.ts`, `Theme.tsx`, `Container.ts`, `Items.ts`, `Lines.tsx`, `Sections.tsx`, `SheetContainer.ts`, `TextFallback.ts`, `Texts.ts`, `Titles.tsx`

**`components/` (32 fichiers — styled inline) :**
`Sheet.tsx`, `Nav.tsx`, `Footer.tsx`, `Dot.tsx`, `Square.tsx`, `Glyph.tsx`, `ActionsFooter.tsx`, `ColumnTitleWithOptions.tsx`, `SectionTitle.tsx`, `AutoCompleteInput.tsx`, `UserAvatar.tsx`, etc.

**`contexts/` (1 fichier) :** `ToastContext.tsx`

**`app/` (1 fichier) :** `app/new/page.tsx`

### Patterns complexes à migrer

| Pattern                                       | Occurrences  | Difficulté | Stratégie                               |
| --------------------------------------------- | ------------ | ---------- | --------------------------------------- |
| `props.theme.*`                               | 87           | Moyenne    | Classes Tailwind `dark:`                |
| Media queries custom                          | 39           | Faible     | Breakpoints custom dans `@theme`        |
| Sélecteurs siblings (`& ~ span svg`)          | 3-4 fichiers | **Haute**  | CSS modules ou refacto JS (hover state) |
| `styled(Component)` héritage                  | 6            | Moyenne    | Aplatir, merger les classes             |
| Calculs dynamiques (`${props.$size * 0.4}px`) | 5            | Moyenne    | `style={{}}` inline                     |
| `!important` overrides                        | 8+           | Moyenne    | Data attributes + spécificité CSS       |
| `@media (any-hover: hover)`                   | Multiple     | Moyenne    | Variant custom Tailwind ou CSS          |
| Keyframes conditionnels                       | 1 (Toast)    | Moyenne    | Classes conditionnelles                 |

---

## 3. Architecture du thème

### Approche : `dark:` partout

Pas de CSS custom properties pour les couleurs du thème. Chaque élément porte ses classes light et dark explicitement :

```tsx
// Exemple de composant migré
<div className="bg-white dark:bg-neutral-800 text-black dark:text-neutral-300 border-gray-300 dark:border-gray-600">
  <h2 className="text-gray-600 dark:text-neutral-300">Title</h2>
</div>
```

### Mapping des couleurs du thème vers Tailwind

| `props.theme.*`              | Light       | Dark       | Classes Tailwind                             |
| ---------------------------- | ----------- | ---------- | -------------------------------------------- |
| `background`                 | `white`     | `#333`     | `bg-white dark:bg-neutral-800`               |
| `color`                      | `black`     | `#ccc`     | `text-black dark:text-neutral-300`           |
| `dotColor`                   | `black`     | `#aaa`     | `fill-black dark:fill-neutral-400`           |
| `borderColor`                | `lightgray` | `darkGray` | `border-gray-300 dark:border-gray-500`       |
| `actionItemBorderColor`      | `#ccc`      | `#666`     | `border-neutral-300 dark:border-neutral-500` |
| `actionItemBackgroundActive` | `#f7f7f7`   | `#555`     | `bg-neutral-50 dark:bg-neutral-600`          |
| `focusBorderColor`           | `#8bcbe0`   | `#8bcbe0`  | `border-[#8bcbe0]`                           |
| `focusBackgroundColor`       | `#b4dae7`   | `#1d718d`  | `bg-[#b4dae7] dark:bg-[#1d718d]`             |
| `hoverBackgroundColor`       | `#8bcbe0`   | `#1b5c72`  | `bg-[#8bcbe0] dark:bg-[#1b5c72]`             |
| `actionBackground`           | `#eee`      | `#444`     | `bg-neutral-200 dark:bg-neutral-700`         |
| `glyphGray`                  | `#555`      | `#999`     | `text-neutral-600 dark:text-neutral-400`     |
| `blue`                       | `#1e4ed1`   | `#1e4ed1`  | `text-[#1e4ed1]`                             |
| `navBackground`              | `#f8f8f8`   | `#070707`  | `bg-neutral-50 dark:bg-neutral-950`          |
| `handTextColor`              | `#333`      | `#bbb`     | `text-neutral-700 dark:text-neutral-400`     |
| `dotBaseNotSelectColot`      | `#bbb`      | `#fff`     | `fill-neutral-400 dark:fill-white`           |
| `titleColor`                 | `#595959`   | `#ccc`     | `text-neutral-500 dark:text-neutral-300`     |
| `red`                        | `red`       | `#e62a2a`  | `text-red-600 dark:text-red-500`             |

> **Note** : Ce mapping utilise la palette Tailwind la plus proche. Lors de la migration de chaque composant, vérifier visuellement que le rendu est fidèle. Pour les couleurs sans équivalent Tailwind exact, utiliser les valeurs arbitraires (`[#8bcbe0]`).

### Modification de `ThemeContext` (fait en Phase 0)

```tsx
// ThemeContext toggle maintenant .dark sur <html> :
const toggleDarkMode = () => {
  const next = !darkMode;
  localStorage.setItem('ThemeContext:darkMode', String(next));
  setDarkMode(next);
  document.documentElement.classList.toggle('dark', next);
};

// + useEffect applique la classe au mount initial
useEffect(() => {
  // ... après setDarkMode(lsDarkMode) :
  document.documentElement.classList.toggle('dark', lsDarkMode);
}, []);
```

---

## 4. Gestion des styles dynamiques

Trois stratégies selon le cas :

### 4a. `style={{}}` inline pour les valeurs vraiment dynamiques

```tsx
// UserAvatar — taille vient des props
<div
  className="rounded-full flex items-center justify-center text-white font-semibold select-none"
  style={{
    width: size,
    height: size,
    fontSize: size * 0.4,
    backgroundColor: bg,
  }}
/>
```

### 4b. CSS custom properties pour les valeurs semi-dynamiques

```tsx
// OptionsContainer — max-height dépend du nombre d'items
<div
  className="overflow-hidden transition-all duration-300"
  style={
    {
      '--max-h': `${elemCount * 24 + actionCount * 41 + 20}px`,
    } as React.CSSProperties
  }
/>
```

### 4c. Map de classes pour les valeurs contraintes

```tsx
// HorizontalSection — $count est 2 ou 3
const gridColsMap = { 2: 'grid-cols-2', 3: 'grid-cols-3' } as const;
<div className={gridColsMap[count]} />;
```

**Ne jamais faire :** `grid-cols-${count}` — Tailwind ne peut pas détecter les classes interpolées au build.

---

## 5. Composants à ne PAS migrer en Tailwind pur

Ces cas utilisent des CSS modules (`.module.css`) ou du CSS dans `globals.css` :

| Composant                                | Raison                                                                              | Solution                        |
| ---------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------- |
| `DotContainer` (Dot.tsx)                 | Sélecteurs siblings (`&:hover ~ span svg`), 8 `!important`, 15+ combinaisons d'état | CSS module avec data attributes |
| `SquareLineContainer` (SquareLine.tsx)   | Grid template avec `calc()`, responsive columns                                     | CSS module                      |
| `SquareStyle` animation SVG (Square.tsx) | `stroke-dasharray` / `stroke-dashoffset` avec timing conditionnel                   | CSS dans `globals.css`          |
| `fill-stroke` keyframe (GlobalStyle)     | Animation SVG one-off                                                               | CSS dans `globals.css`          |
| `@media (any-hover: hover)`              | Pas de variant Tailwind natif                                                       | Variant custom ou CSS           |

---

## 6. Extraction de composants UI

### Principe directeur

Extraire un composant quand la même combinaison classes + structure apparaît 2+ fois. Ne pas créer de composant pour un élément stylé unique.

### Tiers

**Tier 1 — Garder comme composants extraits (structure + comportement) :**
`Dot`, `DotRow`, `Square`, `SquareRow`, `Glyph`, `Nav`, `MenuDropdown`, `ActionsFooter`, `SectionTitle`, `ColumnTitleWithOptions`, `AutoCompleteInput`

**Tier 2 — Convertir en classes Tailwind inline, pas de composant :**
`EmptyLine`, `BlackLine`, `FooterStyle`, `FooterText`, `FooterLink`, `Container`, `TextFallback`, `OptionItem`, `ActionItem`

**Tier 3 — Constantes de classes réutilisables :**

```ts
// lib/tw.ts
export const HAND_TEXT = 'font-bilbo text-neutral-700 dark:text-neutral-400';
export const HAND_TEXT_LG =
  'font-bilbo text-3xl text-neutral-700 dark:text-neutral-400';
```

### Organisation

```
components/
  ui/               # Primitives interactives (nouveau)
    Dot.tsx
    DotRow.tsx       # Ligne de dots avec logique hover
    Square.tsx
    SquareRow.tsx
    Glyph.tsx
    MenuDropdown.tsx
  line/              # Lignes de saisie (existant, inchangé)
  sections/          # Sections fiche (existant, inchangé)
  pages/             # Composants page-level (existant, inchangé)
lib/
  tw.ts              # Constantes de classes partagées
```

---

## 7. Accessibilité — Points d'attention

| Problème                                                                   | Sévérité  | Action                                                                                                    |
| -------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------- |
| `outline: none` sans remplacement sur Glyph, DotContainer, SquareContainer | **Haute** | Remplacer par `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-border` |
| `onKeyPress` déprécié (dans `generateHandleKeypress`)                      | **Haute** | Remplacer par `onKeyDown`                                                                                 |
| Touch targets < 44px (dots = 24px wide)                                    | Moyenne   | Ajouter `min-w-11 min-h-11` sur le container interactif                                                   |
| `--dot-base-unselected: #bbbbbb` contraste 1.7:1 (fail WCAG AA)            | Moyenne   | Assombrir à minimum `#767676` (4.5:1)                                                                     |
| Manque `role="radiogroup"` + `aria-label` sur le parent des dots           | Faible    | Ajouter durant migration                                                                                  |
| `prefers-reduced-motion` reset                                             | OK        | Conserver tel quel, déplacer dans `globals.css`                                                           |

---

## 8. Impact performance

### Bundle size

|                                       | Avant          | Après                    |
| ------------------------------------- | -------------- | ------------------------ |
| JS client (styled-components runtime) | ~16 KB gzipped | 0                        |
| CSS statique (Tailwind)               | ~0             | ~5-10 KB gzipped         |
| **Net**                               |                | **~8-12 KB JS en moins** |

Le CSS est mieux : cacheable, ne bloque pas le parsing JS, pas d'hydration nécessaire.

### Runtime

- **Plus de style injection au runtime** — chaque mount/unmount de styled component déclenche un recalcul. Avec Tailwind, le CSS est parsé une fois.
- **Plus de SSR hydration overhead** — le pattern `registry.tsx` disparaît.
- **Theme switching plus léger** — actuellement, changer le dark mode re-render tout l'arbre `StyledThemeProvider`. Avec Tailwind `dark:`, le toggle ajoute/retire la classe `.dark` sur `<html>` et le CSS s'applique nativement.

---

## 9. Plan de migration

### Phase 0 : Fondation (1-2 jours) — Taille S ✅

**Aucun changement visuel. Uniquement de l'infrastructure.**

- [x] Configurer Tailwind `@theme` (breakpoints custom, fonts) dans `globals.css`
- [x] Déplacer le contenu de `GlobalStyle.ts` (font-faces, resets, `prefers-reduced-motion`, keyframe `fill-stroke`) dans `globals.css`
- [x] Réduire `GlobalStyle.ts` aux seules règles theme-dependent
- [x] Modifier `ThemeContext` pour toggler `.dark` sur `<html>` (en plus du `StyledThemeProvider` existant, pour coexistence)
- [x] Créer `helpers/classNames.ts` (helper maison, 5 lignes)
- [x] Ajouter des tests Playwright de screenshot visuel (`e2e/tests/visual.spec.ts`)

**Validation** : l'app est visuellement identique. Build + lint + tests E2E passent.

### Phase 1 : Composants feuilles sans thème (1-2 jours) — Taille S

- [ ] `styles/TextFallback.ts`
- [ ] `components/line/ColumnLine.ts`
- [ ] `components/NamedSquare.tsx`
- [ ] `styles/SheetContainer.ts`
- [ ] `components/ErrorPage.tsx`

**Validation** : tests E2E + comparaison screenshots.

### Phase 2 : Fichiers partagés `styles/` (3-4 jours) — Taille L

**Blast radius élevé — ces fichiers sont importés partout.**

- [ ] `styles/Lines.tsx` (`EmptyLine`, `BlackLine`)
- [ ] `styles/Items.ts` (`OptionItem`, `ActionItem`)
- [ ] `styles/Titles.tsx` (`Title`, `StyledColumnTitle`, `SubTitle`)
- [ ] `styles/Texts.ts` (`HandLargeText`, `HandEditableText`, etc.) — créer `lib/tw.ts`
- [ ] `styles/Sections.tsx` (`HorizontalSection` avec grid dynamique)
- [ ] `styles/Container.ts` (hover-reveal pattern)

**Validation** : tests E2E + screenshots + test manuel light/dark sur chaque page.

### Phase 3 : Composants autonomes (2-3 jours) — Taille M

- [ ] `components/Footer.tsx`
- [ ] `components/SectionTitle.tsx`
- [ ] `components/line/TextHelper.ts`
- [ ] `components/line/ButtonGlyphContainer.ts`
- [ ] `components/PexElem.tsx`
- [ ] `components/PexPercentages.tsx`
- [ ] `components/UserAvatar.tsx` (styles dynamiques inline)
- [ ] `app/new/page.tsx`

**Validation** : tests E2E + screenshots.

### Phase 4 : Composants interactifs complexes (4-5 jours) — Taille XL

**Phase la plus risquée. Les composants Dot/Square/Glyph sont le cœur de l'UI.**

- [ ] `components/Glyph.tsx`
- [ ] `components/Square.tsx` + CSS module pour animation SVG
- [ ] `components/Dot.tsx` + CSS module pour sélecteurs siblings
- [ ] `components/line/DotSeparator.ts`
- [ ] `components/SquareLine.tsx` + CSS module pour grid calc
- [ ] `components/line/Line.tsx`
- [ ] `components/line/LineTitle.tsx`, `LineValue.tsx`, `AbilityLine.tsx`

**Validation** : tests E2E + screenshots + **test manuel exhaustif** de toutes les interactions (hover dots, click squares, états locked/disabled/base/selected, animations).

### Phase 5 : Navigation et Actions (2-3 jours) — Taille M

- [ ] `components/Nav.tsx` (dropdown, transitions)
- [ ] `components/ActionsFooter.tsx` (desktop/mobile split, `styled(Link)`)
- [ ] `components/AutoCompleteInput.tsx` (dropdown, focus states)
- [ ] `components/ColumnTitleWithOptions.tsx` (max-height dynamique)

**Validation** : tests E2E + screenshots + test manuel navigation mobile/desktop.

### Phase 6 : Config et Toast (1-2 jours) — Taille S

- [ ] `components/config/ConfigAccessSection.tsx`
- [ ] `components/config/ConfigDangerousSection.tsx`
- [ ] `components/config/ConfigPreferencesSection.tsx`
- [ ] `components/pages/HomeClient.tsx`, `ConfigClient.tsx`, `ProfileClient.tsx`
- [ ] `contexts/ToastContext.tsx` (keyframes → classes conditionnelles)

**Validation** : tests E2E + screenshots.

### Phase 7 : Cleanup (1-2 jours) — Taille M

- [ ] Supprimer `styles/GlobalStyle.ts`
- [ ] Supprimer `styles/Theme.tsx`
- [ ] Supprimer `lib/registry.tsx`
- [ ] Retirer `<StyledComponentsRegistry>` de `app/layout.tsx`
- [ ] Retirer `<ThemeProvider>` (styled-components) de `lib/providers.tsx`
- [ ] Retirer `compiler.styledComponents` de `next.config.js` (si présent)
- [ ] `pnpm remove styled-components`
- [ ] Vérifier : `grep -r "styled-components" --include="*.ts" --include="*.tsx" .` → 0 résultats
- [ ] Supprimer tous les fichiers `styles/*.ts(x)` migrés

**Validation** : `pnpm build` clean + tests E2E complets + screenshots finaux.

---

## 10. Estimation globale

| Phase                           | Effort          | Risque         |
| ------------------------------- | --------------- | -------------- |
| Phase 0 : Fondation             | 1-2 jours       | Faible         |
| Phase 1 : Feuilles sans thème   | 1-2 jours       | Faible         |
| Phase 2 : Styles partagés       | 3-4 jours       | **Moyen-Haut** |
| Phase 3 : Composants autonomes  | 2-3 jours       | Moyen          |
| Phase 4 : Interactifs complexes | 4-5 jours       | **Haut**       |
| Phase 5 : Nav + Actions         | 2-3 jours       | Moyen          |
| Phase 6 : Config + Toast        | 1-2 jours       | Faible         |
| Phase 7 : Cleanup               | 1-2 jours       | Faible         |
| **Total**                       | **15-22 jours** |                |

> +20-30% si moins de confort avec Tailwind.

---

## 11. Pièges courants

1. **Ne pas oublier le forwarding de `className`** — Beaucoup de styled components reçoivent des classes dynamiques (`full`, `locked`, `disabled`). Utiliser `classNames()` (`helpers/classNames.ts`) pour composer classes Tailwind + classes dynamiques.

2. **`!important` à réévaluer** — Les 8+ usages de `!important` existent pour overrider la spécificité styled-components. En Tailwind, le modèle de spécificité change. Tester sans `!important` d'abord.

3. **Transitions explicites** — `transition: fill 0.2s` ≠ Tailwind `transition` (qui applique `transition: all`). Utiliser `transition-[fill]` pour cibler.

4. **`as` prop polymorphique** — Si des styled components utilisent `as`, Tailwind ne fournit pas ça. Utiliser l'élément HTML directement.

5. **Ne jamais interpoler les classes** — `grid-cols-${count}` ne marche pas. Utiliser un map de classes.

6. **`onKeyPress` → `onKeyDown`** — Profiter de la migration pour corriger (déprécié dans les browsers modernes).

---

## 12. Consensus des reviewers

### Architecte

> Migration incrémentale en 5 phases, fondation CSS custom properties d'abord. Go 100% Tailwind, pas de résiduel styled-components. Le plus gros gain architectural : suppression du SSR registry et du runtime style injection. Estimation : 7-10 jours.

### UI/UX Designer

> CSS custom properties avec `@theme` pour les tokens sémantiques. Attention particulière aux Dot/Square (sélecteurs siblings → refacto vers hover state JS ou CSS module). Profiter de la migration pour corriger l'accessibilité (focus visible, touch targets, contraste `dotBaseNotSelectColor`). Ne pas forcer tout en Tailwind — les animations SVG et les sélecteurs complexes restent en CSS.

### Lead Engineer

> ROI moyen-terme : la migration se rentabilise en 2-3 cycles de mise à jour Next.js. Phase 0 (screenshots Playwright) est un prérequis dur. Phase 4 (Dot/Square) est la plus risquée, estimée XL. Estimation totale : 15-22 jours. Accepter que 3-4 composants restent en CSS modules — c'est du bon engineering, pas un échec.
