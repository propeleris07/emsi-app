import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { merchImages } from '@/config/merchImages';
import type { MerchProduct } from '@/models';
import { useTheme } from '@/theme';
import { Text } from './Text';

export const MERCH_ICONS: Record<MerchProduct['category'], keyof typeof Ionicons.glyphMap> = {
  apparel: 'shirt-outline',
  drinkware: 'cafe-outline',
  accessories: 'bag-handle-outline',
  car: 'car-sport-outline',
};

interface Props {
  product: MerchProduct;
  style?: StyleProp<ViewStyle>;
  /** Mažoje miniatiūroje užrašas nerodomas. */
  compact?: boolean;
}

/** Prekės nuotrauka arba, kol jos nėra, švelnus žalias rezervas su ikona. */
export function MerchImage({ product, style, compact }: Props) {
  const { t } = useTranslation();
  const { colors, radius, isDark } = useTheme();
  const source = merchImages[product.id];
  return (
    <View style={[{ borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surfaceAlt }, style]}>
      {source ? (
        <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      ) : (
        <LinearGradient
          colors={isDark ? ['#183626', '#11241A'] : ['#E9F4ED', '#D3EADC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', gap: 6 }]}
        >
          <View style={{ position: 'absolute', width: '70%', aspectRatio: 1, borderRadius: 999, backgroundColor: colors.primary, opacity: 0.06 }} />
          <Ionicons name={MERCH_ICONS[product.category]} size={compact ? 24 : 44} color={colors.primary} />
          {compact ? null : (
            <Text variant="caption" tone="muted">
              {t('merch.photoSoon')}
            </Text>
          )}
        </LinearGradient>
      )}
    </View>
  );
}
