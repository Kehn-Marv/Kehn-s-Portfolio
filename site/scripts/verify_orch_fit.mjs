import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
const orch = page.locator('span:text-is("TEAM ORCHESTRATOR")').first();
await orch.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const box = await orch.boundingBox();
await page.mouse.move(box.x + 60, box.y - 120);
await page.waitForTimeout(3000);
// measure: is the build chip fully inside the demo container?
const fit = await page.evaluate(() => {
  const chip = Array.from(document.querySelectorAll("span")).find((s) =>
    s.textContent?.includes("verified before done")
  );
  const root = chip.closest(".h-52");
  const c = chip.getBoundingClientRect();
  const r = root.getBoundingClientRect();
  return { chipBottom: c.bottom, rootBottom: r.bottom, fits: c.bottom <= r.bottom };
});
console.log(JSON.stringify(fit));
const card = orch.locator("xpath=ancestor::div[contains(@class,'border-2')][1]");
await page.screenshot({ path: "/tmp/orch_fit.png", clip: { x: box.x - 80, y: box.y - 360, width: 640, height: 560 } });
await browser.close();
