import { createServer } from "node:http";
import { createReadStream, existsSync, readdirSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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
const repoRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(repoRoot, "..");
const outputDir = path.join(repoRoot, "assets", "showcase-screenshots");
const localChromium = "C:/Users/AdamBartkowski/AppData/Local/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-win64/chrome-headless-shell.exe";

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".avif", "image/avif"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".mp4", "video/mp4"],
  [".webm", "video/webm"],
]);

const sites = [
  { id: "slodkotu", root: "salon_kosmetyczny", port: 8141 },
  { id: "bs-makeup", root: "bs_makeup", port: 8143 },
  { id: "auto-mig", root: "mechanik", port: 8144 },
  { id: "sunny-travel", root: "biuro_podrozy", port: 8145 },
  { id: "atelier-relaks", root: path.join("spa_meble_premium", "out"), port: 8146 },
  { id: "surowa-dieta", root: "surowa_dieta", port: 8147 },
  { id: "kalistenika", root: "Projekt kalistenika", port: 8148 },
  { id: "podwiatr", root: "Podwiatr", port: 8149 },
];

const shots = [
  { site: "slodkotu", name: "slodkotu-mobile.jpg", viewport: "mobile", scrollY: 0 },
  { site: "bs-makeup", name: "bs-makeup-desktop.jpg", viewport: "desktop", scrollY: 560 },
  { site: "bs-makeup", name: "bs-makeup-mobile.jpg", viewport: "mobile", scrollY: 720 },
  { site: "auto-mig", name: "auto-mig-mobile.jpg", viewport: "mobile", scrollY: 520 },
  { site: "auto-mig", name: "auto-mig-desktop.jpg", viewport: "desktop", scrollY: 720 },
  { site: "sunny-travel", name: "sunny-travel-desktop.jpg", viewport: "desktop", scrollY: 650 },
  { site: "sunny-travel", name: "sunny-travel-mobile.jpg", viewport: "mobile", scrollY: 560 },
  { site: "atelier-relaks", name: "atelier-relaks-desktop.jpg", viewport: "desktop", scrollY: 560 },
  { site: "atelier-relaks", name: "atelier-relaks-mobile.jpg", viewport: "mobile", scrollY: 520 },
  { site: "surowa-dieta", name: "surowa-dieta-desktop.jpg", viewport: "desktop", scrollY: 620 },
  { site: "surowa-dieta", name: "surowa-dieta-mobile.jpg", viewport: "mobile", scrollY: 480 },
  { site: "kalistenika", name: "kalistenika-desktop.jpg", viewport: "desktop", scrollY: 0 },
  { site: "kalistenika", name: "kalistenika-mobile.jpg", viewport: "mobile", scrollY: 520 },
  { site: "podwiatr", name: "podwiatr-section-desktop.jpg", viewport: "desktop", path: "/fotograf-szczecin/", scrollY: 0 },
];

const viewports = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1 },
  mobile: { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true },
};

function serveStatic(root, port) {
  const absoluteRoot = path.join(workspaceRoot, root);
  if (!existsSync(absoluteRoot)) {
    throw new Error(`Missing local site root: ${absoluteRoot}`);
  }

  const server = createServer((req, res) => {
    const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
    const decodedPath = decodeURIComponent(url.pathname);
    const normalizedPath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
    let filePath = path.join(absoluteRoot, normalizedPath);

    if (decodedPath.endsWith("/")) {
      filePath = path.join(filePath, "index.html");
    } else if (!path.extname(filePath) && existsSync(path.join(filePath, "index.html"))) {
      filePath = path.join(filePath, "index.html");
    }

    if (!filePath.startsWith(absoluteRoot)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    if (!existsSync(filePath)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": mimeTypes.get(path.extname(filePath).toLowerCase()) || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => resolve({ server, absoluteRoot, port }));
  });
}

async function captureShot(browser, siteMap, shot) {
  const site = siteMap.get(shot.site);
  const context = await browser.newContext({
    viewport: viewports[shot.viewport],
    deviceScaleFactor: viewports[shot.viewport].deviceScaleFactor,
    isMobile: viewports[shot.viewport].isMobile || false,
  });
  const page = await context.newPage();

  await page.goto(`http://127.0.0.1:${site.port}${shot.path || "/"}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForTimeout(900);
  await page.addStyleTag({
    content: `
      * { scroll-behavior: auto !important; }
      .intro-loader, .cursor-glow, .preloader, .loading-screen { display: none !important; }
      body { cursor: default !important; }
    `,
  });
  await page.evaluate(() => {
    const acceptPattern = /akceptuj|akceptuje|akceptuję|accept/i;
    const cookiePattern = /cookie|cookies|plik/i;
    const controls = [...document.querySelectorAll("button, a")];
    const acceptControl = controls.find((element) => acceptPattern.test(element.textContent || ""));
    acceptControl?.click();

    for (const element of [...document.body.querySelectorAll("*")]) {
      const text = element.textContent || "";
      if (!cookiePattern.test(text) || text.length > 1200) continue;
      const style = window.getComputedStyle(element);
      if (style.position === "fixed" || style.position === "sticky") {
        element.remove();
      }
    }
  });
  await page.waitForTimeout(250);
  if (shot.scrollY) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), shot.scrollY);
    await page.waitForTimeout(450);
  }

  await page.screenshot({
    path: path.join(outputDir, shot.name),
    type: "jpeg",
    quality: 86,
    fullPage: false,
  });
  await context.close();
}

await mkdir(outputDir, { recursive: true });

const servers = [];
try {
  for (const site of sites) {
    servers.push({ site, ...(await serveStatic(site.root, site.port)) });
  }

  const siteMap = new Map(servers.map(({ site, port }) => [site.id, { ...site, port }]));
  const browser = await chromium.launch({
    headless: true,
    executablePath: existsSync(localChromium) ? localChromium : undefined,
  });
  for (const shot of shots) {
    await captureShot(browser, siteMap, shot);
    console.log(`captured ${shot.name}`);
  }
  await browser.close();
} finally {
  await Promise.all(servers.map(({ server }) => new Promise((resolve) => server.close(resolve))));
}
