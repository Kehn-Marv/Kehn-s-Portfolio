import { chromium } from "playwright";

const OUT = "/Users/Jacky_1/Desktop/projects/new_personal_portfolio_website/design_refs/scratch";

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
const rect = await canvas.boundingBox();
if (!rect) throw new Error("Canvas not found");

const cx = rect.x + rect.width * 0.5;
const cy = rect.y + rect.height * 0.5;

// Click to flip to back
await page.mouse.click(cx, cy);
await page.waitForTimeout(1500);
await canvas.screenshot({ path: `${OUT}/flip_back.png` });

// Click again to flip to front
await page.mouse.click(cx, cy);
await page.waitForTimeout(1500);
await canvas.screenshot({ path: `${OUT}/flip_front.png` });

// Drag should not flip
await page.mouse.move(cx, cy);
await page.mouse.down();
for (let i = 1; i <= 10; i++) {
  await page.mouse.move(cx + (200 * i) / 10, cy);
}
await page.mouse.up();
await page.waitForTimeout(1500);
await canvas.screenshot({ path: `${OUT}/flip_after_drag.png` });

await browser.close();
console.log("captured flip verification screenshots");
