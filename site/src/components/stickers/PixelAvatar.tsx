import pixelAvatars from "./pixelAvatars.json";

export type PixelAvatarKey = "robot" | "flame" | "diamond" | "ghost" | "cat";

interface PixelAvatarProps {
  avatar: PixelAvatarKey;
  size?: number;
  className?: string;
}

const palette = pixelAvatars.palette as Record<string, string>;

/**
 * 8×8 pixel avatar — CSS grid of 1×1 cells, matching raft-landing /
 * slock PixelAvatar.tsx (imageRendering: pixelated, not SVG in the web UI).
 */
export function PixelAvatar({ avatar, size = 36, className }: PixelAvatarProps) {
  const def = pixelAvatars.avatars[avatar];
  if (!def) return null;

  const bgFill = def.bg.startsWith("#") ? def.bg : palette[def.bg];

  return (
    <div
      className={`shrink-0 overflow-hidden ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        display: "grid",
        gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
        gridTemplateRows: "repeat(8, minmax(0, 1fr))",
        backgroundColor: bgFill,
        imageRendering: "pixelated",
      }}
      aria-hidden="true"
    >
      {def.grid.flatMap((row, y) =>
        row.split("").map((ch, x) => {
          const color = ch === "_" ? null : palette[ch];
          return (
            <div
              key={`${y}-${x}`}
              style={{
                backgroundColor: color ?? "transparent",
                boxShadow: color ? `0 0 0 0.5px ${color}` : undefined,
              }}
            />
          );
        }),
      )}
    </div>
  );
}
