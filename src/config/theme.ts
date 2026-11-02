/**
 * VISOS programėlės spalvos, tarpai ir šriftų dydžiai.
 * Norėdami pakeisti prekės ženklo spalvas – keiskite tik `brand` reikšmes.
 */

export const brand = {
  green: '#00A651', // „M“ raidė logotipe
  greenDark: '#008541',
  red: '#ED1C24', // „S“ raidė logotipe
  yellow: '#FFD500', // vėliavos juosta
  blue: '#0096D6', // „I“ raidė logotipe
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
  onAccent: string;
  tabInactive: string;
  overlay: string;
  cardGradient: [string, string];
  mapPin: string;
}

const light: ColorPalette = {
  primary: brand.green,
  primaryPressed: brand.greenDark,
  primarySoft: '#E3F5EB',
  onPrimary: '#FFFFFF',
  background: '#F1F5F2',
  surface: '#FFFFFF',
  surfaceAlt: '#E6EEE9',
  text: '#0E1A13',
  textMuted: '#5A6B61',
  border: '#D9E3DD',
  danger: brand.red,
  dangerSoft: '#FDE7E8',
  warning: '#E89B00',
  info: brand.blue,
  success: brand.green,
  accent: brand.yellow,
  onAccent: '#1A1A1A',
  tabInactive: '#8A9A90',
  overlay: 'rgba(0,0,0,0.45)',
  cardGradient: ['#00A651', '#00783B'],
  mapPin: brand.green,
};

const dark: ColorPalette = {
  primary: '#1DBF6A',
  primaryPressed: '#14A458',
  primarySoft: '#123324',
  onPrimary: '#04140B',
  background: '#0A110D',
  surface: '#131D18',
  surfaceAlt: '#1B2822',
  text: '#EEF4F0',
  textMuted: '#98ABA0',
  border: '#25352D',
  danger: '#FF4A50',
  dangerSoft: '#3A1517',
  warning: '#FFB020',
  info: '#2FB2EE',
  success: '#1DBF6A',
  accent: brand.yellow,
  onAccent: '#1A1A1A',
  tabInactive: '#6F8378',
  overlay: 'rgba(0,0,0,0.6)',
  cardGradient: ['#0B8F49', '#04522A'],
  mapPin: '#1DBF6A',
};

export const palettes = { light, dark };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 18, xl: 26, pill: 999 } as const;

export const typography = {
  hero: { fontSize: 40, fontWeight: '800' as const, letterSpacing: -1 },
  h1: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodyStrong: { fontSize: 16, fontWeight: '600' as const },
  small: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
  price: { fontSize: 30, fontWeight: '800' as const, fontVariant: ['tabular-nums' as const] },
};

/** Minimalus paspaudžiamo elemento aukštis (vienos rankos naudojimui). */
export const touchTarget = 52;

export interface Theme {
  colors: ColorPalette;
  isDark: boolean;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
}
