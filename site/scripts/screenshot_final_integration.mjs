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
await page.waitForTimeout(4000);

const hero = page.locator("section#top");
await hero.screenshot({ path: path.join(OUT, "final_hero_wall.png") });

const ubcBadge = page.locator('img[src*="ubc-badge"]');
await ubcBadge.hover();
await page.waitForTimeout(500);
await hero.screenshot({ path: path.join(OUT, "final_ubc_receipt.png") });

// CursorLogoSticker: white tile SVG (110 viewBox) whose rect fill is #FFFFFF
const cursorSticker = page
  .locator("#top button")
  .filter({ has: page.locator('svg rect[fill="#FFFFFF"]') })
  .first();
await cursorSticker.hover();
await page.waitForTimeout(500);
await hero.screenshot({ path: path.join(OUT, "final_cursor_receipt.png") });

await page.locator("#connect").scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
const boxes = page.getByRole("checkbox");
for (let i = 0; i < 4; i += 1) {
  await boxes.nth(i).click();
}
await page.waitForTimeout(1600);
await page.locator("#connect").screenshot({
  path: path.join(OUT, "final_connect_burst.png"),
});

await browser.close();
console.log("captured 4 final integration screenshots");
