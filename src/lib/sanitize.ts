/**
 * HTML sanitizer for agent-supplied post bodies.
 *
 * `/blog/[slug]` renders `post.body` through `dangerouslySetInnerHTML`, and the
 * write schema only checks it's a non-empty string. The Hermes agent is the
 * only authenticated writer, but it composes bodies from scraped product pages
 * — so a malicious listing could smuggle a <script> through the agent and into
 * every visitor's browser. This closes that path.
 *
 * Applied in two places by design (defence in depth):
 *   1. on write, in the POST/PUT schema — so nothing dirty is ever stored;
 *   2. on render, in the post page — so rows written before this existed, or
 *      inserted directly via SQL/seed, are still safe to display.
 *
 * The allowlist matches what the editorial template and `.post-body` styles in
 * globals.css actually support. Anything else is dropped rather than escaped.
 */

import sanitizeHtml from "sanitize-html";
import { siteUrl } from "@/lib/config";

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr",
    // h1 is deliberately absent: the page renders the post title as the only
    // h1, and a second one in the body would break the heading outline.
    "h2", "h3", "h4",
    "ul", "ol", "li",
    "blockquote", "figure", "figcaption",
    "strong", "em", "b", "i", "u", "s", "mark", "small", "sup", "sub",
    "a", "img",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
    "code", "pre", "span", "div",
    // `section` carries the ids the TOC scroll-spy anchors to. Without it
    // sanitize-html keeps the children but drops the wrapper *and its id*,
    // leaving every TOC link a dead anchor.
    "section",
  ],
  allowedAttributes: {
    // `id` on headings is what the TOC scroll-spy anchors to — keep it.
    "*": ["id", "class"],
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    th: ["colspan", "rowspan", "scope"],
    td: ["colspan", "rowspan"],
  },
  // Drop javascript:/data: URLs; keep only real web and mail links.
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
  // Strip <script>/<style> contents entirely rather than leaving inner text.
  nonTextTags: ["script", "style", "textarea", "option", "noscript"],
  transformTags: {
    /**
     * Outbound body links are agent-supplied and may be affiliate links, so they
     * get nofollow+sponsored and external targets are made safe to open.
     *
     * Same-origin links are deliberately left alone. They are editorial
     * cross-links, and the article body is the only contextual-linking surface
     * on the site — marking them `nofollow sponsored` would block internal link
     * equity and tell Google our own pages are paid placements.
     */
    a: (tagName, attribs) => {
      const rel = new Set((attribs.rel ?? "").split(/\s+/).filter(Boolean));
      if (isOutbound(attribs.href)) {
        rel.add("nofollow");
        rel.add("sponsored");
      }
      if (attribs.target === "_blank") {
        rel.add("noopener");
        rel.add("noreferrer");
      }
      const next = { ...attribs };
      if (rel.size > 0) next.rel = [...rel].join(" ");
      else delete next.rel;
      return { tagName, attribs: next };
    },
  },
};

/**
 * True for links that leave the site. Relative hrefs, fragments and same-origin
 * absolutes are internal; anything with a different host is not.
 *
 * Note `siteUrl` is localhost in dev, so a hardcoded production absolute URL in
 * a body counts as outbound there. That errs toward over-tagging, which is the
 * safe direction.
 */
function isOutbound(href: string | undefined): boolean {
  if (!href) return false;
  if (/^(#|\/(?!\/))/.test(href)) return false; // "#faq", "/blog/x" — but not "//evil.com"
  if (/^(mailto|tel):/i.test(href)) return false;
  if (!/^[a-z][a-z0-9+.-]*:|^\/\//i.test(href)) return false; // bare "about" etc.
  try {
    return new URL(href, siteUrl).host !== new URL(siteUrl).host;
  } catch {
    return true;
  }
}

/** Strip anything not on the allowlist. Safe for `dangerouslySetInnerHTML`. */
export function sanitizePostBody(html: string): string {
  return sanitizeHtml(html, OPTIONS);
}
