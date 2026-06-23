import fs from "node:fs/promises";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nodeModulesRoot = "C:/Users/AdamBartkowski/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const directPlaywrightCorePath = path.join(nodeModulesRoot, "playwright-core");
const pnpmRoot = path.join(nodeModulesRoot, ".pnpm");
const pnpmPlaywrightCorePath = existsSync(pnpmRoot)
  ? readdirSync(pnpmRoot)
      .filter((name) => /^playwright-core@\d+\.\d+\.\d+$/.test(name))
      .sort()
      .pop()
  : null;
const { chromium } = require(
  pnpmPlaywrightCorePath
    ? path.join(pnpmRoot, pnpmPlaywrightCorePath, "node_modules", "playwright-core")
    : directPlaywrightCorePath,
);

const outputDir = "D:/Moej stronki/cyber_plus/assets/portfolio";
const localChromium = "C:/Users/AdamBartkowski/AppData/Local/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-win64/chrome-headless-shell.exe";

const shots = [
  {
    id: "bs-makeup",
    url: "http://127.0.0.1:8128/",
    output: "bs-makeup-shot.jpg",
    scrollTo: "#proces",
  },
  {
    id: "auto-mig",
    url: "http://127.0.0.1:8129/",
    output: "auto-mig-shot.jpg",
  },
  {
    id: "sunny-travel",
    url: "http://127.0.0.1:8130/",
    output: "sunny-travel-shot.jpg",
  },
  {
    id: "atelier-relaks",
    url: "http://127.0.0.1:8131/",
    output: "atelier-relaks-shot.jpg",
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
    if ((await candidate.count()) === 0) continue;

    try {
      await candidate.click({ timeout: 1200 });
      await page.waitForTimeout(400);
      break;
    } catch {
      // Best effort only.
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

async function captureShot(browser, item) {
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
  });

  try {
    await preparePage(page, item.url);
    if (item.scrollTo) {
      await page.locator(item.scrollTo).scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }
    const outputPath = path.join(outputDir, item.output);
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
  executablePath: existsSync(localChromium) ? localChromium : undefined,
});

  try {
    for (const item of shots) {
      const outputPath = await captureShot(browser, item);
      console.log(`${item.id} -> ${outputPath}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
