#!/usr/bin/env node
/**
 * Compresses the OG social image only.
 * PWA / favicon assets are hand-authored (minimal set in public/):
 *   favicon-32x32.png, apple-touch-icon.png, icon-192x192.webp, icon-512x512.webp
 */
import { mkdirSync, renameSync, unlinkSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public');
const ogSource = join(publicDir, 'og', 'og-default.png');
const ogOut = join(publicDir, 'og', 'og-default.png');

mkdirSync(join(publicDir, 'og'), { recursive: true });

await sharp(ogSource)
  .resize(1200, 630, { fit: 'cover' })
  .png({ compressionLevel: 9, quality: 80 })
  .toFile(ogOut + '.tmp');

try {
  unlinkSync(ogOut);
} catch {
  /* ignore */
}
renameSync(ogOut + '.tmp', ogOut);
console.log(`Wrote ${ogOut} (${Math.round(statSync(ogOut).size / 1024)}KB)`);
