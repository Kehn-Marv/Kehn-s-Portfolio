import { chromium } from "playwright";

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (msg) => console.log("[page]", msg.text()));
page.on("pageerror", (err) => console.log("[pageerror]", err.message));
await page.goto("http://localhost:3456", { waitUntil: "networkidle" });
await page.waitForTimeout(3500);

const rects = await page.evaluate(() => {
  const canvas = document.querySelector("section#top canvas");
  const wrapper = canvas?.closest("div[role='img']");
  const fmt = (r) =>
    r ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } : null;
  return {
    canvas: fmt(canvas?.getBoundingClientRect()),
    wrapper: fmt(wrapper?.getBoundingClientRect()),
  };
});
console.log("rects:", JSON.stringify(rects));

// Drag using coordinates relative to the actual canvas rect.
const c = rects.canvas;
const startX = c.x + c.w * 0.5;
const startY = c.y + c.h * 0.55;
await page.mouse.move(startX, startY);
await page.mouse.down();
await page.mouse.move(startX + 150, startY - 120, { steps: 10 });
await page.waitForTimeout(150);
await page.screenshot({ path: "../design_refs/scratch/hero3d_debug_drag.png" });
await page.mouse.up();
await browser.close();
console.log("done");
