import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000/#work", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const section = page.locator("#work");
await section.screenshot({ path: "/tmp/work_layout.png" });
await browser.close();
console.log("done");
