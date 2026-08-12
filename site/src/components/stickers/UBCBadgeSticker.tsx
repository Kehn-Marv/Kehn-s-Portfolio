import { useId } from "react";

const INK = "#141111";
const NAVY = "#002145";
const WHITE = "#FFFFFF";

/** Outer die-cut: flat top, straight shoulders, curved taper to a point. */
const SHIELD = "M 27 12 H 93 V 50 C 93 76 82 94 60 106 C 38 94 27 76 27 50 Z";

/** Navy field inset 6 units inside the die-cut. */
const FIELD = "M 33 18 H 87 V 49 C 87 71 78 87 60 97 C 42 87 33 71 33 49 Z";

/**
 * Sunburst rays, polar-generated for perfect bilateral symmetry:
 * 7 triangular rays radiating from (60,88), bases on a r=16 dome circle,
 * center ray tallest (tip y=48, reaching the top wave), outer rays fanning
 * to ±73° so the sun spans the shield like the official simplified crest.
 */
const SUN_RAYS =
  "M 44.1 86.5 L 37 81 L 45.9 80.4 L 46.1 80 L 37.5 68.1 L 50.4 75.2 " +
  "L 50.7 75 L 45.8 56 L 56.5 72.4 L 56.8 72.3 L 60 48 L 63.2 72.3 " +
  "L 63.5 72.4 L 74.2 56 L 69.3 75 L 69.6 75.2 L 82.5 68.1 L 73.9 80 " +
  "L 74.1 80.4 L 83 81 L 75.9 86.5 Z";

const SUN_DOME = { cx: 60, cy: 88, r: 16 };

/** One uniform sine period repeated edge-to-edge (wavelength 14, peak ±1.8). */
const WAVE =
  "M 32 0 Q 35.5 -3.6 39 0 T 46 0 T 53 0 T 60 0 T 67 0 T 74 0 T 81 0 T 88 0";

const WAVE_ROWS = [47, 55, 63] as const;

export function UBCBadgeSticker({
  size = 120,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const clipId = useId();
  const sans = "var(--font-space-grotesk), system-ui, sans-serif";

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={FIELD} />
        </clipPath>
      </defs>

      {/* Sticker chrome: hard ink offset shadow + white die-cut ring */}
      <path d={SHIELD} fill={INK} transform="translate(4 4)" />
      <path d={SHIELD} fill={WHITE} stroke={INK} strokeWidth="4" />
      <path d={FIELD} fill={NAVY} />

      <g clipPath={`url(#${clipId})`}>
        <text
          x="60"
          y="40"
          fill={WHITE}
          fontFamily={sans}
          fontSize="20"
          fontWeight="700"
          letterSpacing="2.5"
          textAnchor="middle"
        >
          UBC
        </text>

        {WAVE_ROWS.map((y) => (
          <path
            key={y}
            d={WAVE}
            transform={`translate(0 ${y})`}
            fill="none"
            stroke={WHITE}
            strokeWidth="3"
            strokeLinecap="round"
          />
        ))}

        {/* Navy halo first so the rays punch cleanly through the waves */}
        <circle
          cx={SUN_DOME.cx}
          cy={SUN_DOME.cy}
          r={SUN_DOME.r}
          fill="none"
          stroke={NAVY}
          strokeWidth="4"
        />
        <path
          d={SUN_RAYS}
          fill="none"
          stroke={NAVY}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <circle
          cx={SUN_DOME.cx}
          cy={SUN_DOME.cy}
          r={SUN_DOME.r}
          fill={WHITE}
        />
        <path d={SUN_RAYS} fill={WHITE} />

        {/* Navy rim keeps the sun separated from the white die-cut ring */}
        <path d={FIELD} fill="none" stroke={NAVY} strokeWidth="5" />
      </g>
    </svg>
  );
}
