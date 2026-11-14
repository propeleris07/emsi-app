import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { BrandHeader } from './BrandHeader';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  /** Pridėti viršutinį saugų atstumą (ekranams be antraštės). */
  safeTop?: boolean;
  padded?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
  /** Žalia prekės ženklo antraštė ekrano viršuje (skirtukų ekranams be navigacijos juostos). */
  hero?: { title: string; eyebrow?: string; subtitle?: string };
}

export function Screen({ children, scroll = true, safeTop, padded = true, refreshing, onRefresh, contentStyle, footer, hero }: Props) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const padding: ViewStyle = {
    paddingHorizontal: padded ? spacing.lg : 0,
    paddingTop: hero ? 0 : (safeTop ? insets.top : 0) + (padded ? spacing.lg : 0),
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  };
  const header = hero ? (
    <View style={{ marginHorizontal: padded ? -spacing.lg : 0, marginBottom: -spacing.sm }}>
      <BrandHeader {...hero} height={hero.subtitle || hero.eyebrow ? 148 : 124} />
    </View>
  ) : null;
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {scroll ? (
        <ScrollView
          contentInsetAdjustmentBehavior={hero ? 'never' : 'automatic'}
          contentContainerStyle={[padding, contentStyle]}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            ) : undefined
          }
        >
          {header}
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, padding, contentStyle]}>
          {header}
          {children}
        </View>
      )}
      {footer ? (
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: Math.max(insets.bottom, spacing.lg),
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}
