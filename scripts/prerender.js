/**
 * Post-build prerender using Puppeteer.
 * Serves dist/ locally and saves rendered HTML per route.
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
    })
  );
  await new Promise((resolve) => server.listen(PORT, resolve));
  return server;
}

function shouldSkipPrerender() {
  if (process.env.VERCEL === '1') return 'Vercel build (no Chrome in build image)';
  if (process.env.SKIP_PRERENDER === '1') return 'SKIP_PRERENDER=1';
  return null;
}

async function main() {
  const skipReason = shouldSkipPrerender();
  if (skipReason) {
    console.log(`Skipping prerender: ${skipReason}. Site deploys as SPA; meta tags still work client-side.`);
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
    console.warn('Build will continue. Run prerender locally or in CI with Chrome for static HTML.');
    return;
  }

  console.log(`Prerendering ${routes.length} routes...`);

  for (const route of routes) {
    const page = await browser.newPage();
    try {
      await page.goto(`http://127.0.0.1:${PORT}${route}`, {
        waitUntil: 'networkidle2',
        timeout: 60000,
      });
      await page.waitForFunction(
        () => document.querySelector('title')?.textContent?.includes('DeviceKart'),
        { timeout: 30000 }
      ).catch(() => {});
      await new Promise((r) => setTimeout(r, 300));
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

  await browser.close();
  server.close();
  console.log('Prerender complete.');
}

main().catch((err) => {
  console.warn(`Prerender failed (non-fatal): ${err.message}`);
});
