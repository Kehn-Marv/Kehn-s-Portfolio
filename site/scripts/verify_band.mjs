import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../../design_refs/scratch");

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (msg) => console.log("[page]", msg.text()));
page.on("pageerror", (err) => console.log("[pageerror]", err.message));

await page.goto("http://localhost:3456", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);

const rects = await page.evaluate(() => {
  const canvas = document.querySelector("section#top canvas");
  const fmt = (r) =>
    r
      ? {
          x: Math.round(r.x),
          y: Math.round(r.y),
          w: Math.round(r.width),
          h: Math.round(r.height),
        }
      : null;
  return { canvas: fmt(canvas?.getBoundingClientRect()) };
});
console.log("rects:", JSON.stringify(rects));

const c = rects.canvas;
if (!c) {
  throw new Error("Canvas not found");
}

// Grab near card center, drag around moderately, then release.
const cx = c.x + c.w * 0.5;
const cy = c.y + c.h * 0.56;
await page.mouse.move(cx, cy);
await page.mouse.down();
await page.mouse.move(cx + 60, cy - 50, { steps: 8 });
await page.waitForTimeout(60);
await page.mouse.move(cx - 45, cy - 20, { steps: 8 });
await page.waitForTimeout(60);
await page.mouse.move(cx + 30, cy + 15, { steps: 6 });
await page.waitForTimeout(60);
await page.mouse.up();

// Clip region: horizontal middle half, vertical top to ~55% of canvas height
const clipRect = {
  x: c.x + c.w * 0.25,
  y: c.y,
  width: c.w * 0.5,
  height: c.h * 0.55,
};

// Capture 8 consecutive frames ~120ms apart while the card swings.
for (let i = 0; i < 8; i++) {
  const outPath = path.join(OUT_DIR, `band_fix_frame_${i}.png`);
  await page.screenshot({ path: outPath, clip: clipRect });
  console.log("saved", outPath);
  await page.waitForTimeout(120);
}

await page.waitForTimeout(2000);
const settledPath = path.join(OUT_DIR, "band_fix_settled.png");
await page.screenshot({ path: settledPath, fullPage: false });
console.log("saved", settledPath);

await browser.close();
console.log("done");
