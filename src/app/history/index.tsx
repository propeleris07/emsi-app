import { useMemo, useState } from 'react';
import { ScrollView, SectionList, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Chip, Divider, EmptyState, Text, TransactionRow } from '@/components';
import { useLang } from '@/hooks/useLang';
import { useTransactions } from '@/hooks/useTransactions';
import type { TransactionCategory } from '@/models';
import { useTheme } from '@/theme';
import { CATEGORY_ICONS } from '@/utils/categories';
import { formatMoney } from '@/utils/format';
import { monthKey, monthTitle } from '@/utils/months';

const FILTERS: (TransactionCategory | 'all')[] = ['all', 'fuel', 'carwash', 'food', 'coffee'];

export default function HistoryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const { colors, spacing } = useTheme();
  const { items, loading, reload } = useTransactions();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');

  const sections = useMemo(() => {
    const groups = new Map<string, typeof items>();
    for (const tx of items) {
      if (filter !== 'all' && tx.category !== filter && !(filter === 'food' && tx.category === 'coffee')) continue;
      const k = monthKey(tx.createdAt);
      groups.set(k, [...(groups.get(k) ?? []), tx]);
    }
    return [...groups.entries()].map(([k, data]) => ({
      key: k,
      title: monthTitle(k, lang),
      total: data.reduce((a, x) => a + x.total, 0),
      data,
    }));
  }, [items, filter, lang]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: t('history.title') }} />
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm }}>
        <Button title={t('history.stats')} icon="pie-chart" variant="secondary" onPress={() => router.push('/history/stats')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          {FILTERS.map((f) => (
            <Chip
              key={f}
              label={t(`history.filter.${f}`)}
              icon={f === 'all' ? 'apps' : CATEGORY_ICONS[f]}
              selected={filter === f}
              onPress={() => setFilter(f)}
            />
          ))}
        </ScrollView>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(tx) => tx.id}
        refreshing={loading}
        onRefresh={reload}
        stickySectionHeadersEnabled
        ItemSeparatorComponent={() => <Divider inset={72} />}
        ListEmptyComponent={loading ? undefined : <EmptyState icon="receipt-outline" title={t('history.empty')} />}
        renderSectionHeader={({ section }) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.sm,
              backgroundColor: colors.background,
            }}
          >
            <Text variant="bodyStrong">{section.title}</Text>
            <Text variant="bodyStrong" tone="muted">
              {formatMoney(section.total, lang)}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: colors.surface }}>
            <TransactionRow tx={item} onPress={() => router.push({ pathname: '/receipt/[id]', params: { id: item.id } })} />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
      />
    </View>
  );
}
