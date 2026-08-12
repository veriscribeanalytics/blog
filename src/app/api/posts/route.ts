import type { NextRequest } from "next/server";
import { listPublishedPosts, createPost } from "@/lib/queries";
import { postWriteSchema } from "@/lib/schema";
import { verifyAgent, unauthorized } from "@/lib/auth";
import { revalidatePost } from "@/lib/revalidate";
import { errorResponse, jsonError } from "@/lib/apiError";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const limit = clamp(parseInt(sp.get("limit") ?? "20", 10) || 20, 1, 100);
  const offset = Math.max(0, parseInt(sp.get("offset") ?? "0", 10) || 0);
  const category = sp.get("category") ?? undefined;

  // withTotal: the API is the one caller that paginates, so it needs the count.
  const { posts, total } = await listPublishedPosts(limit, offset, category, true);
  return Response.json({ posts, total });
}

export async function POST(request: Request) {
  if (!verifyAgent(request).ok) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body.");
  }

  const parsed = postWriteSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, zodMessage(parsed.error));
  }

  try {
    const slug = await createPost(parsed.data);
    revalidatePost(slug);
    return Response.json({ slug }, { status: 201 });
  } catch (err) {
    return errorResponse(err, "POST /api/posts", parsed.data.slug);
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function zodMessage(err: import("zod").ZodError): string {
  return err.issues
    .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("; ");
}
