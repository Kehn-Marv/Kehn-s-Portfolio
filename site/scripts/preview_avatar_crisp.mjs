import { chromium } from "playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../../design_refs/scratch");
const PREVIEW_HTML = "/tmp/avatar_preview.html";
const SCREENSHOT = path.join(OUT_DIR, "avatar_crisp_preview.png");
const JSON_PATH = path.resolve(__dirname, "../src/components/stickers/pixelAvatars.json");

const SQUAD = [
  { avatar: "robot", rotate: -3, translateY: 0 },
  { avatar: "flame", rotate: 0, translateY: 4 },
  { avatar: "diamond", rotate: 3, translateY: 0 },
];

const DISPLAY_SIZES = [130, 260, 520];

const rawJson = await readFile(JSON_PATH, "utf8");
const pixelData = JSON.parse(rawJson);

/** @param {Record<string, string>} palette */
function resolveBg(bg, palette) {
  return bg.startsWith("#") ? bg : palette[bg];
}

/** @param {string[]} grid @param {Record<string, string>} palette @param {string} bg */
function renderPixelAvatarSvg(avatarKey, grid, bg, palette) {
  const bgFill = resolveBg(bg, palette);
  const pixelRects = grid
    .flatMap((row, y) =>
      row.split("").map((ch, x) => {
        if (ch === "_") return "";
        return `<rect x="${x}" y="${y}" width="1" height="1" fill="${palette[ch]}"/>`;
      }),
    )
    .join("");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" width="100%" height="100%" shape-rendering="crispEdges" data-avatar="${avatarKey}" aria-hidden="true">`,
    `<rect width="8" height="8" fill="${bgFill}"/>`,
    pixelRects,
    `</svg>`,
  ].join("");
}

/** @param {string[]} grid */
function countNonTransparentCells(grid) {
  return grid.reduce((sum, row) => sum + [...row].filter((ch) => ch !== "_").length, 0);
}

/** @param {number} tileSize */
function renderSquadSticker(tileSize) {
  const tiles = SQUAD.map(({ avatar, rotate, translateY }, i) => {
    const marginLeft = i === 0 ? 0 : -4;
    const def = pixelData.avatars[avatar];
    return `
      <div class="tile" style="
        width:${tileSize}px;height:${tileSize}px;
        margin-left:${marginLeft}px;
        z-index:${i + 1};
        transform:rotate(${rotate}deg) translateY(${translateY}px);
      ">
        ${renderPixelAvatarSvg(avatar, def.grid, def.bg, pixelData.palette)}
      </div>`;
  }).join("");

  const stickerWidth = tileSize * 3 - 8 + 4;
  return `
    <div class="squad" data-tile-size="${tileSize}" style="width:${stickerWidth}px;height:${tileSize + 4}px;position:relative;padding-top:4px;padding-right:4px;">
      <div style="display:flex;align-items:flex-start;position:relative;">
        ${tiles}
      </div>
      <span class="tag">15+</span>
    </div>`;
}

const expectedRectCounts = Object.fromEntries(
  SQUAD.map(({ avatar }) => [
    avatar,
    countNonTransparentCells(pixelData.avatars[avatar].grid),
  ]),
);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Avatar Crisp Preview</title>
  <style>
    body {
      margin: 0;
      background: #FFFAEF;
      display: flex;
      flex-direction: column;
      gap: 48px;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 40px;
      font-family: ui-monospace, monospace;
    }
    .row-label { font-size: 14px; font-weight: 700; color: #141111; margin-bottom: 8px; }
    .tile {
      overflow: hidden;
      border: 2px solid #141111;
      box-shadow: 3px 3px 0 #141111;
      flex-shrink: 0;
      display: block;
      background: transparent;
    }
    .tile svg { display: block; width: 100%; height: 100%; }
    .tag {
      position: absolute;
      right: -4px;
      top: -4px;
      z-index: 20;
      background: #FFD440;
      padding: 2px 4px;
      font-size: 10px;
      font-weight: 700;
      border: 2px solid #141111;
      box-shadow: 2px 2px 0 #141111;
      transform: rotate(8deg);
    }
  </style>
</head>
<body>
  ${DISPLAY_SIZES.map(
    (size) => `
    <section>
      <div class="row-label">tile ${size}px</div>
      ${renderSquadSticker(size)}
    </section>`,
  ).join("\n")}
</body>
</html>`;

await mkdir(OUT_DIR, { recursive: true });
await writeFile(PREVIEW_HTML, html, "utf8");

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 900, height: 2400 },
  deviceScaleFactor: 2,
});
await page.goto(`file://${PREVIEW_HTML}`);
await page.waitForTimeout(300);

const assertionResults = await page.evaluate((expectedCounts) => {
  const results = [];

  function isIntegerAttr(el, attr) {
    const val = el.getAttribute(attr);
    if (val === null) return attr === "x" || attr === "y";
    return Number.isInteger(Number(val));
  }

  for (const svg of document.querySelectorAll("svg[data-avatar]")) {
    const avatarKey = svg.getAttribute("data-avatar");
    const tileSize = Number(svg.closest(".squad")?.getAttribute("data-tile-size") ?? 0);
    const shapeRendering = getComputedStyle(svg).shapeRendering;

    const rects = [...svg.querySelectorAll("rect")];
    const pixelRects = rects.filter((r) => {
      const w = r.getAttribute("width");
      const h = r.getAttribute("height");
      return w === "1" && h === "1";
    });

    const integerCoordsOk = rects.every(
      (r) =>
        isIntegerAttr(r, "x") &&
        isIntegerAttr(r, "y") &&
        isIntegerAttr(r, "width") &&
        isIntegerAttr(r, "height"),
    );

    const crispEdgesOk =
      shapeRendering === "crispedges" ||
      svg.getAttribute("shape-rendering") === "crispEdges";

    const expectedCount = expectedCounts[avatarKey];
    const rectCountOk = pixelRects.length === expectedCount;

    results.push({
      avatar: avatarKey,
      tileSize,
      integerCoordsOk,
      crispEdgesOk,
      rectCountOk,
      expectedRectCount: expectedCount,
      actualPixelRectCount: pixelRects.length,
      shapeRendering,
      pass: integerCoordsOk && crispEdgesOk && rectCountOk,
    });
  }

  return results;
}, expectedRectCounts);

await page.screenshot({ path: SCREENSHOT, fullPage: true });
await browser.close();

console.log("Preview screenshot:", SCREENSHOT);
console.log("Expected pixel rect counts:", expectedRectCounts);
console.log("\nAssertion results:");
for (const result of assertionResults) {
  const status = result.pass ? "PASS" : "FAIL";
  console.log(
    `[${status}] ${result.avatar} @ ${result.tileSize}px — ` +
      `integerCoords=${result.integerCoordsOk}, crispEdges=${result.crispEdgesOk}, ` +
      `rectCount=${result.actualPixelRectCount}/${result.expectedRectCount}`,
  );
}

const allPass = assertionResults.every((r) => r.pass);
if (!allPass) {
  console.error("\nOne or more assertions failed.");
  process.exit(1);
}

console.log("\nAll assertions passed.");
