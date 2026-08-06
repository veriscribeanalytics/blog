"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/config";
import type { Category } from "@/lib/types";
import { ArrowRight, ChevronDown, Close, Menu } from "./icons";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="AffiliBlog home"
      className={`font-serif tracking-tight leading-none ${className}`}
    >
      <span className="text-ink">Affili</span>
      <span className="text-bronze">Blog</span>
    </Link>
  );
}

export default function Header({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [cats, setCats] = useState(false);

  // lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-page px-5 lg:px-8">
        <div className="flex h-header-mobile lg:h-header-desktop items-center gap-4">
          {/* hamburger — always visible, matches the mock on every breakpoint */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="-ml-1 p-2 text-ink hover:text-bronze transition-colors"
          >
            <Menu size={22} />
          </button>

          {/* logo: centred on mobile, inline on desktop */}
          <div className="flex-1 flex justify-center lg:flex-none lg:justify-start">
            <Logo className="text-logo-mobile lg:text-logo-desktop" />
          </div>

          {/* desktop nav */}
          <nav className="hidden lg:flex items-center gap-8 ml-auto text-nav text-body">
            <div
              className="relative"
              onMouseEnter={() => setCats(true)}
              onMouseLeave={() => setCats(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-bronze transition-colors"
                aria-expanded={cats}
              >
                Categories
                <ChevronDown size={14} />
              </button>
              {cats && (
                <div className="absolute left-0 top-full pt-3">
                  <div className="w-56 bg-paper border border-line shadow-dropdown py-2">
                    {categories.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/category/${c.slug}`}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-sand hover:text-bronze transition-colors"
                      >
                        {c.name}
                        <span className="text-tiny text-muted">
                          {c.count.replace(" Articles", "")}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:text-bronze transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 lg:gap-5 lg:ml-2">
            <Link
              href="#newsletter"
              className="hidden lg:inline-flex btn-subscribe"
            >
              Subscribe
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* mobile / tablet drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-[86%] max-w-sm bg-paper flex flex-col transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-header-mobile items-center justify-between px-5 border-b border-line">
            <Logo className="text-logo-mobile" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="p-2 text-ink"
            >
              <Close size={22} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-5 py-6">
            <p className="eyebrow mb-3">Categories</p>
            <div className="space-y-1 mb-7">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between py-2 text-[15px] text-body hover:text-bronze"
                >
                  {c.name}
                  <span className="text-tiny text-muted">{c.count}</span>
                </Link>
              ))}
            </div>

            <p className="eyebrow mb-3">Menu</p>
            <div className="space-y-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-[15px] text-body hover:text-bronze"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="p-5 border-t border-line">
            <Link
              href="#newsletter"
              onClick={() => setOpen(false)}
              className="block w-full bg-ink text-cream text-center text-[14px] font-medium py-3 hover:bg-bronze-deep transition-colors"
            >
              Subscribe
            </Link>
          </div>
        </aside>
      </div>
    </header>
  );
}
