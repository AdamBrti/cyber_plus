import path from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "C:/Users/AdamBartkowski/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright-core@1.60.0/node_modules/playwright-core"
);

const pageUrl = pathToFileURL("D:/Moej stronki/bs_makeup/index.html").href;
const outputPath = "D:/Moej stronki/cyber_plus/assets/portfolio/bs-makeup-shot.jpg";

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

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
  });

  try {
    await page.goto(pageUrl, { waitUntil: "load", timeout: 45000 });
    await page.addStyleTag({ content: createMotionKillCss() });
    await page.waitForTimeout(1000);
    await page.locator("#proces").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: outputPath,
      type: "jpeg",
      quality: 84,
    });
    console.log(path.basename(outputPath));
  } finally {
    await page.close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
