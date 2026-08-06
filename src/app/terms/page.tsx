import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Terms of Use — AffiliBlog",
  description: "The terms that govern your use of this website.",
};

export default function TermsPage() {
  return (
    <PageShell title="Terms of Use" eyebrow="Legal" width="prose">
      <div className="prose-page mt-8">
        <p>
          <strong>Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>
        </p>

        <p>
          By accessing and using AffiliBlog, you accept and agree to be bound by these Terms of Use. If you do not agree, please do not use this site.
        </p>

        <h2>Use of Content</h2>
        <p>
          All content on this site — including text, graphics, logos, and images — is the property of AffiliBlog or its content suppliers and is protected by copyright law.
        </p>

        <p>
          You may view, download, and print content for personal, non-commercial use. You may not reproduce, republish, distribute, or create derivative works from our content without written permission.
        </p>

        <h2>No Professional Advice</h2>
        <p>
          The content on this site is for informational purposes only. Our reviews and recommendations reflect our opinions based on testing and research. They do not constitute professional, financial, medical, or legal advice.
        </p>

        <p>
          You are responsible for evaluating whether a product is suitable for your needs before purchasing.
        </p>

        <h2>Product Information Accuracy</h2>
        <p>
          We make reasonable efforts to ensure product information — including prices, specifications, ratings, and availability — is accurate at the time of publication. However:
        </p>
        <ul>
          <li>Prices and availability change frequently and are controlled by the retailer, not us</li>
          <li>Specifications may be updated by manufacturers without notice</li>
          <li>We do not guarantee that any product information is complete, current, or error-free</li>
        </ul>

        <p>
          Always verify details on the retailer&rsquo;s site before purchasing.
        </p>

        <h2>Third-Party Links</h2>
        <p>
          Our site contains links to third-party websites, including affiliate links to Amazon and other retailers. We are not responsible for the content, privacy practices, or terms of those sites.
        </p>

        <p>
          Your transactions with third-party retailers are solely between you and that retailer. We are not a party to those transactions and have no responsibility for order fulfillment, shipping, returns, warranties, or customer service.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          This site is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied. To the fullest extent permitted by law, AffiliBlog shall not be liable for any direct, indirect, incidental, or consequential damages arising from:
        </p>
        <ul>
          <li>Your use of, or inability to use, this site</li>
          <li>Any purchase you make based on our content</li>
          <li>Errors or omissions in our content</li>
          <li>Any third-party site linked from ours</li>
        </ul>

        <h2>Affiliate Relationships</h2>
        <p>
          We earn commissions from qualifying purchases made through affiliate links. See our <a href="/disclosure">Affiliate Disclosure</a> for full details.
        </p>

        <h2>Newsletter</h2>
        <p>
          By subscribing to our newsletter, you consent to receive periodic emails from us. You may unsubscribe at any time using the link in any email.
        </p>

        <h2>Changes to These Terms</h2>
        <p>
          We may revise these Terms of Use at any time. Continued use of the site after changes are posted constitutes acceptance of the revised terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms? Reach us through our <a href="/contact">contact page</a>.
        </p>
      </div>
    </PageShell>
  );
}
