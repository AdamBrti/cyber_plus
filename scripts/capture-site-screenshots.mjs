import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "C:/Users/AdamBartkowski/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright-core@1.60.0/node_modules/playwright-core"
);

const outputDir = "D:/Moej stronki/cyber_plus/assets/showcase-screenshots";

const shots = [
  {
    id: "podwiatr",
    url: "https://podwiatr.net.pl/",
    desktop: "podwiatr-desktop.jpg",
    mobile: "podwiatr-mobile.jpg",
  },
  {
    id: "sztangislaw",
    url: "https://www.sztangislaw.pl/",
    desktop: "sztangislaw-desktop.jpg",
    mobile: "sztangislaw-mobile.jpg",
  },
  {
    id: "without-gravity",
    url: "https://without-gravity.szczecin.pl/",
    desktop: "without-gravity-desktop.jpg",
    mobile: "without-gravity-mobile.jpg",
  },
];

function createMotionKillCss() {
  return `
    *,
    *::before,
    *::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
      caret-color: transparent !important;
    }
  `;
}

async function dismissOverlays(page) {
  const acceptPatterns = [/akcept/i, /accept/i, /zgadzam/i, /agree/i, /allow all/i];

  for (const pattern of acceptPatterns) {
    const candidate = page.locator("button, a").filter({ hasText: pattern }).first();
    if ((await candidate.count()) === 0) {
      continue;
    }

    try {
      await candidate.click({ timeout: 1500 });
      await page.waitForTimeout(500);
      break;
    } catch {
      // Ignore non-interactable matches and keep looking.
    }
  }

  await page.evaluate(() => {
    const patterns = [/cookie/i, /consent/i, /chat/i, /intercom/i, /whatsapp/i, /messenger/i];

    document.querySelectorAll("body *").forEach((element) => {
      const descriptor = [
        element.id,
        typeof element.className === "string" ? element.className : "",
        element.getAttribute("aria-label") || "",
        element.getAttribute("data-testid") || "",
      ].join(" ");

      if (patterns.some((pattern) => pattern.test(descriptor))) {
        element.style.setProperty("display", "none", "important");
      }
    });
  });
}

async function preparePage(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addStyleTag({ content: createMotionKillCss() });
  await page.waitForLoadState("networkidle", { timeout: 45000 }).catch(() => {});
  await dismissOverlays(page);
  await page.waitForTimeout(1200);
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);
}

async function captureDesktop(browser, item) {
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
  });

  try {
    await preparePage(page, item.url);
    const outputPath = path.join(outputDir, item.desktop);
    await page.screenshot({
      path: outputPath,
      type: "jpeg",
      quality: 84,
    });
    return outputPath;
  } finally {
    await page.close();
  }
}

async function captureMobile(browser, item) {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  try {
    await preparePage(page, item.url);
    const outputPath = path.join(outputDir, item.mobile);
    await page.screenshot({
      path: outputPath,
      type: "jpeg",
      quality: 84,
    });
    return outputPath;
  } finally {
    await page.close();
  }
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    for (const item of shots) {
      const desktopPath = await captureDesktop(browser, item);
      const mobilePath = await captureMobile(browser, item);
      console.log(`${item.id}:`);
      console.log(`  desktop -> ${desktopPath}`);
      console.log(`  mobile  -> ${mobilePath}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
