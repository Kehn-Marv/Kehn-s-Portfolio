import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
const photonTitle = page.locator('text=PHOTON --ASK').first();
await photonTitle.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const box = await photonTitle.boundingBox();
// hover the TITLE BAR (not the demo body) — should still trigger
await page.mouse.move(box.x + 40, box.y + 5);
await page.waitForTimeout(120); // chip should be gone almost immediately
const chipVisible = await page.evaluate(() => {
  const chips = Array.from(document.querySelectorAll("span")).filter((s) =>
    s.textContent?.includes("hover to run")
  );
  // find the one inside the photon card (ink terminal)
  const photonChip = chips.find((c) => c.closest(".bg-ink"));
  return photonChip ? photonChip.checkVisibility() : false;
});
console.log("photon chip visible 120ms after titlebar hover:", chipVisible);
await page.waitForTimeout(2500);
const answered = await page.evaluate(() =>
  document.body.textContent.includes("Sunlight scatters")
);
console.log("answer rendered after titlebar-hover play:", answered);
await browser.close();
