import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.locator("#work").scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
for (const label of ["NESTEASE", "LAUNCHPAD", "TEAM ORCHESTRATOR"]) {
  const card = page.locator(`span:text-is("${label}")`).first();
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const box = await card.boundingBox();
  await page.mouse.move(box.x + 60, box.y - 100);
  await page.waitForTimeout(2800);
  await page.screenshot({ path: `/tmp/demo_${label.replace(/ /g, "_")}.png`, clip: { x: Math.max(0, box.x - 80), y: Math.max(0, box.y - 340), width: 620, height: 520 } });
  await page.mouse.move(10, 10);
  await page.waitForTimeout(300);
}
await browser.close();
console.log("done");
