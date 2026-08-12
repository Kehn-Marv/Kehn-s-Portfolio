/** Path from official CUBE_2D_LIGHT.svg — single 2D mark glyph (solid ink). */
const CUBE_2D_PATH =
  "M457.43,125.94L244.42,2.96c-6.84-3.95-15.28-3.95-22.12,0L9.3,125.94c-5.75,3.32-9.3,9.46-9.3,16.11v247.99c0,6.65,3.55,12.79,9.3,16.11l213.01,122.98c6.84,3.95,15.28,3.95,22.12,0l213.01-122.98c5.75-3.32,9.3-9.46,9.3-16.11v-247.99c0-6.65-3.55-12.79-9.3-16.11h-.01ZM444.05,151.99l-205.63,356.16c-1.39,2.4-5.06,1.42-5.06-1.36v-233.21c0-4.66-2.49-8.97-6.53-11.31L24.87,145.67c-2.4-1.39-1.42-5.06,1.36-5.06h411.26c5.84,0,9.49,6.33,6.57,11.39h-.01Z";

const CUBE_VIEWBOX = { width: 466.73, height: 532.09 };
const TILE = { x: 8, y: 8, size: 90 };
const SHADOW_OFFSET = 4;
const INK = "#141111";

export function CursorLogoSticker({
  size = 110,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const logoSize = TILE.size * 0.62;
  const logoScale = logoSize / CUBE_VIEWBOX.height;
  const logoWidth = CUBE_VIEWBOX.width * logoScale;
  const logoHeight = CUBE_VIEWBOX.height * logoScale;
  const logoX = TILE.x + (TILE.size - logoWidth) / 2;
  const logoY = TILE.y + (TILE.size - logoHeight) / 2;

  return (
    <svg
      viewBox="0 0 110 110"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <rect
        x={TILE.x + SHADOW_OFFSET}
        y={TILE.y + SHADOW_OFFSET}
        width={TILE.size}
        height={TILE.size}
        fill={INK}
      />
      <rect
        x={TILE.x}
        y={TILE.y}
        width={TILE.size}
        height={TILE.size}
        fill="#FFFFFF"
        stroke={INK}
        strokeWidth="2"
      />
      <g transform={`translate(${logoX}, ${logoY}) scale(${logoScale})`}>
        <path d={CUBE_2D_PATH} fill={INK} />
      </g>
    </svg>
  );
}
