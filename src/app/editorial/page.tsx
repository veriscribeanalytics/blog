import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description: "How we test, rank, and recommend the products we write about.",
  alternates: { canonical: "/editorial" },
};

export default function EditorialPage() {
  return (
    <PageShell
      title="Editorial Policy"
      eyebrow="Legal"
      width="prose"
      intro="How we decide what to recommend — and what would make us change our minds."
    >
      <div className="prose-page mt-8">
        <p>
          <strong>Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>
        </p>

        <h2>Our Commitment</h2>
        <p>
          We only recommend what we would buy ourselves. Every ranking on this site reflects our genuine assessment of which product serves the reader best — not which one pays the highest commission.
        </p>

        <h2>How We Evaluate Products</h2>
        <p>
          Each product we cover is assessed against a consistent set of criteria:
        </p>
        <ul>
          <li><strong>Real-world performance</strong> — how it behaves in everyday use, not just on a spec sheet</li>
          <li><strong>Build quality</strong> — materials, construction, and how well it holds up over time</li>
          <li><strong>Value for money</strong> — what you get relative to what you pay, at every budget</li>
          <li><strong>Verified owner feedback</strong> — patterns across a large sample of real purchaser reviews</li>
          <li><strong>Support and warranty</strong> — what happens when something goes wrong</li>
        </ul>

        <h2>How We Rank</h2>
        <p>
          Rankings reflect the balance of the criteria above for a typical buyer in that category. &ldquo;Best Overall&rdquo; means best for most people — not the most expensive option, and not the cheapest.
        </p>

        <p>
          Where a product wins on a narrower axis — budget, battery life, a specific use case — we say so explicitly rather than inflating its overall position.
        </p>

        <h2>Commercial Independence</h2>
        <p>
          Affiliate commissions never influence rankings, scores, or whether a product is included. Specifically:
        </p>
        <ul>
          <li>No brand can pay for placement, a higher ranking, or a better score</li>
          <li>Commission rates are not a factor in our evaluation criteria</li>
          <li>We include products with no affiliate program when they are the right recommendation</li>
          <li>We exclude products that fail our standards regardless of commission</li>
        </ul>

        <p>
          Our editorial team makes recommendations independently of any commercial relationship. See our <a href="/disclosure">Affiliate Disclosure</a> for how we earn.
        </p>

        <h2>Free and Loaned Products</h2>
        <p>
          When a manufacturer provides a product for review at no cost, we disclose it in the article. Receiving a product free does not guarantee coverage or a positive assessment.
        </p>

        <h2>Keeping Content Current</h2>
        <p>
          Product categories move quickly. We review our published guides on an ongoing basis and update them when:
        </p>
        <ul>
          <li>A recommended product is discontinued or replaced by a newer model</li>
          <li>A materially better option enters the category</li>
          <li>Pricing shifts enough to change the value calculation</li>
          <li>Reliability issues emerge from long-term owner feedback</li>
        </ul>

        <p>
          Each article shows when it was last updated.
        </p>

        <h2>Corrections</h2>
        <p>
          We correct factual errors promptly. If you spot something inaccurate — a wrong specification, an outdated price, a broken claim — tell us through our <a href="/contact">contact page</a> and we will review it.
        </p>

        <p>
          Substantive corrections are noted in the article rather than made silently.
        </p>

        <h2>Reader First</h2>
        <p>
          If a category has no product worth recommending, we say that. A guide that tells you to wait, or to keep what you have, is more useful than one that manufactures a winner.
        </p>
      </div>
    </PageShell>
  );
}
