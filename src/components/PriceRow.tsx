import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { DiscountRules, FuelPrice } from '@/models';
import { useLang } from '@/hooks/useLang';
import { useTheme } from '@/theme';
import { formatPricePerL } from '@/utils/format';
import { cardPrice } from '@/utils/pricing';
import { FuelBadge } from './FuelBadge';
import { Text } from './Text';

interface Props {
  price: FuelPrice;
  rules: DiscountRules;
  compact?: boolean;
}

/** Degalų eilutė: kaina su kortele (didelė) ir be jos (perbraukta). */
export function PriceRow({ price, rules, compact }: Props) {
  const { t } = useTranslation();
  const lang = useLang();
  const { spacing } = useTheme();
  const withCard = cardPrice(price.pricePerL, price.fuel, rules);
  const hasDiscount = withCard < price.pricePerL;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: compact ? 6 : 10 }}>
      <FuelBadge fuel={price.fuel} size={compact ? 38 : 44} />
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">{t(`fuel.long.${price.fuel}`)}</Text>
        {hasDiscount ? (
          <Text variant="caption" tone="muted">
            {t('prices.withoutCard')}{' '}
            <Text variant="caption" tone="muted" style={{ textDecorationLine: 'line-through' }}>
              {formatPricePerL(price.pricePerL, lang)}
            </Text>
          </Text>
        ) : null}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: compact ? 22 : 28, fontWeight: '800', fontVariant: ['tabular-nums'] }}>
          {formatPricePerL(withCard, lang)}
        </Text>
        <Text variant="caption" tone={hasDiscount ? 'primary' : 'muted'}>
          {hasDiscount ? t('prices.withCard') : '€/l'}
        </Text>
      </View>
    </View>
  );
}
