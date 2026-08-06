<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AffiliBlog — Frontend Guide

An affiliate review blog. Warm editorial look: cream paper, serif headlines, bronze accents.
Backend guidance lives in `BACKEND.md`.

## Status: design prototype

The UI is built and matches the approved mockups. **All content is fake.** Nothing is
wired to a database, and no form actually submits anywhere.

Known placeholders, to be replaced when the backend lands:

- **Images** — every image is a hotlinked Unsplash CDN URL built by the `img()` helper
  at the top of `src/lib/data.ts`. None are stored in this repo. They are stand-ins for
  art direction only; do not ship them to production. Unsplash can rate-limit or pull
  any of these at any time.
- **Content** — the exported arrays in `src/lib/data.ts` are hardcoded.
- **Newsletter form** (`Newsletter.tsx`) — no submit handler.
- **Search button** (`Header.tsx`) — renders, does nothing.
- **"View on Amazon" links** — all `href="#"`.
- **Share buttons** — all `href="#"`.
- **Carousel** (`HeroSection.tsx`) — the `01 / 02` counter increments but there is only
  one slide; it does not change the image.
- **Routes** — only `/` and `/blog/[slug]` exist. Header/footer link to `/deals`,
  `/reviews`, `/guides`, `/about`, `/contact`, `/category/[slug]`, `/blog`, and legal
  pages that are all **404s** today.
- `/blog/[slug]` ignores its `slug` and renders the same hardcoded post for any value.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · `next/font`.

Tailwind v4 has **no `tailwind.config.js`** — the theme is declared with `@theme` inside
`src/app/globals.css`. Add design tokens there, not in a JS config.

## Layout

```
src/
  app/
    layout.tsx              root: fonts + <body>
    page.tsx                home
    globals.css             @theme tokens, base styles, .eyebrow
    blog/[slug]/page.tsx    post page (async params)
  components/
    Header.tsx              sticky nav + mobile drawer (exports Logo)
    Footer.tsx
    Newsletter.tsx          "Stay Updated" band
    HeroSection.tsx         hero + Trending Now rail
    CategoriesSection.tsx
    LatestPosts.tsx
    PostSidebar.tsx         TOC scroll-spy + deal card + related
    ProductCard.tsx
    StarRating.tsx
    icons.tsx               inline SVGs, currentColor
  lib/
    data.ts                 ALL demo content + types
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

- **Server Components by default.** Only three files carry `"use client"`, each for a
  real reason: `Header` (drawer state), `HeroSection` (carousel), `PostSidebar`
  (IntersectionObserver). Don't add the directive unless you need state, effects, or
  event handlers.
- **Breakpoints** map to the three mockups: base = mobile 375, `lg:` = laptop 1024,
  `max-w-[1400px]` caps desktop. Mobile-first — write the small layout, then add `lg:`.
- **Content flows from `src/lib/data.ts`.** Components read the exported types
  (`Post`, `Category`, `Product`) and never hardcode strings. Keep it that way — when
  the API arrives, only this file's internals change.
- **Icons** are inline SVG in `icons.tsx` using `currentColor`. No icon library.
- Every `next/image` needs `sizes`. Remote hosts must be allowlisted in
  `next.config.ts` → `images.remotePatterns`.

## Accessibility

Keep what's there: the drawer traps nothing but closes on Escape and locks body scroll,
breadcrumbs use `<ol>` + `aria-label`, icon-only buttons have `aria-label`, the TOC is a
`<nav>`. New interactive elements need a real `<button>`/`<a>` and a visible focus state.

## Verify before claiming done

`npx tsc --noEmit` was the only check run on the initial build. It does **not** catch
layout regressions. Run the dev server and look at all three widths before saying a
visual change works.

```bash
npm run dev     # http://localhost:3000
npm run build   # not yet run on this project — expect to fix things
npm run lint
```
