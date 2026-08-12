import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../../design_refs/scratch");
const PREVIEW_HTML = "/tmp/sticker_preview.html";
const SCREENSHOT = path.join(OUT_DIR, "svg_redraw_preview.png");

const EXPECTED_FILLS = [
  "#141111",
  "#002145",
  "#ffffff",
  "#fffaef",
  "#c0b9b1",
  "#ffd440",
];

const UBC_SVG = `
<svg id="ubc-sticker" viewBox="0 0 120 120" width="240" height="240" aria-hidden="true">
  <path d="M 26 14 H 94 V 26 C 94 72 82 92 60 106 C 38 92 26 72 26 26 Z" fill="#141111" transform="translate(4, 4)" />
  <path d="M 26 14 H 94 V 26 C 94 72 82 92 60 106 C 38 92 26 72 26 26 Z" fill="#002145" stroke="#141111" stroke-width="5" />
  <path d="M 31 19 H 89 V 30 C 89 70 79 88 60 100 C 41 88 31 70 31 30 Z" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round" />
  <text x="60" y="42" fill="#FFFFFF" font-family="sans-serif" font-size="23" font-weight="700" letter-spacing="2" text-anchor="middle">UBC</text>
  <path d="M 32 52 Q 41 46 50 52 Q 59 58 68 52 Q 77 46 88 52" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
  <path d="M 32 60 Q 38 54 44 60 Q 48 64 50 60" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
  <path d="M 70 60 Q 76 54 82 60 Q 86 64 88 60" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
  <path d="M 32 68 Q 38 62 44 68 Q 47 72 49 68" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
  <path d="M 71 68 Q 77 62 83 68 Q 86 72 88 68" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
  <path d="M 44 100 Q 44 88 60 88 Q 76 88 76 100 Z" fill="#FFFFFF" />
  <path d="M 60 56 L 54 90 L 66 90 Z" fill="#FFFFFF" />
  <path d="M 48 62 L 42 90 L 52 90 Z" fill="#FFFFFF" />
  <path d="M 38 68 L 34 90 L 42 90 Z" fill="#FFFFFF" />
  <path d="M 72 62 L 68 90 L 78 90 Z" fill="#FFFFFF" />
  <path d="M 82 68 L 78 90 L 86 90 Z" fill="#FFFFFF" />
  <path d="M 50 66 L 46 90 L 54 90 Z" fill="#FFFFFF" />
  <path d="M 70 66 L 66 90 L 74 90 Z" fill="#FFFFFF" />
</svg>`;

const CURSOR_SVG = `
<svg id="cursor-sticker" viewBox="0 0 110 110" width="240" height="240" aria-hidden="true">
  <rect x="12" y="12" width="90" height="90" fill="#141111" />
  <rect x="8" y="8" width="90" height="90" fill="#FFFFFF" stroke="#141111" stroke-width="2" />
  <g transform="translate(28.58, 25.1) scale(0.10464)">
    <path d="M233.37,266.66l231.16,133.46c-1.42,2.46-3.48,4.56-6.03,6.03l-216.06,124.74c-5.61,3.24-12.53,3.24-18.14,0L8.24,406.15c-2.55-1.47-4.61-3.57-6.03-6.03l231.16-133.46h0Z" fill="#C0B9B1" stroke="#141111" stroke-width="2" stroke-linejoin="round" />
    <path d="M233.37,0v266.66L2.21,400.12c-1.42-2.46-2.21-5.3-2.21-8.24v-250.44c0-5.89,3.14-11.32,8.24-14.27L224.29,2.43c2.81-1.62,5.94-2.43,9.07-2.43h.01Z" fill="#FFFFFF" stroke="#141111" stroke-width="2" stroke-linejoin="round" />
    <path d="M464.52,133.2c-1.42-2.46-3.48-4.56-6.03-6.03L242.43,2.43c-2.8-1.62-5.93-2.43-9.06-2.43v266.66l231.16,133.46c1.42-2.46,2.21-5.3,2.21-8.24v-250.44c0-2.95-.78-5.77-2.21-8.24h-.01Z" fill="#141111" stroke="#141111" stroke-width="2" stroke-linejoin="round" />
    <path d="M448.35,142.54c1.31,2.26,1.49,5.16,0,7.74l-209.83,363.42c-1.41,2.46-5.16,1.45-5.16-1.38v-239.48c0-1.91-.51-3.75-1.44-5.36l216.42-124.95h.01Z" fill="#FFD440" stroke="#141111" stroke-width="2" stroke-linejoin="round" />
    <path d="M448.35,142.54l-216.42,124.95c-.92-1.6-2.26-2.96-3.92-3.92L20.62,143.83c-2.46-1.41-1.45-5.16,1.38-5.16h419.65c2.98,0,5.4,1.61,6.7,3.87Z" fill="#FFFAEF" stroke="#141111" stroke-width="2" stroke-linejoin="round" />
  </g>
</svg>`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>SVG Sticker Preview</title>
  <style>
    body { margin: 0; background: #FFFAEF; display: flex; gap: 48px; align-items: center; justify-content: center; min-height: 100vh; padding: 40px; }
  </style>
</head>
<body>
  ${UBC_SVG}
  ${CURSOR_SVG}
</body>
</html>`;

function normalizeColor(value) {
  if (!value || value === "none" || value.startsWith("url(")) return null;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return value.toLowerCase();
  ctx.fillStyle = value;
  return ctx.fillStyle.toLowerCase();
}

function inspectSvg(svgId) {
  const svg = document.getElementById(svgId);
  if (!svg) return { id: svgId, ok: false, error: "svg not found" };

  const paths = svg.querySelectorAll("path");
  const rects = svg.querySelectorAll("rect");
  const visiblePaths = [...paths].filter((p) => {
    const bb = p.getBBox();
    return bb.width > 0 && bb.height > 0;
  });

  const box = svg.getBoundingClientRect();
  const fills = new Set();
  for (const el of svg.querySelectorAll("[fill], [stroke]")) {
    const fill = normalizeColor(el.getAttribute("fill"));
    const stroke = normalizeColor(el.getAttribute("stroke"));
    if (fill) fills.add(fill);
    if (stroke) fills.add(stroke);
  }

  return {
    id: svgId,
    ok: box.width > 40 && box.height > 40 && visiblePaths.length >= 3,
    boundingBox: { width: box.width, height: box.height },
    pathCount: paths.length,
    visiblePathCount: visiblePaths.length,
    rectCount: rects.length,
    fills: [...fills].sort(),
  };
}

await mkdir(OUT_DIR, { recursive: true });
await writeFile(PREVIEW_HTML, html, "utf8");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 420 } });
await page.goto(`file://${PREVIEW_HTML}`);
await page.waitForTimeout(300);

const checks = await page.evaluate(
  ({ expectedFills }) => {
    function normalizeColor(value) {
      if (!value || value === "none" || value.startsWith("url(")) return null;
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx) return value.toLowerCase();
      ctx.fillStyle = value;
      return ctx.fillStyle.toLowerCase();
    }

    function inspectSvg(svgId) {
      const svg = document.getElementById(svgId);
      if (!svg) return { id: svgId, ok: false, error: "svg not found" };

      const paths = svg.querySelectorAll("path");
      const rects = svg.querySelectorAll("rect");
      const visiblePaths = [...paths].filter((p) => {
        const bb = p.getBBox();
        return bb.width > 0 && bb.height > 0;
      });

      const box = svg.getBoundingClientRect();
      const fills = new Set();
      for (const el of svg.querySelectorAll("[fill], [stroke]")) {
        const fill = normalizeColor(el.getAttribute("fill"));
        const stroke = normalizeColor(el.getAttribute("stroke"));
        if (fill) fills.add(fill);
        if (stroke) fills.add(stroke);
      }

      const matchedPalette = expectedFills.filter((c) => fills.has(c));

      return {
        id: svgId,
        ok: box.width > 40 && box.height > 40 && visiblePaths.length >= 3,
        boundingBox: { width: box.width, height: box.height },
        pathCount: paths.length,
        visiblePathCount: visiblePaths.length,
        rectCount: rects.length,
        fills: [...fills].sort(),
        matchedPalette,
        paletteOk: matchedPalette.length >= 3,
      };
    }

    return [inspectSvg("ubc-sticker"), inspectSvg("cursor-sticker")];
  },
  { expectedFills: EXPECTED_FILLS },
);

await page.screenshot({ path: SCREENSHOT, fullPage: true });
await browser.close();

console.log("Preview screenshot:", SCREENSHOT);
console.log("Objective checks:");
for (const result of checks) {
  console.log(JSON.stringify(result, null, 2));
}

const allOk = checks.every((r) => r.ok && r.paletteOk);
if (!allOk) {
  console.error("One or more objective checks failed.");
  process.exit(1);
}

console.log("All objective checks passed.");
