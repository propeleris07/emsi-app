import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import type { LoyaltyCard } from '@/models';
import { useTheme } from '@/theme';
import { groupCardNumber } from '@/utils/format';
import { BrandStripes } from './BrandHeader';
import { Logo } from './Logo';
import { Text } from './Text';

/** Skaitmeninės kortelės vaizdas (banko kortelės proporcijos). */
export function LoyaltyCardVisual({ card }: { card: LoyaltyCard }) {
  const { t } = useTranslation();
  const { colors, radius, spacing, shadows } = useTheme();
  return (
    <View style={[{ borderRadius: radius.xl }, shadows.md]}>
      <LinearGradient
        colors={colors.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: radius.xl, aspectRatio: 1.586, padding: spacing.xl, justifyContent: 'space-between', overflow: 'hidden' }}
      >
        {/* Geltonos įstrižos juostos – tas pats motyvas kaip ekranų antraštėse */}
        <BrandStripes width={130} height={130} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4 }}>
            <Logo height={26} />
          </View>
          <View style={{ backgroundColor: 'rgba(0,0,0,0.28)', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 4 }}>
            <Text variant="caption" style={{ color: '#fff', fontWeight: '700' }}>
              {t(`cardType.${card.type}`)}
            </Text>
          </View>
        </View>
        <View>
          <Text variant="caption" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {t('card.discountCard')}
          </Text>
          <Text style={{ color: '#fff', fontSize: 20, lineHeight: 26, fontWeight: '700', letterSpacing: 2, fontVariant: ['tabular-nums'] }}>
            {groupCardNumber(card.number)}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}
