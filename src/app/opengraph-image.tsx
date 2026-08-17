import { ImageResponse } from "next/og";
import { siteName } from "@/lib/config";

/**
 * Default social card, generated at build time.
 *
 * Every route without its own image points at this one, so a share of `/`,
 * `/blog` or any legal page gets a real preview instead of a bare link. Post and
 * category pages override it with their hero image.
 *
 * Drawn from the design tokens rather than a static asset so it can't drift from
 * the site's palette.
 *
 * TYPE CAVEAT: `next/og` ships one default sans face and no serif, so the
 * headline renders in that sans rather than Playfair — the card is on-palette but
 * not in the site's display face. Fixing it properly means passing font `data` to
 * ImageResponse, which needs a font file committed to the repo; fetching Playfair
 * over the network at build time would make a deploy fail on a blip, which this
 * project has already been burned by (see DEPLOY.md).
 */
export const alt = `${siteName} — honest reviews, curated deals, buying guides`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CREAM = "#faf7f2";
const INK = "#14110e";
const BODY = "#4f463d";
const BRONZE = "#a67c45";
const LINE = "#e7dfd3";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: CREAM,
          padding: "72px 80px",
          border: `1px solid ${LINE}`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 30,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: BRONZE,
              fontWeight: 600,
            }}
          >
            {siteName}
          </div>
          <div
            style={{
              marginTop: 18,
              width: 132,
              height: 3,
              backgroundColor: BRONZE,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 74,
            lineHeight: 1.12,
            color: INK,
            letterSpacing: "-0.02em",
            maxWidth: 900,
          }}
        >
          Honest reviews of things worth buying.
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: BODY,
            letterSpacing: "0.02em",
          }}
        >
          Researched, cross-checked, and judged honestly.
        </div>
      </div>
    ),
    size,
  );
}
