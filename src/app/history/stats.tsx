import { useMemo, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BarChart, Screen, Surface, Text } from '@/components';
import { useLang } from '@/hooks/useLang';
import { useSavings } from '@/hooks/useSavings';
import { useTransactions } from '@/hooks/useTransactions';
import type { TransactionCategory } from '@/models';
import { useTheme } from '@/theme';
import { CATEGORY_COLORS, CATEGORY_ORDER } from '@/utils/categories';
import { formatLitres, formatMoney, formatPricePerL } from '@/utils/format';
import { lastMonthKeys, monthKey, monthShort, monthTitle } from '@/utils/months';

type Totals = Record<TransactionCategory, number>;
const empty = (): Totals => ({ fuel: 0, carwash: 0, food: 0, coffee: 0, subscription: 0 });

export default function StatsScreen() {
  const { t } = useTranslation();
  const lang = useLang();
  const { spacing, radius, colors } = useTheme();
  const { width } = useWindowDimensions();
  const { items } = useTransactions();
  const savings = useSavings();
  const months = useMemo(() => lastMonthKeys(6), []);
  const [selected, setSelected] = useState(months[months.length - 1]);

  const byMonth = useMemo(() => {
    const map = new Map<string, { totals: Totals; litres: number; fuelSpend: number; saved: number }>();
    for (const k of months) map.set(k, { totals: empty(), litres: 0, fuelSpend: 0, saved: 0 });
    for (const tx of items) {
      const m = map.get(monthKey(tx.createdAt));
      if (!m) continue;
      m.totals[tx.category] += tx.total;
      m.saved += tx.discount;
      if (tx.category === 'fuel') {
        m.fuelSpend += tx.total;
        m.litres += tx.items.reduce((a, i) => a + (i.unit === 'l' ? i.qty : 0), 0);
      }
    }
    return map;
  }, [items, months]);

  const current = byMonth.get(selected)!;
  const monthTotal = CATEGORY_ORDER.reduce((a, c) => a + current.totals[c], 0);
  const chartWidth = width - spacing.lg * 4;

  return (
    <Screen>
      <Surface style={{ gap: spacing.md }}>
        <Text variant="h3">{t('stats.last6')}</Text>
        <BarChart
          width={chartWidth}
          highlightIndex={months.indexOf(selected)}
          onSelect={(i) => setSelected(months[i])}
          bars={months.map((k) => ({
            label: monthShort(k, lang),
            segments: CATEGORY_ORDER.map((c) => ({ value: byMonth.get(k)!.totals[c], color: CATEGORY_COLORS[c] })),
          }))}
        />
        <Text variant="caption" tone="muted">
          {t('stats.tapMonth')}
        </Text>
      </Surface>

      <Surface style={{ gap: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text variant="h3">{monthTitle(selected, lang)}</Text>
          <Text variant="h2">{formatMoney(monthTotal, lang)}</Text>
        </View>
        {CATEGORY_ORDER.filter((c) => current.totals[c] > 0).map((c) => {
          const share = monthTotal ? current.totals[c] / monthTotal : 0;
          return (
            <View key={c} style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: CATEGORY_COLORS[c] }} />
                  <Text>{t(`category.${c}`)}</Text>
                </View>
                <Text variant="bodyStrong">
                  {formatMoney(current.totals[c], lang)} <Text variant="small" tone="muted">({Math.round(share * 100)} %)</Text>
                </Text>
              </View>
              <View style={{ height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}>
                <View style={{ width: `${share * 100}%`, height: '100%', backgroundColor: CATEGORY_COLORS[c] }} />
              </View>
            </View>
          );
        })}
        {monthTotal === 0 ? <Text tone="muted">{t('stats.noData')}</Text> : null}
      </Surface>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Surface style={{ flex: 1, gap: 4 }}>
          <Text variant="caption" tone="muted">
            {t('stats.litres')}
          </Text>
          <Text variant="h3">{formatLitres(current.litres, lang)}</Text>
          {current.litres > 0 ? (
            <Text variant="caption" tone="muted">
              {t('stats.avgPrice', { price: formatPricePerL(current.fuelSpend / current.litres, lang) })}
            </Text>
          ) : null}
        </Surface>
        <Surface style={{ flex: 1, gap: 4 }}>
          <Text variant="caption" tone="muted">
            {t('stats.savedMonth')}
          </Text>
          <Text variant="h3" tone="primary">
            {formatMoney(current.saved, lang)}
          </Text>
          {savings ? (
            <Text variant="caption" tone="muted">
              {t('stats.savedYear', { amount: formatMoney(savings.thisYear, lang) })}
            </Text>
          ) : null}
        </Surface>
      </View>
    </Screen>
  );
}
