import { DM_Sans, Inter, Lora, Merriweather, Montserrat, Outfit, Playfair_Display, Poppins } from 'next/font/google';
import type { FontKey } from '@/lib/fonts';

// Self-hosted copies of the curated fonts (see src/lib/fonts.ts). `preload: false` everywhere: the
// @font-face rules are tiny, and a file is only fetched when the page uses that font.
// `display: swap` shows text at once in a fallback font while the chosen one arrives.
const opts = { subsets: ['latin'] as ('latin')[], display: 'swap' as const, preload: false };

const inter = Inter({ ...opts, variable: '--font-inter' });
const outfit = Outfit({ ...opts, variable: '--font-outfit' });
const dmSans = DM_Sans({ ...opts, variable: '--font-dm-sans' });
const poppins = Poppins({ ...opts, weight: ['400', '500', '600', '700'], variable: '--font-poppins' });
const montserrat = Montserrat({ ...opts, variable: '--font-montserrat' });
const lora = Lora({ ...opts, variable: '--font-lora' });
const merriweather = Merriweather({ ...opts, weight: ['400', '700'], variable: '--font-merriweather' });
const playfair = Playfair_Display({ ...opts, variable: '--font-playfair' });

export const LOADED_FONTS: Record<FontKey, { variable: string }> = {
  inter,
  outfit,
  'dm-sans': dmSans,
  poppins,
  montserrat,
  lora,
  merriweather,
  playfair,
};

/** Class names that define every --font-* variable (put on <html>). */
export const allFontVariables = Object.values(LOADED_FONTS)
  .map((f) => f.variable)
  .join(' ');
