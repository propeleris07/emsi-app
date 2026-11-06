import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { PressableScale } from './PressableScale';

interface Props extends ViewProps {
  onPress?: () => void;
  padded?: boolean;
  /** Šešėlio stiprumas; `none` – plokščia kortelė. */
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

/** Balta (tamsioje temoje – tamsi) kortelė su apvaliais kampais ir švelniu šešėliu. */
export function Surface({ onPress, padded = true, elevation = 'sm', style, children, ...rest }: Props) {
  const { colors, radius, spacing, shadows, isDark } = useTheme();
  const base: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: padded ? spacing.lg : 0,
    // Šviesioje temoje gylį suteikia šešėlis, tamsioje – plonas kontūras.
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
    ...(elevation === 'none' ? null : shadows[elevation]),
  };
  if (onPress) {
    return (
      <PressableScale accessibilityRole="button" onPress={onPress} style={[base, style]} {...rest}>
        {children}
      </PressableScale>
    );
  }
  return (
    <View style={[base, style]} {...rest}>
      {children}
    </View>
  );
}
