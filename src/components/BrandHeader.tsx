import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand } from '@/config/theme';
import { useTheme } from '@/theme';
import { Text } from './Text';

interface Props {
  title?: string;
  /** Mažas užrašas virš antraštės (pvz., „1 žingsnis iš 3“). */
  eyebrow?: string;
  subtitle?: string;
  /** Aukštis be saugios zonos viršuje. */
  height?: number;
  /** `hero` – didelė dviejų eilučių antraštė (pradžios ekranas). */
  size?: 'hero' | 'title';
  /** Turinys virš antraštės (logotipas, mygtukai). */
  top?: ReactNode;
}

/** Geltonos įstrižos „lenktynių“ juostos – prekės ženklo motyvas. */
export function BrandStripes({ width = 230, height = 230 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 230 230" style={{ position: 'absolute', right: 0, top: 0 }} pointerEvents="none">
      <Path d="M92 230 L230 28 L230 86 L132 230 Z" fill={brand.yellow} />
      <Path d="M158 230 L230 124 L230 160 L182 230 Z" fill={brand.yellow} />
      <Path d="M36 230 L194 0 L212 0 L54 230 Z" fill={brand.yellow} opacity={0.9} />
    </Svg>
  );
}

/** Žalia ekrano viršaus antraštė su geltonomis juostomis ir išlenktu apatiniu kraštu. */
export function BrandHeader({ title, eyebrow, subtitle, height = 132, size = 'title', top }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, spacing } = useTheme();
  const total = insets.top + height;
  return (
    <View style={{ height: total, backgroundColor: brand.green, overflow: 'hidden' }}>
      <BrandStripes width={size === 'hero' ? 230 : 170} height={total} />
      {/* Išlenktas apatinis kraštas */}
      <Svg width="100%" height={28} viewBox="0 0 400 28" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
        <Path d="M0 0 C110 30 290 30 400 0 L400 28 L0 28 Z" fill={colors.background} />
      </Svg>
      <View style={{ paddingTop: insets.top + (top ? spacing.md : spacing.xl), paddingHorizontal: spacing.lg, gap: spacing.md }}>
        {top}
        <View style={{ gap: 2, maxWidth: size === 'hero' ? '72%' : '78%' }}>
          {eyebrow ? (
            <Text variant="caption" style={{ color: brand.yellow, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              {eyebrow}
            </Text>
          ) : null}
          {title ? (
            <Text variant={size === 'hero' ? 'hero' : 'h1'} style={{ color: '#fff' }} accessibilityRole="header">
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text variant="small" style={{ color: 'rgba(255,255,255,0.85)' }} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
