import Image from "next/image";
import { Mail } from "./icons";
import { newsletterTagline } from "@/lib/data";
import SubscribeForm from "./SubscribeForm";

/**
 * "Stay Updated" band — desktop: lamp photo left, form center.
 * Mobile: compact dark bar with envelope icon + inline form.
 * Both forms POST to /api/newsletter via the shared client SubscribeForm.
 */
export default function Newsletter() {
  return (
    <section id="newsletter" className="mx-auto max-w-page px-5 lg:px-8 pb-16 lg:pb-24">
      {/* ── desktop ────────────────────────────────────────────── */}
      <div className="hidden lg:block bg-sand border border-line overflow-hidden">
        <div className="flex">
          <div className="relative w-[280px] shrink-0">
            <Image
              src="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&h=600&q=80"
              alt=""
              fill
              sizes="280px"
              className="object-cover"
            />
          </div>

          <div className="flex-1 px-10 py-10 flex flex-col justify-center">
            <h2 className="text-[30px] leading-tight">Stay Updated</h2>
            <p className="mt-2 text-[15px] text-body max-w-lg leading-relaxed">
              Get the latest reviews, guides and exclusive deals straight to your inbox.
            </p>

            <SubscribeForm
              id="email-desktop"
              wrapperClass="mt-6 w-full"
              formClass="flex gap-3 max-w-2xl"
              inputClass="flex-1 bg-paper border border-line px-4 py-3 text-[14px] text-ink placeholder:text-muted focus:border-bronze transition-colors"
              buttonClass="btn-subscribe"
            />

            <p
              className="mt-6 text-bronze text-[19px] leading-tight"
              style={{ fontFamily: "var(--font-dancing)" }}
            >
              {newsletterTagline}
            </p>
          </div>
        </div>
      </div>

      {/* ── mobile ─────────────────────────────────────────────── */}
      <div className="lg:hidden bg-ink text-cream flex items-center gap-4 px-5 py-4 border border-ink">
        <Mail size={24} className="shrink-0" />
        <SubscribeForm
          id="email-mobile"
          wrapperClass="flex-1 min-w-0"
          formClass="flex gap-2"
          inputClass="flex-1 bg-paper/10 border border-cream/20 px-3 py-2 text-nav text-cream placeholder:text-cream/60 focus:border-cream/40 transition-colors"
          buttonClass="bg-bronze text-ink text-nav font-medium px-5 py-2 hover:bg-bronze-deep transition-colors"
          buttonLabel="Go"
          messageClass="mt-1.5 text-[12px]"
        />
      </div>
    </section>
  );
}
