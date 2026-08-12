import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../../design_refs/scratch");

fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto("http://localhost:3456", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);

const canvas = page.locator("section#top canvas");
const settledPath = path.join(OUT_DIR, "strap_settled.png");
await canvas.screenshot({ path: settledPath });
console.log("saved", settledPath);

const rect = await canvas.boundingBox();
if (!rect) {
  throw new Error("Canvas bounding box not found");
}

const startX = rect.x + rect.width * 0.5;
const startY = rect.y + rect.height * 0.55;
const endX = rect.x + rect.width * 0.85;
const endY = rect.y + rect.height * 0.35;

await page.mouse.move(startX, startY);
await page.mouse.down();
await page.mouse.move(endX, endY, { steps: 12 });

const draggingPath = path.join(OUT_DIR, "strap_dragging.png");
await canvas.screenshot({ path: draggingPath });
console.log("saved", draggingPath);

await page.mouse.up();
await page.waitForTimeout(350);

const midswingPath = path.join(OUT_DIR, "strap_midswing.png");
await canvas.screenshot({ path: midswingPath });
console.log("saved", midswingPath);

await browser.close();

for (const p of [settledPath, draggingPath, midswingPath]) {
  const stat = fs.statSync(p);
  if (stat.size === 0) {
    throw new Error(`Empty screenshot: ${p}`);
  }
  console.log(`${path.basename(p)}: ${stat.size} bytes`);
}

console.log("done");
