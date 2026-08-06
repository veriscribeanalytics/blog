import { revalidatePath } from "next/cache";

/**
 * Invalidate the home page and the dynamic post page so a freshly written post
 * shows up immediately (ISR would otherwise lag up to 60s).
 * `revalidatePath('/blog/[slug]', 'page')` covers the dynamic route pattern.
 */
export function revalidatePost(_slug: string): void {
  revalidatePath("/");
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/blog/" + _slug);
}
