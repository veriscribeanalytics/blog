/** Inline stroke icons — sized by the `size` prop, coloured by `currentColor`. */

type P = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const Menu = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

export const Close = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const Search = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const ChevronDown = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ArrowRight = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
);

export const ArrowLeft = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M20 12H4M10 6l-6 6 6 6" />
  </svg>
);

export const Check = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="m4 12.5 5 5L20 6.5" />
  </svg>
);

export const Play = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M6 4l14 8-14 8V4z" />
  </svg>
);

export const Pause = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M8 5v14M16 5v14" />
  </svg>
);

export const Grid = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

export const Star = ({
  size = 14,
  className,
  fill = "currentColor",
}: P & { fill?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    aria-hidden
    className={className}
  >
    <path d="M12 2.5l2.95 5.98 6.6.96-4.77 4.65 1.12 6.57L12 17.55 6.1 20.66l1.12-6.57L2.45 9.44l6.6-.96L12 2.5z" />
  </svg>
);

export const StarHalf = ({ size = 14, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={className}>
    <defs>
      <linearGradient id="half">
        <stop offset="50%" stopColor="currentColor" />
        <stop offset="50%" stopColor="transparent" />
      </linearGradient>
    </defs>
    <path
      d="M12 2.5l2.95 5.98 6.6.96-4.77 4.65 1.12 6.57L12 17.55 6.1 20.66l1.12-6.57L2.45 9.44l6.6-.96L12 2.5z"
      fill="url(#half)"
      stroke="currentColor"
      strokeWidth={1.2}
    />
  </svg>
);

export const Facebook = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.2c0-.9.3-1.5 1.6-1.5h1.6V4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V10H7.5v3h2.8v8h3.2z" />
  </svg>
);

export const Twitter = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M17.5 3h3.2l-7 8 7.3 10h-5.6l-4.4-6-5 6H2.8l7.3-8.6L3 3h5.7l4.1 5.6L17.5 3zm-1.1 16h1.7L7.7 4.8H5.9l10.5 14.2z" />
  </svg>
);

export const WhatsApp = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M12 2a9.9 9.9 0 0 0-8.5 15L2 22l5.1-1.4A9.9 9.9 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.5-5.9c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8.9c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.1-.2 0-.4.1-.5l.6-.7c.1-.2.1-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.4-.3.3-.9 1-.9 2.2 0 1.3.9 2.5 1 2.7a9.4 9.4 0 0 0 3.7 3.3c1.7.7 2.1.6 2.5.5.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2z" />
  </svg>
);

export const Link = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M9.5 14.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1" />
    <path d="M14.5 9.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1" />
  </svg>
);

export const Instagram = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const YouTube = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M21.6 7.2s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.2 4.1 12 4.1 12 4.1h0s-4.2 0-6.8.2c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2.2 8.8 2.2 10.5v1.6c0 1.6.2 3.3.2 3.3s.2 1.4.8 2c.8.8 1.8.8 2.2.9 1.6.1 6.6.2 6.6.2s4.2 0 6.8-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.3v-1.6c0-1.7-.2-3.3-.2-3.3zM9.9 14.3V8.6l5.5 2.9-5.5 2.8z" />
  </svg>
);

export const Heart = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

export const Headphones = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3a9 9 0 0 0-9 9v7a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H5v-2a7 7 0 1 1 14 0v2h-1a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-7a9 9 0 0 0-9-9z" />
  </svg>
);

export const Shield = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 2 4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4zm-1 16.2c-3.3-1.2-6-5.2-6-9.2V6.9l6-3.4v14.7z" />
  </svg>
);

export const Tag = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M20.6 11.2 13.8 4.4C13.6 4.2 13.3 4 13 4H5c-.6 0-1 .4-1 1v8c0 .3.1.6.3.8l6.8 6.8c.2.2.5.3.8.3s.6-.1.8-.3l8-8c.2-.2.3-.5.3-.8s-.2-.6-.4-.6zM8.5 9.5c-.8 0-1.5-.7-1.5-1.5S7.7 6.5 8.5 6.5 10 7.2 10 8s-.7 1.5-1.5 1.5z" />
  </svg>
);

export const Zap = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z" />
  </svg>
);

export const Mail = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 7 10-7" />
  </svg>
);

export const ChevronRight = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const Pinterest = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5.1s-.3-.6-.3-1.5c0-1.4.8-2.5 1.8-2.5.9 0 1.3.6 1.3 1.4 0 .9-.6 2.2-.9 3.4-.2 1 .5 1.9 1.5 1.9 1.9 0 3.2-2.4 3.2-5.2 0-2.1-1.5-3.7-4.1-3.7-3 0-4.8 2.2-4.8 4.7 0 .9.3 1.5.7 2 .2.2.2.3.1.5l-.2.8c-.1.3-.2.4-.5.2-1.3-.5-1.9-2-1.9-3.6 0-2.7 2.2-5.9 6.7-5.9 3.6 0 5.9 2.6 5.9 5.4 0 3.7-2 6.4-5 6.4-1 0-2-.6-2.3-1.2l-.6 2.5c-.2.8-.7 1.7-1.1 2.3A10 10 0 1 0 12 2z" />
  </svg>
);

/**
 * Hand-drawn bronze underline swash. Repeats under headings across the site —
 * decorative only, so it is hidden from assistive tech.
 */
export const Swash = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 200 12"
    fill="none"
    preserveAspectRatio="none"
    aria-hidden
    className={className}
  >
    <path
      d="M2 8.5c22-4.2 47-6 74-5.3 27 .7 51 3.4 74 6.1M14 11c19-2.6 40-3.7 63-3.2"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);
