import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.locator("#work").scrollIntoViewIfNeeded();
await page.waitForTimeout(2500); // no autoplay expected: hints should read "hover to run"
await page.locator("#work").screenshot({ path: "/tmp/work_idle_hints.png" });
// hover photon, let it finish, move away — chip should flip to replay and demo stays at end
const photon = page.locator('span:text-is("PHOTON")').first();
const box = await photon.boundingBox();
await page.mouse.move(box.x + 60, box.y - 120);
await page.waitForTimeout(2500);
await page.mouse.move(10, 400);
await page.waitForTimeout(500);
await page.locator("#work").screenshot({ path: "/tmp/work_after_play.png" });
await browser.close();
console.log("done");
