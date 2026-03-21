import { Pool } from 'pg';
import base from '../../defaultData/base';
import darkAge from '../../defaultData/darkAge';
import victorian from '../../defaultData/victorian';
import vampire from '../../defaultData/vampire';
import human from '../../defaultData/human';
import ghoul from '../../defaultData/ghoul';

// ---------------------------------------------------------------------------
// Pool — lazy singleton, max 3 connections for test parallelism
// ---------------------------------------------------------------------------

let _pool: Pool | null = null;

export function getPool(): Pool {
  if (!_pool) {
    const connectionString = process.env.POSTGRES_URL || '';
    const needsSsl = connectionString.includes('sslmode');
    _pool = new Pool({
      connectionString,
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
      ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    });
  }
  return _pool;
}

export async function closePool(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}

// ---------------------------------------------------------------------------
// Character type map — mirrors create/route.ts
// ---------------------------------------------------------------------------

const TYPE: Record<number, { sections: object }> = {
  0: vampire,
  1: human,
  2: ghoul,
};

// ---------------------------------------------------------------------------
// seedUser
// ---------------------------------------------------------------------------

export type SeedUserOptions = {
  name?: string;
  email?: string;
  hasOnboarded?: boolean;
};

export type SeedUserResult = {
  userId: string;
  sessionToken: string;
};

export async function seedUser(
  options: SeedUserOptions = {}
): Promise<SeedUserResult> {
  const suffix = crypto.randomUUID();
  const name = options.name ?? `E2E Test User ${suffix}`;
  const email = options.email ?? `e2e-${suffix}@example.com`;
  const hasOnboarded = options.hasOnboarded ?? true;

  const pool = getPool();

  const userResult = await pool.query<{ id: string }>(
    `
    INSERT INTO users (name, email, has_onboarded, created_at, updated_at)
    VALUES ($1, $2, $3, now(), now())
    RETURNING id
    `,
    [name, email, hasOnboarded]
  );

  const userId = userResult.rows[0].id;
  const sessionToken = crypto.randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await pool.query(
    `
    INSERT INTO sessions (id, "sessionToken", "userId", expires)
    VALUES ($1, $2, $3, $4)
    `,
    [crypto.randomUUID(), sessionToken, userId, expires]
  );

  return { userId, sessionToken };
}

// ---------------------------------------------------------------------------
// seedCharacter
// ---------------------------------------------------------------------------

export type SeedCharacterOptions = {
  type?: number;
  era?: number;
  name?: string;
  privateSheet?: boolean;
};

export async function seedCharacter(
  userId: string,
  options: SeedCharacterOptions = {}
): Promise<string> {
  const type = options.type ?? 0;
  const era = options.era ?? 0;
  const name = options.name ?? `Test Character ${crypto.randomUUID()}`;
  const privateSheet = options.privateSheet ?? false;

  const eraDefaults = era === 0 ? darkAge : victorian;
  const typeDefaults = TYPE[type] ?? vampire;

  const data: any = {
    ...base,
    ...eraDefaults,
    ...typeDefaults,
    editors: [userId],
    viewers: [],
    privateSheet,
  };
  data.infos.name = name;
  data.infos.era = era;

  // Strip privateSheet and relation arrays from the JSONB data column —
  // mirrors the vampireToRow() logic used in the production code path.
  const { privateSheet: _ps, editors: _ed, viewers: _vi, ...jsonbData } = data;

  const pool = getPool();

  const insertResult = await pool.query<{ id: string }>(
    `
    INSERT INTO vampires (private_sheet, data, owner_id)
    VALUES ($1, $2::jsonb, $3)
    RETURNING id
    `,
    [privateSheet, JSON.stringify(jsonbData), userId]
  );

  const vampireId: string = insertResult.rows[0].id;

  await pool.query(
    `
    INSERT INTO vampire_editors (vampire_id, user_id)
    VALUES ($1, $2)
    `,
    [vampireId, userId]
  );

  return vampireId;
}

// ---------------------------------------------------------------------------
// cleanup
// ---------------------------------------------------------------------------

export async function cleanup(userId: string): Promise<void> {
  const pool = getPool();
  // CASCADE on sessions, vampire_editors, vampire_viewers.
  // vampires rows owned by the user are deleted via owner_id FK cascade.
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
}
