# Deploying AffiliBlog

Target: **Vercel** + **Neon** Postgres, serving `https://blogs.veriscribeanalytics.com`.

## 1. Environment variables (set these in Vercel *before* the first build)

Project → Settings → Environment Variables. Set for **Production** (and Preview,
except `NEXT_PUBLIC_SITE_URL` — see the note on previews below).

| Variable | Value | Secret? |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://blogs.veriscribeanalytics.com` | no |
| `DATABASE_URL` | Neon **pooled** connection string | yes |
| `AGENT_API_KEY` | the long random key Hermes sends as `Authorization: Bearer …` | yes |
| `AMAZON_AFFILIATE_TAG` | `affiliblog-21` | no |
| `RESEND_API_KEY` | leave unset until the newsletter forward is wired | yes |

> **`NEXT_PUBLIC_SITE_URL` is read at build time, not request time.**
> `robots.txt` and `sitemap.xml` are prerendered — the build output lists both as
> `○ (Static)`. If the variable is missing when the build runs, `Disallow: /` gets
> **baked into the artifact** and stays there until you redeploy. Adding the
> variable afterwards is not enough; you must trigger a new build.

Two consequences worth knowing:

- Setting it in `.env.local` only fixes local dev. `.env*` is gitignored and never
  reaches Vercel — the Vercel variable is the one that matters for production.
- Leaving it **unset on Preview deploys is deliberate**: previews then serve
  `Disallow: /`, so a preview URL can't compete with production in the index.

## 2. Neon

Create the project, then take the **pooled** connection string — the host contains
`-pooler`:

```
postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/DB?sslmode=require
```

Use the pooled endpoint, not the direct one. `src/lib/db.ts` keeps `max: 3` per
instance on Vercel, but every warm serverless instance holds its own pool, so the
real ceiling is `max` × instance count. Neon's pooler does the multiplexing that
keeps that under the connection limit.

`pg` 8.22 handles `sslmode=require` natively — no extra SSL config, and no need
for `@neondatabase/serverless` (that's for the edge runtime; this app runs on Node).

## 3. Migrate content

There is no `pg_dump` on the dev machine, so the copy is a Node script:

```bash
# dry run first — connects, writes nothing, prints the row plan
node db/migrate-to-neon.mjs --target "postgresql://…-pooler…/DB?sslmode=require"

# then write
node db/migrate-to-neon.mjs --target "…" --apply
```

It applies `db/migrations/0001_init.sql` and copies rows in FK order, preserving
ids. Re-running is safe (`ON CONFLICT DO NOTHING`); add `--truncate` to force an
exact mirror of local.

**Do not run `db/seed.sql` against production.** It is demo content
(`best-laptops-for-students`, `top-7-air-fryers`, 3 categories) that does not match
the real site. All real posts are agent-written and exist only in the database,
which is why the migration is a row copy rather than a re-seed.

The script resets each `SERIAL` sequence after inserting explicit ids — without
that, the agent's next `POST /api/posts` would collide on the primary key.

## 4. Domain

Add `blogs.veriscribeanalytics.com` in Vercel → Domains and point the DNS record it
gives you. `NEXT_PUBLIC_SITE_URL` must match the final origin exactly — scheme, no
trailing slash, and the same host you serve. A mismatch makes every canonical point
somewhere other than the page it's on.

## 5. Verify after deploying

```bash
curl -s https://blogs.veriscribeanalytics.com/robots.txt
# want: Allow: / + Disallow: /api/ + Sitemap: …/sitemap.xml
# if you see `Disallow: /`, NEXT_PUBLIC_SITE_URL was missing at build time

curl -s https://blogs.veriscribeanalytics.com/sitemap.xml | grep -c "<loc>"
# want: 18 (12 static + 1 category + 5 published posts)

curl -s https://blogs.veriscribeanalytics.com/blog/best-power-banks-under-999-2026 \
  | grep -o 'application/ld+json'
```

Then submit the sitemap in Google Search Console.

## Troubleshooting — every failure hit on the first deploy

These happened in this order on the real deploy. Each looks like a different
problem; three of the four are environment-variable scoping.

### "Deployment was blocked because the commit author did not have contributing access"

Not a build failure — Vercel never started building. On the Hobby plan a private
repo only deploys when the commit author matches the linked GitHub account.

This repo has two identities in its history: `AI Innovations
<veriscribeanalytics2025@gmail.com>` on the first two commits, and
`veriscribeanalytics-hash <veriscribeanalytics@gmail.com>` from `6fe1e3a`
onward. Check with `git log --format="%h %an <%ae>"`.

Fixes, cheapest first: add the authoring email as a verified secondary on the
Vercel-linked GitHub account (note GitHub requires an email to be unique across
accounts, so it may need removing from the other account first); reconnect
Vercel to the authoring account; make the repo public; or deploy with
`vercel --prod`, which uploads directly and skips the author check.

### `ECONNREFUSED 127.0.0.1:5432`, blamed on `/about`

`DATABASE_URL` in Vercel held the local dev string, so the build tried to reach
Postgres on the build machine.

The reported page is misleading. `/about` is static and contains no database
code — but `Footer.tsx` and `PageShell.tsx` both call `getCategories()`, and
every route renders through `PageShell`, so **all 20 pages touch the DB at build
time**. Next.js blames whichever prerendered first. Don't go looking in the
named file.

`src/lib/db.ts` now rewrites this specific error into a message naming the real
cause. It is deliberately not gated on `process.env.VERCEL`, because that
variable is absent when a project disables "Automatically expose System
Environment Variables" — exactly when the diagnostic is needed.

A corollary worth knowing: because the build needs the DB, a Neon cold start or
network blip during a build fails the whole deploy. There is no try/catch on the
pages on purpose — swallowing it would ship a site with an empty footer and no
posts, which is worse than a red build. `sitemap.ts` is the one place that does
catch, since a missing sitemap beats a 500.

### The variable was fixed but nothing changed

Vercel scopes environment variables per environment, and **pushing a branch
builds Preview, not Production**. Fixing Production alone leaves Preview on the
old value. This cost three round trips.

- `DATABASE_URL` → tick **all three** environments.
- `NEXT_PUBLIC_SITE_URL` → **Production only**, so preview URLs keep serving
  `Disallow: /` and can't compete with production in the index.

Environment changes do not apply to a build that already ran. Redeploy after
saving.

### `password authentication failed for user 'neondb_owner'` (`28P01`)

TLS and DNS are fine at this point; only the credential is wrong. Usual causes:
the placeholder `PASSWORD` was pasted literally, the password was rotated after
the string was copied, or a special character needs URL-encoding. Paste only the
URL — no surrounding `psql '...'`, no trailing `PGUSER=` / `PGPASSWORD=` lines,
no leading or trailing whitespace.

## Migration 0002 — run this before the next deploy

`db/migrations/0002_affiliate_clicks.sql` adds the `affiliate_clicks` table that
`/go/<id>` writes to, plus a `CHECK` on `products.amazon_url` requiring a `tag=`.
It is idempotent. Apply it to Neon the same way as `0001`, and note the ordering
constraint: **`/go` returns 404 for every product until the table exists**, so run
it before deploying, not after.

The `CHECK` will reject the migration itself if any existing row has an untagged
`amazon_url`. Find them first:

```sql
SELECT id, name, amazon_url FROM products WHERE amazon_url NOT LIKE '%tag=%';
```

Reading the click log:

```sql
SELECT post_slug, COUNT(*) AS clicks
  FROM affiliate_clicks
 WHERE clicked_at > NOW() - INTERVAL '7 days'
 GROUP BY post_slug ORDER BY clicks DESC;
```

## Known gaps at launch

- **Hotlinked images.** Post rows point at Unsplash CDN URLs, which can be
  rate-limited or pulled. Remote hosts are allowlisted in `next.config.ts`.
- **The OG card is off-face.** `src/app/opengraph-image.tsx` generates a real
  1200×630 card from the design tokens, but `next/og` ships no serif, so the
  headline renders in its default sans rather than Playfair. Fixing it needs a
  font file committed to the repo — deliberately not fetched at build time.
- **Thin content.** 5 published posts in 1 category; `/categories` and the category
  listing are near-empty. Empty categories now emit `noindex` rather than being
  indexed as thin pages.
- **`npm audit`: 4 high** in Next's own dependency chain (postcss / sharp / nanoid).
  Clearing them needs `next@16.3.0`, above the pinned `16.2.12` — a deliberate
  upgrade, not a drive-by `--force`.
- **Newsletter** stores to `newsletter_subscribers` only; the Resend forward is
  stubbed pending `RESEND_API_KEY`.
- **Rate limiting is in-process** (`src/lib/rateLimit.ts`), so on serverless each
  instance keeps its own counters and the effective limit scales with instance
  count. Fine for launch volume; needs shared state if abuse shows up.
- **`Manifesto.tsx` is imported by nothing.** It and `config.ts`'s `manifesto`
  block are a finished design element that was never placed on the home page —
  left alone rather than deleted or wired in unasked.
