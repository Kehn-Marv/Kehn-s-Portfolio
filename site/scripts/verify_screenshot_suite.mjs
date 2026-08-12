import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../../design_refs/scratch");
await mkdir(OUT, { recursive: true });

const LAUNCH_ARGS = ["--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist"];
const PAD = 20;

const browser = await chromium.launch({ args: LAUNCH_ARGS });

async function clipScreenshot(page, locator, filename) {
  const box = await locator.boundingBox();
  if (!box) throw new Error(`Element not found for ${filename}`);
  await page.screenshot({
    path: path.join(OUT, filename),
    clip: {
      x: Math.max(0, box.x - PAD),
      y: Math.max(0, box.y - PAD),
      width: box.width + PAD * 2,
      height: box.height + PAD * 2,
    },
  });
}

// --- Desktop ---
const desktop = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await desktop.goto("http://localhost:3456", { waitUntil: "networkidle" });
await desktop.waitForTimeout(4500);

await desktop.locator("section#top").screenshot({
  path: path.join(OUT, "verify_hero_solo.png"),
});

const ubcSticker = desktop.locator(".absolute.-left-14.top-\\[60\\%\\] button");
await clipScreenshot(desktop, ubcSticker, "verify_ubc_svg.png");

const cursorSticker = desktop
  .locator("#top button")
  .filter({ has: desktop.locator('svg rect[fill="#FFFFFF"]') })
  .first();
await clipScreenshot(desktop, cursorSticker, "verify_cursor_svg.png");

const squadSticker = desktop.locator(".absolute.-bottom-4.-right-2 button");
await clipScreenshot(desktop, squadSticker, "verify_avatar_crisp.png");

await squadSticker.hover();
await desktop.waitForTimeout(500);
await desktop.locator("#top").screenshot({
  path: path.join(OUT, "verify_squad_receipt.png"),
});

await desktop.locator("#connect").scrollIntoViewIfNeeded();
const boxes = desktop.getByRole("checkbox");
for (let i = 0; i < 4; i += 1) {
  await boxes.nth(i).click();
}
await desktop.waitForTimeout(1600);
await desktop.locator("#connect").screenshot({
  path: path.join(OUT, "verify_connect_burst.png"),
});

await desktop.screenshot({
  path: path.join(OUT, "verify_full_page.png"),
  fullPage: true,
});

// --- Bounding box audit ---
const bboxAudit = await desktop.evaluate(() => {
  const section = document.querySelector("section#top");
  if (!section) return { error: "section#top not found" };

  const sectionRect = section.getBoundingClientRect();
  const wrappers = [...section.querySelectorAll(".pointer-events-auto")];

  const stickers = wrappers.map((wrap, i) => {
    const rect = wrap.getBoundingClientRect();
    const cls = wrap.className;
    const overflows = {
      left: rect.left < sectionRect.left,
      right: rect.right > sectionRect.right,
      top: rect.top < sectionRect.top,
      bottom: rect.bottom > sectionRect.bottom,
    };
    const overflowAny = Object.values(overflows).some(Boolean);

    return {
      index: i,
      className: cls,
      box: {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        right: Math.round(rect.right),
        bottom: Math.round(rect.bottom),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
      center: {
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top + rect.height / 2),
      },
      overflows,
      overflowAny,
    };
  });

  const cardArea = section.querySelector(".relative.mx-auto");
  const cardRect = cardArea?.getBoundingClientRect();
  const canvasCenter = cardRect
    ? {
        x: Math.round(cardRect.left + cardRect.width / 2),
        y: Math.round(cardRect.top + cardRect.height / 2),
        width: Math.round(cardRect.width),
        height: Math.round(cardRect.height),
      }
    : null;

  const overlapsCanvas = canvasCenter
    ? stickers.map((s) => {
        const cx = canvasCenter.x;
        const cy = canvasCenter.y;
        const inCenter =
          s.center.x >= canvasCenter.x - canvasCenter.width * 0.15 &&
          s.center.x <= canvasCenter.x + canvasCenter.width * 0.15 &&
          s.center.y >= canvasCenter.y - canvasCenter.height * 0.2 &&
          s.center.y <= canvasCenter.y + canvasCenter.height * 0.2;
        return { index: s.index, className: s.className, centerInCardHangZone: inCenter };
      })
    : [];

  return {
    section: {
      left: Math.round(sectionRect.left),
      top: Math.round(sectionRect.top),
      right: Math.round(sectionRect.right),
      bottom: Math.round(sectionRect.bottom),
      width: Math.round(sectionRect.width),
      height: Math.round(sectionRect.height),
    },
    canvasCenter,
    stickerCount: stickers.length,
    stickers,
    overlapsCanvas,
    overflowCount: stickers.filter((s) => s.overflowAny).length,
  };
});

await writeFile(
  path.join(OUT, "verify_bbox_audit.json"),
  JSON.stringify(bboxAudit, null, 2),
);

// --- Mobile ---
const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});
await mobile.goto("http://localhost:3456", { waitUntil: "networkidle" });
await mobile.waitForTimeout(4000);
await mobile.screenshot({ path: path.join(OUT, "verify_mobile_fold.png") });

await browser.close();

console.log("=== SCREENSHOT SUITE COMPLETE ===");
for (const name of [
  "verify_hero_solo.png",
  "verify_ubc_svg.png",
  "verify_cursor_svg.png",
  "verify_avatar_crisp.png",
  "verify_squad_receipt.png",
  "verify_connect_burst.png",
  "verify_mobile_fold.png",
  "verify_full_page.png",
]) {
  console.log(path.join(OUT, name));
}

console.log("\n=== BBOX AUDIT ===");
console.log(JSON.stringify(bboxAudit, null, 2));
