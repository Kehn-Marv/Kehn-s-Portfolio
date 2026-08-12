// Render work-card cover artboards (site/artboards/*.html) to PNGs in
// public/assets/work/. Usage: node scripts/render_artboards.mjs [name ...]
import { chromium } from "playwright";
import { readdirSync } from "node:fs";
import { resolve, basename } from "node:path";

const artboardDir = resolve(import.meta.dirname, "../artboards");
const outDir = resolve(import.meta.dirname, "../public/assets/work");

const requested = process.argv.slice(2);
const names = readdirSync(artboardDir)
  .filter((f) => f.endsWith(".html"))
  .map((f) => basename(f, ".html"))
  .filter((n) => requested.length === 0 || requested.includes(n));

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1600, height: 700 },
  deviceScaleFactor: 2,
});

for (const name of names) {
  await page.goto(`file://${artboardDir}/${name}.html`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const path = `${outDir}/${name}.png`;
  await page.locator(".artboard").screenshot({ path });
  console.log(`rendered ${name} -> ${path}`);
}

await browser.close();
