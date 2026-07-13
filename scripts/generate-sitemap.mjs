#!/usr/bin/env node
/**
 * Generates public/sitemap.xml from PUBLIC_PATHS.
 * Run as part of `pnpm build` so the sitemap stays aligned with the router.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

/** Keep in sync with src/lib/seo/public-paths.ts */
const PUBLIC_PATHS = ['/'];
const SITE_URL = (process.env.VITE_SITE_URL || 'https://coldop.in').replace(/\/$/, '');

const urls = PUBLIC_PATHS.map((path) => {
  const loc = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
  return `  <url>
    <loc>${loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>${path === '/' ? '1.0' : '0.8'}</priority>
  </url>`;
}).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const out = join(root, 'public', 'sitemap.xml');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, xml, 'utf8');
console.log(`Wrote ${out}`);
