const INK = "#141111";
const YC_ORANGE = "#FF6600";
const WHITE = "#FFFFFF";
const CREAM = "#FFFAEF";

const TILE = { x: 8, y: 6, size: 96 };
const SHADOW = 4;

/**
 * YC-readable sticker: orange square + white Y (the brand mark).
 * Event copy lives in a cream label — straight text, no cramped textPath.
 */
export function YCStamp({
  size = 120,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const sans = "var(--font-space-grotesk), system-ui, sans-serif";
  const { x, y, size: s } = TILE;

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <rect x={x + SHADOW} y={y + SHADOW} width={s} height={s} fill={INK} />

      <rect
        x={x}
        y={y}
        width={s}
        height={s}
        fill={YC_ORANGE}
        stroke={INK}
        strokeWidth="3.5"
      />

      {/* Brand mark */}
      <text
        x={x + s / 2}
        y={y + 48}
        fill={WHITE}
        fontFamily={sans}
        fontSize="50"
        fontWeight="700"
        textAnchor="middle"
        letterSpacing="-1"
      >
        Y
      </text>

      {/* Readable event label — grotesk, not mono (mono zeros look broken) */}
      <rect
        x={x + 7}
        y={y + 58}
        width={s - 14}
        height={30}
        fill={CREAM}
        stroke={INK}
        strokeWidth="2.25"
      />
      <text
        x={x + s / 2}
        y={y + 71}
        fill={INK}
        fontFamily={sans}
        fontSize="9.5"
        fontWeight="700"
        textAnchor="middle"
        letterSpacing="0.5"
      >
        STACKATHON
      </text>
      <text
        x={x + s / 2}
        y={y + 83}
        fill={INK}
        fontFamily={sans}
        fontSize="8.5"
        fontWeight="700"
        textAnchor="middle"
        letterSpacing="0.6"
      >
        YC HQ · 2026
      </text>
    </svg>
  );
}
