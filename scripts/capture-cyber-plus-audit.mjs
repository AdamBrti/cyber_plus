import { existsSync, readdirSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const nodeModulesRoot = "C:/Users/AdamBartkowski/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const directPlaywrightPath = path.join(nodeModulesRoot, "playwright");
const pnpmRoot = path.join(nodeModulesRoot, ".pnpm");
const pnpmPlaywrightPath = existsSync(pnpmRoot)
  ? readdirSync(pnpmRoot)
      .filter((name) => /^playwright@\d+\.\d+\.\d+$/.test(name))
      .sort()
      .pop()
  : null;
const { chromium } = require(
  pnpmPlaywrightPath
    ? path.join(pnpmRoot, pnpmPlaywrightPath, "node_modules", "playwright")
    : directPlaywrightPath,
);

const baseUrl = "http://127.0.0.1:8137";
const outputDir = path.resolve("audit-screenshots", "after-asset-fix");
const localChromium = "C:/Users/AdamBartkowski/AppData/Local/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-win64/chrome-headless-shell.exe";

const pages = [
  "portfolio.html",
  "oferta.html",
  "proces.html",
  "technologia.html",
  "strony-dla-fotografow.html",
  "strony-dla-salonow-beauty.html",
  "strony-dla-trenerow-personalnych.html",
];

const viewports = [
  { name: "desktop", width: 1440, height: 900, isMobile: false },
  { name: "mobile", width: 390, height: 844, isMobile: true },
];

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: existsSync(localChromium) ? localChromium : undefined,
});
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.isMobile,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    for (const pageName of pages) {
      await page.goto(`${baseUrl}/${pageName}`, { waitUntil: "load", timeout: 20_000 });
      await page.addStyleTag({
        content: `
          * { scroll-behavior: auto !important; }
          .intro-loader, .cursor-glow { display: none !important; }
          .reveal { opacity: 1 !important; transform: none !important; }
        `,
      });
      await page.evaluate(() => {
        const acceptPattern = /rozumiem|akceptuj|akceptuje|akceptuję|accept/i;
        const controls = [...document.querySelectorAll("button, a")];
        const acceptControl = controls.find((element) => acceptPattern.test(element.textContent || ""));
        acceptControl?.click();
      });
      await page.waitForTimeout(350);
      await page.screenshot({
        path: path.join(outputDir, `${pageName.replace(".html", "")}-${viewport.name}.png`),
        fullPage: false,
      });
      console.log(`captured ${pageName} ${viewport.name}`);
    }

    await context.close();
  }
} finally {
  await browser.close();
}
