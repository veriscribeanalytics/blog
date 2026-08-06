/**
 * Pure display formatters — raw DB values (paise, ISO dates, counts) into the
 * display strings the frontend expects. No IO, fully unit-testable.
 * See BACKEND.md "Display mapping".
 */

const INR = new Intl.NumberFormat("en-IN");
const US = new Intl.NumberFormat("en-US");
const DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : DATE.format(d);
}

export function formatReadTime(minutes: number | null | undefined): string {
  return `${minutes ?? 0} min read`;
}

export function formatReviews(count: number | null | undefined): string {
  return `${US.format(count ?? 0)} reviews`;
}

/** paise -> "₹2,499" (Indian grouping) */
export function formatPrice(paise: number | null | undefined): string {
  return `₹${INR.format(Math.round((paise ?? 0) / 100))}`;
}

/** "50% OFF" derived from paise values, or "" when no real discount. */
export function formatDiscount(
  pricePaise: number | null | undefined,
  mrpPaise: number | null | undefined,
): string {
  const price = pricePaise ?? 0;
  const mrp = mrpPaise ?? 0;
  if (!mrp || mrp <= price) return "";
  const pct = Math.round(((mrp - price) / mrp) * 100);
  return pct > 0 ? `${pct}% OFF` : "";
}

export function formatRank(rank: number | null | undefined): string {
  return `#${rank ?? 0}`;
}

/** "Updated 2 hours ago" style relative time. */
export function formatUpdated(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const mins = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
  if (mins < 1) return "Updated just now";
  if (mins < 60) return `Updated ${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Updated ${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `Updated ${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `Updated ${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.round(months / 12);
  return `Updated ${years} year${years === 1 ? "" : "s"} ago`;
}

export function formatCount(count: number | null | undefined): string {
  const n = count ?? 0;
  return `${US.format(n)} ${n === 1 ? "Article" : "Articles"}`;
}

/** "Electronics" -> "electronics", "Home & Kitchen" -> "home-kitchen" */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
