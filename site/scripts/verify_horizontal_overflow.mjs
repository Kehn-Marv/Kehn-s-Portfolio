import { chromium } from "playwright";
import { existsSync } from "node:fs";

const url = process.env.OVERFLOW_QA_URL ?? "http://127.0.0.1:3500/";
const macChromePath =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const chromePath =
  process.env.CHROME_PATH ??
  (existsSync(macChromePath) ? macChromePath : undefined);
const widths = [
  320,
  360,
  390,
  768,
  1024,
  1280,
  1440,
  1920,
  2560,
  3840,
  6000,
  7680,
  12000,
];
const report = [];

const browser = await chromium.launch({
  headless: true,
  ...(chromePath ? { executablePath: chromePath } : {}),
});

for (const width of widths) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    reducedMotion: "no-preference",
  });

  const pageErrors = [];
  const failedRequests = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) =>
    failedRequests.push({
      url: request.url(),
      error: request.failure()?.errorText ?? "unknown",
    }),
  );

  const response = await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    const scrollHeight = document.documentElement.scrollHeight;
    for (let y = 0; y <= scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((resolve) => window.setTimeout(resolve, 40));
    }
  });

  const layout = await page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    const fullWidthRegions = [
      ...document.querySelectorAll("main > section, main > section > div:first-child, footer"),
    ].map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        tag: element.tagName,
        id: element.id,
        width: rect.width,
        left: rect.left,
        right: rect.right,
      };
    });
    const contentShellWidths = [
      "#experience > div:nth-child(2)",
      "#work > div:nth-child(2)",
      "#connect > div:nth-child(2)",
    ].map((selector) => ({
      selector,
      width:
        document.querySelector(selector)?.getBoundingClientRect().width ?? 0,
    }));

    window.scrollTo(100_000, window.scrollY);

    return {
      viewportWidth: root.clientWidth,
      rootScrollWidth: root.scrollWidth,
      bodyScrollWidth: body.scrollWidth,
      scrollXAfterForcedScroll: window.scrollX,
      htmlOverflowX: getComputedStyle(root).overflowX,
      bodyOverflowX: getComputedStyle(body).overflowX,
      bodyZoom: getComputedStyle(body).zoom,
      bodyWidth: body.getBoundingClientRect().width,
      rootFontSize: Number.parseFloat(getComputedStyle(root).fontSize),
      fullWidthRegions,
      contentShellWidths,
    };
  });

  const marqueeLoops = await page.evaluate(async () => {
    const viewportWidth = document.documentElement.clientWidth;
    const samples = [0, 0.25, 0.5, 0.75, 0.999];

    return Promise.all(
      [...document.querySelectorAll("[data-marquee-track]")].map(
        async (track) => {
          const groups = [...track.querySelectorAll("[data-marquee-group]")];
          const animation = track.getAnimations()[0];
          const duration = Number(animation?.effect?.getTiming().duration ?? 0);
          animation?.pause();

          const groupWidths = groups.map(
            (group) => group.getBoundingClientRect().width,
          );
          const groupContentWidths = groups.map((group) =>
            [...group.querySelectorAll("[data-marquee-item]")].reduce(
              (sum, item) => sum + item.getBoundingClientRect().width,
              0,
            ),
          );
          const equalGroups =
            groups.length === 2 &&
            Math.abs(groupWidths[0] - groupWidths[1]) <= 0.5;
          const groupsFillViewport = groupWidths.every(
            (groupWidth) => groupWidth >= viewportWidth,
          );
          const contentFillsGroups = groupContentWidths.every(
            (contentWidth, index) => contentWidth >= groupWidths[index] - 0.5,
          );
          const sampleCoverage = [];

          for (const progress of samples) {
            if (animation) {
              animation.currentTime = duration * progress;
            }
            await new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve)),
            );

            const intervals = groups
              .map((group) => group.getBoundingClientRect())
              .map((rect) => ({
                left: Math.max(0, rect.left),
                right: Math.min(viewportWidth, rect.right),
              }))
              .filter((interval) => interval.right > interval.left)
              .sort((a, b) => a.left - b.left);
            let coveredUntil = 0;
            for (const interval of intervals) {
              if (interval.left > coveredUntil + 0.5) break;
              coveredUntil = Math.max(coveredUntil, interval.right);
            }
            sampleCoverage.push(coveredUntil >= viewportWidth - 0.5);
          }

          animation?.play();

          return {
            pass:
              Boolean(animation) &&
              duration > 0 &&
              equalGroups &&
              groupsFillViewport &&
              contentFillsGroups &&
              sampleCoverage.every(Boolean),
            duration,
            groupWidths,
            groupContentWidths,
            equalGroups,
            groupsFillViewport,
            contentFillsGroups,
            sampleCoverage,
          };
        },
      ),
    );
  });

  const fullWidthRegionsPass = layout.fullWidthRegions.every(
    (region) =>
      region.left >= -0.5 &&
      region.right <= layout.viewportWidth + 0.5 &&
      region.width <= layout.viewportWidth + 0.5,
  );
  const extremeScalePass =
    width < 2560 ||
    layout.contentShellWidths.every(
      (shell) => shell.width >= layout.viewportWidth * 0.4,
    );

  const pass =
    response?.status() === 200 &&
    layout.rootScrollWidth === layout.viewportWidth &&
    Math.abs(
      layout.bodyScrollWidth * Number(layout.bodyZoom) -
        layout.viewportWidth,
    ) <= 1 &&
    layout.scrollXAfterForcedScroll === 0 &&
    layout.htmlOverflowX === "clip" &&
    layout.bodyOverflowX === "clip" &&
    layout.bodyZoom === "1" &&
    Math.abs(layout.bodyWidth - layout.viewportWidth) <= 1 &&
    fullWidthRegionsPass &&
    extremeScalePass &&
    marqueeLoops.every((loop) => loop.pass) &&
    pageErrors.length === 0 &&
    failedRequests.length === 0;

  report.push({
    width,
    status: response?.status(),
    pass,
    fullWidthRegionsPass,
    extremeScalePass,
    marqueeLoops,
    layout,
    pageErrors,
    failedRequests,
  });

  if (width === 390 || width === 1440) {
    await page.screenshot({
      path: `/tmp/personal-site-overflow-${width}.png`,
      fullPage: true,
    });
  }

  await page.close();
}

await browser.close();

console.log(JSON.stringify(report, null, 2));

if (report.some((entry) => !entry.pass)) {
  process.exitCode = 1;
}
