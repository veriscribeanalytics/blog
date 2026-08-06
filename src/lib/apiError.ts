/**
 * Route-handler error helpers.
 *
 * Postgres errors must never reach the client verbatim — they leak table and
 * constraint names. `errorResponse` maps the constraint violations the agent can
 * actually cause onto meaningful status codes, and swallows everything else into
 * a generic 500 that is logged server-side instead.
 */

/** Postgres SQLSTATE codes we translate. */
const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";
const NOT_NULL_VIOLATION = "23502";

type PgError = { code?: string; constraint?: string };

export function jsonError(status: number, message: string): Response {
  return Response.json({ error: message }, { status });
}

/**
 * Map a thrown write error to a client-safe Response.
 *
 * @param err     the caught error
 * @param context label for the server-side log line, e.g. "POST /api/posts"
 * @param slug    the slug being written, used in the 409 message
 */
export function errorResponse(
  err: unknown,
  context: string,
  slug?: string,
): Response {
  const { code, constraint } = (err ?? {}) as PgError;

  if (code === UNIQUE_VIOLATION) {
    if (constraint === "posts_slug_key") {
      return jsonError(
        409,
        slug
          ? `A post with slug "${slug}" already exists. Use PUT /api/posts/${slug} to update it.`
          : "A post with that slug already exists. Use PUT to update it.",
      );
    }
    if (constraint === "products_amazon_url_key") {
      // upsertProduct handles this via ON CONFLICT, so reaching here is a bug —
      // still, answer with the honest status rather than a 500.
      return jsonError(409, "That Amazon URL is already registered to a product.");
    }
    if (constraint === "categories_slug_key") {
      return jsonError(409, "That category slug already exists.");
    }
    return jsonError(409, "That record already exists.");
  }

  if (code === FOREIGN_KEY_VIOLATION) {
    return jsonError(409, "A referenced record does not exist.");
  }

  if (code === NOT_NULL_VIOLATION) {
    return jsonError(400, "A required field was missing.");
  }

  // Unknown — log the real error, tell the client nothing about it.
  console.error(`[${context}]`, err);
  return jsonError(500, "Internal server error.");
}
