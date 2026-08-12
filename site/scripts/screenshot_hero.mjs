import { chromium } from "playwright";

const OUT = "../design_refs/scratch";
const browser = await chromium.launch({
  args: ["--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3456", { waitUntil: "networkidle" });

// Let the card drop, swing, and settle.
await page.waitForTimeout(4000);
await page.screenshot({ path: `${OUT}/hero3d_settled.png` });

// Try to drag the card way outside the canvas — it should stay in frame.
await page.mouse.move(750, 390);
await page.mouse.down();
await page.mouse.move(1430, 860, { steps: 15 });
await page.waitForTimeout(150);
await page.screenshot({ path: `${OUT}/hero3d_dragged_far.png` });
await page.mouse.up();
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/hero3d_release.png` });

await browser.close();
console.log("captured hero3d states");
