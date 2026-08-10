import { subscribeEmail } from "@/lib/queries";
import { clientIp, rateLimit } from "@/lib/rateLimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 5 signups per IP per hour. More than enough for a real reader; tight enough
// to make bulk DB-filling tedious. See rateLimit.ts for the caveats.
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT = 5;

export async function POST(request: Request) {
  // Checked before parsing the body: rate-limiters should reject cheaply, not
  // after the heavier JSON parse work has already happened.
  const rl = rateLimit(`newsletter:${clientIp(request)}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!rl.ok) {
    return Response.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email =
    typeof body === "object" && body !== null && "email" in body
      ? String((body as { email: unknown }).email).trim().toLowerCase()
      : "";

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return Response.json({ error: "A valid email is required." }, { status: 400 });
  }

  const created = await subscribeEmail(email);
  if (!created) {
    return Response.json({ error: "Already subscribed." }, { status: 409 });
  }

  // v1 local: stored in newsletter_subscribers. When RESEND_API_KEY is set we
  // could also forward to Resend's audience API here — deferred for now.
  return Response.json({ ok: true }, { status: 201 });
}
