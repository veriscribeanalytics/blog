import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import PostGrid from "@/components/PostGrid";
import { getGuides, pageOpenGraph } from "@/lib/data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Buying Guides",
  description: "Explainers and buying advice to help you choose well.",
  alternates: { canonical: "/guides" },
  openGraph: pageOpenGraph("/guides"),
};

export default async function GuidesPage() {
  const posts = await getGuides();

  return (
    <PageShell
      path="/guides"
      title="Buying Guides"
      eyebrow="Learn"
      intro="Explainers and advice on how to choose — the background reading behind our picks."
    >
      <PostGrid
        posts={posts}
        empty="No guides published yet — check back soon."
      />
    </PageShell>
  );
}
