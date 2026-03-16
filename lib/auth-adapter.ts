import type {
  Adapter,
  AdapterUser,
  AdapterAccount,
  AdapterSession,
  VerificationToken,
} from 'next-auth/adapters';
import pool from './pool';

function toAdapterUser(row: any): AdapterUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    emailVerified: row.emailVerified ? new Date(row.emailVerified) : null,
    image: row.image,
    isAdmin: row.is_admin,
  } as AdapterUser;
}

export function customPgAdapter(): Adapter {
  return {
    async createUser(user) {
      const { rows } = await pool.query(
        `INSERT INTO users (name, email, "emailVerified", image)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, "emailVerified", image, is_admin`,
        [
          user.name ?? null,
          user.email,
          user.emailVerified?.toISOString() ?? null,
          user.image ?? null,
        ]
      );
      return toAdapterUser(rows[0]);
    },

    async getUser(id) {
      const { rows } = await pool.query(
        `SELECT id, name, email, "emailVerified", image, is_admin
         FROM users WHERE id = $1`,
        [id]
      );
      if (!rows[0]) return null;
      return toAdapterUser(rows[0]);
    },

    async getUserByEmail(email) {
      const { rows } = await pool.query(
        `SELECT id, name, email, "emailVerified", image, is_admin
         FROM users WHERE email = $1`,
        [email]
      );
      if (!rows[0]) return null;
      return toAdapterUser(rows[0]);
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const { rows } = await pool.query(
        `SELECT u.id, u.name, u.email, u."emailVerified", u.image, u.is_admin
         FROM users u
         JOIN accounts a ON a."userId" = u.id
         WHERE a.provider = $1 AND a."providerAccountId" = $2`,
        [provider, providerAccountId]
      );
      if (!rows[0]) return null;
      return toAdapterUser(rows[0]);
    },

    async updateUser(user) {
      const { rows } = await pool.query(
        `UPDATE users
         SET name = COALESCE($1, name),
             email = COALESCE($2, email),
             "emailVerified" = COALESCE($3, "emailVerified"),
             image = COALESCE($4, image),
             updated_at = now()
         WHERE id = $5
         RETURNING id, name, email, "emailVerified", image, is_admin`,
        [
          user.name ?? null,
          user.email ?? null,
          user.emailVerified?.toISOString() ?? null,
          user.image ?? null,
          user.id,
        ]
      );
      return toAdapterUser(rows[0]);
    },

    async linkAccount(account) {
      await pool.query(
        `INSERT INTO accounts (
           "userId", type, provider, "providerAccountId",
           refresh_token, access_token, expires_at,
           token_type, scope, id_token, session_state
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          account.userId,
          account.type,
          account.provider,
          account.providerAccountId,
          account.refresh_token ?? null,
          account.access_token ?? null,
          account.expires_at ?? null,
          account.token_type ?? null,
          account.scope ?? null,
          account.id_token ?? null,
          account.session_state ?? null,
        ]
      );
      return account as AdapterAccount;
    },

    async createSession(session) {
      const { rows } = await pool.query(
        `INSERT INTO sessions ("sessionToken", "userId", expires)
         VALUES ($1, $2, $3)
         RETURNING id, "sessionToken", "userId", expires`,
        [session.sessionToken, session.userId, session.expires.toISOString()]
      );
      const row = rows[0];
      return {
        sessionToken: row.sessionToken,
        userId: row.userId,
        expires: new Date(row.expires),
      } as AdapterSession;
    },

    async getSessionAndUser(sessionToken) {
      const { rows } = await pool.query(
        `SELECT
           s."sessionToken", s."userId", s.expires,
           u.id, u.name, u.email, u."emailVerified", u.image, u.is_admin
         FROM sessions s
         JOIN users u ON u.id = s."userId"
         WHERE s."sessionToken" = $1
           AND s.expires > now()`,
        [sessionToken]
      );
      if (!rows[0]) return null;
      const row = rows[0];
      return {
        session: {
          sessionToken: row.sessionToken,
          userId: row.userId,
          expires: new Date(row.expires),
        } as AdapterSession,
        user: toAdapterUser(row),
      };
    },

    async updateSession(session) {
      const { rows } = await pool.query(
        `UPDATE sessions
         SET expires = COALESCE($1, expires)
         WHERE "sessionToken" = $2
         RETURNING "sessionToken", "userId", expires`,
        [session.expires?.toISOString() ?? null, session.sessionToken]
      );
      if (!rows[0]) return null;
      const row = rows[0];
      return {
        sessionToken: row.sessionToken,
        userId: row.userId,
        expires: new Date(row.expires),
      } as AdapterSession;
    },

    async deleteSession(sessionToken) {
      await pool.query(`DELETE FROM sessions WHERE "sessionToken" = $1`, [
        sessionToken,
      ]);
    },

    async createVerificationToken(token) {
      const { rows } = await pool.query(
        `INSERT INTO verification_tokens (identifier, token, expires)
         VALUES ($1, $2, $3)
         RETURNING identifier, token, expires`,
        [token.identifier, token.token, token.expires.toISOString()]
      );
      const row = rows[0];
      return {
        identifier: row.identifier,
        token: row.token,
        expires: new Date(row.expires),
      } as VerificationToken;
    },

    async useVerificationToken({ identifier, token }) {
      const { rows } = await pool.query(
        `DELETE FROM verification_tokens
         WHERE identifier = $1 AND token = $2
         RETURNING identifier, token, expires`,
        [identifier, token]
      );
      if (!rows[0]) return null;
      const row = rows[0];
      return {
        identifier: row.identifier,
        token: row.token,
        expires: new Date(row.expires),
      } as VerificationToken;
    },
  };
}
