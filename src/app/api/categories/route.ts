import { listCategories } from "@/lib/queries";

export async function GET() {
  const categories = await listCategories();
  return Response.json({ categories });
}
