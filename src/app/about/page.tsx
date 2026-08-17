import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { pageOpenGraph } from "@/lib/config";

export const metadata: Metadata = {
  title: "About",
  description: "Who we are and how we approach product reviews.",
  alternates: { canonical: "/about" },
  openGraph: pageOpenGraph("/about"),
};

export default function AboutPage() {
  return (
    <PageShell
      path="/about"
      title="About AffiliBlog"
      eyebrow="Who We Are"
      width="prose"
      intro="Honest reviews, curated deals and expert buying guides — so you spend less time researching and more time enjoying."
    >
      <div className="prose-page mt-8">
        <h2>Why This Site Exists</h2>
        <p>
          Buying anything online means wading through hundreds of near-identical listings, inflated star ratings, and review sections that read like they were written by the marketing department.
        </p>

        <p>
          We do that wading for you. Each guide narrows a category down to a handful of products worth your money, explains why each one made the list, and says plainly who it is not for.
        </p>

        <h2>How We Work</h2>
        <p>
          Every recommendation is assessed on real-world performance, build quality, value for money, and the pattern of feedback from verified owners — not on spec sheets alone.
        </p>

        <p>
          Our rankings are editorially independent. No brand can pay for placement or a higher position. The full detail is in our{" "}
          <Link href="/editorial">Editorial Policy</Link>.
        </p>

        <h2>How We Make Money</h2>
        <p>
          We participate in the Amazon Associates Program. When you buy through a link on this site, we may earn a commission at no extra cost to you — the price is the same either way.
        </p>

        <p>
          That commission is what funds the research and keeps the site free to read. It does not influence what we recommend. See our{" "}
          <Link href="/disclosure">Affiliate Disclosure</Link> for specifics.
        </p>

        <h2>What We Cover</h2>
        <p>
          Consumer categories where the choice is genuinely hard and the price difference is real — electronics, home and kitchen, personal care, and adjacent categories. Browse everything by{" "}
          <Link href="/categories">category</Link>, or jump to our{" "}
          <Link href="/reviews">reviews</Link> and{" "}
          <Link href="/guides">buying guides</Link>.
        </p>

        <h2>Get In Touch</h2>
        <p>
          Spotted an error, or want a category covered? Our{" "}
          <Link href="/contact">contact page</Link> has the details.
        </p>
      </div>
    </PageShell>
  );
}
