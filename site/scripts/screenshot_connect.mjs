import { chromium } from "playwright";

const OUT = "../design_refs/scratch";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3456", { waitUntil: "networkidle" });

const section = page.locator("#connect");
await section.scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);
await section.screenshot({ path: `${OUT}/connect_1_locked.png` });

const boxes = page.getByRole("checkbox");
await boxes.nth(0).click();
await boxes.nth(1).click();
await page.waitForTimeout(600);
await section.screenshot({ path: `${OUT}/connect_2_partial.png` });

await boxes.nth(2).click();
await boxes.nth(3).click();
await page.waitForTimeout(1600);
await section.screenshot({ path: `${OUT}/connect_3_unlocked.png` });

await browser.close();
console.log("captured 3 states");
