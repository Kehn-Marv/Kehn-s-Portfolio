import { chromium } from "playwright";

const BASE = "http://localhost:3456";
const OUT = "../design_refs/scratch";

const targets = [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
];

const browser = await chromium.launch();

for (const [name, viewport] of targets) {
  const page = await browser.newPage({ viewport });
  await page.goto(BASE, { waitUntil: "networkidle" });

  // Scroll through the page to trigger whileInView reveals, then back to top.
  await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const step = window.innerHeight * 0.7;
    const total = document.documentElement.scrollHeight;
    for (let y = 0; y <= total; y += step) {
      window.scrollTo(0, y);
      await delay(200);
    }
    window.scrollTo(0, 0);
    await delay(500);
  });
  await page.waitForTimeout(700);

  await page.screenshot({ path: `${OUT}/v1_${name}_fold.png` });
  await page.screenshot({ path: `${OUT}/v1_${name}_full.png`, fullPage: true });
  await page.close();
  console.log(`captured ${name}`);
}

await browser.close();
