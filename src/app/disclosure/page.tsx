import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: "How we earn from product recommendations and affiliate links.",
  alternates: { canonical: "/disclosure" },
};

export default function DisclosurePage() {
  return (
    <PageShell title="Affiliate Disclosure" eyebrow="Legal" width="prose">
      <div className="prose-page mt-8">
        <p>
          <strong>Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>
        </p>

        <h2>Amazon Associates Program</h2>
        <p>
          AffiliBlog is a participant in the Amazon Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in and affiliated sites.
        </p>

        <p>
          <strong>As an Amazon Associate, we earn from qualifying purchases.</strong>
        </p>

        <h2>How Affiliate Links Work</h2>
        <p>
          When you click on an affiliate link and make a purchase, we may receive a commission from the retailer. This commission comes at no additional cost to you — the price you pay is the same whether you use our link or go directly to the retailer.
        </p>

        <h2>Our Editorial Independence</h2>
        <p>
          Our reviews, rankings, and recommendations are based on hands-on testing, research, and editorial judgment. Affiliate relationships do not influence our evaluations or rankings.
        </p>

        <p>
          We recommend products we believe offer genuine value. If we earn a commission, great — but if a product doesn&rsquo;t meet our standards, we won&rsquo;t recommend it regardless of the commission rate.
        </p>

        <h2>What We Review</h2>
        <p>
          We focus on products across categories including electronics, home goods, personal care, and more. Each product we review is evaluated against:
        </p>
        <ul>
          <li>Real-world performance and usability</li>
          <li>Build quality and durability</li>
          <li>Value for money</li>
          <li>Customer feedback and ratings</li>
        </ul>

        <h2>Transparency in Our Content</h2>
        <p>
          Every product review and buying guide on this site includes a disclosure that affiliate links are present. We clearly label &ldquo;View on Amazon&rdquo; buttons and affiliate links throughout our content.
        </p>

        <p>
          If we receive a product for free from a manufacturer or retailer for review purposes, we disclose that in the article. Free products do not guarantee positive reviews.
        </p>

        <h2>Price and Availability</h2>
        <p>
          Prices and availability displayed on our site are accurate at the time of publication but may change. The final price you see on the retailer&rsquo;s site is what you&rsquo;ll pay.
        </p>

        <p>
          We update our content regularly, but we recommend checking the current price and stock on the retailer&rsquo;s site before purchasing.
        </p>

        <h2>Your Support Helps Us</h2>
        <p>
          When you use our affiliate links, you help support our work at no extra cost to yourself. The commissions we earn allow us to:
        </p>
        <ul>
          <li>Purchase products for hands-on testing</li>
          <li>Maintain and improve our website</li>
          <li>Create detailed, honest reviews and guides</li>
          <li>Keep our content free for readers</li>
        </ul>

        <h2>Questions</h2>
        <p>
          If you have questions about our affiliate relationships or how we earn from recommendations, please contact us through our <a href="/contact">contact page</a>.
        </p>
      </div>
    </PageShell>
  );
}
