import { Font } from '@react-pdf/renderer';

// URL imports (not ?inline): fonts stay as separate hashed assets instead of
// base64 in the JS bundle. Same-origin fetch at PDF generation time.
import InterBold from '@/lib/pdf/fonts/Inter-Bold.ttf';
import InterRegular from '@/lib/pdf/fonts/Inter-Regular.ttf';
import OutfitBold from '@/lib/pdf/fonts/Outfit-Bold.ttf';

let fontsRegistered = false;

/**
 * Vitest resolves `.ttf` imports to `/src/...` paths. react-pdf's Node loader
 * opens those via fs, so map them to absolute filesystem paths in tests.
 */
function resolvePdfFontSrc(src: string): string {
  if (import.meta.env.MODE === 'test' && src.startsWith('/')) {
    // Avoid importing node:path in the browser bundle.
    return `${process.cwd()}${src}`;
  }
  return src;
}

/**
 * Registers Coldop PDF fonts from bundled same-origin assets.
 * Safe to call multiple times; only registers once.
 */
export function registerColdopPdfFonts() {
  if (fontsRegistered) return;

  Font.register({
    family: 'Inter',
    fonts: [
      {
        src: resolvePdfFontSrc(InterRegular),
        fontWeight: 400,
      },
      {
        src: resolvePdfFontSrc(InterBold),
        fontWeight: 700,
      },
    ],
  });

  Font.register({
    family: 'Outfit',
    fonts: [
      {
        src: resolvePdfFontSrc(OutfitBold),
        fontWeight: 700,
      },
    ],
  });

  fontsRegistered = true;
}
