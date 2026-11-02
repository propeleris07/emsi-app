import { Text as RNText, type TextProps } from 'react-native';
import { useTheme } from '@/theme';
import type { typography } from '@/config/theme';

type Variant = keyof typeof typography;
type Tone = 'default' | 'muted' | 'primary' | 'danger' | 'inverse' | 'onPrimary';

interface Props extends TextProps {
  variant?: Variant;
  tone?: Tone;
  center?: boolean;
}

export function Text({ variant = 'body', tone = 'default', center, style, ...rest }: Props) {
  const { colors, typography: ty } = useTheme();
  const color = {
    default: colors.text,
    muted: colors.textMuted,
    primary: colors.primary,
    danger: colors.danger,
    inverse: colors.background,
    onPrimary: colors.onPrimary,
  }[tone];
  return (
    <RNText
      style={[ty[variant], { color }, center && { textAlign: 'center' }, style]}
      {...rest}
    />
  );
}
