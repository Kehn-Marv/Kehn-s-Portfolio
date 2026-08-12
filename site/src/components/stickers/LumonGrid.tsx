const DIGITS = [
  ["1", "4", "1", "5", "9"],
  ["2", "6", "5", "3", "5"],
  ["8", "9", "7", "9", "3"],
  ["2", "3", "8", "4", "6"],
];

const GRID_X = 22;
const GRID_Y = 30;
const COL_W = 16;
const ROW_H = 16;

export function LumonGrid({
  size = 120,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const mono = "var(--font-space-mono), monospace";

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <rect x="12" y="20" width="96" height="80" fill="#141111" />
      <rect
        x="8"
        y="16"
        width="96"
        height="80"
        fill="#FFFAEF"
        stroke="#141111"
        strokeWidth="5"
      />

      <rect
        x={GRID_X + COL_W - 2}
        y={GRID_Y + ROW_H - 2}
        width={COL_W * 2 + 4}
        height={ROW_H * 2 + 4}
        fill="none"
        stroke="#27CCF3"
        strokeWidth="3"
      />

      {DIGITS.map((row, rowIndex) =>
        row.map((digit, colIndex) => (
          <text
            key={`${rowIndex}-${colIndex}`}
            x={GRID_X + colIndex * COL_W + COL_W / 2}
            y={GRID_Y + rowIndex * ROW_H + ROW_H / 2 + 3}
            fill="#141111"
            fontFamily={mono}
            fontSize="9"
            fontWeight="700"
            textAnchor="middle"
          >
            {digit}
          </text>
        ))
      )}
    </svg>
  );
}
