import { Pool } from 'pg';

// POSTGRES_URL pointe vers le pgbouncer pooler de Neon (Vercel Postgres) en prod.
// pgbouncer transaction mode : pas de SET session-level cross-query.
// SSL requis pour Neon en prod (la connection string inclut ?sslmode=require).
// En local, pas de SSL — on détecte via la présence de 'sslmode' dans l'URL.
//
// max: 1 en prod (serverless Vercel = une requête à la fois par instance).
// max: 5 en dev (un seul process Node pour toutes les requêtes).
const connectionString = process.env.POSTGRES_URL || '';
const needsSsl = connectionString.includes('sslmode');
const isServerless = !!process.env.VERCEL;

const pool = new Pool({
  connectionString,
  max: isServerless ? 1 : 5,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
  ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
});

export default pool;
