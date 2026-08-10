import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import PostGrid from "@/components/PostGrid";
import { getReviews } from "@/lib/data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Reviews",
  description: "Hands-on product reviews with ranked picks for every budget.",
  alternates: { canonical: "/reviews" },
};

export default async function ReviewsPage() {
  const posts = await getReviews();

  return (
    <PageShell
      title="Reviews"
      eyebrow="Tested"
      intro="Hands-on reviews with ranked picks — every article here compares real products against each other."
    >
      <PostGrid
        posts={posts}
        empty="No reviews published yet — check back soon."
      />
    </PageShell>
  );
}
