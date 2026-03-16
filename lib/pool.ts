import { Pool } from 'pg';

// Serverless-optimized config.
// POSTGRES_URL pointe vers le pgbouncer pooler de Neon (Vercel Postgres).
// max:1 car chaque instance serverless Vercel gère une requête à la fois.
// pgbouncer transaction mode : pas de SET session-level cross-query.
// SSL requis pour Neon en prod (la connection string inclut ?sslmode=require).
// En local, pas de SSL — on détecte via la présence de 'sslmode' dans l'URL.
const connectionString = process.env.POSTGRES_URL || '';
const needsSsl = connectionString.includes('sslmode');

const pool = new Pool({
  connectionString,
  max: 1,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
  ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
});

export default pool;
