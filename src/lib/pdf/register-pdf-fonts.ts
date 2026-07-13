import { Font } from '@react-pdf/renderer';

import InterBold from '@/lib/pdf/fonts/Inter-Bold.ttf?inline';
import InterRegular from '@/lib/pdf/fonts/Inter-Regular.ttf?inline';
import OutfitBold from '@/lib/pdf/fonts/Outfit-Bold.ttf?inline';

let fontsRegistered = false;

/**
 * Registers Coldop PDF fonts from bundled assets (inlined data URLs, no remote fetch).
 * Safe to call multiple times; only registers once.
 */
export function registerColdopPdfFonts() {
  if (fontsRegistered) return;

  Font.register({
    family: 'Inter',
    fonts: [
      {
        src: InterRegular,
        fontWeight: 400,
      },
      {
        src: InterBold,
        fontWeight: 700,
      },
    ],
  });

  Font.register({
    family: 'Outfit',
    fonts: [
      {
        src: OutfitBold,
        fontWeight: 700,
      },
    ],
  });

  fontsRegistered = true;
}
