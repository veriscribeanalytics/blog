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

## Known gaps at launch

- **No OG image.** `layout.tsx` has no `openGraph.images`, and `public/` is still
  the default Next.js SVGs. Social shares render with no image.
- **Hotlinked images.** Post rows point at Unsplash CDN URLs, which can be
  rate-limited or pulled. Remote hosts are allowlisted in `next.config.ts`.
- **Thin content.** 5 published posts in 1 category; `/categories` and the category
  listing are near-empty.
- **`npm audit`: 4 high** in Next's own dependency chain (postcss / sharp / nanoid).
  Clearing them needs `next@16.3.0`, above the pinned `16.2.12` — a deliberate
  upgrade, not a drive-by `--force`.
- **Newsletter** stores to `newsletter_subscribers` only; the Resend forward is
  stubbed pending `RESEND_API_KEY`.
- **Rate limiting is in-process** (`src/lib/rateLimit.ts`), so on serverless each
  instance keeps its own counters and the effective limit scales with instance
  count. Fine for launch volume; needs shared state if abuse shows up.
