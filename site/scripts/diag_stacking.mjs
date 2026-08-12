import { chromium } from "playwright";

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto("http://localhost:3456", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

// Find Cursor sticker button by hovering candidates until receipt appears
const buttons = page.locator("section#top button");
const count = await buttons.count();
let cursorWrapper = null;

for (let i = 0; i < count; i++) {
  const btn = buttons.nth(i);
  await btn.hover({ force: true });
  await page.waitForTimeout(400);
  const hasReceipt = await page.evaluate(() => {
    const tooltip = document.querySelector('[role="tooltip"]');
    return tooltip?.textContent?.match(/CURSOR AMBASSADOR/i) != null;
  });
  if (hasReceipt) {
    cursorWrapper = await btn.evaluateHandle((el) =>
      el.closest('[class*="pointer-events-auto"]')
    );
    break;
  }
}

if (!cursorWrapper) {
  console.error("Could not find Cursor sticker with receipt tooltip");
  await browser.close();
  process.exit(1);
}

const findings = await page.evaluate(() => {
  const cursorBtn = [...document.querySelectorAll("section#top button")].find((btn) => {
    const wrapper = btn.closest('[class*="pointer-events-auto"]');
    const tooltip = wrapper?.querySelector('[role="tooltip"]');
    return tooltip?.textContent?.match(/CURSOR AMBASSADOR/i);
  });
  const cursorWrapper = cursorBtn?.closest('[class*="pointer-events-auto"]');
  const ubcImg = document.querySelector('img[src*="ubc-badge"]');
  const ubcWrapper = ubcImg?.closest('[class*="pointer-events-auto"]');

  if (!cursorWrapper || !ubcWrapper) {
    return { error: "Could not locate wrappers", cursorWrapper: !!cursorWrapper, ubcWrapper: !!ubcWrapper };
  }

  const sharedParent = (() => {
    let a = cursorWrapper.parentElement;
    while (a) {
      if (a.contains(ubcWrapper) && a !== cursorWrapper && a !== ubcWrapper) return a;
      a = a.parentElement;
    }
    return null;
  })();

  const getComputedInfo = (el) => {
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName,
      className: el.className?.toString?.() ?? "",
      zIndex: cs.zIndex,
      position: cs.position,
      transform: cs.transform,
      opacity: cs.opacity,
      filter: cs.filter,
      isolation: cs.isolation,
      willChange: cs.willChange,
      display: cs.display,
      inlineStyle: el.getAttribute("style"),
    };
  };

  const ancestorChain = (el, stopAt) => {
    const chain = [];
    let node = el;
    while (node && node !== stopAt?.parentElement) {
      const cs = getComputedStyle(node);
      const createsContext =
        cs.transform !== "none" ||
        cs.filter !== "none" ||
        cs.opacity !== "1" ||
        cs.isolation === "isolate" ||
        cs.willChange.includes("transform") ||
        cs.willChange.includes("opacity") ||
        cs.willChange.includes("filter") ||
        (cs.position !== "static" && cs.zIndex !== "auto");
      chain.push({
        ...getComputedInfo(node),
        createsStackingContext: createsContext,
      });
      if (node === stopAt) break;
      node = node.parentElement;
    }
    return chain;
  };

  const cursorChildren = [...cursorWrapper.children].map((c) => getComputedInfo(c));
  const receipt = cursorWrapper.querySelector('[role="tooltip"]');

  // DOM order among siblings under shared parent
  const siblings = sharedParent ? [...sharedParent.children] : [];
  const cursorIdx = siblings.indexOf(cursorWrapper);
  const ubcIdx = siblings.indexOf(ubcWrapper);

  // Check if Tailwind z-10 uses !important
  const cursorZFromClass = getComputedStyle(cursorWrapper).zIndex;
  const cursorInlineZ = cursorWrapper.style.zIndex;

  // elementFromPoint on receipt center
  const receiptRect = receipt?.getBoundingClientRect();
  let hitTest = null;
  if (receiptRect) {
    const cx = receiptRect.left + receiptRect.width / 2;
    const cy = receiptRect.top + receiptRect.height / 2;
    const hit = document.elementFromPoint(cx, cy);
    hitTest = {
      point: { x: Math.round(cx), y: Math.round(cy) },
      hitTag: hit?.tagName,
      hitClass: hit?.className?.toString?.() ?? "",
      hitIsReceipt: receipt.contains(hit),
      hitIsUbc: ubcWrapper.contains(hit),
    };
  }

  return {
    cursorWrapper: getComputedInfo(cursorWrapper),
    ubcWrapper: getComputedInfo(ubcWrapper),
    cursorInnerChildren: cursorChildren,
    receipt: receipt ? getComputedInfo(receipt) : null,
    domOrder: { cursorIdx, ubcIdx, totalSiblings: siblings.length },
    sharedParent: sharedParent
      ? { tag: sharedParent.tagName, className: sharedParent.className?.toString?.() ?? "" }
      : null,
    cursorAncestorChain: ancestorChain(cursorWrapper, sharedParent),
    ubcAncestorChain: ancestorChain(ubcWrapper, sharedParent),
    hitTest,
    openState: {
      ariaExpanded: cursorBtn?.getAttribute("aria-expanded"),
      tooltipVisible: !!receipt,
    },
  };
});

console.log("=== STACKING DIAGNOSIS ===");
console.log(JSON.stringify(findings, null, 2));

await browser.close();
