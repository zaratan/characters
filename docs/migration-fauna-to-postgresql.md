# Migration FaunaDB -> PostgreSQL (Vercel Postgres)

> **Contexte** : FaunaDB est mort. On migre vers PostgreSQL hébergé sur Vercel Postgres (basé sur Neon).
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
CREATE TABLE users (
  id    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sub   TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name  TEXT NOT NULL,
  nickname TEXT NOT NULL,
  picture  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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
  editors: string[];
  viewers: string[];
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
    async findAll(userId?: string): Promise<VampireListItem[]> {
      const { rows } = await sql`
        SELECT v.id, v.data->'infos'->>'name' as name, v.private_sheet
        FROM vampires v
        LEFT JOIN vampire_editors ve ON ve.vampire_id = v.id
        LEFT JOIN users u ON u.id = ve.user_id AND u.sub = ${userId ?? ''}
        LEFT JOIN vampire_viewers vv ON vv.vampire_id = v.id
        LEFT JOIN users u2 ON u2.id = vv.user_id AND u2.sub = ${userId ?? ''}
        WHERE v.private_sheet = false
           OR u.id IS NOT NULL
           OR u2.id IS NOT NULL
      `;
      return rows.map((r) => ({ key: r.id, name: r.name }));
    },

    async findById(id: string): Promise<VampireType | null> {
      const { rows } = await sql`SELECT * FROM vampires WHERE id = ${id}`;
      if (!rows[0]) return null;

      const { rows: editors } = await sql`
        SELECT u.sub FROM vampire_editors ve JOIN users u ON u.id = ve.user_id
        WHERE ve.vampire_id = ${id}
      `;
      const { rows: viewers } = await sql`
        SELECT u.sub FROM vampire_viewers vv JOIN users u ON u.id = vv.user_id
        WHERE vv.vampire_id = ${id}
      `;

      return rowToVampire(
        rows[0],
        editors.map((e) => e.sub),
        viewers.map((v) => v.sub),
      );
    },

    async create(vampire: VampireType): Promise<void> {
      const { id, privateSheet, data } = vampireToRow(vampire);
      await sql`
        INSERT INTO vampires (id, private_sheet, data)
        VALUES (${id}, ${privateSheet}, ${data})
      `;
      // editors/viewers gérés séparément
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
      // Merge JSONB côté PostgreSQL — pas besoin de tout renvoyer
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

    async isEditor(vampireId: string, userSub: string): Promise<boolean> {
      const { rows } = await sql`
        SELECT 1 FROM vampire_editors ve
        JOIN users u ON u.id = ve.user_id
        WHERE ve.vampire_id = ${vampireId} AND u.sub = ${userSub}
      `;
      return rows.length > 0;
    },
  },

  users: {
    async findAll() {
      const { rows } = await sql`
        SELECT sub, email, name, nickname, picture FROM users
      `;
      return rows;
    },

    async findOrCreate(sub: string, data: { email: string; name: string; nickname: string; picture: string }) {
      const { rows } = await sql`
        INSERT INTO users (sub, email, name, nickname, picture)
        VALUES (${sub}, ${data.email}, ${data.name}, ${data.nickname}, ${data.picture})
        ON CONFLICT (sub) DO UPDATE SET email = ${data.email}, name = ${data.name}
        RETURNING id
      `;
      return rows[0].id;
    },
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

## 5. Fichiers à modifier

### 5.1 Fichiers à supprimer

Aucun fichier n'est à supprimer — on réécrit le contenu des API routes.

### 5.2 Fichiers à modifier (7 fichiers)

| Fichier | Changement |
|---------|------------|
| `pages/api/vampires/create.ts` | `q.Create()` -> `db.vampires.create()` |
| `pages/api/vampires.ts` | `q.Map(q.Paginate(q.Match(...)))` -> `db.vampires.findAll()` |
| `pages/api/vampires/[id].ts` | `q.Map(q.Paginate(q.Match(q.Index('one_vampire'))))` -> `db.vampires.findById()` |
| `pages/api/vampires/[id]/update.ts` | `q.Replace()` -> `db.vampires.update()` |
| `pages/api/vampires/[id]/update_partial.ts` | `q.Update()` -> `db.vampires.updatePartial()` |
| `pages/api/vampires/[id]/delete.ts` | `q.Delete()` -> `db.vampires.delete()` |
| `pages/api/users.ts` | `q.Map(q.Paginate(q.Match(...)))` -> `db.users.findAll()` |

### 5.3 Fichiers à créer

| Fichier | Contenu |
|---------|---------|
| `lib/db.ts` | Helper layer (section 4.4) |
| `migrations/TIMESTAMP_init-schema.js` | Migration initiale (section 3) |

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

await db.vampires.create(data);
const editorUserId = await db.users.findOrCreate(session.user.sub, session.user);
// + INSERT dans vampire_editors
```

### 6.2 `GET /api/vampires` (liste)

```typescript
// AVANT — fetch tout + filtre côté app
const dbs = await client.query(q.Map(q.Paginate(q.Match(q.Index('all_vampires_full'))), (ref) => q.Get(ref)));
const filtered = dbs.data.filter((v) => !v.data.privateSheet || ...);

// APRÈS — filtre côté SQL
const vampires = await db.vampires.findAll(session?.user?.sub);
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
if (!(await db.vampires.isEditor(id, user.sub))) return res.status(403)...;
await db.vampires.update(id, data);
```

### 6.5 `PATCH /api/vampires/[id]/update_partial`

```typescript
// APRÈS — merge JSONB natif PostgreSQL, pas besoin de tout renvoyer
if (!(await db.vampires.isEditor(id, user.sub))) return res.status(403)...;
await db.vampires.updatePartial(id, partialData);
```

### 6.6 `DELETE /api/vampires/[id]/delete`

```typescript
// APRÈS
if (!(await db.vampires.isEditor(id, user.sub))) return res.status(403)...;
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

### Phase 1 : Setup (30 min)

1. **Provisionner Vercel Postgres** dans le dashboard Vercel (Storage -> Create -> Postgres)
2. Les variables d'env `POSTGRES_URL` etc. sont auto-ajoutées
3. `yarn add @vercel/postgres` et `yarn add -D node-pg-migrate`
4. `yarn remove faunadb`
5. Créer la migration initiale : `npx node-pg-migrate create init-schema`
6. Écrire le schema (section 4.2) dans le fichier de migration
7. `npx node-pg-migrate up` (crée les tables)
8. Ajouter les scripts dans `package.json` :
   ```json
   "migrate:up": "node-pg-migrate up",
   "migrate:down": "node-pg-migrate down",
   "migrate:create": "node-pg-migrate create",
   "build": "node-pg-migrate up && next build"
   ```

### Phase 2 : Créer `lib/db.ts` (30 min)

Écrire le helper layer (section 4.4). C'est le seul fichier qui contient du SQL. Toutes les routes l'importent.

### Phase 3 : Réécriture des API routes (1-2h)

Réécrire les 7 fichiers listés en section 5.2. Chaque fichier :
1. Remplacer `import faunadb` par `import { db } from '../../lib/db'`
2. Remplacer les appels FQL par des appels `db.*`
3. Supprimer le boilerplate Fauna (client init, `q.Map(q.Paginate(...))`)

Grâce au schema JSONB unique et au helper layer, **il n'y a pas de phase de sérialisation séparée**. Le mapping `VampireType` ↔ DB est encapsulé dans `lib/db.ts`.

### Phase 4 : Nettoyage

1. Supprimer `FAUNADB_SECRET_KEY` des env vars Vercel
2. Mettre à jour `.env.sample`
3. Mettre à jour `CLAUDE.md` (remplacer FaunaDB par PostgreSQL)

---

## 8. Env vars

### À supprimer
```
FAUNADB_SECRET_KEY
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
| Setup infra (Vercel Postgres + deps) | ~20 min | Faible | Faible |
| Migration initiale + `lib/db.ts` | ~45 min | Faible | Faible |
| Réécriture des 7 API routes | ~1-2h | Faible | Faible |
| Tests manuels end-to-end | ~45 min | - | - |
| Nettoyage (env vars, docs, deps) | ~15 min | Faible | Faible |
| **Total** | **~3-4h** | | |

> L'estimation a baissé par rapport aux versions précédentes du doc. Le schema JSONB unique supprime la phase de sérialisation et rend les routes quasi mécaniques.

### Détail par fichier

| Fichier | Lignes | Avant | Après | Effort | Notes |
|---------|--------|-------|-------|--------|-------|
| `lib/db.ts` | *nouveau* | - | Helper layer complet | 45 min | Le gros du travail. Écrit une fois, utilisé partout |
| `pages/api/vampires/create.ts` | 62 | `q.Create()` | `db.vampires.create()` | 10 min | Quasi mécanique : remplacer import + appel |
| `pages/api/vampires.ts` | 62 | `q.Map/Paginate/Match` + filtre JS | `db.vampires.findAll()` | 10 min | Le filtre privé/public passe côté SQL — plus propre. `fetchVampireFromDB()` aussi utilisée dans `getStaticPaths` |
| `pages/api/vampires/[id].ts` | 47 | `q.Map/Paginate/Match/Get` | `db.vampires.findById()` | 5 min | Trivial. `fetchOneVampire()` aussi utilisée dans `getStaticProps` |
| `pages/api/vampires/[id]/update.ts` | 63 | `q.Map + q.Replace` | `db.vampires.isEditor()` + `db.vampires.update()` | 10 min | Deux appels au lieu du boilerplate Fauna |
| `pages/api/vampires/[id]/update_partial.ts` | 60 | `q.Map + q.Update` | `db.vampires.isEditor()` + `db.vampires.updatePartial()` | 10 min | Merge JSONB natif PostgreSQL |
| `pages/api/vampires/[id]/delete.ts` | 55 | `q.Map + q.Delete` | `db.vampires.isEditor()` + `db.vampires.delete()` | 5 min | Trivial. Cascade auto |
| `pages/api/users.ts` | 64 | `q.Map/Paginate/Match` + `lodash.pick` | `db.users.findAll()` | 5 min | Plus besoin de `lodash.pick` |

### Ce qui demande de l'attention

| Point | Détail | Impact |
|-------|--------|--------|
| **Functions exportées** | `fetchVampireFromDB()` et `fetchOneVampire()` sont importées dans les pages pour `getStaticPaths`/`getStaticProps`. Il faut les réécrire pour appeler `db.*` | Faible — juste s'assurer du même format de retour |
| **Hardcoded viewer** | `'github|3338913'` est hardcodé comme viewer par défaut dans `create.ts`. Il faut que ce user existe dans la table `users` | Faible — `INSERT ... ON CONFLICT DO UPDATE` gère ça |
| **Merge JSONB shallow** | `data \|\| patch` merge au premier niveau. Si le front envoie un `infos` partiel (juste `name`), ça écrase les autres champs d'`infos` | Moyen — vérifier le comportement du front (cf. section 9) |

---

## 11. Résumé des dépendances

### À ajouter
```json
{
  "@vercel/postgres": "^0.10.x"
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
  "faunadb": "^4.6.0"
}
```
