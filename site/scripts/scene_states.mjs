import { chromium } from "playwright";
import fs from "node:fs";

const OUT = new URL("../../design_refs/scratch/scene_v2/", import.meta.url)
  .pathname;
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3456/v2", { waitUntil: "networkidle" });
await page.waitForSelector("canvas");
await page.waitForFunction(() => window.__scene !== undefined);
await page.waitForTimeout(2000); // scene assets + suspense settle

await page.screenshot({ path: `${OUT}state_1_idle.png` });

await page.evaluate(() => window.__scene.getState().spill());
await page.waitForFunction(() => window.__scene.getState().settled, null, {
  timeout: 15_000,
});
await page.screenshot({ path: `${OUT}state_2_spilled.png` });

await page.evaluate(() => window.__scene.getState().beginInspect("flashcards"));
await page.waitForTimeout(1600); // camera transition + dim
await page.screenshot({ path: `${OUT}state_3_inspect.png` });

await page.evaluate(() => window.__scene.getState().endInspect());
await page.waitForTimeout(1600);
await page.screenshot({ path: `${OUT}state_4_back.png` });

await browser.close();
console.log("saved 4 screenshots to", OUT);
