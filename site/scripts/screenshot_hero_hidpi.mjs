import { chromium } from "playwright";

const OUT = "../design_refs/scratch/hero3d_card_hidpi.png";
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
await canvas.screenshot({ path: OUT });

await browser.close();
console.log("captured hero3d_card_hidpi.png");
