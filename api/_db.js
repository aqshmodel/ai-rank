import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Use standard PG environment variables like PGHOST, PGUSER, PGDATABASE, PGPASSWORD, PGPORT
// or connection string via DATABASE_URL
export const dbEnabled = Boolean(process.env.DATABASE_URL || (process.env.PGHOST && process.env.PGUSER && process.env.PGDATABASE));

export const pool = dbEnabled
  ? new Pool(
      process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL }
        : {}
    )
  : null;

if (dbEnabled) {
  pool.on('error', (err, client) => {
    console.error('[AIRANK:db_error] Unexpected error on idle client', err);
    process.exit(-1);
  });
}
