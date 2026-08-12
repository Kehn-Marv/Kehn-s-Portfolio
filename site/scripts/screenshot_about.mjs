import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3456", { waitUntil: "networkidle" });
await page.locator("#about").scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
await page
  .locator("#about")
  .screenshot({ path: "../design_refs/scratch/v1_about_section.png" });
await browser.close();
console.log("captured about section");
