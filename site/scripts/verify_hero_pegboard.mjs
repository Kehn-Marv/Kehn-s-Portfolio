import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.screenshot({ path: "/tmp/hero_pegboard.png" });
// hover the UBC sticker to check receipt + swing
const ubc = page.locator("#top button").filter({ has: page.locator("svg,img") }).nth(6);
await browser.close();
console.log("done");
