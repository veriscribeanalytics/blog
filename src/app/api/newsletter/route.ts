import { subscribeEmail } from "@/lib/queries";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
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

  if (!EMAIL_RE.test(email)) {
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
