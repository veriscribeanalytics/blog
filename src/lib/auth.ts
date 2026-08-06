import type { NextRequest } from "next/server";

/**
 * The Hermes agent is the only writer. Auth is a single shared key sent as
 * `Authorization: Bearer <AGENT_API_KEY>`. No users, no sessions.
 * If the key isn't configured on the server, every write is rejected (fail-safe).
 */
export function verifyAgent(req: Request | NextRequest): { ok: boolean } {
  const configured = process.env.AGENT_API_KEY;
  if (!configured) return { ok: false };
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  return { ok: token.length > 0 && timingSafeEqual(token, configured) };
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export function unauthorized(): Response {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
