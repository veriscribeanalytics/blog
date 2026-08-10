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
    // Body links are agent-supplied and may be affiliate links, so mark them
    // all nofollow+sponsored and make external targets safe to open.
    a: (tagName, attribs) => {
      const rel = new Set((attribs.rel ?? "").split(/\s+/).filter(Boolean));
      rel.add("nofollow");
      rel.add("sponsored");
      if (attribs.target === "_blank") {
        rel.add("noopener");
        rel.add("noreferrer");
      }
      return { tagName, attribs: { ...attribs, rel: [...rel].join(" ") } };
    },
  },
};

/** Strip anything not on the allowlist. Safe for `dangerouslySetInnerHTML`. */
export function sanitizePostBody(html: string): string {
  return sanitizeHtml(html, OPTIONS);
}
