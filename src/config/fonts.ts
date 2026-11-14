import type { TextStyle } from 'react-native';

/**
 * Prekės ženklo šriftai:
 *  – antraštėms ir kainoms – „Montserrat“ (ryškus, pasviręs),
 *  – tekstui – „Inter“.
 * Norėdami pakeisti šriftą – pakeiskite failus čia; pavadinimai kairėje turi likti tie patys.
 */
export const fontAssets = {
  'Display-Bold': require('@expo-google-fonts/montserrat/700Bold/Montserrat_700Bold.ttf'),
  'Display-BoldItalic': require('@expo-google-fonts/montserrat/700Bold_Italic/Montserrat_700Bold_Italic.ttf'),
  'Display-ExtraBold': require('@expo-google-fonts/montserrat/800ExtraBold/Montserrat_800ExtraBold.ttf'),
  'Display-ExtraBoldItalic': require('@expo-google-fonts/montserrat/800ExtraBold_Italic/Montserrat_800ExtraBold_Italic.ttf'),
  'Body-Regular': require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
  'Body-Medium': require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
  'Body-SemiBold': require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
  'Body-Bold': require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
  'Body-ExtraBold': require('@expo-google-fonts/inter/800ExtraBold/Inter_800ExtraBold.ttf'),
};

export type FontKind = 'display' | 'body';

const toNumber = (w: TextStyle['fontWeight']): number => (w === 'bold' ? 700 : w === 'normal' || w == null ? 400 : Number(w));

/**
 * Parenka šrifto failą pagal storį ir pasvirimą.
 * Kiekvienas storis – atskiras failas, todėl `fontWeight` pačiam tekstui nebetaikomas.
 */
export function fontFamilyFor(kind: FontKind, weight: TextStyle['fontWeight'], italic: boolean): string {
  const w = toNumber(weight);
  if (kind === 'display') {
    const face = w >= 800 ? 'ExtraBold' : 'Bold';
    return `Display-${face}${italic ? 'Italic' : ''}`;
  }
  const face = w >= 800 ? 'ExtraBold' : w >= 700 ? 'Bold' : w >= 600 ? 'SemiBold' : w >= 500 ? 'Medium' : 'Regular';
  return `Body-${face}`;
}

/** Stilius tekstui už `Text` komponento ribų (navigacijos antraštės, įvedimo laukai). */
export const fonts = {
  displayBold: 'Display-Bold',
  displayItalic: 'Display-ExtraBoldItalic',
  body: 'Body-Regular',
  bodySemiBold: 'Body-SemiBold',
  bodyBold: 'Body-Bold',
} as const;
