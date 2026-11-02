import { useMemo, useState } from 'react';
import { FlatList, ScrollView, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button, Chip, StationCard, StationsMap, Surface, Text, OpenStatus } from '@/components';
import { useCardRules } from '@/hooks/useCardRules';
import { useLang } from '@/hooks/useLang';
import { useStations } from '@/hooks/useStations';
import type { FuelType, StationServiceKind } from '@/models';
import { useTheme } from '@/theme';
import { openDirections } from '@/utils/directions';
import { formatDistance, formatPricePerL } from '@/utils/format';
import { cardPrice } from '@/utils/pricing';

const FILTERS: { key: StationServiceKind; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { key: 'open24h', icon: 'time' },
  { key: 'carwash', icon: 'water' },
  { key: 'lpg', icon: 'flame' },
  { key: 'adblue', icon: 'beaker' },
  { key: 'food', icon: 'fast-food' },
  { key: 'ev', icon: 'flash' },
];

const FUELS: FuelType[] = ['95', 'D', 'LPG', '98'];

export default function StationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const { colors, spacing, radius } = useTheme();
  const rules = useCardRules();
  const { stations, prices, coords, locationSource } = useStations();
  const [mode, setMode] = useState<'map' | 'list'>('map');
  const [filters, setFilters] = useState<StationServiceKind[]>([]);
  const [fuel, setFuel] = useState<FuelType>('95');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stations.filter(
      (s) =>
        filters.every((f) => s.services.includes(f)) &&
        (!q || s.city.toLowerCase().includes(q) || s.address.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)),
    );
  }, [stations, filters, query]);

  const selected = filtered.find((s) => s.id === selectedId);
  const toggle = (k: StationServiceKind) => setFilters((f) => (f.includes(k) ? f.filter((x) => x !== k) : [...f, k]));

  const priceLabel = (id: string) => {
    const p = prices[id]?.find((x) => x.fuel === fuel);
    return p ? formatPricePerL(cardPrice(p.pricePerL, fuel, rules), lang) : '—';
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Valdikliai */}
      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.sm }}>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              backgroundColor: colors.surface,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: spacing.md,
              height: 48,
            }}
          >
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('stations.search')}
              placeholderTextColor={colors.textMuted}
              style={{ flex: 1, fontSize: 16, color: colors.text }}
              clearButtonMode="while-editing"
            />
          </View>
          <Chip
            label={mode === 'map' ? t('stations.list') : t('stations.map')}
            icon={mode === 'map' ? 'list' : 'map'}
            onPress={() => setMode((m) => (m === 'map' ? 'list' : 'map'))}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          {FILTERS.map((f) => (
            <Chip key={f.key} icon={f.icon} label={t(`services.${f.key}`)} selected={filters.includes(f.key)} onPress={() => toggle(f.key)} />
          ))}
        </ScrollView>
        <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
          <Text variant="small" tone="muted">
            {t('stations.priceFor')}
          </Text>
          {FUELS.map((f) => (
            <Chip key={f} label={t(`fuel.short.${f}`)} selected={fuel === f} onPress={() => setFuel(f)} />
          ))}
        </View>
      </View>

      {mode === 'map' ? (
        <View style={{ flex: 1 }}>
          <StationsMap
            stations={filtered}
            prices={prices}
            rules={rules}
            fuel={fuel}
            coords={coords}
            showUser={locationSource === 'device'}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          {selected ? (
            <View style={{ position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.xl }}>
              <Surface style={{ gap: spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="h3" numberOfLines={1}>
                      {selected.name}
                    </Text>
                    <Text variant="small" tone="muted">
                      {selected.address} · {formatDistance(selected.distanceKm, lang)}
                    </Text>
                    <OpenStatus station={selected} />
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 26, fontWeight: '800' }}>{priceLabel(selected.id)}</Text>
                    <Text variant="caption" tone="primary">
                      {t(`fuel.short.${fuel}`)} · {t('prices.withCard')}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <Button title={t('stations.navigate')} icon="navigate" style={{ flex: 1 }} onPress={() => openDirections(selected, t)} />
                  <Button title={t('stations.details')} variant="secondary" style={{ flex: 1 }} onPress={() => router.push(`/stations/${selected.id}`)} />
                </View>
              </Surface>
            </View>
          ) : null}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
          ListEmptyComponent={<Text tone="muted" center>{t('stations.none')}</Text>}
          renderItem={({ item }) => (
            <StationCard
              station={item}
              onPress={() => router.push(`/stations/${item.id}`)}
              right={
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 20, fontWeight: '800' }}>{priceLabel(item.id)}</Text>
                  <Text variant="caption" tone="muted">
                    {t(`fuel.short.${fuel}`)}
                  </Text>
                </View>
              }
            />
          )}
        />
      )}
    </View>
  );
}
