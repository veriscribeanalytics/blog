import Link from "next/link";
import { getCategories, navLinks } from "@/lib/data";
import { Logo } from "./Header";

export default async function Footer() {
  const categories = await getCategories();
  return (
    <footer className="mt-auto bg-paper border-t border-line">
      <div className="mx-auto max-w-page px-5 lg:px-8 py-14 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Logo className="text-logo-mobile" />
            <p className="mt-4 text-[14px] leading-relaxed text-body max-w-xs">
              Honest reviews, curated deals and expert buying guides — so you spend
              less time researching and more time enjoying.
            </p>
          </div>

          <div>
            <h3 className="text-nav font-sans font-semibold tracking-[0.14em] uppercase text-ink">
              Categories
            </h3>
            <ul className="mt-4 space-y-2.5 text-[14px] text-body">
              {categories.slice(0, 5).map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} className="hover:text-bronze transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-nav font-sans font-semibold tracking-[0.14em] uppercase text-ink">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5 text-[14px] text-body">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-bronze transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-nav font-sans font-semibold tracking-[0.14em] uppercase text-ink">
              Legal
            </h3>
            <ul className="mt-4 space-y-2.5 text-[14px] text-body">
              {[
                ["Privacy Policy", "/privacy"],
                ["Terms of Use", "/terms"],
                ["Affiliate Disclosure", "/disclosure"],
                ["Editorial Policy", "/editorial"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-bronze transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-line flex flex-col sm:flex-row gap-3 items-center justify-between text-[12.5px] text-muted">
          <p>© {new Date().getFullYear()} AffiliBlog. All rights reserved.</p>
          <p>
            As an Amazon Associate we earn from qualifying purchases.
          </p>
        </div>
      </div>
    </footer>
  );
}
