import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { touchTarget } from '@/config/theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent' | 'wallet';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Button({ title, onPress, variant = 'primary', size = 'md', icon, loading, disabled, style, testID }: Props) {
  const { colors, radius, shadows, isDark } = useTheme();
  const palette = {
    primary: { bg: colors.primary, pressed: colors.primaryPressed, fg: colors.onPrimary, border: 'transparent' },
    secondary: { bg: colors.surface, pressed: colors.surfaceAlt, fg: colors.text, border: isDark ? colors.border : 'transparent' },
    ghost: { bg: 'transparent', pressed: colors.primarySoft, fg: colors.primary, border: 'transparent' },
    danger: { bg: colors.dangerSoft, pressed: colors.dangerSoft, fg: colors.danger, border: 'transparent' },
    accent: { bg: colors.accent, pressed: colors.accent, fg: colors.onAccent, border: 'transparent' },
    // Apple / Google Wallet mygtukai pagal jų gaires visada juodi.
    wallet: { bg: '#000000', pressed: '#222222', fg: '#FFFFFF', border: '#3A3A3A' },
  }[variant];
  const height = size === 'lg' ? 60 : touchTarget;
  const isDisabled = disabled || loading;
  const elevation = variant === 'primary' || variant === 'accent' ? shadows.md : variant === 'secondary' ? shadows.sm : null;

  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          borderRadius: size === 'lg' ? radius.lg : radius.md,
          backgroundColor: pressed ? palette.pressed : palette.bg,
          borderColor: palette.border,
          opacity: isDisabled ? 0.5 : 1,
        },
        !isDisabled && elevation,
        style,
      ]}
    >
      {({ pressed }) => (
        <>
          {variant === 'primary' && !pressed ? (
            <LinearGradient
              colors={colors.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: size === 'lg' ? radius.lg : radius.md }]}
            />
          ) : null}
          {loading ? (
            <ActivityIndicator color={palette.fg} />
          ) : (
            <View style={styles.row}>
              {icon ? <Ionicons name={icon} size={size === 'lg' ? 22 : 20} color={palette.fg} /> : null}
              <Text variant={size === 'lg' ? 'h3' : 'bodyStrong'} style={{ color: palette.fg }} numberOfLines={1}>
                {title}
              </Text>
            </View>
          )}
        </>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
});
