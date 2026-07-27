import { Font } from '@react-pdf/renderer';

const INTER_REGULAR = {
  url: new URL('./fonts/Inter-Regular.ttf', import.meta.url).href,
  fileName: 'Inter-Regular.ttf',
} as const;
const INTER_BOLD = {
  url: new URL('./fonts/Inter-Bold.ttf', import.meta.url).href,
  fileName: 'Inter-Bold.ttf',
} as const;
const OUTFIT_BOLD = {
  url: new URL('./fonts/Outfit-Bold.ttf', import.meta.url).href,
  fileName: 'Outfit-Bold.ttf',
} as const;

let fontsRegistered: Promise<void> | null = null;

function bytesToDataUrl(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return `data:font/ttf;base64,${btoa(binary)}`;
}

async function loadFontDataUrl(url: string, fileName: string): Promise<string> {
  // Vitest (Node) rewrites asset URLs so fetch can't load them; read from disk.
  // In the browser (including Vite dev), those same /src/... URLs fetch fine —
  // never take the Node path there.
  const isNode =
    typeof process !== 'undefined' && Boolean(process.versions?.node);
  const shouldReadFromDisk =
    isNode &&
    !import.meta.env.PROD &&
    (url.startsWith('file:') || url.includes('/src/lib/pdf/fonts/'));

  if (shouldReadFromDisk) {
    const { readFile } = await import('node:fs/promises');
    const { dirname, join } = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const buffer = await readFile(
      join(dirname(fileURLToPath(import.meta.url)), 'fonts', fileName),
    );
    return `data:font/ttf;base64,${buffer.toString('base64')}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load PDF font (${response.status}): ${url}`);
  }

  return bytesToDataUrl(new Uint8Array(await response.arrayBuffer()));
}

/**
 * Registers Coldop PDF fonts from bundled assets.
 * Fonts are emitted as separate files (not inlined into JS), then converted to
 * data URLs before registration so @react-pdf does not remote-fetch during render.
 * Safe to call multiple times; only loads and registers once.
 */
export async function registerColdopPdfFonts() {
  if (!fontsRegistered) {
    fontsRegistered = (async () => {
      const [InterRegular, InterBold, OutfitBold] = await Promise.all([
        loadFontDataUrl(INTER_REGULAR.url, INTER_REGULAR.fileName),
        loadFontDataUrl(INTER_BOLD.url, INTER_BOLD.fileName),
        loadFontDataUrl(OUTFIT_BOLD.url, OUTFIT_BOLD.fileName),
      ]);

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
    })();
  }

  await fontsRegistered;
}
