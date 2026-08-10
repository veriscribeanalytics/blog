import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with questions, corrections, or category suggestions.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <PageShell
      title="Get in Touch"
      eyebrow="Contact"
      width="prose"
      intro="Found an error, or want a category covered? We'd like to hear about it."
    >
      <div className="prose-page mt-8">
        <h2>Spotted Something Wrong?</h2>
        <p>
          We correct factual errors promptly. If you&rsquo;ve found a wrong specification, an outdated price, a broken claim, or anything else that looks off, email us at:
        </p>
        <p>
          <strong>corrections@affiliblog.example</strong>
        </p>
        <p>
          Include the article URL and the specific claim that needs fixing — the more precise you are, the faster we can review and update.
        </p>

        <h2>Category Suggestions</h2>
        <p>
          If there&rsquo;s a product category you&rsquo;d like us to cover, let us know. We can&rsquo;t promise coverage — it depends on whether the category is genuinely hard to navigate and whether we can test the products — but we do read every suggestion.
        </p>
        <p>
          <strong>ideas@affiliblog.example</strong>
        </p>

        <h2>General Inquiries</h2>
        <p>
          For anything else — partnership questions, press inquiries, or something that doesn&rsquo;t fit the categories above — reach us at:
        </p>
        <p>
          <strong>hello@affiliblog.example</strong>
        </p>

        <h2>What We Can&rsquo;t Help With</h2>
        <p>
          We don&rsquo;t troubleshoot products you&rsquo;ve already purchased, handle order or shipping issues, or intervene in retailer disputes. For those, contact the seller or manufacturer directly.
        </p>

        <h2>Newsletter</h2>
        <p>
          Already subscribed and want to update your email or unsubscribe? Every newsletter includes an unsubscribe link at the bottom. To change your address, unsubscribe the old one and re-subscribe with the new.
        </p>
      </div>
    </PageShell>
  );
}
