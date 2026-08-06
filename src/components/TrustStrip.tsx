import { Headphones, Shield, Tag, Zap } from "./icons";
import { trustPoints } from "@/lib/data";

const iconMap = {
  headphones: Headphones,
  zap: Zap,
  shield: Shield,
  tag: Tag,
};

/**
 * Four-up credibility strip that sits directly under the post hero.
 * Desktop: 4 columns. Mobile: 2×2 grid.
 */
export default function TrustStrip() {
  return (
    <div className="border-y border-line bg-paper">
      <div className="mx-auto max-w-page px-5 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {trustPoints.map((point, i) => {
            const Icon = iconMap[point.icon];
            return (
              <div
                key={i}
                className={`flex flex-col items-center gap-2.5 py-5 lg:py-6 ${
                  i < 2 ? "border-b lg:border-b-0" : ""
                } ${
                  i === 0 || i === 2
                    ? "border-r"
                    : i === 1
                      ? "lg:border-r"
                      : ""
                }`}
              >
                <Icon size={22} className="text-bronze" />
                <p className="text-[12px] text-body text-center max-w-[140px] leading-snug">
                  {point.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
