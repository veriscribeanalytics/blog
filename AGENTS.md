<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AffiliBlog — Frontend Guide

An affiliate review blog. Warm editorial look: cream paper, serif headlines, bronze accents.
Backend guidance lives in `BACKEND.md`.

## Status: DB-backed, pre-launch

The UI matches the approved mockups and is wired end to end. Content comes from
Postgres via `src/lib/queries.ts`, exposed to server components through the async
getters in `src/lib/data.ts`. The Hermes agent writes posts over the REST API.
`npm run build` passes; 21 routes exist and every header/footer link resolves.

Real and working: all routes (`/`, `/blog`, `/blog/[slug]`, `/category/[slug]`,
`/deals`, `/reviews`, `/guides`, `/categories`, `/about`, `/contact`, and the legal
pages) · newsletter signup (`SubscribeForm` → `POST /api/newsletter`, rate-limited)
· affiliate links (real `amazonUrl`s, `rel="nofollow sponsored noopener"`) · hero
carousel (`HeroSection.tsx`, backed by the trending rail).

Deploy target is Vercel + Neon on `blogs.veriscribeanalytics.com`. The runbook,
including the exact environment variables, lives in `DEPLOY.md` — read that before
deploying rather than re-deriving the steps.

Still outstanding before launch:

- **`NEXT_PUBLIC_SITE_URL` must be set in Vercel's environment variables.** It is
  now in `.env.local`, which fixes local dev only — `.env*` is gitignored and never
  reaches Vercel. `robots.ts` serves `Disallow: /` without it, and because
  `robots.txt`/`sitemap.xml` are prerendered (`○ Static` in the build output), a
  build with the variable missing bakes `Disallow: /` into the artifact until you
  redeploy.
- **Production database** — content still lives in local Postgres, which Vercel
  can't reach. Copy it with `node db/migrate-to-neon.mjs` (see `DEPLOY.md`). Never
  run `db/seed.sql` against production; it holds demo posts that are not the real
  content.
- **Images** — post rows still point at hotlinked Unsplash CDN URLs. Fine for
  art direction, not for production; Unsplash can rate-limit or pull them.
  Agent-written posts supply their own (allowlist in `next.config.ts`).
- **No OG image** — `public/` still holds the default Next.js SVGs. Social shares
  fall back to no image. Add one and reference it in `layout.tsx`'s `openGraph`.
- **Thin content** — 5 published posts across 1 category, so `/categories` and the
  category listing are near-empty.
- **Newsletter** stores to `newsletter_subscribers` only; the Resend forward is
  stubbed pending `RESEND_API_KEY`.
- **`npm audit`** reports 4 high-severity advisories in Next's own dependency
  chain (postcss / sharp / nanoid). Clearing them needs `next@16.3.0`, outside the
  pinned range — a deliberate upgrade, not a drive-by `--force`.

## SEO

Treat this as load-bearing — it's an affiliate site, organic search is the point.

- `src/lib/config.ts` owns `siteUrl` / `absoluteUrl()`. Build every absolute URL
  from those, never hardcode the origin.
- `layout.tsx` sets `metadataBase` and a title template (`%s — AffiliBlog`), so
  **page metadata must set only its own title** — no manual ` — AffiliBlog` suffix.
- Every page sets `alternates.canonical`. New routes must too.
- `src/app/sitemap.ts` and `robots.ts` are generated from the DB; new indexable
  route groups need adding to `STATIC_ROUTES` in `sitemap.ts`.
- `src/lib/jsonld.ts` emits Article + BreadcrumbList + ItemList/Product + FAQPage
  for posts. **Only describe what's visible on the page** — inventing an offer or
  rating that a reader can't see violates Google's structured-data policy.
- `Product` carries raw `priceValue` / `mrpValue` / `reviewCount` alongside the
  display strings; JSON-LD uses the raw numbers, never the formatted `"₹2,499"`.

## Security

- **`post.body` is agent-supplied HTML rendered with `dangerouslySetInnerHTML`.**
  It is sanitized twice — on write (`schema.ts` transform) and on read
  (`getPostBySlug`) — via the allowlist in `src/lib/sanitize.ts`. Keep both. If a
  post needs a new tag, widen the allowlist; never bypass the sanitizer.
- Writes are authenticated with a single bearer key (`src/lib/auth.ts`) and fail
  closed when `AGENT_API_KEY` is unset.
- `/api/newsletter` is the only unauthenticated write; it's IP rate-limited
  in-process (see the caveats in `src/lib/rateLimit.ts`).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · `next/font`.

Tailwind v4 has **no `tailwind.config.js`** — the theme is declared with `@theme` inside
`src/app/globals.css`. Add design tokens there, not in a JS config.

## Layout

```
src/
  app/
    layout.tsx              root: fonts, metadataBase/OG, site JSON-LD
    page.tsx                home
    globals.css             @theme tokens, base styles, .eyebrow, .post-body
    sitemap.ts              DB-driven sitemap.xml
    robots.ts               robots.txt (Disallow: / until SITE_URL is set)
    blog/page.tsx           all articles
    blog/[slug]/page.tsx    post page (async params) + post JSON-LD
    category/[slug]/        per-category listing
    categories|deals|reviews|guides|about|contact/
    disclosure|editorial|privacy|terms/
    api/posts/route.ts      GET list · POST create (agent-only)
    api/posts/[slug]/       GET one · PUT update · DELETE soft-delete
    api/categories/route.ts
    api/newsletter/route.ts POST subscribe (rate-limited)
  components/
    Header.tsx              sticky nav + mobile drawer (exports Logo)
    Footer.tsx
    Newsletter.tsx          "Stay Updated" band
    SubscribeForm.tsx       the only form that posts anywhere
    HeroSection.tsx         hero carousel + Trending Now rail
    CategoriesSection.tsx
    LatestPosts.tsx  PostGrid.tsx  PageShell.tsx
    PostSidebar.tsx         TOC scroll-spy + deal card + related
    ProductCard.tsx  StarRating.tsx  TrustStrip.tsx
    AnnouncementBar.tsx  AccentTitle.tsx  Manifesto.tsx
    icons.tsx               inline SVGs, currentColor
  lib/
    data.ts                 the seam server components import
    queries.ts              all SQL
    db.ts                   lazy pg pool (server-only)
    config.ts               DB-free static config, siteUrl/absoluteUrl
    types.ts                display types
    schema.ts               zod validation for agent writes
    sanitize.ts             post-body HTML allowlist
    jsonld.ts               schema.org builders
    rateLimit.ts            in-process IP limiter
    format.ts               paise/date/count -> display strings
    auth.ts  env.ts  apiError.ts  revalidate.ts
db/
  migrations/0001_init.sql
  seed.sql
```

## Design tokens

Sampled from the mockup pixels — don't eyeball replacements, reuse the tokens.

| Token | Hex | Use |
|---|---|---|
| `cream` | `#faf7f2` | page background |
| `paper` | `#fdfbf8` | cards, header |
| `sand` | `#f4eee5` | inset panels |
| `line` | `#e7dfd3` | borders |
| `ink` | `#14110e` | headings, buttons |
| `body` | `#4f463d` | body copy |
| `muted` | `#8d8378` | dates, captions |
| `bronze` | `#a67c45` | accent, logo, active state |
| `leaf` | `#2e7d4f` | discount badges |
| `star` | `#e0a12b` | ratings |

Type: **Playfair Display** headings, **Inter** body/UI. Both via `next/font` in
`layout.tsx`. `h1`–`h4` get the serif automatically — don't add `font-serif` by hand.

Corners are square. There is no border radius anywhere except avatars and dots.

## Conventions

- **Server Components by default.** Only four files carry `"use client"`, each for a
  real reason: `Header` (drawer state), `HeroSection` (carousel), `PostSidebar`
  (IntersectionObserver), `SubscribeForm` (form state). Don't add the directive unless
  you need state, effects, or event handlers.
- **Breakpoints** map to the three mockups: base = mobile 375, `lg:` = laptop 1024,
  `max-w-[1400px]` caps desktop. Mobile-first — write the small layout, then add `lg:`.
- **Content flows from `src/lib/data.ts`.** Components read the exported types
  (`Post`, `Category`, `Product`) and never hardcode strings. Server components use the
  async getters; **client components must import from `@/lib/config` and `@/lib/types`
  instead** — `data.ts` pulls the Node-only `pg` chain.
- **Icons** are inline SVG in `icons.tsx` using `currentColor`. No icon library.
- Every `next/image` needs `sizes`. Remote hosts must be allowlisted in
  `next.config.ts` → `images.remotePatterns`.

## Accessibility

Keep what's there: the drawer traps nothing but closes on Escape and locks body scroll,
breadcrumbs use `<ol>` + `aria-label`, icon-only buttons have `aria-label`, the TOC is a
`<nav>`. New interactive elements need a real `<button>`/`<a>` and a visible focus state.

## Verify before claiming done

`npx tsc --noEmit` and `npm run build` both pass — keep them that way. Neither catches
layout regressions: run the dev server and look at all three widths before saying a
visual change works.

```bash
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

For SEO changes, also confirm the generated output rather than assuming:

```bash
curl -s localhost:3000/robots.txt
curl -s localhost:3000/sitemap.xml | head -20
# JSON-LD on a post — paste into search.google.com/test/rich-results
curl -s localhost:3000/blog/<slug> | grep -o 'application/ld+json'
```
