import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import PostGrid from "@/components/PostGrid";
import { getAllPosts, pageOpenGraph } from "@/lib/data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All Articles",
  description: "Browse every review, guide, and buying recommendation we've published.",
  alternates: { canonical: "/blog" },
  openGraph: pageOpenGraph("/blog"),
};

export default async function BlogPage() {
  const { posts } = await getAllPosts();

  return (
    <PageShell
      path="/blog"
      title="All Articles"
      eyebrow="Blog"
      intro="Every review, guide, and buying recommendation we've published — newest first."
    >
      <PostGrid posts={posts} />
    </PageShell>
  );
}
