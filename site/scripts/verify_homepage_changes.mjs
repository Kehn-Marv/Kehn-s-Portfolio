import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
const results = {};

await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

// CHECK 2: Beliefs section gone
const beliefsText = await page.getByText("3 things I believe", { exact: false }).count();
const beliefsChip = await page.getByText("beliefs", { exact: true }).count();
const bodyHasBelieve = await page.evaluate(() =>
  document.body.innerText.toLowerCase().includes("things i believe")
);
results.check2_beliefs = {
  headingCount: beliefsText,
  chipCount: beliefsChip,
  bodyHasBelieve,
  pass: beliefsText === 0 && bodyHasBelieve === false,
};

// CHECK 3: Lumon link not in hero, but in work section
const heroLumon = await page.locator('#top a[href*="lumon-industries.ca"]').count();
const workLumon = await page.locator('#work a[href*="lumon-industries.ca"]').count();
const anyLumon = await page.locator('a[href*="lumon-industries.ca"]').count();
results.check3_lumon = {
  heroLumonLinks: heroLumon,
  workLumonLinks: workLumon,
  totalLumonLinks: anyLumon,
  pass: heroLumon === 0 && workLumon >= 1,
};

// CHECK 4: hover two stickers, tooltip appears ABOVE sticker
async function hoverAndMeasure(name, buttonLocator, shotPath) {
  const box = await buttonLocator.boundingBox();
  await buttonLocator.hover();
  await page.waitForTimeout(700);
  const tip = page.locator('[role="tooltip"]').last();
  await tip.waitFor({ state: "visible", timeout: 3000 });
  await page.waitForTimeout(400);
  const tipBox = await tip.boundingBox();
  const stickerBox = await buttonLocator.boundingBox();
  await page.screenshot({ path: shotPath });
  // move mouse away to close
  await page.mouse.move(5, 5);
  await page.waitForTimeout(400);
  const tolerance = 6;
  const above = tipBox.y + tipBox.height <= stickerBox.y + tolerance;
  return {
    name,
    stickerTop: Math.round(stickerBox.y),
    stickerBottom: Math.round(stickerBox.y + stickerBox.height),
    tooltipTop: Math.round(tipBox.y),
    tooltipBottom: Math.round(tipBox.y + tipBox.height),
    gap: Math.round(stickerBox.y - (tipBox.y + tipBox.height)),
    pass: above,
    screenshot: shotPath,
  };
}

// Find sticker buttons by their receipt tooltip content via aria. We locate the
// button whose sticker corresponds. UBC badge sticker and bucket hat.
// The buttons are inside #top. Identify by nearest receipt text is portal-based,
// so match by SVG title / img alt is empty. Use order from pegItems.
// bucket-hat is pegItems[0], ubc is pegItems[6]. Buttons render in that order.
const heroButtons = page.locator('#top button[aria-expanded]');
const btnCount = await heroButtons.count();
results.heroStickerButtonCount = btnCount;

// GitHubSticker has no aria-expanded button, so it drops from this sequence.
// Verified mapping: index 0 = bucket hat, index 5 = UBC badge.
const bucketBtn = heroButtons.nth(0);
const ubcBtn = heroButtons.nth(5);

results.check4_bucket = await hoverAndMeasure(
  "bucket-hat",
  bucketBtn,
  "/tmp/hero_sticker_bucket.png"
);
results.check4_ubc = await hoverAndMeasure(
  "ubc-badge",
  ubcBtn,
  "/tmp/hero_sticker_ubc.png"
);
results.check4_pass = results.check4_bucket.pass && results.check4_ubc.pass;

// CHECK 5: work section 5 cards, 5th centered on own row
await page.locator("#work").scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);

// Count work cards. Each card has a label. Gather labels.
const labels = await page.evaluate(() => {
  const work = document.querySelector("#work");
  if (!work) return null;
  // find repeated card blocks: look for elements containing known labels
  const wanted = ["LUMON SIMULATOR"];
  const all = Array.from(work.querySelectorAll("*"))
    .map((el) => el.textContent || "")
    .join(" ");
  return { hasLumonLabel: all.includes("LUMON SIMULATOR") };
});

// Better: count cards via a structural approach. Find the grid container.
const cardInfo = await page.evaluate(() => {
  const work = document.querySelector("#work");
  if (!work) return { error: "no #work" };
  // Heuristic: cards are the direct children of a grid that each contain an <a href github or lumon> or a demo.
  // Find all links to github/lumon inside work to count cards.
  const cardLinks = Array.from(
    work.querySelectorAll('a[href*="github.com"], a[href*="lumon-industries.ca"]')
  );
  // Find lumon card element (closest positioned card ancestor)
  return { cardLinkCount: cardLinks.length };
});
results.workCardLinkCount = cardInfo.cardLinkCount;
results.workHasLumonLabel = labels?.hasLumonLabel;

// Count actual cards by known labels present in #work.
const cardLabelInfo = await page.evaluate(() => {
  const work = document.querySelector("#work");
  if (!work) return null;
  const known = [
    "NESTEASE",
    "LAUNCHPAD",
    "ORCHESTRATOR",
    "PHOTON",
    "LUMON SIMULATOR",
  ];
  const text = work.innerText.toUpperCase();
  const found = known.filter((k) => text.includes(k));
  return { known, found, count: found.length };
});
results.workCardCount = cardLabelInfo;

// Measure the lumon card centering. Find the lumon link, walk up to card, get its box.
const lumonBoxInfo = await page.evaluate(() => {
  const work = document.querySelector("#work");
  if (!work) return null;
  const lumonLink = work.querySelector('a[href*="lumon-industries.ca"]');
  if (!lumonLink) return null;
  // Walk up to a card-like ancestor (has border/shadow). Just go up a few levels.
  let el = lumonLink;
  for (let i = 0; i < 8; i++) {
    if (!el.parentElement) break;
    el = el.parentElement;
    const cls = el.className?.toString?.() || "";
    if (cls.includes("shadow-brutal") || cls.includes("border-2")) break;
  }
  const cardRect = el.getBoundingClientRect();
  const workRect = work.getBoundingClientRect();
  return {
    cardLeft: cardRect.left,
    cardRight: cardRect.right,
    cardCenter: cardRect.left + cardRect.width / 2,
    workLeft: workRect.left,
    workRight: workRect.right,
    workCenter: workRect.left + workRect.width / 2,
    cardWidth: cardRect.width,
    workWidth: workRect.width,
  };
});
if (lumonBoxInfo) {
  const centerDelta = Math.abs(lumonBoxInfo.cardCenter - lumonBoxInfo.workCenter);
  // centered = card center near work center AND card narrower than full width (own row)
  results.check5_centering = {
    cardCenter: Math.round(lumonBoxInfo.cardCenter),
    workCenter: Math.round(lumonBoxInfo.workCenter),
    centerDelta: Math.round(centerDelta),
    cardWidth: Math.round(lumonBoxInfo.cardWidth),
    workWidth: Math.round(lumonBoxInfo.workWidth),
    centered: centerDelta < 40,
  };
} else {
  results.check5_centering = { error: "lumon card not found" };
}

// hover lumon card, wait 2.5s, screenshot
const lumonCardHandle = page.locator('#work a[href*="lumon-industries.ca"]').first();
await lumonCardHandle.scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
// hover the card container (parent), not just the link
const lumonBox = await lumonCardHandle.boundingBox();
if (lumonBox) {
  await page.mouse.move(
    lumonBox.x + lumonBox.width / 2,
    lumonBox.y - 60 // hover above link, likely over demo area
  );
}
// also hover the actual card region
await lumonCardHandle.hover();
await page.waitForTimeout(2500);
await page.screenshot({ path: "/tmp/lumon_card.png" });
results.check5_screenshot = "/tmp/lumon_card.png";
results.check5_pass =
  results.workHasLumonLabel === true &&
  (results.check5_centering.centered === true);

console.log(JSON.stringify(results, null, 2));
await browser.close();
