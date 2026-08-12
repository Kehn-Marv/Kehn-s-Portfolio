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

const squad = page
  .locator("#top button")
  .filter({ has: page.locator('svg[shape-rendering="crispEdges"]') })
  .last();
await squad.hover();
await page.waitForTimeout(500);
await page.locator("#top").screenshot({
  path: path.join(OUT, "avatar_sticker_hero.png"),
});

const section = page.locator("#connect");
await section.scrollIntoViewIfNeeded();
const boxes = page.getByRole("checkbox");
for (let i = 0; i < 4; i++) {
  await boxes.nth(i).click();
}
await page.waitForTimeout(1600);
await section.screenshot({
  path: path.join(OUT, "avatar_sticker_connect.png"),
});

await browser.close();
console.log("wrote", path.join(OUT, "avatar_sticker_hero.png"));
console.log("wrote", path.join(OUT, "avatar_sticker_connect.png"));
