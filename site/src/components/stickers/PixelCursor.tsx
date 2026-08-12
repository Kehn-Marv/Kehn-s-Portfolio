const FILLED: [number, number][] = [
  [1, 0],
  [1, 1],
  [2, 1],
  [1, 2],
  [2, 2],
  [3, 2],
  [4, 2],
  [2, 3],
  [3, 3],
  [4, 3],
  [3, 4],
  [4, 4],
  [4, 5],
];

const CELL = 8;
const ORIGIN_X = 36;
const ORIGIN_Y = 28;
const SHADOW = 4;

function cellKey(col: number, row: number): string {
  return `${col},${row}`;
}

function buildOutlineCells(): [number, number][] {
  const filled = new Set(FILLED.map(([c, r]) => cellKey(c, r)));
  const outline = new Set<string>();

  for (const [col, row] of FILLED) {
    for (const [dc, dr] of [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ] as [number, number][]) {
      const nc = col + dc;
      const nr = row + dr;
      const key = cellKey(nc, nr);
      if (!filled.has(key) && !outline.has(key)) {
        outline.add(key);
      }
    }
  }

  return Array.from(outline).map((key) => {
    const [col, row] = key.split(",").map(Number);
    return [col, row] as [number, number];
  });
}

const OUTLINE = buildOutlineCells();

function rectAt(
  col: number,
  row: number,
  fill: string,
  offsetX = 0,
  offsetY = 0
) {
  return (
    <rect
      key={`${fill}-${col}-${row}-${offsetX}-${offsetY}`}
      x={ORIGIN_X + col * CELL + offsetX}
      y={ORIGIN_Y + row * CELL + offsetY}
      width={CELL}
      height={CELL}
      fill={fill}
    />
  );
}

export function PixelCursor({
  size = 120,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      {FILLED.map(([col, row]) =>
        rectAt(col, row, "#141111", SHADOW, SHADOW)
      )}
      {OUTLINE.map(([col, row]) => rectAt(col, row, "#141111"))}
      {FILLED.map(([col, row]) => rectAt(col, row, "#FFD440"))}
    </svg>
  );
}
