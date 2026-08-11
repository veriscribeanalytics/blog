/**
 * One-way content migration: local Postgres -> hosted Postgres (Neon).
 *
 * There is no `pg_dump` on this machine, so this does the dump/restore in Node
 * using the `pg` client the app already depends on. Cross-platform, no install.
 *
 * It deliberately does NOT run `db/seed.sql`. That file is demo content
 * (best-laptops-for-students, top-7-air-fryers, 3 categories) which does not
 * match production — running it against the live DB would pollute it with
 * placeholder posts. Real content is agent-written and lives only in the DB,
 * so the source of truth is a row copy, not the seed.
 *
 * Usage:
 *   node db/migrate-to-neon.mjs --target "postgresql://...@...neon.tech/db?sslmode=require"
 *   node db/migrate-to-neon.mjs --target "..." --apply     # actually write
 *   node db/migrate-to-neon.mjs --target "..." --apply --truncate
 *
 * Dry-run by default: it connects, applies nothing, and prints the plan.
 * Pass --apply to write. Re-running with --apply is safe (ON CONFLICT DO
 * NOTHING); use --truncate to force an exact mirror of the source.
 *
 * NOTE: pass the POOLED Neon connection string (host contains `-pooler`) as the
 * app's DATABASE_URL. For this script either endpoint works.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const HERE = dirname(fileURLToPath(import.meta.url));

// FK order: parents before children. post_products references both posts and
// products, so it must come last.
const TABLES = [
  { name: "categories", pk: "id" },
  { name: "products", pk: "id" },
  { name: "posts", pk: "id" },
  { name: "post_products", pk: null }, // composite PK, no sequence
  { name: "newsletter_subscribers", pk: "id" },
];

function parseArgs(argv) {
  const out = { apply: false, truncate: false, target: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--apply") out.apply = true;
    else if (argv[i] === "--truncate") out.truncate = true;
    else if (argv[i] === "--target") out.target = argv[++i];
  }
  return out;
}

/** Minimal .env parser — avoids adding a dotenv dependency for one script. */
function readEnvLocal(key) {
  try {
    const text = readFileSync(join(HERE, "..", ".env.local"), "utf8");
    const m = text.match(new RegExp(`^${key}=(.*)$`, "m"));
    return m ? m[1].trim().replace(/^["']|["']$/g, "") : null;
  } catch {
    return null;
  }
}

/** Redact credentials before anything reaches stdout. */
function safeHost(cs) {
  try {
    const u = new URL(cs);
    return `${u.host}${u.pathname}`;
  } catch {
    return "<unparseable connection string>";
  }
}

async function columnsOf(pool, table) {
  const { rows } = await pool.query(
    `SELECT column_name, data_type FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position`,
    [table],
  );
  return rows.map((r) => ({ name: r.column_name, type: r.data_type }));
}

/**
 * `pg` parses json/jsonb columns into JS values on read. Handing a JS array
 * straight back as a bind parameter makes `pg` serialize it as a Postgres
 * ARRAY literal (`{a,b}`), which json/jsonb rejects with "invalid input syntax
 * for type json". Re-encode so the driver sends a JSON string instead.
 *
 * Applies to posts.table_of_contents / in_this_article / faqs and
 * products.pros. Every other type (timestamptz -> Date, numeric -> string,
 * inet -> string) round-trips as-is.
 */
function encode(value, type) {
  if (value === null || value === undefined) return null;
  if (type === "json" || type === "jsonb") return JSON.stringify(value);
  return value;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const sourceUrl = readEnvLocal("DATABASE_URL");
  if (!sourceUrl) {
    console.error("No DATABASE_URL in .env.local — nothing to migrate from.");
    process.exit(1);
  }
  const targetUrl = args.target ?? process.env.NEON_DATABASE_URL ?? null;
  if (!targetUrl) {
    console.error(
      "No target. Pass --target \"<neon connection string>\" or set NEON_DATABASE_URL.",
    );
    process.exit(1);
  }
  if (targetUrl === sourceUrl) {
    console.error("Target is the same as source. Refusing to migrate onto itself.");
    process.exit(1);
  }

  const source = new Pool({ connectionString: sourceUrl, max: 2, connectionTimeoutMillis: 10_000 });
  const target = new Pool({ connectionString: targetUrl, max: 2, connectionTimeoutMillis: 20_000 });

  console.log(`source : ${safeHost(sourceUrl)}`);
  console.log(`target : ${safeHost(targetUrl)}`);
  console.log(`mode   : ${args.apply ? (args.truncate ? "APPLY + TRUNCATE" : "APPLY") : "DRY RUN"}\n`);

  try {
    await source.query("SELECT 1");
    await target.query("SELECT 1");

    // 1. Schema. CREATE TABLE IF NOT EXISTS throughout, so this is idempotent.
    const ddl = readFileSync(join(HERE, "migrations", "0001_init.sql"), "utf8");
    if (args.apply) {
      await target.query(ddl);
      console.log("schema : 0001_init.sql applied\n");
    } else {
      console.log("schema : would apply db/migrations/0001_init.sql\n");
    }

    // 2. Rows, parents first.
    const plan = [];
    for (const { name } of TABLES) {
      const srcCols = await columnsOf(source, name);
      if (srcCols.length === 0) {
        plan.push({ name, count: 0, note: "missing in source, skipped" });
        continue;
      }
      const { rows } = await source.query(`SELECT * FROM ${name}`);
      plan.push({ name, count: rows.length, cols: srcCols, rows });
    }

    for (const t of plan) {
      if (t.note) {
        console.log(`${t.name.padEnd(24)} ${t.note}`);
        continue;
      }
      console.log(`${t.name.padEnd(24)} ${String(t.count).padStart(4)} rows`);
    }
    console.log("");

    if (!args.apply) {
      console.log("Dry run — nothing written. Re-run with --apply to migrate.");
      return;
    }

    // Column intersection guards against drift between the local DB and the
    // migration file; copying a column the target lacks would abort the whole
    // transaction partway through.
    const targetCols = {};
    for (const { name } of TABLES) {
      targetCols[name] = (await columnsOf(target, name)).map((c) => c.name);
    }

    const client = await target.connect();
    try {
      await client.query("BEGIN");

      if (args.truncate) {
        // Reverse order so children go before parents; CASCADE covers the rest.
        const names = [...TABLES].reverse().map((t) => t.name).join(", ");
        await client.query(`TRUNCATE ${names} RESTART IDENTITY CASCADE`);
        console.log("truncated target tables\n");
      }

      for (const t of plan) {
        if (t.note || t.count === 0) continue;
        const cols = t.cols.filter((c) => targetCols[t.name].includes(c.name));
        const dropped = t.cols
          .filter((c) => !targetCols[t.name].includes(c.name))
          .map((c) => c.name);
        if (dropped.length) {
          console.log(`  ! ${t.name}: target lacks ${dropped.join(", ")} — not copied`);
        }
        const colList = cols.map((c) => `"${c.name}"`).join(", ");
        const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
        let written = 0;
        for (const row of t.rows) {
          const res = await client.query(
            `INSERT INTO ${t.name} (${colList}) VALUES (${placeholders})
             ON CONFLICT DO NOTHING`,
            cols.map((c) => encode(row[c.name], c.type)),
          );
          written += res.rowCount;
        }
        console.log(`  ${t.name.padEnd(22)} ${String(written).padStart(4)} inserted / ${t.count} source`);
      }

      // 3. Sequences. Rows were inserted with explicit ids, which does NOT move
      // a SERIAL's sequence — without this the agent's next POST collides on the
      // primary key.
      for (const { name, pk } of TABLES) {
        if (!pk) continue;
        await client.query(
          `SELECT setval(
             pg_get_serial_sequence($1, $2),
             GREATEST((SELECT COALESCE(MAX(${pk}), 0) FROM ${name}), 1),
             (SELECT COUNT(*) FROM ${name}) > 0
           )`,
          [name, pk],
        );
      }
      console.log("\nsequences reset to max(id)");

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    // 4. Verify by reading the target back, not by trusting the writes above.
    console.log("\nverifying target:");
    let mismatch = false;
    for (const t of plan) {
      if (t.note) continue;
      const { rows } = await target.query(`SELECT COUNT(*)::int AS n FROM ${t.name}`);
      const ok = rows[0].n === t.count;
      if (!ok) mismatch = true;
      console.log(`  ${ok ? "ok  " : "DIFF"} ${t.name.padEnd(22)} source ${t.count} -> target ${rows[0].n}`);
    }

    const pub = await target.query(
      "SELECT slug FROM posts WHERE is_published = true ORDER BY id",
    );
    console.log(`\npublished posts on target (${pub.rowCount}):`);
    for (const r of pub.rows) console.log(`  - ${r.slug}`);

    if (mismatch) {
      console.log(
        "\nCounts differ. With --apply (no --truncate) that is expected on a re-run:",
      );
      console.log("rows already present are skipped. Use --truncate for an exact mirror.");
    }
  } finally {
    await source.end();
    await target.end();
  }
}

main().catch((err) => {
  console.error("\nmigration failed:", err.message);
  process.exit(1);
});
