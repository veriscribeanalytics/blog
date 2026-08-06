# AffiliBlog

An affiliate review blog with a warm editorial look (cream paper, serif headlines,
bronze accents). **Frontend and backend live in this one repo** — the Next.js pages
are the frontend, and the API routes + Postgres are the backend. The only writer is
an external **Hermes agent** that publishes posts via a single shared API key.

- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · `pg` (Postgres) · Zod
- **Data store:** local Postgres via the `pg` pool — **no Supabase, no ORM, no object storage**.
- **Auth model:** one shared `AGENT_API_KEY`. No users, no JWT, no sessions.

---

## 1. Prerequisites

- **Node.js** 18.18+ (Node 20 recommended)
- **PostgreSQL** (local). This repo was built against a **portable** Postgres that lives in
  `%USERPROFILE%\pgsql` / `%USERPROFILE%\pgdata` and is started with `db/start-db.ps1`.
  A regular installed Postgres works too — just point `DATABASE_URL` at it.
- **PowerShell** (for `db/start-db.ps1`; other steps are plain `npm`/`psql` and cross-platform).

---

## 2. Quick start (first time on a new machine)

```bash
# 1. clone
git clone https://github.com/veriscribeanalytics/blog.git
cd blog
npm install

# 2. env — copy the template and fill in real values
cp .env.example .env.local      # Windows: copy .env.example .env.local
#   set DATABASE_URL  -> your Postgres connection string
#   set AGENT_API_KEY -> a long random string (see §4 to generate one)

# 3. start Postgres (portable install)
./db/start-db.ps1                # -Status to check, -Stop to stop

# 4. create the database + run schema + seed
createdb affiliblog                                       # uses trust auth, no password
psql -d affiliblog -f db/migrations/0001_init.sql          # creates the 5 tables
psql -d affiliblog -f db/seed.sql                          # demo rows (Unsplash images)

# 5. run
npm run dev                     # http://localhost:3000
```

After seed you should see real rows on `/` and a full post at `/blog/<slug>`.

> **No Postgres running?** `psql` / `createdb` errors = the server isn't up. Run
> `./db/start-db.ps1` (portable) or start your installed Postgres service first.

---

## 3. Environment variables

Copy `.env.example` to `.env.local` and fill these in. **`.env.local` is gitignored —
never commit real secrets.**

| Variable | Required | Example | Notes |
|---|---|---|---|
| `DATABASE_URL` | yes | `postgresql://postgres:postgres@localhost:5432/affiliblog` | Local Postgres connection string. |
| `AGENT_API_KEY` | yes | (long random string) | The Hermes agent sends this as `Authorization: Bearer <key>`. |
| `AMAZON_AFFILIATE_TAG` | no | `affiliblog-21` | Informational for v1 — **read by nothing**. The agent must bake `?tag=affiliblog-21` into each `amazonUrl` itself today. |
| `RESEND_API_KEY` | no | _(blank)_ | When set, `/api/newsletter` could also forward to Resend. v1 just stores subscribers locally. |

### Generate an `AGENT_API_KEY` (PowerShell)

```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Use a **different** key per environment (dev / staging / prod).

---

## 4. Database

**5 tables** — defined in `db/migrations/0001_init.sql`:

| Table | Purpose |
|---|---|
| `categories` | post categories (slug, name, image_url) |
| `posts` | articles (slug unique, title, body HTML, hero image, author, TOC, FAQs, pull quote, flags) |
| `products` | one row per Amazon listing (upsert-by-`amazon_url`, so they dedupe across posts) |
| `post_products` | join table with per-placement `rank_num` / `badge` / `display_order` |
| `newsletter_subscribers` | `{ email }` collected by the newsletter form |

Demo rows are in `db/seed.sql` (re-runnable, `ON CONFLICT DO NOTHING`). Seed image URLs
are **Unsplash placeholders** — replace with owned images before launch.

### Local Postgres control (`db/start-db.ps1`)

Assumes the portable Postgres at `%USERPROFILE%\pgsql` / `%USERPROFILE%\pgdata`
(trust auth, no password, port 5432).

```bash
./db/start-db.ps1            # start if not running
./db/start-db.ps1 -Status    # check status
./db/start-db.ps1 -Stop      # stop
```

Connect in DBeaver: `host=localhost  port=5432  user=postgres`.

---

## 5. Project structure

```
affiliblog/
  db/
    migrations/0001_init.sql   # schema (5 tables)
    seed.sql                   # demo data
    start-db.ps1               # portable Postgres start/stop
  src/
    app/
      layout.tsx               # fonts + <body>
      page.tsx                 # home (server component, reads Postgres)
      blog/[slug]/page.tsx     # post page (renders body HTML, ISR revalidate=60)
      api/
        posts/route.ts         # GET list, POST create (auth)
        posts/[slug]/route.ts   # GET one, PUT update, DELETE soft-delete (auth)
        categories/route.ts     # GET list
        newsletter/route.ts     # POST subscribe
      …                        # /deals /reviews /guides /about /contact etc.
    components/                 # Header, Footer, HeroSection, ProductCard, PostSidebar, …
    lib/
      config.ts                 # static site config (client-safe, no pg import)
      db.ts                     # pg pool (Node-only)
      queries.ts                # SQL + row mappers
      schema.ts                 # Zod validation (mirrors the agent payload)
      format.ts                 # raw → display-string derivation
      types.ts                  # Post / Category / Product / PostDetail display types
      data.ts                   # SEAM: server components import from here only
      auth.ts                   # AGENT_API_KEY bearer check (timing-safe)
      revalidate.ts             # busts ISR caches after a write
  next.config.ts                # images.remotePatterns allowlist
  .env.example                  # env template (committed)
  .env.local                    # real values (gitignored)
```

### The one rule that must not break

> **Server components import names and shapes from `src/lib/data.ts`. Only the
> internals of `data.ts` change.**

`data.ts` is the seam — it re-exports static config and exposes async getters that
read Postgres via `queries.ts`. Pages read the DB **directly** through this seam;
they do **not** `fetch('/api/posts')`. The public REST API exists for **external
consumers** (the agent, testing), not for the app's own pages.

---

## 6. API reference

| Method | Path | Auth | Returns |
|---|---|---|---|
| `GET`  | `/api/posts` | none | `{ posts, total }` — `?limit=&offset=&category=` |
| `GET`  | `/api/posts/:slug` | none | full post (body, products, TOC, related, FAQs, pull quote) |
| `GET`  | `/api/categories` | none | `{ categories }` |
| `POST` | `/api/posts` | `Bearer AGENT_API_KEY` | `201 { slug }` — create |
| `PUT`  | `/api/posts/:slug` | `Bearer AGENT_API_KEY` | `200 { slug }` — update (bumps `updated_at`) |
| `DELETE` | `/api/posts/:slug` | `Bearer AGENT_API_KEY` | `204` — soft delete (`is_published=false`) |
| `POST` | `/api/newsletter` | none | `201` / `409` (dup) / `400` |

Every successful write calls `revalidatePost()` → busts `/`, `/blog/[slug]` page,
and `/blog/<slug>` so new/changed posts appear immediately.

---

## 7. Hermes agent integration

The agent is the **only writer**. It authenticates with the shared key and POSTs a
validated JSON payload. Validation is in `src/lib/schema.ts` (`postWriteSchema` /
`productWriteSchema`).

### 7.1 Connecting over Tailscale

The dev server binds to `localhost` by default, so it is **not** reachable from
other machines on the tailnet until you bind it to all interfaces:

```bash
npm run dev -- -H 0.0.0.0     # exposes port 3000 on every interface incl. Tailscale
```

Then the agent (on any machine on the same tailnet) hits:

| | Value |
|---|---|
| **Base URL** | `http://desktop-7l3d35j.tail52a020.ts.net:3000` |
| **Fallback (IP)** | `http://100.73.143.85:3000` |
| **Port** | `3000` |
| **Create endpoint** | `POST http://desktop-7l3d35j.tail52a020.ts.net:3000/api/posts` |
| **Update endpoint** | `PUT  http://desktop-7l3d35j.tail52a020.ts.net:3000/api/posts/<slug>` |
| **Auth header** | `Authorization: Bearer <AGENT_API_KEY>` |

Find the current tailnet hostname any time with `tailscale status` (the `Self` row)
or `tailscale status --json` on the host.

> **Production** (`next start`) binds to `0.0.0.0` by default, so no `-H` flag is
> needed there. Behind a real reverse proxy, point the agent at the proxy URL.

### 7.2 Example request

```bash
curl -X POST http://desktop-7l3d35j.tail52a020.ts.net:3000/api/posts \
  -H "Authorization: Bearer $AGENT_API_KEY" \
  -H "Content-Type: application/json" \
  -d @post.json
```

Expected: `201 { "slug": "..." }` (create) or `200 { "slug": "..." }` (update).

### 7.3 Payload — the JSON the agent must send

Validated field-by-field by `src/lib/schema.ts`.

**Post-level fields**

| Field | Type | Required | Notes |
|---|---|---|---|
| `slug` | string | yes | URL-safe, unique. `^[a-z0-9-]+$`, 1–200 chars |
| `title` | string | yes | 1–300 chars |
| `excerpt` | string | yes | 1–600 chars |
| `category` | string | yes | matched by slug; **created if missing** |
| `authorName` | string | yes | e.g. `"Rohan Mehta"` |
| `authorAvatar` | string | yes | external HTTPS image URL (see §8) |
| `publishedAt` | ISO 8601 string | yes | e.g. `"2025-05-20T14:30:00Z"` |
| `heroImageUrl` | string | yes | external HTTPS image URL (see §8) |
| `readTimeMinutes` | integer | yes | e.g. `6` → renders `"6 min read"` |
| `body` | string (HTML) | yes | the full article body; **section `id`s must match `tableOfContents[].id`** for scroll-spy |
| `tableOfContents` | array | yes | `[{ "num": "01", "label": "Top 5", "id": "top-5" }]` |
| `inThisArticle` | string[] | yes | drives the "In This Article" box |
| `faqs` | array | optional | `[{ "q": "...", "a": "..." }]`; omitted → FAQs hidden |
| `pullQuote` | string | optional | one editorial pull quote |
| `isPublished` | boolean | yes | `true` to go live immediately |
| `isHero` | boolean | yes | `true` = home hero |
| `isTrending` | boolean | yes | `true` = Trending rail |
| `products` | array | yes | see below; can be `[]` for non-review posts |

**Product sub-shape** (inside `products[]`)

| Field | Type | Required | Notes |
|---|---|---|---|
| `rank` | integer | yes | `1..N` → renders `"#1"` |
| `badge` | string | yes | e.g. `"#1 Best Overall"` |
| `name` | string | yes | |
| `rating` | number | yes | `0–5`, half-star precision (`4.5`) |
| `reviewCount` | integer | yes | e.g. `12345` → `"12,345 reviews"` |
| `priceInr` | integer | yes | **paise**, not rupees. `249900` = ₹2,499 |
| `mrpInr` | integer | yes | **paise**. `499000` = ₹4,990 |
| `imageUrl` | string | yes | external HTTPS image URL (see §8) |
| `amazonUrl` | string | yes | **must include** `?tag=affiliblog-21`; products upsert-by-`amazon_url` |
| `pros` | string[] | yes | 3–4 short bullets |
| `whyPicked` | string | yes | the "why" paragraph |

### 7.4 What the agent must NOT send (derived server-side in `format.ts`)

`date`, `readTime`, `reviews`, `price`, `mrp`, `discount`, the `"#1"` rank string,
`updated`, category `count`. **Send raw values only; the backend derives display strings.**

### 7.5 Units & encoding rules

- **Money is always integer paise** — `249900`, never `2499.00`.
- **Dates are always ISO 8601 UTC.**
- **Ratings** `0–5`, half-star precision.
- **`amazonUrl`** must carry `?tag=affiliblog-21` (or the configured tag) for v1.
- **`body`** section `id`s must match `tableOfContents[].id` (e.g. TOC `{ id: "top-5" }`
  needs `<section id="top-5">` or `<h2 id="top-5">` in `body`).

### 7.6 Complete example payload

```json
{
  "slug": "best-wireless-headphones-under-5000",
  "title": "Best Wireless Headphones Under ₹5,000 in 2025",
  "excerpt": "We tested 20+ headphones to find the best ones that deliver great sound, comfort and battery life.",
  "category": "Electronics",
  "authorName": "Rohan Mehta",
  "authorAvatar": "https://images.example.com/avatars/rohan.jpg",
  "publishedAt": "2025-05-20T14:30:00Z",
  "heroImageUrl": "https://images.example.com/headphones-hero.jpg",
  "readTimeMinutes": 6,
  "body": "<p>Finding the right wireless headphones under ₹5,000 can feel like guesswork…</p><section id=\"top-5\"><h2>Top 5 Best Wireless Headphones Under ₹5,000</h2>…</section><section id=\"how-we-tested\"><h2>How We Tested</h2>…</section>",
  "tableOfContents": [
    { "num": "01", "label": "Top 5 Best Headphones", "id": "top-5" },
    { "num": "02", "label": "How We Tested", "id": "how-we-tested" }
  ],
  "inThisArticle": ["Top 5 Best Headphones", "How We Tested"],
  "faqs": [
    { "q": "Are wireless headphones under ₹5,000 good for calls?", "a": "Yes — models with dual mics and ENC handle indoor calls well." }
  ],
  "pullQuote": "The best pair isn't the most expensive — it's the one you'll actually enjoy using every day.",
  "isPublished": true,
  "isHero": false,
  "isTrending": false,
  "products": [
    {
      "rank": 1,
      "badge": "#1 Best Overall",
      "name": "boAt Rockerz 450 Pro",
      "rating": 4.5,
      "reviewCount": 12345,
      "priceInr": 249900,
      "mrpInr": 499000,
      "imageUrl": "https://images.example.com/boat-450.jpg",
      "amazonUrl": "https://www.amazon.in/dp/B0XXXXXX?tag=affiliblog-21",
      "pros": ["Excellent sound with deep bass", "Up to 70H battery life", "Comfortable for long use", "Bluetooth 5.3"],
      "whyPicked": "The best overall performance with premium features at an affordable price."
    }
  ]
}
```

### 7.7 Error handling for the agent

- **Missing/invalid field** → `400` with a clear per-field message (self-correct).
- **Slug collision on POST** → currently a raw `500` (Postgres unique constraint).
  Treat it as **"this slug already exists — use `PUT /api/posts/:slug` to update it."**
  (Mapping this to a clean `409` is a known robustness gap.)
- **No / wrong key** → `401`.

---

## 8. Images

**v1: the agent sends external HTTPS image URLs** (`heroImageUrl`, `imageUrl`,
`authorAvatar`). There is **no upload endpoint, no bucket** — URLs are stored as-is.

For `next/image` to optimize them, the host **must be allowlisted** in
`next.config.ts` → `images.remotePatterns`. Already allowed:

- `images.unsplash.com` (seed/demo only)
- `res.cloudinary.com`, `**.imgix.net`, `**.r2.dev`, `**.s3.amazonaws.com`,
  `**.s3.*.amazonaws.com`
- `m.media-amazon.com`, `images-na.ssl-images-amazon.com` (Amazon product imagery)

**Add any new image host the agent uses here**, or images will 400 from the optimizer.

Hotlinking is fine for a prototype but fragile long-term — before public launch,
move to owned storage (S3 / Cloudflare R2 / Cloudinary) and allowlist that host.

---

## 9. Scripts

```bash
npm run dev      # http://localhost:3000  (add -- -H 0.0.0.0 to expose on Tailscale)
npm run build    # production build
npm run start    # serve the production build (binds 0.0.0.0 by default)
npm run lint     # eslint
npx tsc --noEmit # typecheck
```

---

## 10. Known gaps (before launch)

- **Affiliate links not rendered** — `amazon_url` is stored and validated but the read
  path drops it (`types.ts` `Product` has no `amazonUrl`, `ProductCard.tsx` ships
  `href="#"`). Site can't earn until this ships. Three-line frontend fix.
- **`AMAZON_AFFILIATE_TAG` read by nothing** — agent bakes `?tag=affiliblog-21` into
  `amazonUrl` itself today.
- **Seed images are Unsplash** — replace with owned images before launch.
- **Duplicate slug → raw `500`** instead of a clean `409`.
- **`body` not sanitized server-side** on write (stored XSS risk while the single key
  is the only writer).
- **Several nav routes 404** (`/deals`, `/reviews`, `/guides`, `/about`, `/contact`,
  `/category/[slug]`, `/blog`, legal pages) — pages exist but some are placeholders.

---

## 11. TL;DR for the agent

> Send external HTTPS image URLs in `heroImageUrl`, `imageUrl`, `authorAvatar`
> (host must be allowlisted in `next.config.ts` — see §8). Then `POST /api/posts`
> (or `PUT /api/posts/:slug` to update) with the JSON in §7.3 using
> `Authorization: Bearer $AGENT_API_KEY`. Money in **paise**, dates in **ISO UTC**,
> ratings **0–5 half-star**, `amazonUrl` must include `?tag=affiliblog-21`. **Do not
> send display strings** (`date`, `price`, `reviews`…) — the backend derives them.
> Expect `201 { slug }` on create, `200 { slug }` on update. On a slug collision,
> treat it as "already exists — use PUT".
