import { manifesto } from "@/lib/data";
import AccentTitle from "./AccentTitle";

/**
 * Quiet editorial pause between the two home-page grids. Deliberately holds a
 * single sentence on a sand field — the breathing room is the point, so resist
 * adding links or imagery here.
 */
export default function Manifesto() {
  return (
    <section className="border-t border-line-soft bg-sand">
      <div className="mx-auto max-w-page px-5 lg:px-8 py-20 lg:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <p className="eyebrow mb-6">{manifesto.eyebrow}</p>
          <p className="font-serif text-[1.5rem] sm:text-[1.9rem] lg:text-[2.4rem] leading-[1.3] tracking-[-0.02em] text-ink text-balance">
            <AccentTitle title={manifesto.statement} accent={manifesto.accent} />
          </p>
          <span
            aria-hidden
            className="mt-10 inline-block w-16 h-px bg-bronze/50"
          />
        </div>
      </div>
    </section>
  );
}
