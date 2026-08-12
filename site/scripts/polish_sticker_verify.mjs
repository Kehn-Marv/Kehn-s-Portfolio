import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../../design_refs/scratch");
const BASE = "http://localhost:3456";

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

async function elementShot(locator, filename) {
  const el = locator.first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const box = await el.boundingBox();
  if (!box) throw new Error(`No bounding box for ${filename}`);
  const pad = 20;
  await page.screenshot({
    path: path.join(OUT, filename),
    clip: {
      x: Math.max(0, box.x - pad),
      y: Math.max(0, box.y - pad),
      width: box.width + pad * 2,
      height: box.height + pad * 2,
    },
  });
}

// UBC sticker — lg breakpoint shows it; force viewport wide enough
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

const ubcSvg = page.locator('svg[viewBox="0 0 120 120"]').filter({
  has: page.locator("text", { hasText: "UBC" }),
});
await elementShot(ubcSvg, "polish_ubc.png");

const cursorSvg = page.locator('svg[viewBox="0 0 110 110"]').filter({
  has: page.locator("rect[stroke='#141111'], rect[stroke='#141111']"),
});
await elementShot(cursorSvg, "polish_cursor.png");

const avatarSquad = page
  .locator("div.relative.inline-flex.items-start")
  .filter({ has: page.locator("div[style*='grid-template-columns']") })
  .last();
await elementShot(avatarSquad, "polish_avatar.png");

const assertions = await page.evaluate(() => {
  const viewBox = { x: 0, y: 0, width: 120, height: 120 };
  const tol = 0.5;

  function withinViewBox(bb) {
    return (
      bb.x >= viewBox.x - tol &&
      bb.y >= viewBox.y - tol &&
      bb.x + bb.width <= viewBox.x + viewBox.width + tol &&
      bb.y + bb.height <= viewBox.y + viewBox.height + tol
    );
  }

  function checkUbcOverflow() {
    const svg = [...document.querySelectorAll("svg[aria-hidden='true']")].find((el) =>
      el.textContent?.includes("UBC"),
    );
    if (!svg) return { ok: false, error: "UBC svg not found" };

    const clipGroup = svg.querySelector("g[clip-path]");
    const clipPathId = clipGroup?.getAttribute("clip-path")?.match(/#([^)]+)/)?.[1];
    const clipPathEl = clipPathId
      ? svg.querySelector(`clipPath#${CSS.escape(clipPathId)}`)
      : null;

    const offenders = [];
    const structural = [];

    for (const el of svg.querySelectorAll("path, text")) {
      if (!(el instanceof SVGGraphicsElement)) continue;
      if (clipGroup?.contains(el)) continue;

      try {
        const bb = el.getBBox();
        if (bb.width === 0 && bb.height === 0) continue;
        if (!withinViewBox(bb)) {
          offenders.push({ tag: el.tagName, bb: { x: bb.x, y: bb.y, w: bb.width, h: bb.height } });
        } else {
          structural.push(el.tagName);
        }
      } catch {
        // skip
      }
    }

    return {
      ok:
        offenders.length === 0 &&
        Boolean(clipGroup) &&
        Boolean(clipPathEl) &&
        structural.length >= 2,
      offenderCount: offenders.length,
      offenders: offenders.slice(0, 5),
      hasClipGroup: Boolean(clipGroup),
      hasClipPath: Boolean(clipPathEl),
      structuralCount: structural.length,
    };
  }

  function checkAvatarBoxShadow() {
    const grids = [...document.querySelectorAll("div[style*='grid-template-columns']")].filter(
      (el) => (el.getAttribute("style") ?? "").includes("repeat(8"),
    );
    if (grids.length === 0) return { ok: false, error: "avatar grids not found" };

    let opaque = 0;
    let withShadow = 0;
    let missing = [];

    for (const grid of grids) {
      for (const cell of grid.querySelectorAll(":scope > div[style]")) {
        const style = cell.getAttribute("style") ?? "";
        const bgMatch = style.match(/background-color:\s*([^;]+)/i);
        const bg = bgMatch?.[1]?.trim() ?? "";
        if (!bg || bg === "transparent") continue;
        opaque += 1;
        if (/box-shadow:\s*0\s+0\s+0\s+0\.5px/i.test(style)) {
          withShadow += 1;
        } else {
          missing.push(style.slice(0, 80));
        }
      }
    }

    return {
      ok: opaque > 0 && withShadow === opaque,
      gridCount: grids.length,
      opaqueCells: opaque,
      withShadow,
      missingSample: missing.slice(0, 3),
    };
  }

  return {
    ubc: checkUbcOverflow(),
    avatar: checkAvatarBoxShadow(),
  };
});

await browser.close();

console.log("Screenshots:");
console.log("  ", path.join(OUT, "polish_ubc.png"));
console.log("  ", path.join(OUT, "polish_cursor.png"));
console.log("  ", path.join(OUT, "polish_avatar.png"));
console.log("\nAssertions:");
console.log(JSON.stringify(assertions, null, 2));

const allOk = assertions.ubc.ok && assertions.avatar.ok;
if (!allOk) {
  process.exit(1);
}
console.log("\nAll programmatic checks passed.");
