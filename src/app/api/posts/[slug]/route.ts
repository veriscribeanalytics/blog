import {
  getPostBySlug,
  updatePost,
  softDeletePost,
} from "@/lib/queries";
import { postWriteSchema } from "@/lib/schema";
import { verifyAgent, unauthorized } from "@/lib/auth";
import { revalidatePost } from "@/lib/revalidate";
import { errorResponse } from "@/lib/apiError";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(post);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!verifyAgent(request).ok) return unauthorized();
  const { slug } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = postWriteSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: parsed.error.issues
          .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
          .join("; "),
      },
      { status: 400 },
    );
  }

  try {
    const updated = await updatePost(slug, parsed.data);
    if (!updated) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    revalidatePost(updated);
    return Response.json({ slug: updated });
  } catch (err) {
    return errorResponse(err, `PUT /api/posts/${slug}`, parsed.data.slug);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!verifyAgent(request).ok) return unauthorized();
  const { slug } = await params;

  const ok = await softDeletePost(slug);
  if (!ok) return Response.json({ error: "Not found" }, { status: 404 });
  revalidatePost(slug);
  return new Response(null, { status: 204 });
}
