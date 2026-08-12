import { useId } from "react";

export function BellCurveSticker({
  size = 120,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const id = useId();
  const mono = "var(--font-space-mono), monospace";

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <rect x="14" y="24" width="100" height="84" fill="#141111" />
      <rect
        x="10"
        y="20"
        width="100"
        height="84"
        fill="#FFFAEF"
        stroke="#141111"
        strokeWidth="5"
      />

      <defs>
        <clipPath id={`${id}-sigma`}>
          <rect x="48" y="30" width="24" height="58" />
        </clipPath>
      </defs>
      <path
        d="M 22 88 C 38 88, 46 36, 60 36 C 74 36, 82 88, 98 88 Z"
        fill="#FFD440"
        clipPath={`url(#${id}-sigma)`}
      />
      <path
        d="M 22 88 C 38 88, 46 36, 60 36 C 74 36, 82 88, 98 88"
        fill="none"
        stroke="#141111"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <line
        x1="60"
        y1="42"
        x2="60"
        y2="86"
        stroke="#141111"
        strokeWidth="2.5"
        strokeDasharray="4 3"
      />
      <line
        x1="20"
        y1="88"
        x2="100"
        y2="88"
        stroke="#141111"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="36"
        y1="88"
        x2="36"
        y2="93"
        stroke="#141111"
        strokeWidth="2.5"
      />
      <line
        x1="48"
        y1="88"
        x2="48"
        y2="93"
        stroke="#141111"
        strokeWidth="2.5"
      />
      <line
        x1="72"
        y1="88"
        x2="72"
        y2="93"
        stroke="#141111"
        strokeWidth="2.5"
      />
      <line
        x1="84"
        y1="88"
        x2="84"
        y2="93"
        stroke="#141111"
        strokeWidth="2.5"
      />

      <text
        x="60"
        y="101"
        fill="#141111"
        fontFamily={mono}
        fontSize="10"
        fontWeight="700"
        textAnchor="middle"
      >
        μ
      </text>
      <text
        x="66"
        y="76"
        fill="#141111"
        fontFamily={mono}
        fontSize="9"
        fontWeight="700"
        textAnchor="middle"
      >
        σ
      </text>
    </svg>
  );
}
