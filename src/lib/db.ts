import { Pool, type QueryResultRow } from "pg";

/**
 * Server-only Postgres access via `pg`.
 * The pool is created lazily on first query so importing this module never
 * connects and never crashes the build when DATABASE_URL is absent.
 *
 * SECURITY: never import this from a Client Component. Route handlers and
 * `src/lib/queries.ts` (used by server components) are the only consumers.
 *
 * CONNECTION LIMITS: on Vercel every warm serverless instance holds its own
 * pool, so the real ceiling is `max` x instance count, not `max`. A double-digit
 * `max` exhausts the Postgres connection limit under mild traffic. Keep `max`
 * small and let the provider's pooler (Neon's `-pooler` host) do the real
 * multiplexing — DATABASE_URL must point at the POOLED endpoint in production.
 */

// Serverless: many instances x small pool. Long-lived server: one instance, so
// allow a wider pool since nothing else is competing for connections.
const MAX_CONNECTIONS = process.env.VERCEL ? 3 : 10;

let pool: Pool | null = null;

function getPool(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.",
    );
  }
  pool = new Pool({
    connectionString,
    max: MAX_CONNECTIONS,
    // Release idle connections quickly so a frozen instance stops holding a
    // slot it isn't using. Neon also closes idle connections on its own.
    idleTimeoutMillis: 10_000,
    // Fail fast instead of hanging a request for the default 0 (no timeout)
    // when the pooler is saturated or the DB is unreachable.
    connectionTimeoutMillis: 10_000,
  });
  // A pool with no error handler crashes the process when the provider drops an
  // idle connection (Neon scales to zero, so this is routine, not exceptional).
  pool.on("error", (err) => {
    console.error("[db] idle client error", err.message);
  });
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const res = await getPool().query<T>(text, params ?? []);
  return res.rows;
}

export async function one<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** Run multiple statements in a single transaction. */
export async function withTransaction<T>(
  fn: (client: import("pg").PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
