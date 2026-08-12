import * as THREE from "three";

const SCALE = 1.5;

const W = 1024;
const H = 1440;

const INK = "#141111";
const CREAM = "#FFFAEF";
const YELLOW = "#FFD440";
const PINK = "#FE7DA8";
const CORAL = "#F97264";

function makeCanvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);
  return [canvas, ctx];
}

function drawFrame(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 26;
  ctx.strokeRect(13, 13, W - 26, H - 26);
}

function drawPassportStamp(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  rotation: number,
  arcText: string,
  centerText: string,
  mono: string
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.globalAlpha = 0.72;
  ctx.strokeStyle = CORAL;
  ctx.fillStyle = CORAL;

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.lineWidth = 7;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, radius - 26, 0, Math.PI * 2);
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  ctx.stroke();
  ctx.setLineDash([]);

  const textRadius = radius - 16;
  const chars = arcText.split("");
  const arcSpan = Math.PI * 0.85;
  const startAngle = -Math.PI / 2 - arcSpan / 2;
  const angleStep = arcSpan / Math.max(chars.length - 1, 1);

  ctx.font = `700 22px ${mono}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < chars.length; i++) {
    const angle = startAngle + i * angleStep;
    ctx.save();
    ctx.rotate(angle);
    ctx.fillText(chars[i], 0, -textRadius);
    ctx.restore();
  }

  ctx.font = `700 30px ${mono}`;
  ctx.fillText(centerText, 0, 0);

  ctx.restore();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  fill: string
) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const radius = i % 2 === 0 ? r : r * 0.42;
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 10;
  ctx.stroke();
}

function toTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function drawFrontTexture(
  avatar: HTMLImageElement | null,
  display: string,
  mono: string
): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas();
  drawFrame(ctx);

  // Header band
  ctx.fillStyle = YELLOW;
  ctx.fillRect(26, 26, W - 52, 268);
  ctx.fillStyle = INK;
  ctx.fillRect(26, 294, W - 52, 12);

  ctx.fillStyle = INK;
  ctx.font = `700 33px ${mono}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("\u2737 BUILDER PASS \u2014 2026", 64, 106);

  ctx.font = `700 116px ${display}`;
  ctx.fillText("EGEMONYE MARVELLOUS", 58, 240);

  // Avatar frame
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(196, 360, 632, 632);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 14;
  ctx.strokeRect(196, 360, 632, 632);
  if (avatar) {
    ctx.drawImage(avatar, 212, 376, 600, 600);
  }
  drawStar(ctx, 838, 372, 62, PINK);

  // Info lines
  ctx.fillStyle = INK;
  ctx.font = `700 34px ${mono}`;
  ctx.fillText("ROLE: AI AGENTS & DEV TOOLS", 64, 1102);
  ctx.fillText("LOC:  NIGERIA — UTC+1", 64, 1158);
  ctx.fillText("AGENTS ON PAYROLL: 15+", 64, 1214);

  // Barcode
  const bars = [6, 3, 9, 4, 2, 8, 5, 3, 7, 2, 9, 4, 6, 3, 5, 8, 2, 7, 4, 9, 3, 6, 2, 5];
  let x = 64;
  for (let i = 0; i < bars.length && x < 560; i++) {
    const bw = bars[i] * 2.2;
    if (i % 2 === 0) {
      ctx.fillRect(x, 1268, bw, 96);
    }
    x += bw + 6;
  }
  ctx.font = `700 40px ${mono}`;
  ctx.textAlign = "right";
  ctx.fillText("NO.0124", W - 64, 1338);
  ctx.textAlign = "left";

  return toTexture(canvas);
}

export function drawBackTexture(display: string, mono: string): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas();

  // BoxGeometry's -Z face UVs already display the texture unmirrored
  // when the card is flipped, so draw normally.
  ctx.save();

  drawFrame(ctx);

  // Big smiley
  const cx = W / 2;
  const cy = 560;
  ctx.beginPath();
  ctx.arc(cx, cy, 235, 0, Math.PI * 2);
  ctx.fillStyle = YELLOW;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 16;
  ctx.stroke();

  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.ellipse(cx - 85, cy - 60, 30, 48, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 85, cy - 60, 30, 48, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy + 40, 120, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.lineWidth = 20;
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.font = `700 44px ${display}`;
  ctx.fillText("IF YOU CAN READ THIS", cx, 1010);
  ctx.fillText("THE CARD IS BACKWARDS", cx, 1074);

  ctx.font = `700 33px ${mono}`;
  ctx.fillText("\u2737 MADE WITH AGENTS \u2737", cx, 1330);

  drawPassportStamp(
    ctx,
    260,
    380,
    120,
    -0.35,
    "ABV ✦ NIGERIA ✦ HOME",
    "SINCE 2023",
    mono
  );
  drawPassportStamp(
    ctx,
    760,
    880,
    110,
    0.3,
    "SZX \u2726 SHENZHEN \u2726 INTERN ARC",
    "2025",
    mono
  );
  drawPassportStamp(
    ctx,
    620,
    240,
    96,
    0.15,
    "YC HQ \u2726 HACK THE STACKATHON",
    "2026",
    mono
  );

  ctx.restore();
  return toTexture(canvas);
}
