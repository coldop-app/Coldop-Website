#!/usr/bin/env node
/**
 * Builds the Open Graph social image from public/og/og.png.
 * PWA / favicon assets are hand-authored (minimal set in public/):
 *   favicon-32x32.png, apple-touch-icon.png, icon-192x192.webp, icon-512x512.webp
 *
 * Output: public/og/og-default.png (1200×630) — referenced by index.html + SEO helpers.
 */
import { mkdirSync, renameSync, unlinkSync, statSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public');
const ogSource = join(publicDir, 'og', 'og.png');
const ogOut = join(publicDir, 'og', 'og-default.png');

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
/** Brand green from THEME_COLOR / site.ts */
const BG = { r: 26, g: 122, b: 76, alpha: 1 };

if (!existsSync(ogSource)) {
  console.error(`Missing OG source: ${ogSource}`);
  process.exit(1);
}

mkdirSync(join(publicDir, 'og'), { recursive: true });

const logoSize = 420;
const logo = await sharp(ogSource)
  .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

const left = Math.round((OG_WIDTH - logoSize) / 2);
const top = Math.round((OG_HEIGHT - logoSize) / 2);

await sharp({
  create: {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    channels: 4,
    background: BG,
  },
})
  .composite([{ input: logo, left, top }])
  .png({ compressionLevel: 9 })
  .toFile(ogOut + '.tmp');

try {
  unlinkSync(ogOut);
} catch {
  /* ignore */
}
renameSync(ogOut + '.tmp', ogOut);
console.log(
  `Wrote ${ogOut} (${Math.round(statSync(ogOut).size / 1024)}KB, ${OG_WIDTH}x${OG_HEIGHT})`,
);
