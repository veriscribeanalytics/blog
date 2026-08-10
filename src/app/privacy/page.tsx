import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How we collect, use, and protect your information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy" eyebrow="Legal" width="prose">
      <div className="prose-page mt-8">
        <p>
          <strong>Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>
        </p>

        <p>
          AffiliBlog (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates this website. This page explains how we collect, use, and protect your personal information when you visit our site.
        </p>

        <h2>Information We Collect</h2>

        <h3>Information You Provide</h3>
        <p>
          When you subscribe to our newsletter, we collect your email address. This is the only personal information we actively request from you.
        </p>

        <h3>Automatically Collected Information</h3>
        <p>
          Like most websites, we automatically collect certain technical information when you visit, including your IP address, browser type, device information, and pages viewed. This information helps us understand how visitors use our site and improve our content.
        </p>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>To send you our newsletter if you subscribed</li>
          <li>To analyze site traffic and improve our content</li>
          <li>To maintain the security and integrity of our site</li>
          <li>To comply with legal obligations</li>
        </ul>

        <h2>Cookies</h2>
        <p>
          We may use cookies and similar tracking technologies to improve your browsing experience and analyze site traffic. You can control cookie preferences through your browser settings.
        </p>

        <h2>Third-Party Services</h2>
        <p>
          We use third-party services to operate our site and may share information with:
        </p>
        <ul>
          <li><strong>Analytics providers</strong> to understand how visitors use our site</li>
          <li><strong>Email service providers</strong> to deliver our newsletter</li>
          <li><strong>Hosting providers</strong> to store and serve our content</li>
        </ul>

        <h2>Affiliate Links and Amazon Associates</h2>
        <p>
          We participate in the Amazon Associates Program and include affiliate links in our content. When you click these links and make a purchase, we may earn a commission at no extra cost to you. Amazon may collect information about your visit when you click our affiliate links. See our <a href="/disclosure">Affiliate Disclosure</a> for more details.
        </p>

        <h2>Data Security</h2>
        <p>
          We implement reasonable security measures to protect your personal information from unauthorized access, alteration, or disclosure. However, no method of transmission over the internet is 100% secure.
        </p>

        <h2>Your Rights</h2>
        <p>
          You have the right to:
        </p>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your information</li>
          <li>Unsubscribe from our newsletter at any time</li>
        </ul>

        <h2>Children&rsquo;s Privacy</h2>
        <p>
          Our site is not directed to children under 13. We do not knowingly collect personal information from children under 13.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. The &ldquo;Last updated&rdquo; date at the top indicates when this policy was last revised.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about this privacy policy or how we handle your information, please contact us through our <a href="/contact">contact page</a>.
        </p>
      </div>
    </PageShell>
  );
}
