import { View } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { cardArt } from '@/config/images';
import type { LoyaltyCard } from '@/models';
import { useTheme } from '@/theme';
import { groupCardNumber } from '@/utils/format';

/**
 * Skaitmeninės kortelės vaizdas (banko kortelės proporcijos).
 * Kiekvienas planas turi savo dizainą – failai `assets/cards/`, susiejimas `cardArt`.
 */
export function LoyaltyCardVisual({ card }: { card: LoyaltyCard }) {
  const { t } = useTranslation();
  const { radius, shadows } = useTheme();
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${t(`cardType.${card.type}`)}, ${groupCardNumber(card.number)}`}
      style={[{ borderRadius: radius.xl, aspectRatio: 1.586 }, shadows.md]}
    >
      <Image source={cardArt[card.type]} style={{ flex: 1, borderRadius: radius.xl }} contentFit="cover" transition={200} />
    </View>
  );
}
