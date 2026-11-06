import type { ViewStyle } from 'react-native';

/**
 * VISOS programėlės spalvos, tarpai, šešėliai ir šriftų dydžiai.
 * Norėdami pakeisti prekės ženklo spalvas – keiskite tik `brand` reikšmes.
 */

export const brand = {
  green: '#08783D', // pagrindinė žalia
  greenDark: '#05592D',
  greenLight: '#0E9A50',
  red: '#ED1C24', // „S“ raidė logotipe
  yellow: '#FFD21F', // akcentai: akcijos ir svarbūs elementai
  blue: '#0096D6', // „I“ raidė logotipe
  white: '#FFFFFF',
  lightGrey: '#F5F6F5',
  ink: '#202824', // tekstas
} as const;

export interface ColorPalette {
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  onPrimary: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  info: string;
  success: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  tabInactive: string;
  overlay: string;
  cardGradient: [string, string];
  /** Pagrindinių veiksmų ir akcentinių kortelių gradientas. */
  primaryGradient: [string, string];
  /** Švelnus fonas ekranų viršuje (antraštės zona). */
  heroGradient: [string, string];
  /** Šešėlio spalva (be permatomumo – jis nurodomas `shadows`). */
  shadow: string;
  mapPin: string;
}

const light: ColorPalette = {
  primary: brand.green,
  primaryPressed: brand.greenDark,
  primarySoft: '#E6F2EB',
  onPrimary: brand.white,
  background: brand.lightGrey,
  surface: brand.white,
  surfaceAlt: '#EDF0EE',
  text: brand.ink,
  textMuted: '#5E6A64',
  border: '#E2E7E4',
  danger: brand.red,
  dangerSoft: '#FDE8E9',
  warning: '#D98E00',
  info: brand.blue,
  success: brand.green,
  accent: brand.yellow,
  accentSoft: '#FFF6CC',
  onAccent: brand.ink,
  tabInactive: '#8D9792',
  overlay: 'rgba(16,24,20,0.5)',
  cardGradient: ['#0B8C48', '#04502A'],
  primaryGradient: ['#0E9A50', '#06672F'],
  heroGradient: ['#DCEFE3', brand.lightGrey],
  shadow: '16,40,28',
  mapPin: brand.green,
};

const dark: ColorPalette = {
  primary: '#22A060',
  primaryPressed: '#1B8A52',
  primarySoft: '#143024',
  onPrimary: '#FFFFFF',
  background: '#0D1310',
  surface: '#161E1A',
  surfaceAlt: '#1E2823',
  text: '#EEF2EF',
  textMuted: '#9AA8A0',
  border: '#25302A',
  danger: '#FF4A50',
  dangerSoft: '#3A1517',
  warning: '#FFB020',
  info: '#2FB2EE',
  success: '#2DB46B',
  accent: brand.yellow,
  accentSoft: '#3A3313',
  onAccent: brand.ink,
  tabInactive: '#6F8178',
  overlay: 'rgba(0,0,0,0.6)',
  cardGradient: ['#0B8C48', '#043D20'],
  primaryGradient: ['#17A85C', '#08703A'],
  heroGradient: ['#112A1D', '#0D1310'],
  shadow: '0,0,0',
  mapPin: '#2DB46B',
};

export const palettes = { light, dark };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 10, md: 16, lg: 20, xl: 24, pill: 999 } as const;

export const typography = {
  hero: { fontSize: 40, lineHeight: 46, fontWeight: '800' as const, letterSpacing: -1 },
  h1: { fontSize: 30, lineHeight: 36, fontWeight: '800' as const, letterSpacing: -0.6 },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const, letterSpacing: -0.2 },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' as const },
  bodyStrong: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const },
  price: { fontSize: 30, fontWeight: '800' as const, fontVariant: ['tabular-nums' as const] },
};

/** Minimalus paspaudžiamo elemento aukštis (vienos rankos naudojimui). */
export const touchTarget = 52;

export interface Shadows {
  /** Kortelės, sąrašai. */
  sm: ViewStyle;
  /** Iškilę elementai: pagrindiniai mygtukai, plaukiojančios kortelės. */
  md: ViewStyle;
  /** Žemėlapio kortelės, apatinė juosta. */
  lg: ViewStyle;
}

/** Natūralūs, švelnūs šešėliai (`boxShadow` veikia iOS, Android ir naršyklėje). */
export function makeShadows(rgb: string, isDark: boolean): Shadows {
  const k = isDark ? 2.2 : 1;
  const a = (v: number) => Math.min(v * k, 0.6).toFixed(3);
  return {
    sm: { boxShadow: `0 1px 2px rgba(${rgb},${a(0.04)}), 0 4px 14px rgba(${rgb},${a(0.06)})` },
    md: { boxShadow: `0 2px 4px rgba(${rgb},${a(0.06)}), 0 10px 24px rgba(${rgb},${a(0.12)})` },
    lg: { boxShadow: `0 4px 10px rgba(${rgb},${a(0.08)}), 0 18px 40px rgba(${rgb},${a(0.16)})` },
  };
}

export interface Theme {
  colors: ColorPalette;
  isDark: boolean;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: Shadows;
}
