# Migration FaunaDB + Auth0 + Next 12 → PostgreSQL + NextAuth + Next 14

> **Contexte** : FaunaDB est mort, le compte Auth0 n'existe plus, Next.js 12 est EOL. Le projet n'a pas été maintenu.
> On migre tout d'un coup : base de données, authentification, et framework.
> Pas de migration de données — on repart de zéro.
> **Stratégie de rollback** : Fauna est mort, pas de retour possible. On fait du "fix forward".

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
| `uuid` npm package (client-side UUIDv4) | `gen_random_uuid()` PostgreSQL (ID vampires) + `crypto.randomUUID()` natif (clés React) |
| `.babelrc` + `babel-plugin-styled-components` | `compiler: { styledComponents: true }` dans `next.config.js` (SWC natif) |

### Ce qui ne change pas

- **Pages Router** — on reste dessus, pas de migration vers App Router
- Les API routes (mêmes URLs, mêmes shapes de réponse pour les données)
- Le front-end (SWR, contexts, hooks) — sauf `MeContext` qui change de source
- Pusher (s'assurer de préserver les triggers `updateOnSheets`/`updateOnSheet` dans les routes réécrites)
- Les types TypeScript (`VampireType`) — sauf `MeType`/`UserType` qui s'adaptent

### Note sur Next.js 14 + Pages Router

On upgrade vers Next 14 sans migrer vers App Router. Le bénéfice principal est de rester sur une version supportée. Points d'attention :
- **`.babelrc`** : le projet a un `.babelrc` avec `babel-plugin-styled-components` + `next/babel`. **Quand un `.babelrc` existe, Next.js désactive SWC et fallback sur Babel.** Il faut **supprimer `.babelrc`** et utiliser `compiler.styledComponents` dans `next.config.js` à la place.
- **SWR** : envisager upgrade vers SWR 2.x en même temps (breaking changes minimes)
- Si Next 13 est encore supporté au moment de la migration, c'est une alternative avec moins de friction

### Note sur la génération des UUIDs

Le package `uuid` est utilisé dans 7 fichiers :
- `pages/new.tsx` : génère l'ID du vampire côté client avant le POST
- 6 contexts (`AdvFlawContext`, `DisciplinesContext`, `LanguagesContext`, `HumanMagicContext`, `AbilitiesContext`, `SystemContext`) : génèrent des clés React pour les items de listes (disciplines, langues, etc.)

**Stratégie de remplacement :**
- **ID vampires** → `gen_random_uuid()` côté PostgreSQL via `INSERT ... RETURNING id`. Le client ne génère plus l'ID.
- **Clés React** → `crypto.randomUUID()` natif (disponible dans tous les navigateurs modernes et Node.js 14.17+). Zéro dépendance.
- **Résultat** : suppression du package `uuid` + `@types/uuid`.

**Impact sur le flow de création :**
- Avant : `new.tsx` génère l'ID → redirige vers `/vampires/${id}` immédiatement → POST en parallèle
- Après : `new.tsx` POST → attend la réponse `{ id }` → redirige vers `/vampires/${id}`
- C'est un flow plus propre et plus sûr (pas de race condition entre la redirect et le POST)

### Note sur la phase intermédiaire (Phase 1 seule)

Pendant Phase 1 (auth remplacée, DB encore sur Fauna), les `user.id` NextAuth (UUIDs) ne matcheront jamais les `github|3338913` stockés dans Fauna. L'app sera en **lecture seule** entre la fin de Phase 1 et la fin de Phase 2. C'est attendu — ne pas déployer Phase 1 seule en production.

---

## 2. Stack technique

**`@vercel/postgres`** (SQL brut) + **`node-pg-migrate`** (migrations versionnées).

Pas d'ORM — le projet fait du CRUD trivial sur 7 routes. Un helper `lib/db.ts` centralise tout le SQL.

> **Note** : `@vercel/postgres` est un wrapper sur `@neondatabase/serverless` (WebSocket). Si on migre un jour hors Vercel, on swap pour `pg` (node-postgres) + un connection pooler. La migration est triviale car tout le SQL est centralisé dans `lib/db.ts`.

> **Important — transactions** : `@vercel/postgres` utilise un pool de connexions. Chaque appel `sql\`...\`` peut aller sur une connexion différente. Pour les transactions (BEGIN/COMMIT), il faut utiliser `db.connect()` pour obtenir un client dédié. Ne PAS faire `await sql\`BEGIN\`` suivi de `await sql\`INSERT...\`` — la transaction serait illusoire.

---

## 3. Migrations de schema (`node-pg-migrate`)

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
  pgm.addConstraint('vampire_editors', 'vampire_editors_user_id_check', { check: "user_id <> ''" });

  pgm.createTable('vampire_viewers', {
    vampire_id: { type: 'uuid', notNull: true, references: 'vampires', onDelete: 'CASCADE' },
    user_id: { type: 'text', notNull: true, references: 'users', onDelete: 'CASCADE' },
  });
  pgm.addConstraint('vampire_viewers', 'vampire_viewers_pkey', { primaryKey: ['vampire_id', 'user_id'] });
  pgm.addConstraint('vampire_viewers', 'vampire_viewers_user_id_check', { check: "user_id <> ''" });

  // --- Index pour les requêtes fréquentes ---
  pgm.createIndex('vampire_editors', 'user_id', { name: 'idx_vampire_editors_user' });
  pgm.createIndex('vampire_viewers', 'user_id', { name: 'idx_vampire_viewers_user' });
  pgm.createIndex('vampires', 'private_sheet', { name: 'idx_vampires_private' });
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

### Intégration avec Vercel (déploiement)

Les migrations doivent tourner **pendant le build**, pas au runtime des serverless functions :

```json
{
  "scripts": {
    "build": "node -e \"if(process.env.VERCEL_ENV!=='preview'){require('child_process').execSync('npx node-pg-migrate up',{stdio:'inherit'})}\" && next build",
    "migrate:up": "node-pg-migrate up",
    "migrate:down": "node-pg-migrate down",
    "migrate:create": "node-pg-migrate create"
  }
}
```

Vercel exécute `yarn build` à chaque déploiement -> les migrations tournent avant le build Next.js -> la DB est à jour quand l'app démarre.

> **Note** : il faut que `POSTGRES_URL` (ou `DATABASE_URL`) soit accessible au build time. C'est le cas par défaut avec Vercel Postgres.

> **Attention preview deployments** : les preview deployments Vercel utilisent les mêmes env vars par défaut. Le guard `VERCEL_ENV !== 'preview'` empêche d'exécuter les migrations contre la DB de production depuis un preview. Idéalement, configurer une DB séparée pour les previews.

---

## 4. Schema de base de données

Une seule colonne `data JSONB` contient tout le `VampireType` — même philosophie que Fauna. Seuls `private_sheet` et les relations `editors`/`viewers` sont en colonnes relationnelles.

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
  data          JSONB NOT NULL,                              -- LE VampireType entier (sans id, privateSheet, editors, viewers)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE vampire_editors (
  vampire_id UUID NOT NULL REFERENCES vampires(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE CHECK (user_id <> ''),
  PRIMARY KEY (vampire_id, user_id)
);

CREATE TABLE vampire_viewers (
  vampire_id UUID NOT NULL REFERENCES vampires(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE CHECK (user_id <> ''),
  PRIMARY KEY (vampire_id, user_id)
);

-- ============================
-- Index pour les requêtes fréquentes
-- ============================

CREATE INDEX idx_vampire_editors_user ON vampire_editors(user_id);
CREATE INDEX idx_vampire_viewers_user ON vampire_viewers(user_id);
CREATE INDEX idx_vampires_private ON vampires(private_sheet);
```

> **Note colonnes NextAuth** : les tables NextAuth utilisent du camelCase (`"emailVerified"`, `"userId"`, `"sessionToken"`, `"providerAccountId"`) qui nécessite du quoting en SQL brut. Toujours utiliser les double quotes pour ces colonnes.

**Pourquoi ça marche :** on ne requête JAMAIS les champs internes du vampire. On ne fait que :
- Lister les vampires (filtre sur `private_sheet` + jointure `editors`/`viewers`)
- Lire un vampire par `id`
- Remplacer tout le document
- Supprimer par `id`

Le contenu du personnage est toujours lu/écrit en bloc. Le seul champ qu'on extrait dans la liste c'est `data->'infos'->>'name'` pour l'affichage.

### 4.3 Helper layer : `lib/db.ts`

Un helper fait le pont entre `VampireType` et la DB. Les routes API ne voient jamais de SQL, juste des fonctions typées.

> **Attention** : les transactions doivent utiliser `db.connect()` pour obtenir un client dédié. Les tagged templates `sql\`...\`` utilisent le pool et chaque appel peut aller sur une connexion différente.

> **Attention** : toujours utiliser le cast `::jsonb` quand on passe du `JSON.stringify()` en paramètre d'une colonne JSONB.

```typescript
import { db as pgDb, sql } from '@vercel/postgres';
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

function vampireToRow(v: Omit<VampireType, 'id'>) {
  const { privateSheet, editors, viewers, ...data } = v;
  return { privateSheet, data: JSON.stringify(data) };
}

// ---- API publique ----

export const db = {
  vampires: {
    // isAdmin = true → voit tout (plus besoin de hardcoder un sub)
    async list(userId?: string, isAdmin = false): Promise<VampireListItem[]> {
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

    // L'ID est généré par PostgreSQL (gen_random_uuid()), pas côté client
    async create(vampire: Omit<VampireType, 'id'>, creatorUserId: string): Promise<string> {
      const { privateSheet, data } = vampireToRow(vampire);
      // Transaction via client dédié (sql`` utilise le pool = connexions différentes)
      const client = await pgDb.connect();
      try {
        await client.sql`BEGIN`;
        const { rows } = await client.sql`
          INSERT INTO vampires (private_sheet, data)
          VALUES (${privateSheet}, ${data}::jsonb)
          RETURNING id
        `;
        const id = rows[0].id;
        await client.sql`
          INSERT INTO vampire_editors (vampire_id, user_id)
          VALUES (${id}, ${creatorUserId})
        `;
        await client.sql`COMMIT`;
        return id;
      } catch (e) {
        await client.sql`ROLLBACK`;
        throw e;
      } finally {
        client.release();
      }
    },

    async update(id: string, vampire: VampireType): Promise<void> {
      const { privateSheet, data } = vampireToRow(vampire);
      const { editors, viewers } = vampire;
      // Transaction : update data + sync junction tables
      const client = await pgDb.connect();
      try {
        await client.sql`BEGIN`;
        await client.sql`
          UPDATE vampires
          SET data = ${data}::jsonb, private_sheet = ${privateSheet}, updated_at = now()
          WHERE id = ${id}
        `;
        // Sync editors
        await client.sql`DELETE FROM vampire_editors WHERE vampire_id = ${id}`;
        for (const userId of editors) {
          await client.sql`
            INSERT INTO vampire_editors (vampire_id, user_id) VALUES (${id}, ${userId})
          `;
        }
        // Sync viewers
        await client.sql`DELETE FROM vampire_viewers WHERE vampire_id = ${id}`;
        for (const userId of viewers) {
          await client.sql`
            INSERT INTO vampire_viewers (vampire_id, user_id) VALUES (${id}, ${userId})
          `;
        }
        await client.sql`COMMIT`;
      } catch (e) {
        await client.sql`ROLLBACK`;
        throw e;
      } finally {
        client.release();
      }
    },

    async updatePartial(id: string, partial: Partial<VampireType>): Promise<void> {
      const { privateSheet, editors, viewers, ...rest } = partial;
      const { id: _id, ...dataFields } = rest;

      // Si editors ou viewers sont présents, sync les junction tables
      if (editors || viewers) {
        const client = await pgDb.connect();
        try {
          await client.sql`BEGIN`;
          if (editors) {
            await client.sql`DELETE FROM vampire_editors WHERE vampire_id = ${id}`;
            for (const userId of editors) {
              await client.sql`
                INSERT INTO vampire_editors (vampire_id, user_id) VALUES (${id}, ${userId})
              `;
            }
          }
          if (viewers) {
            await client.sql`DELETE FROM vampire_viewers WHERE vampire_id = ${id}`;
            for (const userId of viewers) {
              await client.sql`
                INSERT INTO vampire_viewers (vampire_id, user_id) VALUES (${id}, ${userId})
              `;
            }
          }
          await client.sql`COMMIT`;
        } catch (e) {
          await client.sql`ROLLBACK`;
          throw e;
        } finally {
          client.release();
        }
      }

      if (Object.keys(dataFields).length > 0) {
        await sql`
          UPDATE vampires
          SET data = data || ${JSON.stringify(dataFields)}::jsonb, updated_at = now()
          WHERE id = ${id}
        `;
      }
      if (privateSheet !== undefined) {
        await sql`
          UPDATE vampires SET private_sheet = ${privateSheet}, updated_at = now()
          WHERE id = ${id}
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

    // Viewer OU editor — pour le check de lecture des fiches privées
    async isEditorOrViewer(vampireId: string, userId: string, isAdmin = false): Promise<boolean> {
      if (isAdmin) return true;
      const { rows } = await sql`
        SELECT 1 FROM vampire_editors WHERE vampire_id = ${vampireId} AND user_id = ${userId}
        UNION
        SELECT 1 FROM vampire_viewers WHERE vampire_id = ${vampireId} AND user_id = ${userId}
      `;
      return rows.length > 0;
    },
  },

  users: {
    // Pour le picker editors/viewers — pas d'email exposé
    async findAllPublic() {
      const { rows } = await sql`
        SELECT id, name, image FROM users
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
const id = await db.vampires.create(data, session.user.id);
res.status(200).json({ id }); // Le client redirige après avoir reçu l'ID


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

---

## 5. Couche authentification : Auth0 → NextAuth

NextAuth : open-source, self-hosted, intégré à Next.js. La DB PostgreSQL sert aussi de backend auth.

> **Choix de version** : NextAuth v4, pas v5 (Auth.js). v5 est conçu pour App Router. Sur Pages Router, v4 est le bon choix. Si on migre vers App Router plus tard, on passera à v5 à ce moment.

> **Décision de sécurité** : `allowDangerousEmailAccountLinking: true` est activé. Le risque : quelqu'un qui contrôle un email peut lier un compte existant. C'est acceptable pour une app de fiches de perso sans données sensibles. À revoir si le périmètre de l'app change.

### 5.1 Module augmentation TypeScript : `types/next-auth.d.ts`

**Obligatoire.** NextAuth expose par défaut `session.user` avec seulement `name`, `email`, `image`. On ajoute `id` et `isAdmin` via le callback session, mais TypeScript ne les connaît pas sans cette augmentation.

```typescript
// types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin: boolean;
    };
  }
  interface User {
    isAdmin: boolean;
  }
}
```

> **Note** : le custom adapter (`lib/auth-adapter.ts`) DOIT retourner `isAdmin` dans l'objet `User` pour que le callback session le reçoive. L'adapter `@next-auth/pg-adapter` standard ne connaît pas la colonne `is_admin` — l'adapter custom est donc obligatoire, pas optionnel.

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
      session.user.isAdmin = user.isAdmin;
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
> **Resend** : gratuit jusqu'à 100 emails/jour, une seule clé API. Le domaine d'envoi doit être vérifié dans le dashboard Resend (DNS SPF/DKIM), sinon les magic links atterrissent en spam.

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
| `me.sub` | `me.id` | `ModeContext.tsx` (4 refs), `ActionsFooter.tsx` (1 ref), `[id].tsx`, `config.tsx` |
| `me.picture` / `data.picture` | `me.image` | `Nav.tsx` (profil img) |
| `/api/auth/login?return=...` | `signIn(undefined, { callbackUrl: returnTo })` | `Nav.tsx` |
| `/api/auth/logout` | `signOut()` de `next-auth/react` | `Nav.tsx` |
| `import { UserProfile } from '@auth0/nextjs-auth0'` | Supprimer — utiliser `MeType` | `Nav.tsx` |

### 5.4 `MeContext.tsx` — réécriture

```typescript
import { useSession } from 'next-auth/react';
import { createContext, useContext, useMemo } from 'react';
import { MeType } from '../types/MeType';

type MeContextType = {
  me?: MeType;
  connected: boolean;
};

const MeContext = createContext<MeContextType>({ connected: false });

export const MeProvider = ({ children }) => {
  const { data: session, status } = useSession();

  const value = useMemo(
    () => ({
      me: session?.user ? {
        id: session.user.id,
        name: session.user.name ?? '',
        email: session.user.email ?? '',
        image: session.user.image ?? '',
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

`sub` disparaît, remplacé par `user.id` direct (la clé primaire NextAuth). Plus de `JOIN` pour résoudre `sub` → `id`. Le code complet est dans la section 4.3.

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

Next 14 : dernière version compatible React 18.2 (déjà en place). Next 13 est EOL, Next 15 exige React 19. Pages Router toujours supporté.

### 5bis.1 Supprimer `.babelrc` + configurer SWC

**Le projet a un `.babelrc`** à la racine avec `babel-plugin-styled-components` + preset `next/babel`. **Quand un `.babelrc` existe, Next.js désactive SWC entièrement.** Le `compiler.styledComponents` dans `next.config.js` serait silencieusement ignoré.

**Étapes :**
1. Supprimer `.babelrc`
2. Supprimer `babel-plugin-styled-components` des devDependencies
3. Créer `next.config.js` (le fichier **n'existe pas** actuellement) :

```javascript
// next.config.js
module.exports = {
  compiler: {
    styledComponents: true,
  },
};
```

### 5bis.2 Breaking changes (Pages Router uniquement)

#### `next/link` — supprimer le `<a>` enfant (~8 occurrences)

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
| `components/Nav.tsx` | ~136-138 | `<Link href="..." passHref><MenuDropdownElem as="a">` — **codemod ne gère pas** `passHref` + styled-component |
| `components/Nav.tsx` | ~205-221 | `<Link href="/" passHref><Title as="a">Personnages</Title></Link>` — même pattern `passHref` |
| `components/ActionsFooter.tsx` | ~145, ~155, ~214, ~224 | 4 occurrences (2 desktop, 2 mobile) dans les actions footer |
| `pages/index.tsx` | ~78-86 | `<Link href="..." passHref><HandLargeText as="a">` — même pattern `passHref` |

> **Les cas `passHref` + styled-component `as="a"`** ne seront pas gérés par le codemod `new-link`. Ils doivent être corrigés manuellement. En Next 14, `Link` transmet le `href` automatiquement — `passHref` et `as="a"` ne sont plus nécessaires.

#### `next/image` — comportement changé (1 occurrence)

**Fichier impacté :**

| Fichier | Ligne | Détail |
|---------|-------|--------|
| `components/Sheet.tsx` | ~4, ~97-102 | Image de titre (`title.png` / `title_dark.png`), utilise `width`/`height` — compatible tel quel avec le nouveau `next/image` |

> L'image dans `Sheet.tsx` utilise déjà `width` et `height` explicites, donc elle devrait fonctionner sans changement avec le nouveau `next/image`. À vérifier visuellement.

### 5bis.3 Commandes d'upgrade

```bash
# Upgrade Next.js + ESLint config
yarn add next@14 eslint-config-next@14

# Codemods automatiques (gère next/link et next/image)
npx @next/codemod@latest new-link .
npx @next/codemod@latest next-image-to-legacy-image .
```

Les codemods gèrent les cas simples. **Les 4 cas `passHref` + styled-component** (Nav home, Nav logout, index.tsx, éventuels dans ActionsFooter) doivent être corrigés manuellement.

### 5bis.4 Dépendances à mettre à jour en même temps

| Package | Actuel | Cible | Raison |
|---------|--------|-------|--------|
| `next` | 12.2.3 | 14.x | Framework |
| `eslint-config-next` | 12.2.3 | 14.x | Doit matcher la version de Next |
| `typescript` | 4.7 | 5.x | Next 14 recommande TS 5+ |
| `@types/react` | 18.0.15 | 18.2.x | Aligner avec React 18.2 |
| `@types/node` | 18.6.2 | 20.x | Aligner avec Node 20+ |
| `swr` | 1.3 | 2.x | Rester à jour (breaking changes minimes — `mutate` global toujours dispo) |

---

## 6. Fichiers à modifier

### 6.1 Fichiers à supprimer

| Fichier | Raison |
|---------|--------|
| `pages/api/auth/[...auth0].ts` | Remplacé par `[...nextauth].ts` |
| `hooks/useMe.ts` | Dead code — fait un SWR call vers `/api/me` qui n'existe pas. `MeContext` fournit la même chose via `useSession()` |
| `.babelrc` | Remplacé par `compiler.styledComponents` dans `next.config.js`. Bloque SWC si présent. |

### 6.2 Fichiers à modifier (~25 fichiers)

**Routes API (DB + Auth) :**

| Fichier | Changement DB | Changement Auth |
|---------|--------------|-----------------|
| `pages/api/vampires/create.ts` | `q.Create()` → `db.vampires.create()` — retourne `{ id }` (ID généré par PG) | `withApiAuthRequired` + `getSession` → `getServerSession` |
| `pages/api/vampires.ts` | `q.Map(...)` → `db.vampires.list()` — wrapper `{ characters, failed }` préservé | `getSession` → `getServerSession` |
| `pages/api/vampires/[id].ts` | `q.Map(...)` → `db.vampires.findById()` — wrapper `{ data, failed }` préservé | **Ajouter** check `privateSheet` + `isEditorOrViewer` (faille existante) |
| `pages/api/vampires/[id]/update.ts` | `q.Replace()` → `db.vampires.update()` — sync editors/viewers via junction tables | `withApiAuthRequired` + `getSession` → `getServerSession`. Stripper `appId` du body. |
| `pages/api/vampires/[id]/update_partial.ts` | `q.Update()` → `db.vampires.updatePartial()` — sync editors/viewers si présents | idem |
| `pages/api/vampires/[id]/delete.ts` | `q.Delete()` → `db.vampires.delete()` | idem |
| `pages/api/users.ts` | `q.Map(...)` → `db.users.findAllPublic()` | `withApiAuthRequired` → `getServerSession` (auth requise) |

**Frontend (Auth — `me.sub` → `me.id`, `me.picture` → `me.image`) :**

| Fichier | Changement |
|---------|------------|
| `pages/_app.tsx` | `UserProvider` → `SessionProvider` |
| `contexts/MeContext.tsx` | `useUser()` → `useSession()` (réécriture complète, cf. section 5.4) |
| `contexts/ModeContext.tsx` | **4 refs à `me.sub`** (lignes 37, 40, 45, 48) → `me.id`. **Manqué dans les versions précédentes du plan — CRITIQUE** |
| `contexts/AccessesContext.tsx` | Identifiants `sub` → `id` (renommage paramètres) |
| `types/MeType.ts` | `UserProfile` Auth0 → type simplifié NextAuth |
| `types/UserType.ts` | Supprimer `sub`, `nickname`, `picture` → `id`, `image` |
| `components/Nav.tsx` | `/api/auth/login` → `signIn(undefined, { callbackUrl })`, `/api/auth/logout` → `signOut()`, `data.picture` → `me.image`, supprimer import `UserProfile` de `@auth0/nextjs-auth0` |
| `components/ActionsFooter.tsx` | `me.sub` (ligne 263) → `me.id` pour le check éditeur |
| `components/SheetActionsFooter.tsx` | `ownerActions` conditionné par `me.isAdmin \|\| editors.includes(me.id)` |
| `components/config/ConfigAccessSection.tsx` | **8 refs à `user.sub`** → `user.id`. Response shape `/api/users` change : `sub` → `id`, `picture` → `image` |
| `pages/vampires/[id].tsx` | Supprimer fallback `editors \|\| ['github\|3338913']` → `me.isAdmin`. Adapter `getStaticPaths`/`getStaticProps`. `me.sub` → `me.id` |
| `pages/vampires/[id]/config.tsx` | Idem — `me.isAdmin \|\| editors.includes(me.id)`. Adapter `getStaticProps`. |
| `pages/index.tsx` | Importe `fetchVampireFromDB` → adapter pour `db.vampires.list()`. + fix `Link` `passHref` |
| `pages/new.tsx` | `uuid()` → POST attend `{ id }` de la réponse API → redirect après. |

**Remplacement `uuid` → `crypto.randomUUID()` (6 contexts) :**

| Fichier | Changement |
|---------|------------|
| `contexts/AdvFlawContext.tsx` | `import { v4 as uuid } from 'uuid'` → supprimer import, `uuid()` → `crypto.randomUUID()` |
| `contexts/DisciplinesContext.tsx` | idem |
| `contexts/LanguagesContext.tsx` | idem |
| `contexts/HumanMagicContext.tsx` | idem |
| `contexts/AbilitiesContext.tsx` | idem |
| `contexts/SystemContext.tsx` | idem |

**Next.js 14 upgrade (codemods + manuels) :**

| Fichier | Changement |
|---------|------------|
| `components/Nav.tsx` | 3 `Link` dont 2 avec `passHref` (codemod + fix manuel) |
| `components/ActionsFooter.tsx` | 4 `Link` (codemod) |
| `pages/index.tsx` | 1 `Link` avec `passHref` (fix manuel) |
| `components/Sheet.tsx` | Vérifier `next/image` — probablement ok tel quel |

### 6.3 Fichiers à créer

| Fichier | Contenu |
|---------|---------|
| `pages/api/auth/[...nextauth].ts` | Config NextAuth (section 5.2) |
| `lib/db.ts` | Helper layer DB (section 4.3) |
| `lib/auth-adapter.ts` | Adapter PostgreSQL custom — **obligatoire** (doit retourner `isAdmin` dans l'objet `User`) |
| `types/next-auth.d.ts` | Module augmentation TypeScript pour `Session` et `User` (section 5.1) |
| `next.config.js` | Config SWC + styled-components (section 5bis.1) |
| `migrations/TIMESTAMP_init-schema.js` | Migration initiale — tables NextAuth + tables applicatives + index + constraints (section 3) |

---

## 6bis. Détail des réécritures par route

Chaque route remplace le boilerplate Fauna par un appel à `db.*`. Le SQL est encapsulé dans `lib/db.ts` (section 4.3).

> **Important** : préserver les appels Pusher (`updateOnSheets`, `updateOnSheet`) dans les routes qui les utilisent. Le `delete.ts` actuel n'a PAS de call Pusher (contrairement aux autres routes) — ne pas en inventer un.

> **Important** : les routes qui reçoivent `appId` dans le body doivent le stripper avant de passer les données à `db.*`. Le code actuel fait `delete data.appId`.

> **Important** : les wrappers `{ characters, failed }` et `{ data, failed }` utilisés par `getStaticPaths`/`getStaticProps` doivent être préservés dans les fonctions exportées (`fetchVampireFromDB`, `fetchOneVampire`), ou ces fonctions doivent être réécrites pour retourner directement depuis `db.*` avec adaptation des 3 fichiers consommateurs.

### 6bis.1 `POST /api/vampires/create`

```typescript
// AVANT
const client = new faunadb.Client({ secret });
const id = body.id || 'aaaaaaaa'; // ID généré côté client (uuid)
await client.query(q.Create(q.Collection('vampires'), { data: { ...body, id } }));

// APRÈS
import { db } from '../../../lib/db';

const session = await getServerSession(req, res, authOptions);
const { appId, ...vampireData } = JSON.parse(req.body);
// L'ID est généré par PostgreSQL, pas côté client
const id = await db.vampires.create(vampireData, session.user.id);
// Pusher : updateOnSheets(appId)
res.status(200).json({ id });
```

### 6bis.2 `GET /api/vampires` (liste)

```typescript
// AVANT — fetch tout + filtre côté app
const dbs = await client.query(q.Map(q.Paginate(q.Match(q.Index('all_vampires_full'))), (ref) => q.Get(ref)));
const filtered = dbs.data.filter((v) => !v.data.privateSheet || ...);

// APRÈS — filtre côté SQL
const session = await getServerSession(req, res, authOptions);
const vampires = await db.vampires.list(session?.user?.id, session?.user?.isAdmin);
// Garder le wrapper pour les consommateurs (getStaticPaths, index.tsx)
res.status(200).json({ characters: vampires, failed: false });
```

### 6bis.3 `GET /api/vampires/[id]`

```typescript
// AVANT — aucun check d'accès (faille existante)
const dbs = await client.query(q.Map(q.Paginate(q.Match(q.Index('one_vampire'), id)), (ref) => q.Get(ref)));
return dbs.data[0].data;

// APRÈS — vérification privateSheet + droits
const vampire = await db.vampires.findById(String(id));
if (!vampire) return res.status(404).json({ error: 'not found' });

if (vampire.privateSheet) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'unauthorized' });
  if (!(await db.vampires.isEditorOrViewer(String(id), session.user.id, session.user.isAdmin))) {
    return res.status(403).json({ error: 'forbidden' });
  }
}
```

> **Note :** C'est un fix — le code Fauna actuel ne vérifie pas les droits sur cette route. N'importe qui connaissant l'ID peut lire une fiche privée.

### 6bis.4 `PUT /api/vampires/[id]/update`

```typescript
// AVANT
const vampire = await client.query(q.Map(...));
if (!vampire.data[0].data.editors.includes(user.sub)) return res.status(403)...;
await client.query(q.Replace(vampire.data[0].ref, { data }));

// APRÈS
const { appId, ...vampireData } = JSON.parse(req.body); // Stripper appId
if (!(await db.vampires.isEditor(id, session.user.id, session.user.isAdmin))) return res.status(403)...;
await db.vampires.update(id, vampireData); // Sync data + editors + viewers dans une transaction
// Pusher : updateOnSheet(id, appId)
```

### 6bis.5 `PATCH /api/vampires/[id]/update_partial`

```typescript
// APRÈS — merge JSONB natif PostgreSQL + sync junction tables si editors/viewers présents
const { appId, ...partialData } = JSON.parse(req.body); // Stripper appId
if (!(await db.vampires.isEditor(id, session.user.id, session.user.isAdmin))) return res.status(403)...;
await db.vampires.updatePartial(id, partialData);
// Pusher : updateOnSheet(id, appId)
```

### 6bis.6 `DELETE /api/vampires/[id]/delete`

```typescript
// APRÈS
if (!(await db.vampires.isEditor(id, session.user.id, session.user.isAdmin))) return res.status(403)...;
await db.vampires.delete(id);
// Note : le code actuel n'a PAS de call Pusher sur delete — ne pas en ajouter sauf besoin explicite
```

Le `ON DELETE CASCADE` sur les tables de jointure nettoie `vampire_editors` et `vampire_viewers` automatiquement.

### 6bis.7 `GET /api/users`

```typescript
// AVANT
const dbs = await client.query(q.Map(q.Paginate(q.Match(q.Index('all_users'))), (ref) => q.Get(ref)));
return dbs.data.map((e) => pick(e.data, [...]));

// APRÈS — ne retourne que id, name, image (pas d'email)
const session = await getServerSession(req, res, authOptions);
if (!session) return res.status(401).json({ error: 'unauthorized' });
const users = await db.users.findAllPublic();
```

> **Note :** Cette route sert au picker editors/viewers dans `ConfigAccessSection`. La response shape change : `sub` → `id`, `picture` → `image`. `ConfigAccessSection` doit adapter ses 8 refs à `user.sub`.

---

## 7. Étapes de migration

> **Principe** : chaque phase produit une app testable. On peut vérifier que tout fonctionne avant de passer à la suite.
>
> **Exception** : Phase 1 (auth) seule produit une app en lecture seule — les `user.id` NextAuth ne matchent pas les `sub` Fauna. Ne pas déployer Phase 1 seule en prod. Phases 1 + 2 doivent être déployées ensemble.

### Phase 0 : Setup infra + dépendances (30 min)

On commence par le provisioning sans toucher au code.

1. **Provisionner Vercel Postgres** dans le dashboard Vercel (Storage -> Create -> Postgres)
2. **Créer un compte Resend** + vérifier le domaine d'envoi (DNS SPF/DKIM pour les magic links email)
3. **Créer une app OAuth GitHub** (Settings -> Developer settings -> OAuth Apps)
   - Callback URL : `https://<ton-domaine>/api/auth/callback/github`
   - (ou `http://localhost:3000/api/auth/callback/github` en dev)
4. Installer les dépendances :
   ```bash
   yarn add @vercel/postgres next-auth resend
   yarn add -D node-pg-migrate
   yarn remove faunadb @auth0/nextjs-auth0 uuid @types/uuid
   ```
5. Créer la migration initiale + appliquer :
   ```bash
   npx node-pg-migrate create init-schema
   # écrire le schema (section 3) dans le fichier — inclure les index et les CHECK constraints
   npx node-pg-migrate up
   ```
6. Ajouter les scripts dans `package.json` :
   ```json
   "migrate:up": "node-pg-migrate up",
   "migrate:down": "node-pg-migrate down",
   "migrate:create": "node-pg-migrate create",
   "build": "node -e \"if(process.env.VERCEL_ENV!=='preview'){require('child_process').execSync('npx node-pg-migrate up',{stdio:'inherit'})}\" && next build"
   ```
7. Préparer `.env.sample` avec les nouvelles variables (cf. section 8)

### Phase 1 : Auth — NextAuth (30 min)

On remplace Auth0 par NextAuth **sur Next 12**. L'app peut à nouveau se connecter.

1. Créer `types/next-auth.d.ts` (section 5.1) — module augmentation obligatoire
2. Créer `lib/auth-adapter.ts` — adapter custom qui retourne `isAdmin` dans `User`
3. Créer `pages/api/auth/[...nextauth].ts` (section 5.2)
4. Supprimer `pages/api/auth/[...auth0].ts`
5. Réécrire `pages/_app.tsx` : `UserProvider` → `SessionProvider`
6. Réécrire `contexts/MeContext.tsx` (section 5.4) — exporte `useMe()`
7. Réécrire `components/Nav.tsx` :
   - `/api/auth/login?return=...` → `signIn(undefined, { callbackUrl: returnTo })`
   - `/api/auth/logout` → `signOut()`
   - `data.picture` → `me.image`
   - Supprimer l'import `UserProfile` de `@auth0/nextjs-auth0`
8. Mettre à jour `contexts/ModeContext.tsx` : **4 `me.sub` → `me.id`** (lignes 37, 40, 45, 48)
9. Mettre à jour `components/ActionsFooter.tsx` : `me.sub` → `me.id` (ligne 263)
10. Mettre à jour `types/MeType.ts` et `types/UserType.ts` (section 5.6)
11. Supprimer `hooks/useMe.ts` (dead code — SWR call vers `/api/me` qui n'existe pas)

### Phase 2 : DB — Helper + API routes (1-2h)

On remplace FaunaDB par PostgreSQL **sur Next 12**. L'app est entièrement fonctionnelle.

1. Créer `lib/db.ts` (section 4.3)
2. Réécrire les 7 routes API (section 6bis). Pour chaque fichier :
   - Remplacer `import faunadb` par `import { db } from '../../lib/db'`
   - Remplacer `getSession` / `withApiAuthRequired` par `getServerSession(req, res, authOptions)`
   - Remplacer les appels FQL par des appels `db.*`
   - `user.sub` → `session.user.id`
   - Passer `session.user.isAdmin` aux helpers `isEditor()` / `list()`
   - **Stripper `appId` du body** avant de passer à `db.*`
   - **Préserver les appels Pusher** (`updateOnSheets`, `updateOnSheet`) — sauf `delete.ts` qui n'en a pas
   - **Préserver les wrappers** `{ characters, failed }` / `{ data, failed }` pour `getStaticPaths`/`getStaticProps`
3. Réécrire `pages/new.tsx` :
   - Supprimer `import { v4 as uuid } from 'uuid'`
   - Ne plus générer l'ID côté client
   - POST → attendre `{ id }` de la réponse → `router.push(`/vampires/${id}`)`
4. Remplacer `uuid()` → `crypto.randomUUID()` dans les 6 contexts :
   - `AdvFlawContext.tsx`, `DisciplinesContext.tsx`, `LanguagesContext.tsx`
   - `HumanMagicContext.tsx`, `AbilitiesContext.tsx`, `SystemContext.tsx`
5. Côté front : supprimer tous les fallback `|| ['github|3338913']` dans :
   - `pages/vampires/[id].tsx`
   - `pages/vampires/[id]/config.tsx`
   - `components/SheetActionsFooter.tsx`
   - Remplacer par `me.isAdmin || editors.includes(me.id)`
6. Adapter `contexts/AccessesContext.tsx` : les identifiants passent de `user.sub` à `user.id`
7. Adapter `components/config/ConfigAccessSection.tsx` : **8 `user.sub` → `user.id`**
8. Adapter `pages/index.tsx` : importe `fetchVampireFromDB` → utiliser `db.vampires.list()`
9. Adapter `pages/vampires/[id].tsx` et `pages/vampires/[id]/config.tsx` : `getStaticPaths`/`getStaticProps` utilisent `fetchVampireFromDB`/`fetchOneVampire` → adapter

### Phase 2.5 : Se mettre admin (2 min)

Après le premier login, passer ton user en admin :
```sql
UPDATE users SET is_admin = true WHERE email = 'ton@email.com';
```

> Idéalement, scripter ça pour ne pas l'oublier.

### Phase 3 : Upgrade Next.js 12 → 14 (20 min)

L'app fonctionne déjà sur la nouvelle stack. On peut vérifier l'upgrade isolément.

1. Supprimer `.babelrc` + `babel-plugin-styled-components` :
   ```bash
   rm .babelrc
   yarn remove babel-plugin-styled-components
   ```
2. Créer `next.config.js` (le fichier n'existe pas actuellement) :
   ```javascript
   module.exports = {
     compiler: {
       styledComponents: true,
     },
   };
   ```
3. Upgrade les packages :
   ```bash
   yarn add next@14 eslint-config-next@14
   yarn add -D typescript@5 @types/react@18.2 @types/node@20
   yarn add swr@2
   ```
4. Lancer les codemods automatiques :
   ```bash
   npx @next/codemod@latest new-link .           # Fix <Link><a> → <Link>
   npx @next/codemod@latest next-image-to-legacy-image .  # Fix next/image (si besoin)
   ```
5. Corriger manuellement les ~4 cas `passHref` + styled-component `as="a"` :
   - `components/Nav.tsx` : logout link + home "Personnages" link
   - `pages/index.tsx` : title link
   - Supprimer `passHref`, supprimer `as="a"` sur le styled-component
6. `yarn build` — vérifier que ça compile
7. `yarn dev` — vérifier visuellement que rien n'est cassé (en particulier styled-components sans `.babelrc`)

### Phase 4 : Nettoyage (15 min)

1. Supprimer `FAUNADB_SECRET_KEY`, `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` des env vars Vercel
2. Ajouter `NEXTAUTH_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
3. Supprimer les deps mortes :
   ```bash
   yarn remove node-fetch unfetch
   ```
4. Mettre à jour `.env.sample`
5. Mettre à jour `CLAUDE.md`
6. Nettoyer `helpers/fetcher.ts` : la fonction `host()` utilise `process.env.NOW_GITHUB_ORG` (legacy Zeit/Now) — dead code

---

## 8. Env vars

### À supprimer
```
FAUNADB_SECRET_KEY
AUTH0_DOMAIN
AUTH0_CLIENT_ID
AUTH0_CLIENT_SECRET
BASE_URL                     # À auditer — possiblement dead code (utilisé par Auth0 ?)
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

Les fonctions `fetchVampireFromDB()` et `fetchOneVampire()` sont appelées au build time et dans ISR. Elles importent directement le client Fauna. Il faut les réécrire pour utiliser `db.vampires.list()` et `db.vampires.findById()`.

`@vercel/postgres` fonctionne sans problème dans `getStaticProps` / `getServerSideProps`.

**Fichiers impactés** : `pages/vampires/[id].tsx`, `pages/vampires/[id]/config.tsx`, `pages/index.tsx`.

**Return shapes** : les consommateurs (`getStaticPaths`, `getStaticProps`, `pages/index.tsx`) attendent :
- `fetchVampireFromDB()` → `{ characters: Array<{key, name}>, failed: boolean }`
- `fetchOneVampire(id)` → `{ data: VampireType, failed: boolean }`

`db.vampires.list()` retourne `VampireListItem[]` et `db.vampires.findById()` retourne `VampireType | null`. Soit wrapper les résultats dans les fonctions exportées, soit adapter les 3 fichiers consommateurs. **La seconde option est plus propre** — supprimer les wrappers `{ failed }` et gérer les erreurs avec try/catch.

### JSONB et typage

`@vercel/postgres` retourne les colonnes JSONB déjà parsées (pas besoin de `JSON.parse`). Le helper `rowToVampire()` dans `lib/db.ts` centralise le cast vers `VampireType`. Un seul endroit à maintenir.

> **Note** : `VampireRow.data` est typé comme `Omit<VampireType, ...>` mais à runtime c'est un `any` venant de `@vercel/postgres`. Le type est de la documentation, pas de l'enforcement. Acceptable avec `strict: false`.

### SQL injection

Tout le SQL est centralisé dans `lib/db.ts`. S'assurer que chaque valeur passe par les tagged templates `sql\`...\`` et **jamais** par interpolation de string. Revue de code obligatoire sur ce fichier.

### Transactions avec `@vercel/postgres`

**NE PAS** faire :
```typescript
await sql`BEGIN`;
await sql`INSERT ...`;  // Peut aller sur une autre connexion !
await sql`COMMIT`;
```

**FAIRE** :
```typescript
const client = await pgDb.connect();
try {
  await client.sql`BEGIN`;
  await client.sql`INSERT ...`;
  await client.sql`COMMIT`;
} catch (e) {
  await client.sql`ROLLBACK`;
  throw e;
} finally {
  client.release();
}
```

### Taille des payloads

Les update full envoient tout le personnage. Avec Fauna c'était un `Replace` atomique. Avec `UPDATE SET data = ...`, c'est pareil — pas de changement de comportement.

### Concurrence (Pusher)

Plusieurs utilisateurs peuvent éditer en même temps. Le pattern actuel est "last write wins" (pas de conflit resolution). PostgreSQL se comporte pareil — pas de régression.

### Update partiel et merge JSONB

L'opérateur `||` de PostgreSQL fait un merge shallow de JSONB. Si `update_partial` envoie `{ infos: { name: "New" } }`, ça **remplace** tout l'objet `infos`, pas juste le champ `name`. C'est le même comportement que le `q.Update()` de Fauna (merge au premier niveau). Vérifier que le front envoie des sous-objets complets, pas des champs individuels.

### Triggers Pusher dans les routes API

Les routes `create`, `update`, `update_partial` appellent des fonctions Pusher (`updateOnSheets`, `updateOnSheet`). La route `delete` n'a PAS de call Pusher dans le code actuel. Ces side-effects doivent être préservés tels quels lors de la réécriture.

### Links `passHref` avec styled-components

4 `Link` dans le code utilisent `passHref` avec un styled-component `as="a"`. Le codemod `new-link` ne les gère pas. Fichiers : `Nav.tsx` (2), `index.tsx` (1), potentiellement `ActionsFooter.tsx`. Correction manuelle requise.

### Preview deployments Vercel

Les preview deployments utilisent les mêmes env vars par défaut. Le script build inclut un guard (`VERCEL_ENV !== 'preview'`) pour éviter d'exécuter les migrations contre la DB de production. Idéalement, configurer une DB séparée pour les previews dans le dashboard Vercel.

### ISR et cold starts Neon

`getStaticPaths` appelle la DB au build time, et ISR (`revalidate: 1`) revalide chaque seconde. Avec le free tier Neon, attention aux limites de connexions et à la latence de cold start (~200ms). Pas bloquant mais à monitorer.

---

## 10. Estimation de l'effort

### Vue d'ensemble

| Phase | Effort | Complexité | Risque |
|-------|--------|------------|--------|
| **Phase 0** — Setup infra (Vercel Postgres + deps + OAuth app) | ~30 min | Faible | Faible |
| **Phase 1** — Auth NextAuth (config, contexts, nav, types, ModeContext) | ~45 min | Faible-Moyenne | Faible |
| **Phase 2** — DB helper + réécriture des 7 API routes + front + uuid | ~2h | Moyenne | Moyen |
| **Phase 2.5** — Se mettre admin | ~2 min | Faible | Faible |
| **Phase 3** — Next.js 12 → 14 (.babelrc, SWC, codemods, passHref fixes) | ~30 min | Faible | Faible |
| **Phase 4** — Nettoyage (env vars, docs, dead deps) | ~15 min | Faible | Faible |
| Tests manuels end-to-end | ~1h | - | - |
| **Total** | **~5h** | | |

### Détail par fichier

**Fichiers nouveaux :**

| Fichier | Effort | Notes |
|---------|--------|-------|
| `lib/db.ts` | 45 min | Le gros du travail. Transactions avec `db.connect()`. Revue sécurité obligatoire |
| `pages/api/auth/[...nextauth].ts` | 15 min | Config NextAuth + providers |
| `lib/auth-adapter.ts` | 20 min | Adapter custom **obligatoire** (doit retourner `isAdmin`) |
| `types/next-auth.d.ts` | 5 min | Module augmentation `Session` + `User` |
| `next.config.js` | 2 min | Config SWC styledComponents |
| `migrations/XXXX_init-schema.js` | 10 min | Schema complet + index + CHECK constraints |

**Routes API (DB + auth) :**

| Fichier | Effort | Notes |
|---------|--------|-------|
| `pages/api/vampires/create.ts` | 15 min | Retourne `{ id }` (généré par PG). Garder Pusher. |
| `pages/api/vampires.ts` | 10 min | `db.vampires.list`. Préserver wrapper `{ characters }`. |
| `pages/api/vampires/[id].ts` | 10 min | + ajouter check accès fiches privées. Préserver wrapper `{ data }`. |
| `pages/api/vampires/[id]/update.ts` | 10 min | Sync junction tables via transaction. Stripper `appId`. Garder Pusher. |
| `pages/api/vampires/[id]/update_partial.ts` | 10 min | Sync junction tables si présents. Stripper `appId`. Garder Pusher. |
| `pages/api/vampires/[id]/delete.ts` | 5 min | Pas de Pusher (n'existe pas dans le code actuel) |
| `pages/api/users.ts` | 5 min | `db.users.findAllPublic()` + session check |

**Frontend auth + uuid :**

| Fichier | Effort | Notes |
|---------|--------|-------|
| `pages/_app.tsx` | 5 min | `UserProvider` → `SessionProvider` |
| `contexts/MeContext.tsx` | 10 min | Réécriture avec `useSession()`, exporte `useMe()` |
| `contexts/ModeContext.tsx` | 5 min | **4 `me.sub` → `me.id`** — critique, manqué avant |
| `contexts/AccessesContext.tsx` | 5 min | Renommer paramètres `sub` → `id` |
| `components/Nav.tsx` | 10 min | `signIn`/`signOut` + `picture`→`image` + supprimer `UserProfile` import |
| `components/ActionsFooter.tsx` | 5 min | `me.sub` → `me.id` |
| `components/config/ConfigAccessSection.tsx` | 10 min | **8 `user.sub` → `user.id`** |
| `types/MeType.ts` | 5 min | Simplification |
| `types/UserType.ts` | 5 min | `sub`/`nickname`/`picture` → `id`/`image` |
| `pages/new.tsx` | 10 min | Changer le flow : POST → attendre `{ id }` → redirect |
| `pages/index.tsx` | 5 min | Adapter `fetchVampireFromDB` + fix Link `passHref` |
| 6 contexts (uuid) | 10 min | Search-replace `uuid()` → `crypto.randomUUID()` |

**Fichiers à supprimer :**

| Fichier | Notes |
|---------|-------|
| `hooks/useMe.ts` | Dead code (SWR call vers `/api/me` inexistant) |
| `pages/api/auth/[...auth0].ts` | Remplacé par `[...nextauth].ts` |
| `.babelrc` | Bloque SWC — remplacé par `next.config.js` `compiler.styledComponents` |

### Ce qui demande de l'attention

| Point | Détail | Impact |
|-------|--------|--------|
| **`ModeContext.tsx`** | 4 refs `me.sub` non listées dans les versions précédentes du plan. Sans fix, tous les sheets sont read-only. | **CRITIQUE** |
| **Transactions `db.connect()`** | `sql\`BEGIN\`` sur des connexions poolées ne fonctionne pas. `create`, `update`, `updatePartial` doivent utiliser `db.connect()`. | **CRITIQUE** |
| **Junction tables sync** | `update` et `updatePartial` doivent sync `vampire_editors`/`vampire_viewers`. Sans ça, les changements d'accès sont silencieusement perdus. | **CRITIQUE** |
| **`.babelrc` bloque SWC** | `compiler.styledComponents` est ignoré si `.babelrc` existe. Supprimer `.babelrc` en Phase 3. | **CRITIQUE** |
| **`Nav.tsx` `data.picture`** | Doit devenir `me.image`. L'import `UserProfile` de `@auth0` cassera la compilation. | **CRITIQUE** |
| **`types/next-auth.d.ts`** | Sans module augmentation, `session.user.id` et `isAdmin` sont `undefined` partout. L'adapter custom est obligatoire. | **HAUT** |
| **Return shapes** | `fetchVampireFromDB` retourne `{ characters, failed }`, `db.vampires.list()` retourne un array. Adapter les consommateurs ou wrapper. | **HAUT** |
| **`ConfigAccessSection`** | 8 refs `user.sub` → `user.id`. Response `/api/users` change aussi. | **HAUT** |
| **`appId` dans le body** | Les routes update doivent stripper `appId` avant `db.*`. Le code actuel fait `delete data.appId`. | **MOYEN** |
| **Merge JSONB shallow** | `data \|\| patch` merge au premier niveau seulement | **MOYEN** |
| **Links `passHref`** | 4 cas non gérés par le codemod | **FAIBLE** |
| **Callback URL NextAuth** | L'OAuth app GitHub doit avoir le bon callback URL | Bloquant si mal configuré |

---

## 11. Résumé des dépendances

### À upgrader
```json
{
  "next": "12.2.3 → 14.x",
  "eslint-config-next": "12.2.3 → 14.x",
  "swr": "1.3 → 2.x"
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
  "pg": "^8.x",
  "next-auth": "^4.x",
  "nodemailer": "^8.x",
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
  "@auth0/nextjs-auth0": "^1.9.1",
  "uuid": "^8.3.2",
  "@types/uuid": "*",
  "babel-plugin-styled-components": "*",
  "node-fetch": "^3.2.9",
  "unfetch": "^4.2.0"
}
```

---

## Journal des déviations

### Phase 0 (2026-03-16)

- **Deps déjà installées** : `@vercel/postgres`, `next-auth`, `resend` étaient déjà dans `package.json` — pas de `yarn add` nécessaire.
- **Suppression des anciennes deps différée** : `faunadb`, `@auth0/nextjs-auth0`, `uuid`, `@types/uuid` restent installées car 19+ fichiers les importent encore. Suppression prévue fin Phase 2.
- **Scripts migrate** : ajout de `--database-url-var POSTGRES_URL` aux scripts `migrate:up` et `migrate:down` (le doc original ne le mentionnait pas explicitement).
- **Fix temporaire `/`** : `fetchVampireFromDB` dans `pages/api/vampires.ts` est stubbé pour retourner `{ characters: [], failed: false }` — FaunaDB est mort, la page d'accueil crashait sur `.sort()` d'un `undefined`. Ajout d'un fallback `data?.characters ?? []` dans `pages/index.tsx` par sécurité.
- **`node-pg-migrate` v8** : installé en v8.0.4 (le doc mentionnait v7.x).

### Phase 1 (2026-03-16)

- **`@vercel/postgres` remplacé par `pg`** : `@vercel/postgres` utilise le driver Neon (WebSocket) qui ne peut pas se connecter à un PostgreSQL local. Remplacé par `pg` (node-postgres) qui fonctionne partout (local, Vercel/Neon, n'importe quel hébergeur). `@vercel/postgres` a été désinstallé. Impact : `lib/auth-adapter.ts` utilise `Pool` de `pg` avec des parameterized queries (`$1`, `$2`, ...) au lieu des tagged templates `` sql`...` ``. Le `lib/db.ts` prévu en Phase 2 devra aussi utiliser `pg`.
- **`nodemailer` ajouté** : peer dependency obligatoire de `next-auth/providers/email`, non mentionnée dans le plan.
- **Pas de `pages` custom NextAuth** : le plan de migration mentionnait des pages custom (`/auth/signin`, `/auth/verify`). Non implémentées en Phase 1 — on utilise les pages par défaut NextAuth. À ajouter plus tard si besoin.
- **`pg` déjà en devDependencies** : `pg` était déjà présent en devDependencies (pour `node-pg-migrate`). Déplacé en dependencies.

### Phase 2 (2026-03-16)

- **Pool partagé `lib/pool.ts`** : créé un module pool dédié avec config serverless (`max: 1`, `idleTimeoutMillis: 10_000`, `connectionTimeoutMillis: 5_000`). `lib/auth-adapter.ts` utilise maintenant ce pool partagé au lieu de créer le sien. Évite le double pool (auth + app) qui pouvait épuiser les connexions Neon.
- **`lib/db.ts` utilise `pg`** (pas `@vercel/postgres`) : conformément à la déviation Phase 1. Toutes les requêtes utilisent `pool.query('...', [params])` avec parameterized queries.
- **Helper `withTransaction`** : ajouté dans `lib/db.ts` pour éliminer le boilerplate BEGIN/COMMIT/ROLLBACK. Utilisé par `create`, `update`, `updatePartial`.
- **`updatePartial` toujours transactionnel** : le plan original ne mettait en transaction que si des junction tables étaient touchées. Changé pour toujours utiliser une transaction (cohérence garantie).
- **Réponse `create` changée** : `{ result: 'ok' }` → `{ id }` pour que `pages/new.tsx` puisse récupérer l'UUID généré par PostgreSQL.
- **Sécurité `[id].ts`** : ajout du check privateSheet + isEditorOrViewer dans le handler API (faille existante corrigée). `fetchOneVampire` reste sans auth pour fonctionner avec ISR/getStaticProps.
- **`lodash` conservé** : le plan initial prévoyait de le supprimer, mais il est utilisé dans 3 autres fichiers (`ConfigAccessSection.tsx`, `ModificationsContext.tsx`, `useScroll.ts`). Seul `lodash.pick` a été retiré de `pages/api/users.ts`.
- **UUID validation** : `db.vampires.findById` catch l'erreur PG `22P02` (invalid UUID format) et retourne `null` au lieu de laisser un 500.

### Phase 3 (2026-03-16)

- **`@types/react` non upgradé à 18.2** : `@types/react@18.2.x` est incompatible avec `@types/styled-components@5.1.25` (erreurs de types `ReactNode`/`ReactPortal`). Conservé `@types/react@18.0.15`. `@types/styled-components@5.1.34` corrige certaines erreurs mais en introduit d'autres (`children` non reconnu sur les styled components). Les types seront à réaligner lors de la migration vers styled-components v6 ou une autre solution CSS-in-JS.
- **`@types/node` upgradé à 20.x** et **`typescript` upgradé à 5.9** : aucun problème de compatibilité.
- **SWR 2.x** : migration transparente, aucun changement de code nécessaire.
