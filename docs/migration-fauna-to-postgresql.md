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

### Contexte : qu'est-ce qu'on fait réellement ?

Les 7 routes API font du CRUD trivial :
- `CREATE` un document
- `SELECT` par ID ou liste complète
- `UPDATE` (full replace ou partiel)
- `DELETE` par ID

Pas de jointures complexes, pas de transactions, pas d'agrégations, pas de requêtes dynamiques. Les seules "relations" sont `editors`/`viewers` (des tableaux de strings dans Fauna, qui deviendraient des tables de jointure en SQL).

C'est important parce que ça veut dire qu'**on n'a pas besoin de la puissance d'un ORM**. La question est : est-ce qu'on en veut quand même pour le confort ?

### Option A : `@vercel/postgres` + SQL brut

Le plus direct. Zéro abstraction entre toi et la DB.

```typescript
import { sql } from '@vercel/postgres';

// GET one vampire
const { rows } = await sql`SELECT * FROM vampires WHERE id = ${id}`;

// CREATE
await sql`INSERT INTO vampires (id, infos, attributes, ...) VALUES (${id}, ${JSON.stringify(infos)}, ...)`;

// UPDATE
await sql`UPDATE vampires SET infos = ${JSON.stringify(infos)}, ... WHERE id = ${id}`;

// DELETE
await sql`DELETE FROM vampires WHERE id = ${id}`;
```

| Pour | Contre |
|------|--------|
| Zéro dépendance lourde — juste `@vercel/postgres` (~léger) | SQL à écrire à la main (mais c'est 5 requêtes triviales) |
| Pas de build step supplémentaire (`prisma generate`) | Pas de typage auto sur les résultats (faut caster soi-même) |
| Pas de fichier schema séparé à maintenir | Migrations manuelles (un fichier `init.sql` suffit ici) |
| Cold start plus rapide (pas de Prisma engine) | Pas de tooling pour introspection ou studio |
| Fonctionne tel quel dans les edge functions | Sérialisation/désérialisation JSON manuelle |

**Pour le schema :** un simple fichier `schema.sql` versionné dans le repo, exécuté une fois au setup.

**Pour le typage :** on a déjà `VampireType` — un type d'interface suffit pour les résultats.

### Option B : Prisma

L'ORM le plus populaire en Next.js. Schema déclaratif, client typé auto-généré, migrations versionnées.

```typescript
import { prisma } from '../../../lib/prisma';

// GET one vampire
const vampire = await prisma.vampire.findUnique({ where: { id } });

// CREATE
await prisma.vampire.create({ data: { ... } });

// UPDATE
await prisma.vampire.update({ where: { id }, data: { ... } });

// DELETE
await prisma.vampire.delete({ where: { id } });
```

| Pour | Contre |
|------|--------|
| Client typé : `prisma.vampire.findUnique()` retourne un type exact | **Dépendance lourde** : Prisma engine (binaire Rust ~15 MB), `prisma generate` obligatoire |
| Migrations auto-générées et versionnées | Build step en plus (`prisma generate` dans `postinstall` ou `build`) |
| Relations `editors`/`viewers` gérées élégamment (`connectOrCreate`, `include`) | Cold start plus lent sur serverless (chargement de l'engine) |
| `prisma studio` pour inspecter la DB en dev | Overkill pour 5 requêtes CRUD — comme prendre un camion pour aller chercher le pain |
| Très bien documenté | Couche d'abstraction en plus à comprendre/débugger |
| Fonctionne bien avec Vercel + Neon | Nécessite le pattern singleton en dev (hot reload) |

### Option C : Drizzle ORM

ORM léger, TypeScript-first, proche du SQL. Pas de binaire externe.

```typescript
import { db } from '../../../lib/db';
import { vampires } from '../../../lib/schema';
import { eq } from 'drizzle-orm';

// GET one vampire
const vampire = await db.select().from(vampires).where(eq(vampires.id, id));

// CREATE
await db.insert(vampires).values({ ... });

// UPDATE
await db.update(vampires).set({ ... }).where(eq(vampires.id, id));

// DELETE
await db.delete(vampires).where(eq(vampires.id, id));
```

| Pour | Contre |
|------|--------|
| Léger, pas de binaire externe, pas d'engine | Moins de tooling que Prisma (mais suffisant ici) |
| TypeScript-first, schema = code TS | API un peu plus verbeuse que Prisma pour les relations |
| Proche du SQL — tu sais ce qui est généré | Communauté plus petite (mais en croissance rapide) |
| Migrations via `drizzle-kit` | Un peu moins de docs/exemples |
| Cold start rapide | Schema TS à maintenir (comme Prisma, mais en TS au lieu de `.prisma`) |

### Matrice de décision

| Critère | `@vercel/postgres` | Prisma | Drizzle |
|---------|-------------------|--------|---------|
| Complexité ajoutée | Nulle | Haute | Faible |
| Typage auto des résultats | Non (cast manuel) | Oui | Oui |
| Poids des dépendances | ~léger | ~lourd (engine Rust) | ~moyen |
| Migrations tooling | Non (fichier SQL) | Oui (auto) | Oui (drizzle-kit) |
| Cold start serverless | Rapide | Plus lent | Rapide |
| Courbe d'apprentissage | SQL | Prisma DSL | SQL-like TS |
| Relations editors/viewers | `JOIN` SQL manuels | `include` / `connectOrCreate` | `JOIN` TS typé |
| Adapté à la complexité du projet | Oui | Surdimensionné | Oui |

### Recommandation : `@vercel/postgres` + `node-pg-migrate`

C'est le combo le plus adapté à ce projet : SQL brut pour les requêtes, migrations versionnées pour le schema. Zéro magie, zéro abstraction inutile.

**Pourquoi pas Prisma ?**
- On a 5 requêtes SQL triviales. Prisma apporte un engine Rust, un build step, un DSL à apprendre, et un cold start rallongé… pour écrire `SELECT * FROM vampires WHERE id = $1`.
- Le typage auto est un vrai plus, mais on a déjà `VampireType` côté front. Un cast manuel sur 5 requêtes n'est pas un fardeau.
- Les relations `editors`/`viewers` sont le seul endroit où Prisma simplifie vraiment les choses, mais un `JOIN` SQL classique fait le même travail en 2 lignes.

**Pourquoi pas Drizzle ?**
- Bon outil, mais ça reste un ORM à apprendre et maintenir pour 5 requêtes. Le gain de typage ne justifie pas la dépendance supplémentaire ici.

### Inconvénients de `@vercel/postgres` + `node-pg-migrate`

On choisit cette stack en connaissance de cause. Voici ce qu'on perd et ce qu'on accepte :

#### Ce qu'on perd par rapport à un ORM (Prisma/Drizzle)

| Inconvénient | Impact réel sur ce projet |
|-------------|--------------------------|
| **Pas de typage auto des résultats SQL** — `sql\`SELECT ...\`` retourne `QueryResult<any>`. Il faut caster manuellement vers `VampireType` | **Faible.** On a déjà les types côté front. Un helper `rowToVampire()` écrit une fois suffit. Mais c'est du code en plus à maintenir si les types changent |
| **Pas de validation schema ↔ types** — rien ne garantit que les colonnes SQL correspondent aux types TS. Si tu renommes une colonne en DB, le compilateur ne te dira rien | **Moyen.** Avec un ORM, un `prisma generate` ou un changement de schema Drizzle casse le build immédiatement. Ici, tu le découvres au runtime |
| **SQL à écrire à la main** — les requêtes sont simples, mais il faut quand même écrire les `INSERT INTO ... VALUES (...)` avec 20+ colonnes JSONB | **Faible mais pénible.** Les `INSERT` et `UPDATE` avec beaucoup de colonnes JSONB sont verbeux. Un helper `buildInsert()` aide, mais c'est du plumbing qu'un ORM fait pour toi |
| **Pas de gestion automatique des relations** — les `JOIN` pour `editors`/`viewers` sont manuels. Pas de `include: { editors: true }` | **Faible.** C'est 2 `JOIN` sur 2 tables. Mais si on ajoute d'autres relations plus tard, ça devient plus fastidieux |

#### Inconvénients spécifiques à `@vercel/postgres`

| Inconvénient | Détail |
|-------------|--------|
| **Lock-in Vercel** — `@vercel/postgres` est un wrapper autour de `@neondatabase/serverless`. Si tu quittes Vercel, il faut passer à `pg` ou `@neondatabase/serverless` directement | Pas bloquant : le SQL reste le même, seul l'import change. Mais c'est une dépendance à un hébergeur |
| **Pas de connection pool configurable** — le pooling est géré par Vercel/Neon, tu ne contrôles pas PgBouncer toi-même | Pas un problème pour ce volume d'utilisation |
| **Tagged template literals uniquement** — `sql\`...\`` oblige à utiliser la syntaxe template. Pas de query builder, pas de composition de requêtes | Pour du CRUD simple c'est parfait. Ça deviendrait pénible pour des requêtes dynamiques (filtres optionnels, pagination variable, etc.) |

#### Inconvénients spécifiques à `node-pg-migrate`

| Inconvénient | Détail |
|-------------|--------|
| **Spécifique PostgreSQL** — si un jour tu migres vers MySQL ou SQLite, l'outil ne suit pas | Pas un risque réel ici |
| **Pas de "schema drift detection"** — l'outil ne vérifie pas si la DB est désynchronisée avec les migrations. Si quelqu'un modifie la DB à la main, les migrations ne le savent pas | Mitigé par le fait qu'on est seul sur ce projet |
| **Pas de `prisma studio` ou `drizzle studio`** — pas d'interface graphique intégrée pour explorer la DB | Il faut utiliser un client SQL externe (pgAdmin, TablePlus, psql). Pas un drame mais c'est moins pratique en dev |
| **Deux sources de vérité pour le schema** — les migrations JS/SQL définissent le schema DB, les types TS définissent le shape côté app. Il faut les garder synchronisés manuellement | C'est le principal trade-off. Avec Prisma/Drizzle, le schema est unique et les types en découlent |

#### Le vrai risque à long terme

Le seul scénario où ce choix pourrait coincer : **si le projet grossit significativement** (nouvelles tables, requêtes complexes, filtres dynamiques, pagination). À ce stade, l'absence d'ORM se ferait sentir et il faudrait soit :
- Ajouter Drizzle par-dessus (les migrations `node-pg-migrate` restent compatibles)
- Écrire plus de helpers SQL maison

Pour un projet de cette taille (5 requêtes CRUD, 4 tables), ce risque est théorique.

#### En résumé

On accepte consciemment : du SQL verbeux sur les gros `INSERT`/`UPDATE`, du cast manuel sur les résultats, et deux sources de vérité (migrations + types TS). En échange, on a zéro build step, zéro engine externe, un cold start rapide, et une stack qu'on comprend de bout en bout.

---

## 3. Gestion des migrations de schema

### Le besoin

On veut un système de migrations versionné, comme Rails : des fichiers numérotés, exécutés dans l'ordre, avec un suivi de ce qui a déjà tourné. Pas juste un `init.sql` qu'on lance à la main.

### Les options

#### Option A : `node-pg-migrate` (recommandé avec `@vercel/postgres`)

L'outil de migration standalone le plus utilisé en Node.js (~200k téléchargements/semaine npm). Spécifique PostgreSQL.

```bash
yarn add -D node-pg-migrate
```

**Créer une migration :**
```bash
npx node-pg-migrate create init-schema
# => migrations/1710000000000_init-schema.js
```

**Fichier de migration (JS) :**
```javascript
exports.up = (pgm) => {
  pgm.createTable('users', {
    id: { type: 'text', primaryKey: true, default: pgm.func("gen_random_uuid()") },
    sub: { type: 'text', notNull: true, unique: true },
    email: { type: 'text', notNull: true },
    name: { type: 'text', notNull: true },
    nickname: { type: 'text', notNull: true },
    picture: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createTable('vampires', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    private_sheet: { type: 'boolean', notNull: true, default: false },
    generation: { type: 'integer', notNull: true, default: 12 },
    infos: { type: 'jsonb', notNull: true },
    attributes: { type: 'jsonb', notNull: true },
    mind: { type: 'jsonb', notNull: true },
    sections: { type: 'jsonb', notNull: true },
    talents: { type: 'jsonb', notNull: true },
    custom_talents: { type: 'jsonb', notNull: true, default: '[]' },
    skills: { type: 'jsonb', notNull: true },
    custom_skills: { type: 'jsonb', notNull: true, default: '[]' },
    knowledges: { type: 'jsonb', notNull: true },
    custom_knowledges: { type: 'jsonb', notNull: true, default: '[]' },
    clan_disciplines: { type: 'jsonb', notNull: true, default: '[]' },
    out_clan_disciplines: { type: 'jsonb', notNull: true, default: '[]' },
    combined_disciplines: { type: 'jsonb', notNull: true, default: '[]' },
    advantages: { type: 'jsonb', notNull: true, default: '[]' },
    flaws: { type: 'jsonb', notNull: true, default: '[]' },
    languages: { type: 'jsonb', notNull: true, default: '[]' },
    left_over_pex: { type: 'integer', notNull: true, default: 0 },
    true_faith: { type: 'integer', notNull: true, default: 0 },
    human_magic: { type: 'jsonb', notNull: true, default: '{"psy":[],"staticMagic":[],"theurgy":[]}' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createTable('vampire_editors', {
    vampire_id: { type: 'uuid', notNull: true, references: 'vampires', onDelete: 'CASCADE' },
    user_id: { type: 'text', notNull: true, references: 'users', onDelete: 'CASCADE' },
  });
  pgm.addConstraint('vampire_editors', 'vampire_editors_pkey', { primaryKey: ['vampire_id', 'user_id'] });

  pgm.createTable('vampire_viewers', {
    vampire_id: { type: 'uuid', notNull: true, references: 'vampires', onDelete: 'CASCADE' },
    user_id: { type: 'text', notNull: true, references: 'users', onDelete: 'CASCADE' },
  });
  pgm.addConstraint('vampire_viewers', 'vampire_viewers_pkey', { primaryKey: ['vampire_id', 'user_id'] });
};

exports.down = (pgm) => {
  pgm.dropTable('vampire_viewers');
  pgm.dropTable('vampire_editors');
  pgm.dropTable('vampires');
  pgm.dropTable('users');
};
```

**Ou en SQL pur** (avec `--migration-file-language sql`) :
```bash
npx node-pg-migrate create init-schema --migration-file-language sql
# => migrations/1710000000000_init-schema.sql
```

```sql
-- Up Migration
CREATE TABLE users ( ... );
CREATE TABLE vampires ( ... );

-- Down Migration
DROP TABLE vampire_viewers;
DROP TABLE vampire_editors;
DROP TABLE vampires;
DROP TABLE users;
```

**Commandes :**
```bash
npx node-pg-migrate up                    # Applique toutes les migrations pending
npx node-pg-migrate down                  # Rollback la dernière migration
npx node-pg-migrate redo                  # down + up (pratique en dev)
npx node-pg-migrate create add-index      # Crée une nouvelle migration
```

**Suivi d'état :** table `pgmigrations` créée automatiquement dans la DB, avec le nom et la date d'exécution de chaque migration.

**Config** (`package.json`) :
```json
{
  "scripts": {
    "migrate:up": "node-pg-migrate up",
    "migrate:down": "node-pg-migrate down",
    "migrate:create": "node-pg-migrate create"
  }
}
```

Connection via `DATABASE_URL` (= `POSTGRES_URL` de Vercel).

| Pour | Contre |
|------|--------|
| Node.js natif, s'installe via yarn | API JS un peu verbeuse pour les `CREATE TABLE` |
| Supporte JS, TS et SQL pur | Spécifique PostgreSQL (pas un problème ici) |
| Up + Down, rollback, redo | |
| Table de suivi auto (`pgmigrations`) | |
| ~200k downloads/semaine, maintenu activement | |
| Zéro binaire externe | |

#### Option B : `dbmate` (si tu préfères du SQL pur)

Outil Go distribué comme binaire standalone. SQL uniquement, multi-DB.

```bash
# Install (macOS)
brew install dbmate

# ou via npm (wrapper)
npx dbmate
```

**Créer une migration :**
```bash
dbmate new init-schema
# => db/migrations/20240315120000_init-schema.sql
```

**Fichier de migration :**
```sql
-- migrate:up
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sub TEXT UNIQUE NOT NULL,
  ...
);

CREATE TABLE vampires ( ... );
CREATE TABLE vampire_editors ( ... );
CREATE TABLE vampire_viewers ( ... );

-- migrate:down
DROP TABLE IF EXISTS vampire_viewers;
DROP TABLE IF EXISTS vampire_editors;
DROP TABLE IF EXISTS vampires;
DROP TABLE IF EXISTS users;
```

**Commandes :**
```bash
dbmate up          # Applique les migrations pending
dbmate down        # Rollback la dernière
dbmate status      # Voir l'état des migrations
dbmate new <name>  # Créer une migration
dbmate dump        # Dump le schema actuel
```

| Pour | Contre |
|------|--------|
| SQL pur, rien à apprendre | Binaire Go externe (pas un package npm natif) |
| Très simple, zéro config | Pas de DSL JS — que du SQL |
| Supporte PG, MySQL, SQLite, ClickHouse | Moins intégré à l'écosystème Node.js |
| Dump automatique du schema | |
| Migrations atomiques (transactionnelles) | |

#### Option C : `drizzle-kit` (si tu choisis Drizzle ORM)

Inclus avec Drizzle. Les migrations sont auto-générées à partir du schema TS.

```bash
npx drizzle-kit generate   # Génère les migrations SQL à partir du schema TS
npx drizzle-kit migrate    # Applique les migrations
npx drizzle-kit studio     # Interface web pour explorer la DB
```

Pas besoin d'écrire le SQL à la main — il est inféré du schema TypeScript. Mais tu peux modifier les fichiers SQL générés avant de les appliquer.

#### Et Prisma ?

Si tu choisis Prisma comme ORM, `prisma migrate` est intégré. Pas besoin d'un outil séparé. Mais on a déjà expliqué pourquoi Prisma est surdimensionné pour ce projet (section 2).

### Recommandation

| Si tu choisis... | Outil de migration |
|------------------|--------------------|
| `@vercel/postgres` (SQL brut) | **`node-pg-migrate`** — Node.js natif, le plus naturel avec le reste du stack |
| Drizzle | **`drizzle-kit`** — intégré, pas de dépendance en plus |
| Prisma | **`prisma migrate`** — intégré |

**`node-pg-migrate`** est le meilleur choix standalone : c'est le Rails `db:migrate` de Node.js. Tu écris tes migrations en JS (avec un DSL type `pgm.createTable(...)`) ou en SQL pur, elles sont numérotées par timestamp, et l'outil track ce qui a tourné dans une table `pgmigrations`.

### Intégration avec Vercel (déploiement)

Les migrations doivent tourner **pendant le build**, pas au runtime des serverless functions :

```json
{
  "scripts": {
    "build": "node-pg-migrate up && next build",
    "migrate:up": "node-pg-migrate up",
    "migrate:down": "node-pg-migrate down",
    "migrate:create": "node-pg-migrate create"
  }
}
```

Vercel exécute `yarn build` à chaque déploiement -> les migrations tournent avant le build Next.js -> la DB est à jour quand l'app démarre.

> **Note** : il faut que `POSTGRES_URL` (ou `DATABASE_URL`) soit accessible au build time. C'est le cas par défaut avec Vercel Postgres.

---

## 4. Schema de base de données

### 4.1 Approche : hybride relationnel + JSONB

Le `VampireType` actuel est un gros document JSON imbriqué. Tout normaliser en tables serait disproportionné pour ce projet. On utilise une approche hybride :
- **Tables relationnelles** pour les entités principales et les relations (accès, recherche)
- **Colonnes JSONB** pour les données imbriquées qui sont toujours lues/écrites en bloc

### 4.2 Schema Prisma

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

### 4.3 Pourquoi ce découpage ?

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

## 5. Fichiers à modifier

### 6.1Fichiers à supprimer

Aucun fichier n'est à supprimer — on réécrit le contenu des API routes.

### 6.2Fichiers à modifier (7 fichiers)

| Fichier | Changement |
|---------|------------|
| `pages/api/vampires/create.ts` | `q.Create()` -> `prisma.vampire.create()` |
| `pages/api/vampires.ts` | `q.Paginate(q.Match(...))` -> `prisma.vampire.findMany()` |
| `pages/api/vampires/[id].ts` | `q.Match(q.Index('one_vampire'))` -> `prisma.vampire.findUnique()` |
| `pages/api/vampires/[id]/update.ts` | `q.Replace()` -> `prisma.vampire.update()` |
| `pages/api/vampires/[id]/update_partial.ts` | `q.Update()` -> `prisma.vampire.update()` |
| `pages/api/vampires/[id]/delete.ts` | `q.Delete()` -> `prisma.vampire.delete()` |
| `pages/api/users.ts` | `q.Paginate(q.Match(...))` -> `prisma.user.findMany()` |

### 6.3Fichiers à créer

| Fichier | Contenu |
|---------|---------|
| `prisma/schema.prisma` | Schema ci-dessus |
| `lib/prisma.ts` | Singleton du client Prisma (pattern Next.js) |

### 6.4`lib/prisma.ts` — Singleton client

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## 6. Détail des réécritures par route

### 6.1`POST /api/vampires/create`

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

### 6.2`GET /api/vampires` (liste)

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

### 6.3`GET /api/vampires/[id]`

**Après** :
```typescript
const vampire = await prisma.vampire.findUnique({
  where: { id },
  include: { editors: { include: { user: true } }, viewers: { include: { user: true } } },
});

if (!vampire) return res.status(404).json({ error: 'not found' });
```

### 6.4`PUT /api/vampires/[id]/update`

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

### 6.5`PATCH /api/vampires/[id]/update_partial`

Même pattern que update, mais avec un sous-ensemble des champs.

### 6.6`DELETE /api/vampires/[id]/delete`

**Après** :
```typescript
await prisma.vampire.delete({ where: { id } });
```

Le `onDelete: Cascade` sur les relations nettoie automatiquement `VampireEditor` et `VampireViewer`.

### 6.7`GET /api/users`

**Après** :
```typescript
const users = await prisma.user.findMany({
  select: { email: true, name: true, nickname: true, picture: true, sub: true },
});
```

---

## 7. Étapes de migration

### Phase 1 : Setup (30 min)

1. **Provisionner Vercel Postgres** dans le dashboard Vercel (Storage -> Create -> Postgres)
2. Les variables d'env `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING` sont auto-ajoutées
3. `yarn add prisma @prisma/client`
4. `yarn remove faunadb`
5. Créer `prisma/schema.prisma`
6. Créer `lib/prisma.ts`
7. `npx prisma migrate dev --name init` (crée les tables)

### Phase 2 : Réécriture des API routes (2-3h)

Réécrire les 7 fichiers listés en section 5.2, un par un. Pour chaque fichier :
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

## 8. Env vars

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

## 9. Points d'attention

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

## 10. Estimation de l'effort

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

### Comparaison de l'effort selon l'approche

| Approche | Effort estimé | Commentaire |
|----------|---------------|-------------|
| **`@vercel/postgres` + SQL brut** | ~3-4h | Le plus rapide : pas de setup ORM, pas de schema à maintenir. 5 requêtes SQL à écrire, un fichier `init.sql` |
| **Drizzle ORM** | ~4-5h | Schema TS + setup `drizzle-kit`. Typage auto, migrations incluses |
| **Prisma** | ~4-5h | Schema `.prisma` + `prisma generate` + singleton. Plus de setup, mais client typé |
| Tout normaliser en tables (full relationnel) | ~8-12h | Tables pour abilities, disciplines, rituals, paths... Disproportionné pour le besoin |

---

## 11. Résumé des dépendances

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
