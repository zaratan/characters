import { PoolClient } from 'pg';
import pool from './pool';
import { VampireType } from '../types/VampireType';
import {
  deepMerge,
  filterUserIds,
  rowToVampire,
  vampireToRow,
} from './db-helpers';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (_) {
      /* swallow rollback error to preserve original */
    }
    throw err;
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// db.vampires
// ---------------------------------------------------------------------------

const vampires = {
  async list(
    userId?: string,
    isAdmin?: boolean
  ): Promise<Array<{ key: string; name: string }>> {
    if (isAdmin) {
      const result = await pool.query<{ id: string; name: string }>(`
        SELECT id, data->'infos'->>'name' AS name
        FROM vampires
        ORDER BY data->'infos'->>'name'
      `);
      return result.rows.map((row) => ({ key: row.id, name: row.name }));
    }

    if (userId) {
      const result = await pool.query<{ id: string; name: string }>(
        `
        SELECT DISTINCT v.id, v.data->'infos'->>'name' AS name
        FROM vampires v
        LEFT JOIN vampire_editors ve ON ve.vampire_id = v.id AND ve.user_id = $1
        LEFT JOIN vampire_viewers vv ON vv.vampire_id = v.id AND vv.user_id = $1
        WHERE v.private_sheet = false OR ve.user_id IS NOT NULL OR vv.user_id IS NOT NULL
        ORDER BY v.data->'infos'->>'name'
        `,
        [userId]
      );
      return result.rows.map((row) => ({ key: row.id, name: row.name }));
    }

    // Build-time / unauthenticated: only public sheets.
    const result = await pool.query<{ id: string; name: string }>(`
      SELECT id, data->'infos'->>'name' AS name
      FROM vampires
      WHERE private_sheet = false
      ORDER BY data->'infos'->>'name'
    `);
    return result.rows.map((row) => ({ key: row.id, name: row.name }));
  },

  async findById(id: string): Promise<VampireType | null> {
    try {
      const result = await pool.query(
        `
        SELECT
          v.id,
          v.private_sheet,
          v.data,
          COALESCE(
            (SELECT json_agg(ve.user_id) FROM vampire_editors ve WHERE ve.vampire_id = v.id),
            '[]'::json
          ) AS editors,
          COALESCE(
            (SELECT json_agg(vv.user_id) FROM vampire_viewers vv WHERE vv.vampire_id = v.id),
            '[]'::json
          ) AS viewers
        FROM vampires v
        WHERE v.id = $1
        `,
        [id]
      );

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return rowToVampire(row, row.editors, row.viewers);
    } catch (err: any) {
      // PostgreSQL error 22P02 = invalid_text_representation (bad UUID format).
      if (err?.code === '22P02') return null;
      throw err;
    }
  },

  async create(vampire: any, creatorUserId: string): Promise<string> {
    return withTransaction(async (client) => {
      const { privateSheet, data } = vampireToRow(vampire);

      const insertResult = await client.query(
        `
        INSERT INTO vampires (private_sheet, data)
        VALUES ($1, $2::jsonb)
        RETURNING id
        `,
        [privateSheet, data]
      );

      const newId: string = insertResult.rows[0].id;

      await client.query(
        `
        INSERT INTO vampire_editors (vampire_id, user_id)
        VALUES ($1, $2)
        `,
        [newId, creatorUserId]
      );

      return newId;
    });
  },

  async update(id: string, vampire: any): Promise<void> {
    return withTransaction(async (client) => {
      const { privateSheet, editors, viewers, data } = vampireToRow(vampire);

      await client.query(
        `
        UPDATE vampires
        SET data = $1::jsonb,
            private_sheet = $2,
            updated_at = now()
        WHERE id = $3
        `,
        [data, privateSheet, id]
      );

      await client.query('DELETE FROM vampire_editors WHERE vampire_id = $1', [
        id,
      ]);
      const safeEditors = filterUserIds(editors);
      for (const userId of safeEditors) {
        await client.query(
          'INSERT INTO vampire_editors (vampire_id, user_id) VALUES ($1, $2)',
          [id, userId]
        );
      }

      await client.query('DELETE FROM vampire_viewers WHERE vampire_id = $1', [
        id,
      ]);
      const safeViewers = filterUserIds(viewers);
      for (const userId of safeViewers) {
        await client.query(
          'INSERT INTO vampire_viewers (vampire_id, user_id) VALUES ($1, $2)',
          [id, userId]
        );
      }
    });
  },

  async updatePartial(id: string, partial: any): Promise<void> {
    return withTransaction(async (client) => {
      const {
        editors,
        viewers,
        privateSheet,
        appId,
        id: _id,
        ...rest
      } = partial;

      if (editors !== undefined) {
        await client.query(
          'DELETE FROM vampire_editors WHERE vampire_id = $1',
          [id]
        );
        const safeEditors = filterUserIds(editors);
        for (const userId of safeEditors) {
          await client.query(
            'INSERT INTO vampire_editors (vampire_id, user_id) VALUES ($1, $2)',
            [id, userId]
          );
        }
      }

      if (viewers !== undefined) {
        await client.query(
          'DELETE FROM vampire_viewers WHERE vampire_id = $1',
          [id]
        );
        const safeViewers = filterUserIds(viewers);
        for (const userId of safeViewers) {
          await client.query(
            'INSERT INTO vampire_viewers (vampire_id, user_id) VALUES ($1, $2)',
            [id, userId]
          );
        }
      }

      if (privateSheet !== undefined) {
        await client.query(
          'UPDATE vampires SET private_sheet = $1, updated_at = now() WHERE id = $2',
          [privateSheet, id]
        );
      }

      if (Object.keys(rest).length > 0) {
        // Read current data, deep merge, then write back.
        // PostgreSQL || does shallow merge (clobbers nested objects).
        // FaunaDB q.Update() did recursive merge — we replicate that.
        const current = await client.query(
          'SELECT data FROM vampires WHERE id = $1',
          [id]
        );
        if (current.rows.length > 0) {
          const merged = deepMerge(current.rows[0].data, rest);
          await client.query(
            `
            UPDATE vampires
            SET data = $1::jsonb,
                updated_at = now()
            WHERE id = $2
            `,
            [JSON.stringify(merged), id]
          );
        }
      }
    });
  },

  async delete(id: string): Promise<void> {
    // CASCADE on vampire_editors and vampire_viewers handles junction cleanup.
    await pool.query('DELETE FROM vampires WHERE id = $1', [id]);
  },

  async isEditor(
    vampireId: string,
    userId: string,
    isAdmin?: boolean
  ): Promise<boolean> {
    if (isAdmin) return true;

    const result = await pool.query(
      `
      SELECT 1 FROM vampire_editors
      WHERE vampire_id = $1 AND user_id = $2
      LIMIT 1
      `,
      [vampireId, userId]
    );
    return result.rows.length > 0;
  },

  async isEditorOrViewer(
    vampireId: string,
    userId: string,
    isAdmin?: boolean
  ): Promise<boolean> {
    if (isAdmin) return true;

    const result = await pool.query(
      `
      SELECT 1 FROM vampire_editors WHERE vampire_id = $1 AND user_id = $2
      UNION ALL
      SELECT 1 FROM vampire_viewers WHERE vampire_id = $1 AND user_id = $2
      LIMIT 1
      `,
      [vampireId, userId]
    );
    return result.rows.length > 0;
  },
};

// ---------------------------------------------------------------------------
// db.users
// ---------------------------------------------------------------------------

const users = {
  async findAllPublic(): Promise<
    Array<{ id: string; name: string | null; image: string }>
  > {
    const result = await pool.query<{
      id: string;
      name: string | null;
      image: string;
    }>(`
      SELECT id, name, image
      FROM users
      ORDER BY COALESCE(name, '')
    `);
    return result.rows;
  },

  async updateName(userId: string, name: string): Promise<void> {
    await pool.query(
      `UPDATE users
       SET name = $1, has_onboarded = true, updated_at = now()
       WHERE id = $2`,
      [name, userId]
    );
  },

  async isNameTaken(name: string, excludeUserId: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT 1 FROM users WHERE name = $1 AND id != $2 LIMIT 1`,
      [name, excludeUserId]
    );
    return result.rows.length > 0;
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const db = {
  vampires,
  users,
};
