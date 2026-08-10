/**
 * schema.org JSON-LD builders for post pages.
 *
 * Why this exists: the post page already renders ratings, prices, FAQs and
 * breadcrumbs as HTML, but Google won't infer rich results from markup alone.
 * These emit the same facts in machine-readable form so search results can show
 * star ratings and prices.
 *
 * Rules followed here:
 * - Only describe what is actually on the page. Inventing an offer or a rating
 *   that a user can't see is a structured-data policy violation.
 * - AggregateRating is nested inside the Product it rates (a bare rating with
 *   no reviewed item is ignored).
 * - A Product with no price emits no `offers` rather than a zero-price offer.
 */

import { absoluteUrl } from "@/lib/config";
import type { PostDetail, Product } from "@/lib/types";

/** INR — every price in the DB is rupees. Matches `formatPrice`'s ₹. */
const CURRENCY = "INR";

type Json = Record<string, unknown>;

function productLd(p: Product, postUrl: string): Json {
  const ld: Json = {
    "@type": "Product",
    name: p.name,
    position: p.rank.replace("#", ""),
  };
  if (p.image) ld.image = p.image;
  if (p.why) ld.description = p.why;

  // Only claim an offer when there's a real price behind it.
  if (p.priceValue != null && p.priceValue > 0) {
    ld.offers = {
      "@type": "Offer",
      price: p.priceValue.toFixed(2),
      priceCurrency: CURRENCY,
      availability: "https://schema.org/InStock",
      url: p.amazonUrl || postUrl,
    };
  }

  // Google drops AggregateRating unless both a value and a positive count are
  // present, so gate on the count rather than emitting a bare rating.
  if (p.rating > 0 && p.reviewCount != null && p.reviewCount > 0) {
    ld.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: p.rating,
      reviewCount: p.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }
  return ld;
}

/**
 * The full graph for one post: Article + BreadcrumbList, plus ItemList of
 * ranked products and FAQPage when the post has them.
 */
export function postJsonLd(post: PostDetail): Json {
  const postUrl = absoluteUrl(`/blog/${post.slug}`);
  const graph: Json[] = [];

  const article: Json = {
    "@type": "Article",
    "@id": `${postUrl}#article`,
    headline: post.title,
    description: post.excerpt,
    url: postUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    inLanguage: "en",
    isAccessibleForFree: true,
    publisher: { "@id": absoluteUrl("/#organization") },
  };
  if (post.heroImage) article.image = [post.heroImage];
  if (post.authorName) {
    article.author = { "@type": "Person", name: post.authorName };
  }
  if (post.publishedAt) {
    article.datePublished = post.publishedAt;
    // No separate updated timestamp on PostDetail; published is the honest floor.
    article.dateModified = post.publishedAt;
  }
  if (post.category) article.articleSection = post.category;
  graph.push(article);

  graph.push({
    "@type": "BreadcrumbList",
    "@id": `${postUrl}#breadcrumbs`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: post.category || "Articles",
        item: absoluteUrl(
          post.categorySlug ? `/category/${post.categorySlug}` : "/blog",
        ),
      },
      { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
    ],
  });

  if (post.products.length > 0) {
    graph.push({
      "@type": "ItemList",
      "@id": `${postUrl}#products`,
      name: `Top ${post.products.length} Best Picks`,
      numberOfItems: post.products.length,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      itemListElement: post.products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: productLd(p, postUrl),
      })),
    });
  }

  if (post.faqs && post.faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${postUrl}#faq`,
      mainEntity: post.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

/** Serialize for embedding. `<` is escaped so a stray `</script>` can't break out. */
export function jsonLdScript(data: Json): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
