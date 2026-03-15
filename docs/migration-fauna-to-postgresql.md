# Migration FaunaDB -> PostgreSQL (Vercel Postgres)

> **Contexte** : FaunaDB est mort. On migre vers PostgreSQL hébergé sur Vercel Postgres (basé sur Neon).
> Pas de migration de données — on repart de zéro.

---

## 1. Vue d'ensemble

### Ce qui change

| Avant | Après |
|-------|-------|
| FaunaDB (serverless, FQL) | Vercel Postgres (Neon, SQL) |
| `faunadb` npm package | `@vercel/postgres` ou Prisma |
| Documents JSON imbriqués | Tables relationnelles |
| Indexes FaunaDB (`one_vampire`, `all_vampires_full`, `all_users`) | Index SQL classiques |
| `FAUNADB_SECRET_KEY` | `POSTGRES_URL` (auto-provisionné par Vercel) |

### Ce qui ne change pas

- Les API routes (mêmes URLs, mêmes shapes de réponse)
- Le front-end (SWR, contexts, hooks)
- Auth0, Pusher
- Les types TypeScript (`VampireType`, `UserType`)

---

## 2. Choix technique : ORM / query builder

### Option A : Prisma (recommandé)

- Schema déclaratif, migrations auto-générées
- Typage TypeScript natif
- Très bien intégré à Vercel + Neon
- `prisma generate` crée un client typé
- Large communauté, docs solides

### Option B : @vercel/postgres + SQL brut

- Plus léger, zéro abstraction
- Parfait si on veut rester minimal
- Pas de migration tooling intégré (il faudrait un outil tiers ou des scripts SQL manuels)

### Option C : Drizzle ORM

- Léger, TypeScript-first
- Proche du SQL, moins magique que Prisma
- Bon compromis entre A et B

**Recommandation** : Prisma — le projet a déjà beaucoup de types, autant les garder synchronisés avec le schema DB automatiquement.

---

## 3. Schema de base de données

### 3.1 Approche : hybride relationnel + JSONB

Le `VampireType` actuel est un gros document JSON imbriqué. Tout normaliser en tables serait disproportionné pour ce projet. On utilise une approche hybride :
- **Tables relationnelles** pour les entités principales et les relations (accès, recherche)
- **Colonnes JSONB** pour les données imbriquées qui sont toujours lues/écrites en bloc

### 3.2 Schema Prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}

model User {
  id        String   @id @default(cuid())
  sub       String   @unique          // Auth0 subject ID
  email     String
  name      String
  nickname  String
  picture   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  editableVampires VampireEditor[]
  viewableVampires VampireViewer[]
}

model Vampire {
  id           String   @id @default(uuid())
  privateSheet Boolean  @default(false)
  generation   Int      @default(12)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Données du personnage stockées en JSONB
  infos        Json     // { name, playerName, chronicle, clan, ... }
  attributes   Json     // { strength, dexterity, ... }
  mind         Json     // { willpower, tempWillpower, health, ... }
  sections     Json     // { blood, path, disciplines, ... }

  // Abilities
  talents          Json  // RawAbilitiesListType[]
  customTalents    Json  @default("[]")
  skills           Json
  customSkills     Json  @default("[]")
  knowledges       Json
  customKnowledges Json  @default("[]")

  // Disciplines
  clanDisciplines    Json @default("[]")
  outClanDisciplines Json @default("[]")
  combinedDisciplines Json @default("[]")

  // Advantages, flaws, languages
  advantages Json @default("[]")
  flaws      Json @default("[]")
  languages  Json @default("[]")

  // Experience
  leftOverPex Int @default(0)

  // Pouvoirs optionnels
  trueFaith  Int  @default(0)
  humanMagic Json @default("{\"psy\":[],\"staticMagic\":[],\"theurgy\":[]}")

  // Relations d'accès
  editors VampireEditor[]
  viewers VampireViewer[]
}

// Tables de jointure pour le contrôle d'accès
model VampireEditor {
  vampireId String
  userId    String
  vampire   Vampire @relation(fields: [vampireId], references: [id], onDelete: Cascade)
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([vampireId, userId])
}

model VampireViewer {
  vampireId String
  userId    String
  vampire   Vampire @relation(fields: [vampireId], references: [id], onDelete: Cascade)
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([vampireId, userId])
}
```

### 3.3 Pourquoi ce découpage ?

| Colonne | Pourquoi JSONB et pas une table ? |
|---------|-----------------------------------|
| `infos` | Toujours lu/écrit en bloc, jamais filtré |
| `attributes` | 9 champs fixes, pas de requête dessus |
| `mind` | Idem, structure fixe |
| `talents`, `skills`, etc. | Tableaux d'objets à taille variable, jamais requêtés individuellement |
| `disciplines` | Structure complexe et imbriquée (paths, rituals) |

| Donnée | Pourquoi une table/colonne ? |
|--------|------------------------------|
| `editors`/`viewers` | Besoin de filtrer "les vampires que je peux voir/éditer" |
| `privateSheet` | Filtrage dans les listes |
| `generation` | Colonne scalaire, potentiellement filtrable |
| `id` | Clé primaire |

---

## 4. Fichiers à modifier

### 4.1 Fichiers à supprimer

Aucun fichier n'est à supprimer — on réécrit le contenu des API routes.

### 4.2 Fichiers à modifier (7 fichiers)

| Fichier | Changement |
|---------|------------|
| `pages/api/vampires/create.ts` | `q.Create()` -> `prisma.vampire.create()` |
| `pages/api/vampires.ts` | `q.Paginate(q.Match(...))` -> `prisma.vampire.findMany()` |
| `pages/api/vampires/[id].ts` | `q.Match(q.Index('one_vampire'))` -> `prisma.vampire.findUnique()` |
| `pages/api/vampires/[id]/update.ts` | `q.Replace()` -> `prisma.vampire.update()` |
| `pages/api/vampires/[id]/update_partial.ts` | `q.Update()` -> `prisma.vampire.update()` |
| `pages/api/vampires/[id]/delete.ts` | `q.Delete()` -> `prisma.vampire.delete()` |
| `pages/api/users.ts` | `q.Paginate(q.Match(...))` -> `prisma.user.findMany()` |

### 4.3 Fichiers à créer

| Fichier | Contenu |
|---------|---------|
| `prisma/schema.prisma` | Schema ci-dessus |
| `lib/prisma.ts` | Singleton du client Prisma (pattern Next.js) |

### 4.4 `lib/prisma.ts` — Singleton client

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## 5. Détail des réécritures par route

### 5.1 `POST /api/vampires/create`

**Avant (Fauna)** :
```typescript
await client.query(q.Create(q.Collection('vampires'), { data: vampireData }));
```

**Après (Prisma)** :
```typescript
import { prisma } from '../../../lib/prisma';

const vampire = await prisma.vampire.create({
  data: {
    id: uuidv4(),
    infos: vampireData.infos,
    attributes: vampireData.attributes,
    mind: vampireData.mind,
    sections: vampireData.sections,
    talents: vampireData.talents,
    customTalents: vampireData.customTalents,
    skills: vampireData.skills,
    customSkills: vampireData.customSkills,
    knowledges: vampireData.knowledges,
    customKnowledges: vampireData.customKnowledges,
    clanDisciplines: vampireData.clanDisciplines,
    outClanDisciplines: vampireData.outClanDisciplines,
    combinedDisciplines: vampireData.combinedDisciplines,
    advantages: vampireData.advantages,
    flaws: vampireData.flaws,
    languages: vampireData.languages,
    leftOverPex: vampireData.leftOverPex,
    trueFaith: vampireData.trueFaith,
    humanMagic: vampireData.humanMagic,
    generation: vampireData.generation,
    privateSheet: false,
    editors: {
      create: [{ user: { connectOrCreate: {
        where: { sub: userId },
        create: { sub: userId, email, name, nickname, picture }
      }}}]
    },
    viewers: {
      create: [{ user: { connectOrCreate: {
        where: { sub: 'github|3338913' },
        create: { sub: 'github|3338913', email: '', name: '', nickname: '', picture: '' }
      }}}]
    }
  }
});
```

### 5.2 `GET /api/vampires` (liste)

**Après** :
```typescript
const vampires = await prisma.vampire.findMany({
  where: userId
    ? {
        OR: [
          { privateSheet: false },
          { editors: { some: { user: { sub: userId } } } },
          { viewers: { some: { user: { sub: userId } } } },
        ],
      }
    : { privateSheet: false },
  select: {
    id: true,
    infos: true,
  },
});
```

> Note : le filtrage privé/public qui était fait côté application passe côté SQL. Plus efficace.

### 5.3 `GET /api/vampires/[id]`

**Après** :
```typescript
const vampire = await prisma.vampire.findUnique({
  where: { id },
  include: { editors: { include: { user: true } }, viewers: { include: { user: true } } },
});

if (!vampire) return res.status(404).json({ error: 'not found' });
```

### 5.4 `PUT /api/vampires/[id]/update`

**Après** :
```typescript
// Vérifier l'autorisation
const vampire = await prisma.vampire.findUnique({
  where: { id },
  include: { editors: { include: { user: true } } },
});

const isEditor = vampire.editors.some((e) => e.user.sub === user.sub);
if (!isEditor) return res.status(403).json({ error: 'unauthorized' });

// Mise à jour complète
await prisma.vampire.update({
  where: { id },
  data: { ...newVampireData },
});
```

### 5.5 `PATCH /api/vampires/[id]/update_partial`

Même pattern que update, mais avec un sous-ensemble des champs.

### 5.6 `DELETE /api/vampires/[id]/delete`

**Après** :
```typescript
await prisma.vampire.delete({ where: { id } });
```

Le `onDelete: Cascade` sur les relations nettoie automatiquement `VampireEditor` et `VampireViewer`.

### 5.7 `GET /api/users`

**Après** :
```typescript
const users = await prisma.user.findMany({
  select: { email: true, name: true, nickname: true, picture: true, sub: true },
});
```

---

## 6. Étapes de migration

### Phase 1 : Setup (30 min)

1. **Provisionner Vercel Postgres** dans le dashboard Vercel (Storage -> Create -> Postgres)
2. Les variables d'env `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING` sont auto-ajoutées
3. `yarn add prisma @prisma/client`
4. `yarn remove faunadb`
5. Créer `prisma/schema.prisma`
6. Créer `lib/prisma.ts`
7. `npx prisma migrate dev --name init` (crée les tables)

### Phase 2 : Réécriture des API routes (2-3h)

Réécrire les 7 fichiers listés en section 4.2, un par un. Pour chaque fichier :
1. Remplacer l'import `faunadb` par l'import `prisma`
2. Réécrire les requêtes FQL en appels Prisma
3. Adapter la shape de retour si nécessaire (normalement identique)
4. Tester manuellement

### Phase 3 : Adaptation de la sérialisation (1h)

Le front envoie un gros objet `VampireType` aplati. Il faut s'assurer que la route `update` décompose correctement cet objet en colonnes Prisma :

```typescript
function vampireTypeToPrismaData(v: VampireType) {
  return {
    infos: v.infos,
    attributes: v.attributes,
    mind: v.mind,
    sections: v.sections,
    talents: v.talents,
    customTalents: v.customTalents,
    skills: v.skills,
    customSkills: v.customSkills,
    knowledges: v.knowledges,
    customKnowledges: v.customKnowledges,
    clanDisciplines: v.clanDisciplines,
    outClanDisciplines: v.outClanDisciplines,
    combinedDisciplines: v.combinedDisciplines,
    advantages: v.advantages,
    flaws: v.flaws,
    languages: v.languages,
    leftOverPex: v.leftOverPex,
    trueFaith: v.trueFaith,
    humanMagic: v.humanMagic,
    generation: v.generation,
    privateSheet: v.privateSheet,
  };
}
```

### Phase 4 : Nettoyage

1. Supprimer `FAUNADB_SECRET_KEY` des env vars Vercel
2. Mettre à jour `.env.sample`
3. Mettre à jour `CLAUDE.md` (remplacer FaunaDB par PostgreSQL/Prisma)

---

## 7. Env vars

### À supprimer
```
FAUNADB_SECRET_KEY
```

### Ajoutées automatiquement par Vercel Postgres
```
POSTGRES_URL                # Connection pooling URL (pour Prisma)
POSTGRES_PRISMA_URL         # URL avec pgbouncer pour Prisma
POSTGRES_URL_NON_POOLING    # Direct connection (pour les migrations)
POSTGRES_USER
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_DATABASE
```

---

## 8. Points d'attention

### getStaticPaths / getStaticProps

Les fonctions `fetchVampireFromDB()` et `fetchOneVampire()` sont appelées au build time et dans ISR. Elles importent directement le client Fauna. Il faut les réécrire avec Prisma.

Prisma fonctionne sans problème dans `getStaticProps` / `getServerSideProps`.

### Prisma en dev vs production

En dev, Next.js hot-reload recrée les modules. Sans le singleton (`lib/prisma.ts`), on se retrouve avec des dizaines de connexions. Le pattern singleton ci-dessus règle ce problème.

### JSONB et typage

Prisma type les colonnes `Json` comme `Prisma.JsonValue`. Pour garder le typage fort côté application, caster explicitement :

```typescript
const vampire = await prisma.vampire.findUnique({ where: { id } });
const infos = vampire.infos as VampireType['infos'];
```

Ou créer un helper de transformation qui reconstruit un `VampireType` complet à partir du résultat Prisma.

### Taille des payloads

Les update full envoient tout le personnage. Avec Fauna c'était un `Replace` atomique. Avec Prisma `update`, c'est pareil — pas de changement de comportement.

### Concurrence (Pusher)

Plusieurs utilisateurs peuvent éditer en même temps. Le pattern actuel est "last write wins" (pas de conflit resolution). PostgreSQL se comporte pareil — pas de régression.

---

## 9. Estimation de l'effort

### Vue d'ensemble

| Phase | Effort | Complexité | Risque |
|-------|--------|------------|--------|
| Setup infra (Vercel Postgres + Prisma) | ~30 min | Faible | Faible |
| Schema Prisma + migration initiale | ~30 min | Faible | Faible |
| Réécriture des API routes | ~2h | Faible-Moyenne | Moyen |
| Sérialisation / helpers | ~30 min | Faible | Faible |
| Tests manuels end-to-end | ~1h | - | - |
| Nettoyage (env vars, docs, deps) | ~15 min | Faible | Faible |
| **Total** | **~4-5h** | | |

### Détail par fichier

Les 7 fichiers à réécrire sont tous courts et simples. Aucune logique métier complexe — c'est du CRUD direct.

| Fichier | Lignes | Opérations Fauna | Difficulté | Effort | Notes |
|---------|--------|------------------|------------|--------|-------|
| `pages/api/vampires/create.ts` | 62 | `q.Create()` | Facile | 20 min | Le plus de travail : décomposer le VampireType en colonnes Prisma + créer les relations `editors`/`viewers` via `connectOrCreate` |
| `pages/api/vampires.ts` | 62 | `q.Map/Paginate/Match` | Facile | 15 min | Le filtrage privé/public passe dans le `WHERE` Prisma — plus propre qu'avant. La fonction exportée `fetchVampireFromDB()` est aussi utilisée dans `getStaticPaths` |
| `pages/api/vampires/[id].ts` | 47 | `q.Map/Paginate/Match/Get` | Trivial | 10 min | Simple `findUnique`. La fonction exportée `fetchOneVampire()` est aussi utilisée dans `getStaticProps` |
| `pages/api/vampires/[id]/update.ts` | 63 | `q.Map/Paginate/Replace` | Facile | 20 min | Fetch + check auth + `Replace` -> `findUnique` + check + `update`. Attention : le body est un JSON brut à décomposer en colonnes |
| `pages/api/vampires/[id]/update_partial.ts` | 60 | `q.Map/Paginate/Update` | Facile | 15 min | Quasi identique à update.ts. `q.Update` (merge partiel) -> `prisma.update` avec seulement les champs envoyés |
| `pages/api/vampires/[id]/delete.ts` | 55 | `q.Map/Paginate/Delete` | Trivial | 10 min | Fetch + check auth + `Delete` -> `findUnique` + check + `delete`. Le cascade nettoie les jointures |
| `pages/api/users.ts` | 64 | `q.Map/Paginate/Match` | Trivial | 10 min | Simple `findMany` avec `select`. Plus besoin du `lodash.pick` |

### Ce qui rend cette migration simple

1. **Fichiers courts** — les 7 routes font entre 47 et 64 lignes. Code boilerplate Fauna répétitif (init client + `q.Map(q.Paginate(q.Match(...)))`)
2. **Pas de logique métier dans le DB layer** — tout est CRUD basique. Pas de transactions, pas de requêtes complexes, pas d'agrégations
3. **Le front ne change pas** — les API routes gardent les mêmes URLs et les mêmes shapes de réponse. SWR, contexts, hooks : rien à toucher
4. **Pas de migration de données** — on repart de zéro, donc pas de script d'export/import/transformation
5. **Pattern identique** — les 4 routes update/delete/update_partial ont exactement le même pattern "fetch by index -> check auth -> opération". Quand t'en as fait une, les autres c'est du copier-coller

### Ce qui demande de l'attention

| Point | Détail | Impact |
|-------|--------|--------|
| **Sérialisation create/update** | Le front envoie un objet `VampireType` aplati. Il faut le décomposer en colonnes Prisma (`infos`, `attributes`, `mind`, etc.) et extraire `editors`/`viewers` pour les tables de jointure | Moyen — un helper `vampireTypeToPrismaData()` à écrire une fois |
| **Reconstruction de la réponse** | `GET /api/vampires/[id]` doit retourner un objet plat `VampireType`, pas la structure Prisma avec relations imbriquées | Faible — un helper `prismaToVampireType()` inverse |
| **`update_partial`** | L'update partiel envoie un sous-ensemble du VampireType. Il faut ne mettre à jour que les colonnes envoyées, pas écraser les autres avec `undefined` | Moyen — filtrer les clés `undefined` avant l'appel Prisma |
| **Functions exportées** | `fetchVampireFromDB()` et `fetchOneVampire()` sont importées dans les pages pour `getStaticPaths`/`getStaticProps`. La signature de retour doit rester identique | Faible — juste s'assurer du même format de retour |
| **Hardcoded viewer** | `'github|3338913'` est hardcodé comme viewer par défaut dans `create.ts`. Il faut que ce user existe dans la table `User` | Faible — `connectOrCreate` gère ça |

### Comparaison avec d'autres approches

| Approche | Effort estimé | Commentaire |
|----------|---------------|-------------|
| **Prisma + JSONB hybride** (recommandé) | ~4-5h | Schema propre, peu de tables, typage auto |
| SQL brut (`@vercel/postgres`) | ~5-6h | Même travail + écrire le SQL à la main + pas de migration tooling |
| Drizzle ORM | ~4-5h | Comparable à Prisma, moins de docs/exemples pour ce use case |
| Tout normaliser en tables (full relationnel) | ~8-12h | Tables pour abilities, disciplines, rituals, paths... Disproportionné pour le besoin |

---

## 10. Résumé des dépendances

### À ajouter
```json
{
  "prisma": "^6.x",
  "@prisma/client": "^6.x"
}
```

### À supprimer
```json
{
  "faunadb": "^4.6.0"
}
```
