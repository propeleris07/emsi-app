import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { Offer } from '@/models';
import { brand } from '@/config/theme';
import { useLang } from '@/hooks/useLang';
import { useTheme } from '@/theme';
import { formatDate } from '@/utils/format';
import { Button } from './Button';
import { Surface } from './Surface';
import { Text } from './Text';

export const OFFER_ICONS: Record<Offer['category'], keyof typeof Ionicons.glyphMap> = {
  fuel: 'speedometer',
  carwash: 'water',
  food: 'fast-food',
  coffee: 'cafe',
  shop: 'basket',
};

const COLORS: Record<Offer['category'], string> = {
  fuel: brand.green,
  carwash: brand.blue,
  food: brand.red,
  coffee: '#8B5A2B',
  shop: '#E89B00',
};

export function isPromoToday(offer: Offer, now = new Date()): boolean {
  return !!offer.weekday && ((now.getDay() + 6) % 7) + 1 === offer.weekday;
}

interface Props {
  offer: Offer;
  activated?: boolean;
  onPress?: () => void;
  /** Jei nurodyta – rodomas mygtukas „Aktyvuoti“. */
  onActivate?: () => void;
  activating?: boolean;
  width?: number;
}

export function OfferCard({ offer, activated, onPress, onActivate, activating, width }: Props) {
  const { t } = useTranslation();
  const lang = useLang();
  const { colors, spacing, radius } = useTheme();
  const color = COLORS[offer.category];
  const today = isPromoToday(offer);

  const badge = (label: string, tone: 'primary' | 'muted') => (
    <View style={{ borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: tone === 'primary' ? colors.primarySoft : colors.surfaceAlt }}>
      <Text variant="caption" tone={tone}>
        {label}
      </Text>
    </View>
  );

  return (
    <Surface onPress={onPress} padded={false} style={{ width, overflow: 'hidden' }}>
      <View style={{ backgroundColor: color, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Ionicons name={OFFER_ICONS[offer.category]} size={22} color="#fff" />
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', flex: 1 }} numberOfLines={1}>
          {offer.discountLabel}
        </Text>
        {today ? (
          <View style={{ backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text variant="caption" style={{ color: colors.onAccent, fontWeight: '800' }}>
              {t('offers.today')}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={{ padding: spacing.lg, gap: 4 }}>
        <Text variant="bodyStrong" numberOfLines={2}>
          {offer.title}
        </Text>
        <Text variant="small" tone="muted" numberOfLines={onActivate ? undefined : 2}>
          {offer.body}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          {offer.weekday
            ? badge(t('offers.everyWeekday', { day: t(`weekday.${offer.weekday}`) }), today ? 'primary' : 'muted')
            : offer.requiresActivation
              ? badge(activated ? t('offers.activated') : t('offers.needsActivation'), activated ? 'primary' : 'muted')
              : badge(t('offers.automatic'), 'primary')}
          {onActivate ? badge(t('offers.validTo', { date: formatDate(offer.validTo, lang) }), 'muted') : null}
        </View>
        {onActivate && offer.requiresActivation ? (
          <Button
            title={activated ? t('offers.activatedLong') : t('offers.activate')}
            icon={activated ? 'checkmark-circle' : 'flash'}
            variant={activated ? 'secondary' : 'primary'}
            disabled={activated}
            loading={activating}
            onPress={onActivate}
            style={{ marginTop: spacing.sm }}
          />
        ) : null}
      </View>
    </Surface>
  );
}
