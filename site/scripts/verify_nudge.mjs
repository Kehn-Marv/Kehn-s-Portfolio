import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.locator("#work").scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
const count = await page.evaluate(() =>
  Array.from(document.querySelectorAll(".animate-nudge")).length
);
console.log("nudging cards before any play:", count);
// hover photon to completion
const photon = page.locator('span:text-is("PHOTON")').first();
const box = await photon.boundingBox();
await page.mouse.move(box.x + 60, box.y - 120);
await page.waitForTimeout(2600);
await page.mouse.move(10, 400);
await page.waitForTimeout(300);
const after = await page.evaluate(() =>
  Array.from(document.querySelectorAll(".animate-nudge")).length
);
console.log("nudging cards after photon played:", after);
await browser.close();
