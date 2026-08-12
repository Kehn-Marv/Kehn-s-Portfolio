import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../../design_refs/scratch");

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto("http://localhost:3456", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

const cursorSticker = page
  .locator("#top button")
  .filter({ has: page.locator('svg rect[fill="#FFFFFF"]') })
  .first();

const box = await cursorSticker.boundingBox();
if (!box) {
  throw new Error("Cursor sticker button not found in #top");
}

const pad = 30;
await page.screenshot({
  path: path.join(OUT, "final_cursor_cube_closeup.png"),
  clip: {
    x: Math.max(0, box.x - pad),
    y: Math.max(0, box.y - pad),
    width: box.width + pad * 2,
    height: box.height + pad * 2,
  },
});

await browser.close();
console.log("captured final_cursor_cube_closeup.png");
