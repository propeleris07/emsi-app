import { StyleSheet, Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '@/theme';
import { fontFamilyFor, type FontKind } from '@/config/fonts';
import type { typography } from '@/config/theme';

type Variant = keyof typeof typography;
type Tone = 'default' | 'muted' | 'primary' | 'danger' | 'inverse' | 'onPrimary';

interface Props extends TextProps {
  variant?: Variant;
  tone?: Tone;
  center?: boolean;
  /** Šrifto šeima; numatytoji – pagal variantą (antraštės – „display“). */
  font?: FontKind;
}

export function Text({ variant = 'body', tone = 'default', center, font, style, ...rest }: Props) {
  const { colors, typography: ty } = useTheme();
  const color = {
    default: colors.text,
    muted: colors.textMuted,
    primary: colors.primary,
    danger: colors.danger,
    inverse: colors.background,
    onPrimary: colors.onPrimary,
  }[tone];
  const { family, italic: variantItalic, ...base } = ty[variant] as TextStyle & { family: FontKind; italic?: boolean };
  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  const kind = font ?? family;
  const italic = flat.fontStyle ? flat.fontStyle === 'italic' : !!variantItalic;
  // Kiekvienas storis ir pasvirimas – atskiras šrifto failas.
  const face = flat.fontFamily
    ? null
    : {
        fontFamily: fontFamilyFor(kind, flat.fontWeight ?? base.fontWeight, italic),
        fontWeight: 'normal' as const,
        // „Inter“ pasvirusio failo neturime – jam paliekame sistemos pasvirimą.
        fontStyle: kind === 'body' && italic ? ('italic' as const) : ('normal' as const),
      };
  return <RNText style={[base, { color }, center && { textAlign: 'center' }, style, face]} {...rest} />;
}
