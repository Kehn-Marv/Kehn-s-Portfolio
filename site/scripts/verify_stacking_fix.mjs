import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const scratchDir = path.resolve("..", "design_refs", "scratch");
await mkdir(scratchDir, { recursive: true });

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto("http://localhost:3456", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

// --- Cursor sticker: hover button then move into receipt (real user path) ---
const cursorBtn = page.locator(".absolute.-left-2.bottom-14 button");
await cursorBtn.hover();
await page.waitForTimeout(300);

const receiptCenter = await page.evaluate(() => {
  const receipt = [...document.querySelectorAll('[role="tooltip"]')].find((el) =>
    /CURSOR AMBASSADOR/i.test(el.textContent ?? ""),
  );
  const r = receipt?.getBoundingClientRect();
  return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
});

if (receiptCenter) {
  await page.mouse.move(receiptCenter.x, receiptCenter.y);
}
await page.waitForTimeout(500);

const cursorAssert = await page.evaluate(() => {
  const receipt = [...document.querySelectorAll('[role="tooltip"]')].find((el) =>
    /CURSOR AMBASSADOR/i.test(el.textContent ?? ""),
  );
  const ubcWrap = document.querySelector('img[src*="ubc-badge"]')?.closest('[class*="pointer-events-auto"]');
  const wrap = document.querySelector(".absolute.-left-2.bottom-14");
  if (!receipt) return { error: "no cursor receipt", pass: false };

  const rect = receipt.getBoundingClientRect();
  const points = [
    [rect.left + rect.width * 0.15, rect.top + rect.height * 0.2],
    [rect.left + rect.width / 2, rect.top + rect.height / 2],
    [rect.right - rect.width * 0.15, rect.bottom - rect.height * 0.2],
  ];
  const results = points.map(([x, y]) => {
    const hit = document.elementFromPoint(x, y);
    return {
      x: Math.round(x),
      y: Math.round(y),
      tag: hit?.tagName ?? null,
      inReceipt: receipt.contains(hit),
      inUbc: ubcWrap?.contains(hit) ?? false,
      pass: receipt.contains(hit),
    };
  });

  return {
    label: "cursor",
    rect: { top: rect.top, left: rect.left, w: rect.width, h: rect.height },
    results,
    pass: results.every((r) => r.pass),
    cursorZ: wrap ? getComputedStyle(wrap).zIndex : null,
    cursorInline: wrap?.getAttribute("style"),
    ariaExpanded: wrap?.querySelector("button")?.getAttribute("aria-expanded"),
  };
});

console.log("=== CURSOR ASSERTION ===");
console.log(JSON.stringify(cursorAssert, null, 2));

await page.locator("section#top").screenshot({
  path: path.join(scratchDir, "final_cursor_receipt_fixed.png"),
});

// --- UBC sticker regression ---
await page.mouse.move(0, 0);
await page.waitForTimeout(400);

const ubcBtn = page.locator(".absolute.-left-14.top-\\[60\\%\\] button");
await ubcBtn.hover();
await page.waitForTimeout(500);

const ubcAssert = await page.evaluate(() => {
  const receipt = [...document.querySelectorAll('[role="tooltip"]')].find((el) =>
    /UBC/i.test(el.textContent ?? ""),
  );
  if (!receipt) return { error: "no ubc receipt", pass: false };

  const rect = receipt.getBoundingClientRect();
  const points = [
    [rect.left + 12, rect.top + 12],
    [rect.left + rect.width / 2, rect.top + rect.height / 2],
    [rect.right - 12, rect.bottom - 12],
  ];
  const results = points.map(([x, y]) => {
    const hit = document.elementFromPoint(x, y);
    return {
      x: Math.round(x),
      y: Math.round(y),
      tag: hit?.tagName ?? null,
      inReceipt: receipt.contains(hit),
      pass: receipt.contains(hit),
    };
  });

  return {
    label: "ubc",
    results,
    pass: results.every((r) => r.pass),
  };
});

console.log("=== UBC ASSERTION ===");
console.log(JSON.stringify(ubcAssert, null, 2));

await page.locator("section#top").screenshot({
  path: path.join(scratchDir, "final_ubc_receipt_fixed.png"),
});

await browser.close();

if (!cursorAssert.pass) {
  console.error("FAIL: cursor receipt occluded");
  process.exit(1);
}
if (ubcAssert.error || !ubcAssert.pass) {
  console.error("FAIL: ubc receipt regression");
  process.exit(1);
}
console.log("ALL ASSERTIONS PASSED");
