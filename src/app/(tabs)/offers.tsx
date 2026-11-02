import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Chip, EmptyState, OfferCard, OFFER_ICONS, Screen, SectionHeader, Text } from '@/components';
import { useOffers } from '@/hooks/useOffers';
import type { Offer } from '@/models';
import { useCardStore } from '@/store';
import { useTheme } from '@/theme';

type Filter = 'all' | Offer['category'];
const FILTERS: Filter[] = ['all', 'fuel', 'coffee', 'food', 'carwash', 'shop'];

export default function OffersTab() {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const cardType = useCardStore((s) => s.card?.type ?? 'general');
  const { offers, activated, loading, reload, activate } = useOffers();
  const [filter, setFilter] = useState<Filter>('all');
  const [activating, setActivating] = useState<string | null>(null);

  const visible = useMemo(() => offers.filter((o) => filter === 'all' || o.category === filter), [offers, filter]);
  const groups: { key: string; title: string; items: Offer[] }[] = [
    { key: 'segment', title: t('offers.forYou', { type: t(`cardType.${cardType}`) }), items: visible.filter((o) => o.kind === 'segment') },
    { key: 'promo', title: t('offers.promoDays'), items: visible.filter((o) => o.kind === 'promoDay') },
    { key: 'coupon', title: t('offers.coupons'), items: visible.filter((o) => o.kind === 'coupon') },
  ].filter((g) => g.items.length);

  const onActivate = async (id: string) => {
    setActivating(id);
    await activate(id);
    setActivating(null);
  };

  return (
    <Screen safeTop refreshing={loading} onRefresh={reload}>
      <View style={{ marginTop: spacing.md, gap: 4 }}>
        <Text variant="h1">{t('offers.title')}</Text>
        <Text tone="muted">{t('offers.subtitle', { count: activated.length })}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }} style={{ marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg }}>
        {FILTERS.map((f) => (
          <Chip key={f} label={t(`offers.filter.${f}`)} icon={f === 'all' ? 'apps' : OFFER_ICONS[f]} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
      </ScrollView>
      {groups.map((g) => (
        <View key={g.key} style={{ gap: spacing.md }}>
          <SectionHeader title={g.title} />
          {g.items.map((o) => (
            <OfferCard key={o.id} offer={o} activated={activated.includes(o.id)} activating={activating === o.id} onActivate={() => onActivate(o.id)} />
          ))}
        </View>
      ))}
      {!loading && groups.length === 0 ? <EmptyState icon="pricetags-outline" title={t('offers.none')} /> : null}
    </Screen>
  );
}
