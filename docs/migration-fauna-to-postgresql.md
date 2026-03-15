# Migration FaunaDB + Auth0 + Next 12 → PostgreSQL + NextAuth + Next 14

> **Contexte** : FaunaDB est mort, le compte Auth0 n'existe plus, Next.js 12 est EOL. Le projet n'a pas été maintenu.
> On migre tout d'un coup : base de données, authentification, et framework.
> Pas de migration de données — on repart de zéro.

---

## 1. Vue d'ensemble

### Ce qui change

| Avant | Après |
|-------|-------|
| FaunaDB (serverless, FQL) | Vercel Postgres (Neon, SQL) |
| `faunadb` npm package | `@vercel/postgres` + `node-pg-migrate` |
| Documents JSON imbriqués | JSONB unique + tables relationnelles pour les accès |
| Indexes FaunaDB (`one_vampire`, `all_vampires_full`, `all_users`) | Index SQL classiques |
| `FAUNADB_SECRET_KEY` | `POSTGRES_URL` (auto-provisionné par Vercel) |
| Pas de migration tooling | `node-pg-migrate` (migrations versionnées, up/down) |
| Auth0 (`@auth0/nextjs-auth0`) | NextAuth.js (`next-auth`) |
| Auth0 hosted login page | NextAuth providers (GitHub, Google, etc.) |
| `user.sub` (ex: `github\|3338913`) | `user.id` (généré par NextAuth) |
| `AUTH0_DOMAIN` + `AUTH0_CLIENT_ID` + `AUTH0_CLIENT_SECRET` | `NEXTAUTH_SECRET` + credentials providers |
| Next.js 12.2.3 (EOL) | Next.js 14 (LTS, Pages Router toujours supporté) |
| `next/image` (ancien comportement) | `next/legacy/image` ou nouveau `next/image` |
| `<Link><a>...</a></Link>` | `<Link>...</Link>` (sans `<a>` enfant) |

### Ce qui ne change pas

- **Pages Router** — on reste dessus, pas de migration vers App Router
- Les API routes (mêmes URLs, mêmes shapes de réponse pour les données)
- Le front-end (SWR, contexts, hooks) — sauf `MeContext` qui change de source
- Pusher
- Les types TypeScript (`VampireType`) — sauf `MeType`/`UserType` qui s'adaptent

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
  // --- Tables NextAuth ---
  pgm.createTable('users', {
    id: { type: 'text', primaryKey: true, default: pgm.func("gen_random_uuid()") },
    name: { type: 'text' },
    email: { type: 'text', unique: true },
    emailVerified: { type: 'timestamptz' },
    image: { type: 'text' },
    is_admin: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createTable('accounts', {
    id: { type: 'text', primaryKey: true, default: pgm.func("gen_random_uuid()") },
    userId: { type: 'text', notNull: true, references: 'users', onDelete: 'CASCADE' },
    type: { type: 'text', notNull: true },
    provider: { type: 'text', notNull: true },
    providerAccountId: { type: 'text', notNull: true },
    refresh_token: { type: 'text' },
    access_token: { type: 'text' },
    expires_at: { type: 'integer' },
    token_type: { type: 'text' },
    scope: { type: 'text' },
    id_token: { type: 'text' },
    session_state: { type: 'text' },
  });
  pgm.addConstraint('accounts', 'accounts_provider_unique', {
    unique: ['provider', 'providerAccountId'],
  });

  pgm.createTable('sessions', {
    id: { type: 'text', primaryKey: true, default: pgm.func("gen_random_uuid()") },
    sessionToken: { type: 'text', notNull: true, unique: true },
    userId: { type: 'text', notNull: true, references: 'users', onDelete: 'CASCADE' },
    expires: { type: 'timestamptz', notNull: true },
  });

  pgm.createTable('verification_tokens', {
    identifier: { type: 'text', notNull: true },
    token: { type: 'text', notNull: true, unique: true },
    expires: { type: 'timestamptz', notNull: true },
  });
  pgm.addConstraint('verification_tokens', 'verification_tokens_pkey', {
    primaryKey: ['identifier', 'token'],
  });

  // --- Tables applicatives ---
  pgm.createTable('vampires', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    private_sheet: { type: 'boolean', notNull: true, default: false },
    data: { type: 'jsonb', notNull: true },
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
  pgm.dropTable('verification_tokens');
  pgm.dropTable('sessions');
  pgm.dropTable('accounts');
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

### 4.1 Le vrai problème : le mapping

Avec Fauna, on n'a aucun mapping. `VampireType` EST le document :

```typescript
// CREATE — c'est tout
await client.query(q.Create(q.Collection('vampires'), { data: vampireData }));

// READ — c'est tout
const result = await client.query(q.Get(ref));
return result.data; // c'est déjà un VampireType
```

Si on éclate `VampireType` en 20+ colonnes PostgreSQL, on s'inflige un problème de mapping qui n'existait pas. Chaque `INSERT`, `UPDATE`, `SELECT` doit lister toutes les colonnes et transformer dans les deux sens. C'est ça le vrai coût de la migration, pas le SQL.

### 4.2 Deux approches de schema

#### Approche A : Document JSONB unique (recommandé)

On garde la philosophie Fauna : **une seule colonne `data JSONB`** qui contient tout le `VampireType`. On ne sort en colonnes relationnelles que ce qui a besoin d'être filtré/requêté.

```sql
-- ============================
-- NextAuth tables (obligatoires)
-- ============================

CREATE TABLE users (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name            TEXT,
  email           TEXT UNIQUE,
  "emailVerified" TIMESTAMPTZ,
  image           TEXT,
  is_admin        BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE accounts (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                TEXT NOT NULL,
  provider            TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token       TEXT,
  access_token        TEXT,
  expires_at          INTEGER,
  token_type          TEXT,
  scope               TEXT,
  id_token            TEXT,
  session_state       TEXT,
  UNIQUE(provider, "providerAccountId")
);

CREATE TABLE sessions (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId"       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires        TIMESTAMPTZ NOT NULL
);

CREATE TABLE verification_tokens (
  identifier TEXT NOT NULL,
  token      TEXT UNIQUE NOT NULL,
  expires    TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- ============================
-- Tables applicatives
-- ============================

CREATE TABLE vampires (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  private_sheet BOOLEAN NOT NULL DEFAULT false,
  data          JSONB NOT NULL,                              -- LE VampireType entier
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE vampire_editors (
  vampire_id UUID NOT NULL REFERENCES vampires(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (vampire_id, user_id)
);

CREATE TABLE vampire_viewers (
  vampire_id UUID NOT NULL REFERENCES vampires(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (vampire_id, user_id)
);
```

**Pourquoi ça marche :** on ne requête JAMAIS les champs internes du vampire. On ne fait que :
- Lister les vampires (filtre sur `private_sheet` + jointure `editors`/`viewers`)
- Lire un vampire par `id`
- Remplacer tout le document
- Supprimer par `id`

Le contenu du personnage est toujours lu/écrit en bloc. Le seul champ qu'on extrait dans la liste c'est `data->>'name'` pour l'affichage (ou `data->'infos'->>'name'`).

**Les routes deviennent triviales :**

```typescript
import { sql } from '@vercel/postgres';
import { VampireType } from '../../types/VampireType';

// CREATE — presque identique à Fauna
const { editors, viewers, privateSheet, ...charData } = vampireData;
await sql`
  INSERT INTO vampires (id, private_sheet, data)
  VALUES (${id}, ${privateSheet}, ${JSON.stringify(charData)})
`;

// READ — presque identique à Fauna
const { rows } = await sql`SELECT * FROM vampires WHERE id = ${id}`;
const vampire = { ...rows[0].data, id: rows[0].id, privateSheet: rows[0].private_sheet };

// UPDATE (full replace) — presque identique à Fauna
await sql`
  UPDATE vampires SET data = ${JSON.stringify(charData)}, updated_at = now()
  WHERE id = ${id}
`;

// DELETE — identique
await sql`DELETE FROM vampires WHERE id = ${id}`;
```

C'est le même niveau de simplicité que Fauna. Pas de mapping 20 colonnes.

| Pour | Contre |
|------|--------|
| Zéro mapping — `JSON.stringify(data)` et c'est réglé | Pas de validation côté DB (un champ manquant passe silencieusement) |
| Les routes sont quasi identiques à l'existant Fauna | Pas de requêtes SQL sur les champs internes (mais on n'en a pas besoin) |
| `UPDATE` partiel = `jsonb_merge` natif PostgreSQL | Si un jour on veut filtrer par `generation` ou `clan`, il faudra ajouter une colonne ou un index JSONB |
| Schema ultra simple : 4 tables, ~10 colonnes au total | |
| Migration quasi mécanique depuis Fauna | |

#### Approche B : Colonnes JSONB éclatées (schema précédent)

Ce qu'on avait documenté avant : chaque sous-objet de `VampireType` devient une colonne (`infos JSONB`, `attributes JSONB`, `mind JSONB`, etc.). 20+ colonnes.

**On la garde en option** si tu veux pouvoir évoluer vers des requêtes sur des sous-parties du document (ex : filtrer par clan, requêter les disciplines, etc.). Mais pour l'instant, c'est du mapping gratuit.

### 4.3 Recommandation

**Approche A (document JSONB unique)**. C'est la continuité logique de Fauna :
- Même philosophie (document store)
- Même simplicité côté code
- On profite de PostgreSQL pour ce qu'il apporte vraiment : les relations (`editors`/`viewers`) et la fiabilité

Si plus tard le projet a besoin de requêter les champs internes, on peut :
1. Ajouter des **colonnes générées** (`generation INT GENERATED ALWAYS AS ((data->>'generation')::int) STORED`) — sans changer le code
2. Ajouter des **index GIN** sur le JSONB (`CREATE INDEX ON vampires USING GIN (data)`)
3. Extraire des colonnes à ce moment-là, quand le besoin est réel

### 4.4 Helper layer : `lib/db.ts`

Quel que soit le schema, on écrit un petit helper qui fait le pont entre `VampireType` et la DB. L'idée : les routes API ne voient jamais de SQL, juste des fonctions typées.

```typescript
import { sql } from '@vercel/postgres';
import { VampireType } from '../types/VampireType';

// ---- Types ----

type VampireRow = {
  id: string;
  private_sheet: boolean;
  data: Omit<VampireType, 'id' | 'privateSheet' | 'editors' | 'viewers'>;
};

type VampireListItem = { key: string; name: string };

// ---- Helpers internes ----

function rowToVampire(row: VampireRow, editors: string[], viewers: string[]): VampireType {
  return {
    ...row.data,
    id: row.id,
    privateSheet: row.private_sheet,
    editors,
    viewers,
  };
}

function vampireToRow(v: VampireType) {
  const { id, privateSheet, editors, viewers, ...data } = v;
  return { id, privateSheet, data: JSON.stringify(data) };
}

// ---- API publique ----

export const db = {
  vampires: {
    // isAdmin = true → voit tout (plus besoin de hardcoder un sub)
    async findAll(userId?: string, isAdmin = false): Promise<VampireListItem[]> {
      if (isAdmin) {
        const { rows } = await sql`
          SELECT id, data->'infos'->>'name' as name FROM vampires
        `;
        return rows.map((r) => ({ key: r.id, name: r.name }));
      }
      const { rows } = await sql`
        SELECT DISTINCT v.id, v.data->'infos'->>'name' as name
        FROM vampires v
        LEFT JOIN vampire_editors ve ON ve.vampire_id = v.id AND ve.user_id = ${userId ?? ''}
        LEFT JOIN vampire_viewers vv ON vv.vampire_id = v.id AND vv.user_id = ${userId ?? ''}
        WHERE v.private_sheet = false
           OR ve.user_id IS NOT NULL
           OR vv.user_id IS NOT NULL
      `;
      return rows.map((r) => ({ key: r.id, name: r.name }));
    },

    async findById(id: string): Promise<VampireType | null> {
      const { rows } = await sql`SELECT * FROM vampires WHERE id = ${id}`;
      if (!rows[0]) return null;

      const { rows: editors } = await sql`
        SELECT user_id FROM vampire_editors WHERE vampire_id = ${id}
      `;
      const { rows: viewers } = await sql`
        SELECT user_id FROM vampire_viewers WHERE vampire_id = ${id}
      `;

      return rowToVampire(
        rows[0],
        editors.map((e) => e.user_id),
        viewers.map((v) => v.user_id),
      );
    },

    async create(vampire: VampireType): Promise<void> {
      const { id, privateSheet, data } = vampireToRow(vampire);
      await sql`
        INSERT INTO vampires (id, private_sheet, data)
        VALUES (${id}, ${privateSheet}, ${data})
      `;
    },

    async addEditor(vampireId: string, userId: string): Promise<void> {
      await sql`
        INSERT INTO vampire_editors (vampire_id, user_id) VALUES (${vampireId}, ${userId})
        ON CONFLICT DO NOTHING
      `;
    },

    async addViewer(vampireId: string, userId: string): Promise<void> {
      await sql`
        INSERT INTO vampire_viewers (vampire_id, user_id) VALUES (${vampireId}, ${userId})
        ON CONFLICT DO NOTHING
      `;
    },

    async update(id: string, vampire: VampireType): Promise<void> {
      const { privateSheet, data } = vampireToRow(vampire);
      await sql`
        UPDATE vampires
        SET data = ${data}, private_sheet = ${privateSheet}, updated_at = now()
        WHERE id = ${id}
      `;
    },

    async updatePartial(id: string, partial: Partial<VampireType>): Promise<void> {
      const { privateSheet, ...rest } = partial;
      const { id: _, editors, viewers, ...dataFields } = rest;

      if (Object.keys(dataFields).length > 0) {
        await sql`
          UPDATE vampires
          SET data = data || ${JSON.stringify(dataFields)}::jsonb, updated_at = now()
          WHERE id = ${id}
        `;
      }
      if (privateSheet !== undefined) {
        await sql`
          UPDATE vampires SET private_sheet = ${privateSheet} WHERE id = ${id}
        `;
      }
    },

    async delete(id: string): Promise<void> {
      await sql`DELETE FROM vampires WHERE id = ${id}`;
    },

    // Admin peut tout éditer — plus besoin de hardcoder 'github|3338913'
    async isEditor(vampireId: string, userId: string, isAdmin = false): Promise<boolean> {
      if (isAdmin) return true;
      const { rows } = await sql`
        SELECT 1 FROM vampire_editors
        WHERE vampire_id = ${vampireId} AND user_id = ${userId}
      `;
      return rows.length > 0;
    },
  },

  users: {
    async findAll() {
      const { rows } = await sql`
        SELECT id, email, name, image FROM users
      `;
      return rows;
    },
    // Note : pas de findOrCreate — NextAuth gère la création des users
    // via l'adapter PostgreSQL automatiquement au login
  },
};
```

**Résultat : les routes deviennent :**

```typescript
// pages/api/vampires/create.ts — AVANT (Fauna)
await client.query(q.Create(q.Collection('vampires'), { data }));

// pages/api/vampires/create.ts — APRÈS
await db.vampires.create(data);


// pages/api/vampires/[id].ts — AVANT
const dbs = await client.query(q.Map(q.Paginate(q.Match(q.Index('one_vampire'), id)), (ref) => q.Get(ref)));
return dbs.data[0].data;

// pages/api/vampires/[id].ts — APRÈS
const vampire = await db.vampires.findById(id);


// pages/api/vampires/[id]/update.ts — AVANT
await client.query(q.Replace(vId, { data }));

// pages/api/vampires/[id]/update.ts — APRÈS
await db.vampires.update(id, data);


// pages/api/vampires/[id]/delete.ts — AVANT
await client.query(q.Delete(vId));

// pages/api/vampires/[id]/delete.ts — APRÈS
await db.vampires.delete(id);
```

C'est **plus simple qu'avant**. Le boilerplate Fauna (`q.Map(q.Paginate(q.Match(q.Index(...))))`) disparaît.

### 4.5 Pourquoi ce découpage helpers/routes ?

- **Les routes ne contiennent que de la logique HTTP** : parsing du body, auth check, status codes, Pusher
- **`lib/db.ts` contient tout le SQL** : un seul fichier à toucher si le schema évolue
- **Le typage est centralisé** : `rowToVampire()` et `vampireToRow()` sont les deux seuls endroits qui font la conversion. Si `VampireType` change, on change ici
- **Testable** (si un jour on ajoute des tests) : on peut mocker `db.vampires` sans toucher au SQL

---

## 5. Couche authentification : Auth0 → NextAuth

### 5.1 Pourquoi NextAuth

- Auth0 est un service externe payant dont le compte n'existe plus
- NextAuth est open-source, self-hosted, intégré à Next.js
- La DB PostgreSQL qu'on crée sert aussi de backend auth (tables `users`, `accounts`, `sessions`)
- Pas de service externe supplémentaire — tout est dans Vercel

### 5.2 Config NextAuth : `pages/api/auth/[...nextauth].ts`

```typescript
import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import GitHubProvider from 'next-auth/providers/github';
import { Resend } from 'resend';

import { customPgAdapter } from '../../../lib/auth-adapter';

const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions = {
  adapter: customPgAdapter(),
  providers: [
    EmailProvider({
      // Magic link par email via Resend
      from: process.env.EMAIL_FROM, // ex: "Vampire Char <noreply@ton-domaine.com>"
      sendVerificationRequest: async ({ identifier: email, url }) => {
        await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: email,
          subject: 'Connexion à Vampire Char',
          html: `<p>Clique sur ce lien pour te connecter :</p><p><a href="${url}">Se connecter</a></p>`,
        });
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      // Permet de lier un login GitHub à un compte existant (créé via magic link)
      // si l'email est le même. Safe car GitHub vérifie les emails.
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: '/auth/signin',       // Page de login custom (optionnel)
    verifyRequest: '/auth/verify', // Page "check ton email" (optionnel)
  },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.isAdmin = user.isAdmin; // colonne is_admin de la table users
      return session;
    },
  },
};

export default NextAuth(authOptions);
```

> **Deux providers** : Email (magic link, provider principal) + GitHub (pour ceux qui préfèrent). L'utilisateur choisit sur la page de login.
>
> **Linking de comptes** : si un user se connecte d'abord par magic link puis par GitHub (ou l'inverse), NextAuth lie les deux comptes automatiquement si l'email est identique (`allowDangerousEmailAccountLinking`). Le nom est alarmiste mais c'est safe dans notre cas : GitHub vérifie les emails, et le magic link aussi par définition. Résultat : un seul user dans la table `users`, deux entrées dans `accounts` (une `email`, une `github`).
>
> **Resend** : gratuit jusqu'à 100 emails/jour, une seule clé API. Le domaine d'envoi doit être vérifié dans le dashboard Resend.
>
> **Note adapter** : on peut aussi utiliser `@next-auth/pg-adapter` directement si on veut éviter un adapter custom.

### 5.3 Remplacement des patterns Auth0 → NextAuth

| Pattern Auth0 | Pattern NextAuth | Fichiers impactés |
|---------------|-----------------|-------------------|
| `import { getSession } from '@auth0/nextjs-auth0'` | `import { getServerSession } from 'next-auth'` | 6 routes API |
| `const session = getSession(req, res)` | `const session = await getServerSession(req, res, authOptions)` | 6 routes API |
| `session.user.sub` | `session.user.id` | 6 routes API + `lib/db.ts` |
| `withApiAuthRequired(handler)` | `if (!session) return res.status(401)...` | 4 routes API |
| `import { UserProvider } from '@auth0/nextjs-auth0'` | `import { SessionProvider } from 'next-auth/react'` | `_app.tsx` |
| `import { useUser } from '@auth0/nextjs-auth0'` | `import { useSession } from 'next-auth/react'` | `MeContext.tsx` |
| `const { user } = useUser()` | `const { data: session } = useSession()` | `MeContext.tsx` |
| `/api/auth/login` | `signIn()` de `next-auth/react` (redirige vers page avec choix Email / GitHub) | `Nav.tsx` |
| `/api/auth/logout` | `signOut()` de `next-auth/react` | `Nav.tsx` |

### 5.4 `MeContext.tsx` — réécriture

```typescript
import { useSession } from 'next-auth/react';
import { createContext, useContext, useMemo } from 'react';

type MeContextType = {
  me?: { id: string; name: string; email: string; image: string; isAdmin: boolean };
  connected: boolean;
};

const MeContext = createContext<MeContextType>({ connected: false });

export const MeProvider = ({ children }) => {
  const { data: session, status } = useSession();

  const value = useMemo(
    () => ({
      me: session?.user ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        isAdmin: session.user.isAdmin ?? false,
      } : undefined,
      connected: status === 'authenticated',
    }),
    [session, status]
  );

  return <MeContext.Provider value={value}>{children}</MeContext.Provider>;
};

export const useMe = () => useContext(MeContext);
```

### 5.5 Impact sur `lib/db.ts`

Le seul changement dans le helper DB : `sub` disparaît, remplacé par `user.id` direct.

Les jointures `vampire_editors` / `vampire_viewers` lient désormais directement à `users.id` (la clé primaire NextAuth) au lieu de passer par une colonne `sub` intermédiaire. C'est plus simple qu'avant.

```typescript
// AVANT (Auth0) — recherche par sub
async isEditor(vampireId: string, userSub: string): Promise<boolean> {
  const { rows } = await sql`
    SELECT 1 FROM vampire_editors ve
    JOIN users u ON u.id = ve.user_id
    WHERE ve.vampire_id = ${vampireId} AND u.sub = ${userSub}
  `;
  return rows.length > 0;
}

// APRÈS (NextAuth) — recherche directe par user.id, admin bypass
async isEditor(vampireId: string, userId: string, isAdmin = false): Promise<boolean> {
  if (isAdmin) return true;
  const { rows } = await sql`
    SELECT 1 FROM vampire_editors
    WHERE vampire_id = ${vampireId} AND user_id = ${userId}
  `;
  return rows.length > 0;
}
```

Plus de `JOIN` pour résoudre `sub` → `id`. Le `user.id` NextAuth est directement la FK dans les tables de jointure.

### 5.6 Impact sur les types

```typescript
// types/MeType.ts — simplifié, avec isAdmin
export type MeType = {
  id: string;
  name: string;
  email: string;
  image: string;
  isAdmin: boolean;
};

// types/UserType.ts — aligné avec NextAuth
export type UserType = {
  id: string;
  name: string;
  email: string;
  image: string;
};
```

Plus besoin de `sub`, `nickname`, `picture` (renommé `image` par NextAuth), `email_verified`. `isAdmin` remplace le hardcoded `github|3338913`.

---

## 5bis. Upgrade Next.js 12 → 14

### 5bis.1 Pourquoi Next 14 (et pas 13 ou 15)

- **Next 13** est EOL depuis décembre 2024 — aucun intérêt d'y aller
- **Next 15** exige React 19 — c'est un chantier en plus, pas nécessaire maintenant
- **Next 14** est la dernière version compatible React 18.2 (déjà en place), avec support LTS
- Le **Pages Router** est toujours pleinement supporté dans Next 14 — pas besoin de migrer vers App Router

### 5bis.2 Breaking changes (Pages Router uniquement)

L'impact est **très faible** pour ce projet. Seulement 4 fichiers touchés.

#### `next/link` — supprimer le `<a>` enfant (3 occurrences)

```tsx
// AVANT (Next 12)
<Link href="/foo"><a className="bar">text</a></Link>

// APRÈS (Next 14)
<Link href="/foo" className="bar">text</Link>
```

**Fichiers impactés :**

| Fichier | Ligne(s) | Détail |
|---------|----------|--------|
| `components/Nav.tsx` | ~114-116 | `<Link href={loginUrl}><a>Connection</a></Link>` |
| `components/ActionsFooter.tsx` | ~145-146, ~214-215 | 2 occurrences dans les actions footer |

#### `next/image` — comportement changé (1 occurrence)

```tsx
// Option A : garder l'ancien comportement
import Image from 'next/legacy/image';

// Option B : adapter au nouveau composant (recommandé)
// Le nouveau next/image a un layout plus simple (pas de layout="fill" etc.)
import Image from 'next/image';
```

**Fichier impacté :**

| Fichier | Ligne | Détail |
|---------|-------|--------|
| `components/Sheet.tsx` | ~4, ~97-102 | Image de titre (`title.png` / `title_dark.png`), utilise `width`/`height` — compatible tel quel avec le nouveau `next/image` |

> L'image dans `Sheet.tsx` utilise déjà `width` et `height` explicites, donc elle devrait fonctionner sans changement avec le nouveau `next/image`. À vérifier visuellement.

#### Pas d'impact sur ce projet

- `next export` → pas utilisé
- `@next/font` → pas utilisé
- App Router APIs (`cookies()`, `headers()` async) → pas concerné (Pages Router)

### 5bis.3 Commandes d'upgrade

```bash
# Upgrade Next.js + ESLint config
yarn add next@14 eslint-config-next@14

# Codemods automatiques (optionnel, gère next/link et next/image)
npx @next/codemod@latest next-image-to-legacy-image .
npx @next/codemod@latest new-link .
```

Les codemods font les changements mécaniquement — pas besoin de le faire à la main.

### 5bis.4 Dépendances à mettre à jour en même temps

| Package | Actuel | Cible | Raison |
|---------|--------|-------|--------|
| `next` | 12.2.3 | 14.x | Framework |
| `eslint-config-next` | 12.2.3 | 14.x | Doit matcher la version de Next |
| `typescript` | 4.7 | 5.x | Next 14 recommande TS 5+ |
| `@types/react` | 18.0.15 | 18.2.x | Aligner avec React 18.2 |
| `@types/node` | 18.6.2 | 20.x | Aligner avec Node 20+ |

---

## 6. Fichiers à modifier

### 6.1 Fichiers à supprimer

| Fichier | Raison |
|---------|--------|
| `pages/api/auth/[...auth0].ts` | Remplacé par `[...nextauth].ts` |

### 6.2 Fichiers à modifier (13 fichiers)

**Routes API (DB + Auth) :**

| Fichier | Changement DB | Changement Auth |
|---------|--------------|-----------------|
| `pages/api/vampires/create.ts` | `q.Create()` → `db.vampires.create()` | `withApiAuthRequired` + `getSession` → `getServerSession` |
| `pages/api/vampires.ts` | `q.Map(...)` → `db.vampires.findAll()` | `getSession` → `getServerSession` |
| `pages/api/vampires/[id].ts` | `q.Map(...)` → `db.vampires.findById()` | (pas d'auth) |
| `pages/api/vampires/[id]/update.ts` | `q.Replace()` → `db.vampires.update()` | `withApiAuthRequired` + `getSession` → `getServerSession` |
| `pages/api/vampires/[id]/update_partial.ts` | `q.Update()` → `db.vampires.updatePartial()` | idem |
| `pages/api/vampires/[id]/delete.ts` | `q.Delete()` → `db.vampires.delete()` | idem |
| `pages/api/users.ts` | `q.Map(...)` → `db.users.findAll()` | `withApiAuthRequired` → check session |

**Frontend (Auth) :**

| Fichier | Changement |
|---------|------------|
| `pages/_app.tsx` | `UserProvider` → `SessionProvider` |
| `contexts/MeContext.tsx` | `useUser()` → `useSession()` (réécriture, cf. section 5.4) |
| `types/MeType.ts` | `UserProfile` Auth0 → type simplifié NextAuth |
| `types/UserType.ts` | Supprimer `sub`, `nickname`, `picture` → `id`, `image` |
| `hooks/useMe.ts` | Simplifié (plus de fetch `/api/me`) |
| `components/Nav.tsx` | `/api/auth/login` → `signIn()`, `/api/auth/logout` → `signOut()` |
| `pages/vampires/[id].tsx` | Supprimer fallback `editors \|\| ['github\|3338913']` → utiliser `me.isAdmin` |
| `pages/vampires/[id]/config.tsx` | Idem — `me.isAdmin \|\| editors.includes(me.id)` |
| `components/SheetActionsFooter.tsx` | `ownerActions` conditionné par `me.isAdmin \|\| editors.includes(me.id)` |

**Next.js 14 upgrade (codemods) :**

| Fichier | Changement |
|---------|------------|
| `components/Nav.tsx` | `<Link><a>Connection</a></Link>` → `<Link>Connection</Link>` |
| `components/ActionsFooter.tsx` | 2× `<Link><a>...</a></Link>` → `<Link>...</Link>` |
| `components/Sheet.tsx` | Vérifier `next/image` — probablement ok tel quel (utilise déjà `width`/`height`) |

### 6.3 Fichiers à créer

| Fichier | Contenu |
|---------|---------|
| `pages/api/auth/[...nextauth].ts` | Config NextAuth (section 5.2) |
| `lib/db.ts` | Helper layer DB (section 4.4) |
| `lib/auth-adapter.ts` | Adapter PostgreSQL pour NextAuth (optionnel, peut utiliser `@next-auth/pg-adapter`) |
| `migrations/TIMESTAMP_init-schema.js` | Migration initiale — tables NextAuth + tables applicatives (section 4.2) |

---

## 6. Détail des réécritures par route

Chaque route remplace le boilerplate Fauna par un appel à `db.*`. Le SQL est encapsulé dans `lib/db.ts` (section 4.4).

### 6.1 `POST /api/vampires/create`

```typescript
// AVANT
const client = new faunadb.Client({ secret });
await client.query(q.Create(q.Collection('vampires'), { data }));

// APRÈS
import { db } from '../../../lib/db';

const session = await getServerSession(req, res, authOptions);
await db.vampires.create(data);
await db.vampires.addEditor(data.id, session.user.id);
// Plus de viewers: ['github|3338913'] hardcodé — l'admin voit tout via isAdmin
```

### 6.2 `GET /api/vampires` (liste)

```typescript
// AVANT — fetch tout + filtre côté app
const dbs = await client.query(q.Map(q.Paginate(q.Match(q.Index('all_vampires_full'))), (ref) => q.Get(ref)));
const filtered = dbs.data.filter((v) => !v.data.privateSheet || ...);

// APRÈS — filtre côté SQL
const session = await getServerSession(req, res, authOptions);
const vampires = await db.vampires.findAll(session?.user?.id, session?.user?.isAdmin);
```

Le filtrage privé/public passe côté SQL (dans le `WHERE` + `JOIN`). Plus efficace, plus propre.

### 6.3 `GET /api/vampires/[id]`

```typescript
// AVANT
const dbs = await client.query(q.Map(q.Paginate(q.Match(q.Index('one_vampire'), id)), (ref) => q.Get(ref)));
return dbs.data[0].data;

// APRÈS
const vampire = await db.vampires.findById(String(id));
if (!vampire) return res.status(404).json({ error: 'not found' });
```

### 6.4 `PUT /api/vampires/[id]/update`

```typescript
// AVANT
const vampire = await client.query(q.Map(...));
if (!vampire.data[0].data.editors.includes(user.sub)) return res.status(403)...;
await client.query(q.Replace(vampire.data[0].ref, { data }));

// APRÈS
if (!(await db.vampires.isEditor(id, session.user.id, session.user.isAdmin))) return res.status(403)...;
await db.vampires.update(id, data);
```

### 6.5 `PATCH /api/vampires/[id]/update_partial`

```typescript
// APRÈS — merge JSONB natif PostgreSQL, pas besoin de tout renvoyer
if (!(await db.vampires.isEditor(id, session.user.id, session.user.isAdmin))) return res.status(403)...;
await db.vampires.updatePartial(id, partialData);
```

### 6.6 `DELETE /api/vampires/[id]/delete`

```typescript
// APRÈS
if (!(await db.vampires.isEditor(id, session.user.id, session.user.isAdmin))) return res.status(403)...;
await db.vampires.delete(id);
```

Le `ON DELETE CASCADE` sur les tables de jointure nettoie `vampire_editors` et `vampire_viewers` automatiquement.

### 6.7 `GET /api/users`

```typescript
// AVANT
const dbs = await client.query(q.Map(q.Paginate(q.Match(q.Index('all_users'))), (ref) => q.Get(ref)));
return dbs.data.map((e) => pick(e.data, [...]));

// APRÈS
const users = await db.users.findAll();
```

---

## 7. Étapes de migration

### Phase 0 : Upgrade Next.js 12 → 14 (20 min)

On commence par l'upgrade Next car ça permet de valider que l'app démarre avant de toucher à la DB et l'auth.

1. Upgrade les packages :
   ```bash
   yarn add next@14 eslint-config-next@14
   yarn add -D typescript@5 @types/react@18.2 @types/node@20
   ```
2. Lancer les codemods automatiques :
   ```bash
   npx @next/codemod@latest new-link .           # Fix <Link><a> → <Link>
   npx @next/codemod@latest next-image-to-legacy-image .  # Fix next/image (si besoin)
   ```
3. Vérifier manuellement les 3 fichiers touchés :
   - `components/Nav.tsx` (1 Link)
   - `components/ActionsFooter.tsx` (2 Links)
   - `components/Sheet.tsx` (1 Image — probablement ok sans changement)
4. `yarn build` — vérifier que ça compile
5. `yarn dev` — vérifier visuellement que rien n'est cassé

### Phase 1 : Setup infra + dépendances (30 min)

1. **Provisionner Vercel Postgres** dans le dashboard Vercel (Storage -> Create -> Postgres)
2. **Créer un compte Resend** + vérifier le domaine d'envoi (pour les magic links email)
3. **Créer une app OAuth GitHub** (Settings -> Developer settings -> OAuth Apps)
   - Callback URL : `https://<ton-domaine>/api/auth/callback/github`
   - (ou `http://localhost:3000/api/auth/callback/github` en dev)
4. Installer les dépendances :
   ```bash
   yarn add @vercel/postgres next-auth resend
   yarn add -D node-pg-migrate
   yarn remove faunadb @auth0/nextjs-auth0
   ```
5. Créer la migration initiale + appliquer :
   ```bash
   npx node-pg-migrate create init-schema
   # écrire le schema (section 4.2) dans le fichier
   npx node-pg-migrate up
   ```
6. Ajouter les scripts dans `package.json` :
   ```json
   "migrate:up": "node-pg-migrate up",
   "migrate:down": "node-pg-migrate down",
   "migrate:create": "node-pg-migrate create",
   "build": "node-pg-migrate up && next build"
   ```

### Phase 2 : Auth — NextAuth (30 min)

1. Créer `pages/api/auth/[...nextauth].ts` (section 5.2)
2. Supprimer `pages/api/auth/[...auth0].ts`
3. Réécrire `pages/_app.tsx` : `UserProvider` → `SessionProvider`
4. Réécrire `contexts/MeContext.tsx` (section 5.4)
5. Réécrire `components/Nav.tsx` : URLs login/logout → `signIn()`/`signOut()`
6. Mettre à jour `types/MeType.ts` et `types/UserType.ts` (section 5.6)
7. Simplifier `hooks/useMe.ts`

### Phase 3 : DB — Helper + API routes (1-2h)

1. Créer `lib/db.ts` (section 4.4)
2. Réécrire les 7 routes API (section 6.2). Pour chaque fichier :
   - Remplacer `import faunadb` par `import { db } from '../../lib/db'`
   - Remplacer `getSession` / `withApiAuthRequired` par `getServerSession(req, res, authOptions)`
   - Remplacer les appels FQL par des appels `db.*`
   - `user.sub` → `session.user.id`
   - Passer `session.user.isAdmin` aux helpers `isEditor()` / `findAll()`
3. Côté front : supprimer tous les fallback `|| ['github|3338913']` dans :
   - `pages/vampires/[id].tsx`
   - `pages/vampires/[id]/config.tsx`
   - `components/SheetActionsFooter.tsx`
   - Remplacer par `me.isAdmin || editors.includes(me.id)`

### Phase 3.5 : Se mettre admin (2 min)

Après le premier login, passer ton user en admin :
```sql
UPDATE users SET is_admin = true WHERE email = 'ton@email.com';
```

### Phase 4 : Nettoyage (15 min)

1. Supprimer `FAUNADB_SECRET_KEY`, `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` des env vars Vercel
2. Ajouter `NEXTAUTH_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
3. Mettre à jour `.env.sample`
4. Mettre à jour `CLAUDE.md`

---

## 8. Env vars

### À supprimer
```
FAUNADB_SECRET_KEY
AUTH0_DOMAIN
AUTH0_CLIENT_ID
AUTH0_CLIENT_SECRET
```

### À ajouter manuellement
```
NEXTAUTH_SECRET              # Généré avec `openssl rand -base64 32`
NEXTAUTH_URL                 # https://ton-domaine.vercel.app (ou http://localhost:3000 en dev)
RESEND_API_KEY               # Depuis le dashboard Resend (pour magic links email)
EMAIL_FROM                   # Ex: "Vampire Char <noreply@ton-domaine.com>" (domaine vérifié dans Resend)
GITHUB_CLIENT_ID             # Depuis GitHub OAuth App
GITHUB_CLIENT_SECRET         # Depuis GitHub OAuth App
```

### Ajoutées automatiquement par Vercel Postgres
```
POSTGRES_URL                # Connection pooling URL (utilisé par @vercel/postgres)
POSTGRES_URL_NON_POOLING    # Direct connection (utilisé par node-pg-migrate)
POSTGRES_USER
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_DATABASE
```

---

## 9. Points d'attention

### getStaticPaths / getStaticProps

Les fonctions `fetchVampireFromDB()` et `fetchOneVampire()` sont appelées au build time et dans ISR. Elles importent directement le client Fauna. Il faut les réécrire pour utiliser `db.vampires.findAll()` et `db.vampires.findById()`.

`@vercel/postgres` fonctionne sans problème dans `getStaticProps` / `getServerSideProps`.

### JSONB et typage

`@vercel/postgres` retourne les colonnes JSONB déjà parsées (pas besoin de `JSON.parse`). Le helper `rowToVampire()` dans `lib/db.ts` centralise le cast vers `VampireType`. Un seul endroit à maintenir.

### Taille des payloads

Les update full envoient tout le personnage. Avec Fauna c'était un `Replace` atomique. Avec `UPDATE SET data = ...`, c'est pareil — pas de changement de comportement.

### Concurrence (Pusher)

Plusieurs utilisateurs peuvent éditer en même temps. Le pattern actuel est "last write wins" (pas de conflit resolution). PostgreSQL se comporte pareil — pas de régression.

### Update partiel et merge JSONB

L'opérateur `||` de PostgreSQL fait un merge shallow de JSONB. Si `update_partial` envoie `{ infos: { name: "New" } }`, ça **remplace** tout l'objet `infos`, pas juste le champ `name`. C'est le même comportement que le `q.Update()` de Fauna (merge au premier niveau). Vérifier que le front envoie des sous-objets complets, pas des champs individuels.

---

## 10. Estimation de l'effort

### Vue d'ensemble

| Phase | Effort | Complexité | Risque |
|-------|--------|------------|--------|
| Phase | Effort | Complexité | Risque |
|-------|--------|------------|--------|
| **Phase 0** — Next.js 12 → 14 (codemods + vérif) | ~20 min | Faible | Faible |
| **Phase 1** — Setup infra (Vercel Postgres + deps + OAuth app) | ~30 min | Faible | Faible |
| **Phase 2** — Auth NextAuth (config, contexts, nav, types) | ~30 min | Faible | Faible |
| **Phase 3** — DB helper + réécriture des 7 API routes | ~1h30 | Faible-Moyenne | Moyen |
| **Phase 3.5** — Se mettre admin | ~2 min | Faible | Faible |
| **Phase 4** — Nettoyage (env vars, docs, deps) | ~15 min | Faible | Faible |
| Tests manuels end-to-end | ~1h | - | - |
| **Total** | **~4h** | | |

### Détail par fichier

**Fichiers nouveaux :**

| Fichier | Effort | Notes |
|---------|--------|-------|
| `lib/db.ts` | 45 min | Le gros du travail. Tout le SQL centralisé ici |
| `pages/api/auth/[...nextauth].ts` | 15 min | Config NextAuth + provider GitHub |
| `lib/auth-adapter.ts` | 15 min | Adapter PostgreSQL custom (ou utiliser `@next-auth/pg-adapter`) |
| `migrations/XXXX_init-schema.js` | 10 min | Schema complet (tables NextAuth + tables app) |

**Routes API (DB + auth) :**

| Fichier | Effort | Notes |
|---------|--------|-------|
| `pages/api/vampires/create.ts` | 10 min | `q.Create` → `db.vampires.create` + `getServerSession` |
| `pages/api/vampires.ts` | 10 min | `q.Map(...)` → `db.vampires.findAll` + `getServerSession` |
| `pages/api/vampires/[id].ts` | 5 min | Trivial, pas d'auth |
| `pages/api/vampires/[id]/update.ts` | 10 min | DB + auth |
| `pages/api/vampires/[id]/update_partial.ts` | 10 min | DB + auth |
| `pages/api/vampires/[id]/delete.ts` | 5 min | DB + auth, trivial |
| `pages/api/users.ts` | 5 min | `db.users.findAll()` + session check |

**Frontend auth :**

| Fichier | Effort | Notes |
|---------|--------|-------|
| `pages/_app.tsx` | 5 min | `UserProvider` → `SessionProvider` |
| `contexts/MeContext.tsx` | 10 min | Réécriture avec `useSession()` |
| `components/Nav.tsx` | 5 min | `signIn()` / `signOut()` |
| `types/MeType.ts` | 5 min | Simplification |
| `types/UserType.ts` | 5 min | Suppression `sub`/`nickname`, ajout `image` |
| `hooks/useMe.ts` | 5 min | Simplification |

### Ce qui demande de l'attention

| Point | Détail | Impact |
|-------|--------|--------|
| **Functions exportées** | `fetchVampireFromDB()` et `fetchOneVampire()` sont importées dans `getStaticPaths`/`getStaticProps`. Il faut les réécrire avec `db.*` | Faible — même format de retour |
| **Hardcoded viewer supprimé** | `'github\|3338913'` remplacé par le flag `is_admin` sur la table `users`. L'admin voit et édite tout sans être dans `editors[]`/`viewers[]` | Résolu |
| **Merge JSONB shallow** | `data \|\| patch` merge au premier niveau seulement | Moyen — vérifier le front (cf. section 9) |
| **`ConfigAccessSection`** | Le composant d'accès affiche les users par `sub`. Il faudra afficher par `user.id` et adapter le matching | Faible — même logique, juste l'identifiant change |
| **Callback URL NextAuth** | L'OAuth app GitHub doit avoir le bon callback URL. En dev : `http://localhost:3000/api/auth/callback/github`. En prod : le domaine Vercel | Bloquant si mal configuré |

---

## 11. Résumé des dépendances

### À upgrader
```json
{
  "next": "12.2.3 → 14.x",
  "eslint-config-next": "12.2.3 → 14.x"
}
```

### À upgrader (devDependencies)
```json
{
  "typescript": "4.7 → 5.x",
  "@types/react": "18.0.15 → 18.2.x",
  "@types/node": "18.6.2 → 20.x"
}
```

### À ajouter
```json
{
  "@vercel/postgres": "^0.10.x",
  "next-auth": "^4.x",
  "resend": "^4.x"
}
```

### À ajouter (devDependencies)
```json
{
  "node-pg-migrate": "^7.x"
}
```

### À supprimer
```json
{
  "faunadb": "^4.6.0",
  "@auth0/nextjs-auth0": "^1.9.1"
}
```

---

## 12. Inventaire Auth0 (référence)

L'utilisation d'Auth0 est minimale — uniquement les features basiques :

| Feature Auth0 | Utilisé ? |
|---------------|-----------|
| Login/Logout (hosted page) | Oui |
| `user.sub` comme identifiant | Oui |
| Profil basique (`name`, `email`, `picture`, `nickname`) | Oui |
| `withApiAuthRequired()` (middleware) | Oui (4 routes) |
| `getSession()` (server-side) | Oui (6 routes) |
| `useUser()` (client-side) | Oui (`MeContext`) |
| `UserProvider` (wrapper app) | Oui (`_app.tsx`) |
| Roles / Permissions / Custom claims / Rules / Actions / MFA | Non |

C'est ce qui rend la migration vers NextAuth mécanique : aucune feature avancée Auth0 à reproduire.
