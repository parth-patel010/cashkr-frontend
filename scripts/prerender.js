/**
 * Post-build prerender using Puppeteer.
 * Serves dist/ locally and saves rendered HTML per route.
 *
 * Default: skipped (SPA build is fast).
 * Enable with: PRERENDER=1 npm run build
 * Or: npm run build:prerender
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import handler from 'serve-handler';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const distDir = path.join(root, 'dist');
const routesFile = path.join(root, 'prerender-routes.json');
const PORT = 4173;
const CONCURRENCY = Number(process.env.PRERENDER_CONCURRENCY || 4);

function getOutputPath(route) {
  if (route === '/') return path.join(distDir, 'index.html');
  const clean = route.replace(/^\//, '').replace(/\/$/, '');
  return path.join(distDir, clean, 'index.html');
}

async function startServer() {
  const server = http.createServer((req, res) =>
    handler(req, res, {
      public: distDir,
      rewrites: [{ source: '**', destination: '/index.html' }],
    }),
  );
  await new Promise((resolve) => server.listen(PORT, resolve));
  return server;
}

function shouldSkipPrerender() {
  if (process.env.VERCEL === '1') return 'Vercel build (no Chrome in build image)';
  if (process.env.SKIP_PRERENDER === '1') return 'SKIP_PRERENDER=1';
  // Default skip — opt in with --run or PRERENDER=1
  if (process.env.PRERENDER !== '1' && !process.argv.includes('--run')) {
    return 'prerender disabled (use npm run prerender or build:seo)';
  }
  return null;
}

async function prerenderRoute(browser, route) {
  const page = await browser.newPage();
  try {
    await page.goto(`http://127.0.0.1:${PORT}${route}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page
      .waitForFunction(() => document.querySelector('title')?.textContent?.includes('DeviceKart'), {
        timeout: 10000,
      })
      .catch(() => {});
    const html = await page.content();
    const outPath = getOutputPath(route);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html);
    console.log(`  ✓ ${route}`);
  } catch (err) {
    console.warn(`  ✗ ${route}: ${err.message}`);
  } finally {
    await page.close();
  }
}

async function runPool(items, worker, concurrency) {
  let index = 0;
  const runners = Array.from({ length: concurrency }, async () => {
    while (index < items.length) {
      const current = items[index++];
      await worker(current);
    }
  });
  await Promise.all(runners);
}

async function main() {
  const skipReason = shouldSkipPrerender();
  if (skipReason) {
    console.log(`Skipping prerender: ${skipReason}. SPA build is ready in dist/.`);
    return;
  }

  if (!fs.existsSync(distDir)) {
    console.error('dist/ not found — run vite build first');
    process.exit(1);
  }

  const routes = fs.existsSync(routesFile)
    ? JSON.parse(fs.readFileSync(routesFile, 'utf-8'))
    : ['/'];

  const server = await startServer();
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  } catch (err) {
    server.close();
    console.warn(`Prerender skipped (Chrome unavailable): ${err.message}`);
    return;
  }

  console.log(`Prerendering ${routes.length} routes (concurrency ${CONCURRENCY})...`);
  await runPool(routes, (route) => prerenderRoute(browser, route), CONCURRENCY);

  await browser.close();
  server.close();
  console.log('Prerender complete.');
}

main().catch((err) => {
  console.warn(`Prerender failed (non-fatal): ${err.message}`);
});
