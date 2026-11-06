import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';
import { Text } from './Text';

interface Props {
  /** `require('...')` arba `photos.*` iš `@/config/images`. */
  source: number;
  title?: string;
  subtitle?: string;
  height?: number;
  /** Papildomas turinys apačioje (pvz., ženkliukas). */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Nuotraukos juosta su tamsėjančiu gradientu ir tekstu ant jos. */
export function PhotoBanner({ source, title, subtitle, height = 150, children, style }: Props) {
  const { radius, spacing, shadows } = useTheme();
  return (
    <View style={[{ height, borderRadius: radius.xl, overflow: 'hidden' }, shadows.sm, style]}>
      <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
      <LinearGradient colors={['rgba(8,24,16,0)', 'rgba(8,24,16,0.72)']} start={{ x: 0, y: 0.25 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={{ flex: 1, justifyContent: 'flex-end', padding: spacing.lg, gap: 2 }}>
        {children}
        {title ? (
          <Text variant="h2" style={{ color: '#fff' }}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text variant="small" style={{ color: 'rgba(255,255,255,0.88)' }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
