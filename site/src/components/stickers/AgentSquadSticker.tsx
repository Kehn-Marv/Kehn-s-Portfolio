import { PixelAvatar } from "./PixelAvatar";

interface AgentSquadStickerProps {
  size?: number;
  className?: string;
}

const SQUAD = [
  { avatar: "robot" as const, rotate: -3, translateY: 0 },
  { avatar: "flame" as const, rotate: 0, translateY: 4 },
  { avatar: "diamond" as const, rotate: 3, translateY: 0 },
];

export function AgentSquadSticker({ size = 48, className }: AgentSquadStickerProps) {
  return (
    <div
      className={`relative inline-flex items-start ${className ?? ""}`}
      style={{ paddingRight: 4, paddingTop: 4 }}
    >
      <div className="relative flex items-start">
        {SQUAD.map(({ avatar, rotate, translateY }, i) => (
          <div
            key={avatar}
            className="overflow-hidden border-2 border-ink shadow-brutal-sm"
            style={{
              width: size,
              height: size,
              marginLeft: i === 0 ? 0 : -4,
              zIndex: i + 1,
              transform: `rotate(${rotate}deg) translateY(${translateY}px)`,
            }}
          >
            <PixelAvatar avatar={avatar} className="block !h-full !w-full" />
          </div>
        ))}
      </div>
      <span
        className="absolute -right-1 -top-1 z-20 bg-brutal-yellow px-1 font-mono text-[10px] font-bold border-2 border-ink shadow-brutal-xs"
        style={{ transform: "rotate(8deg)" }}
      >
        15+
      </span>
    </div>
  );
}
