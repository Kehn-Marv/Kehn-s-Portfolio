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

await page.screenshot({
  path: path.join(OUT, "stickers_full.png"),
  fullPage: true,
});

const robotSticker = page.locator('img[src*="robot-squad"]');
await robotSticker.hover();
await page.waitForTimeout(500);
await page.locator("#top").screenshot({
  path: path.join(OUT, "stickers_receipt_hero.png"),
});

await page.locator("#work").scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
const ycButton = page.locator("#work button").filter({ has: page.locator("svg") }).first();
await ycButton.hover();
await page.waitForTimeout(500);
await page.locator("#work").screenshot({
  path: path.join(OUT, "stickers_receipt_work.png"),
});

await page.locator("#connect").scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
const boxes = page.getByRole("checkbox");
for (let i = 0; i < 4; i += 1) {
  await boxes.nth(i).click();
}
await page.waitForTimeout(1600);
await page.locator("#connect").screenshot({
  path: path.join(OUT, "stickers_connect_burst.png"),
});

await page.locator("#top").scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
const canvas = page.locator("#top canvas");
const box = await canvas.boundingBox();
if (box) {
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}
await page.waitForTimeout(1500);
await canvas.screenshot({
  path: path.join(OUT, "card_back_passport.png"),
});

await browser.close();
console.log("captured 5 sticker screenshots");
