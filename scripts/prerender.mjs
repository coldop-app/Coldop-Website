#!/usr/bin/env node
/**
 * Post-build prerender for the public landing page (`/`).
 * Starts `vite preview`, captures HTML after React render, writes dist/index.html.
 *
 * Skip with COLDOP_SKIP_PRERENDER=1 when Chromium is unavailable.
 */
import { spawn } from 'node:child_process';
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const distIndex = join(root, 'dist', 'index.html');
const PORT = Number(process.env.COLDOP_PRERENDER_PORT || 4173);
const PREVIEW_URL = `http://127.0.0.1:${PORT}/`;

if (process.env.COLDOP_SKIP_PRERENDER === '1') {
  console.log('Skipping prerender (COLDOP_SKIP_PRERENDER=1)');
  process.exit(0);
}

if (!existsSync(distIndex)) {
  console.error('dist/index.html missing — run vite build first');
  process.exit(1);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, attempts = 40) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 200) return;
    } catch {
      // retry
    }
    await wait(250);
  }
  throw new Error(`Preview server did not start at ${url}`);
}

const preview = spawn(
  'pnpm',
  ['exec', 'vite', 'preview', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'],
  {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  },
);

let previewLog = '';
preview.stdout?.on('data', (d) => {
  previewLog += d.toString();
});
preview.stderr?.on('data', (d) => {
  previewLog += d.toString();
});

let exitCode = 0;

try {
  await waitForServer(PREVIEW_URL);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(PREVIEW_URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('h1', { timeout: 30000 });
  // Allow GSAP / lazy sections a beat without waiting forever
  await wait(500);

  const html = await page.content();
  await browser.close();

  // Ensure the document still references hashed assets from the original build shell
  const builtShell = readFileSync(distIndex, 'utf8');
  const scriptMatch = builtShell.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
  const cssLinks = [...builtShell.matchAll(/<link rel="stylesheet"[^>]*>/g)].map((m) => m[0]);

  let out = html;
  // Playwright may rewrite absolute URLs; keep relative asset paths from the build when possible
  if (scriptMatch && !out.includes(scriptMatch[1])) {
    console.warn('Prerender HTML missing build script path; keeping captured HTML as-is');
  }
  for (const link of cssLinks) {
    if (!out.includes(link) && link.includes('/assets/')) {
      out = out.replace('</head>', `  ${link}\n</head>`);
    }
  }

  writeFileSync(distIndex, out, 'utf8');
  console.log(`Prerendered ${distIndex} (${Math.round(out.length / 1024)}KB)`);
} catch (error) {
  exitCode = 1;
  console.error('Prerender failed:', error instanceof Error ? error.message : error);
  if (previewLog) console.error(previewLog.slice(-2000));
  console.error('Tip: run `pnpm exec playwright install chromium` or set COLDOP_SKIP_PRERENDER=1');
} finally {
  preview.kill('SIGTERM');
}

process.exit(exitCode);
