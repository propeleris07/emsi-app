import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button, Chip, OpenStatus, PressableScale, StationCard, StationsMap, Surface, Text } from '@/components';
import { useCardRules } from '@/hooks/useCardRules';
import { useLang } from '@/hooks/useLang';
import { useStations } from '@/hooks/useStations';
import type { FuelType, StationRegion, StationServiceKind } from '@/models';
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

const REGIONS: StationRegion[] = ['vilnius', 'kaunas', 'klaipeda', 'siauliai', 'panevezys', 'alytus', 'marijampole'];

/** Normalizuoja paiešką: „siauliai“ randa „Šiauliai“. */
const fold = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function StationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const { colors, spacing, radius, shadows, isDark } = useTheme();
  const rules = useCardRules();
  const { stations, prices, coords, locationSource } = useStations();
  const [mode, setMode] = useState<'map' | 'list'>('map');
  const [filters, setFilters] = useState<StationServiceKind[]>([]);
  const [region, setRegion] = useState<StationRegion | 'all'>('all');
  const [fuel, setFuel] = useState<FuelType>('95');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [showAllNonce, setShowAllNonce] = useState(0);
  const [locateKey, setLocateKey] = useState(0);

  const filtered = useMemo(() => {
    const q = fold(query.trim());
    return stations.filter(
      (s) =>
        (region === 'all' || s.region === region) &&
        filters.every((f) => s.services.includes(f)) &&
        (!q || fold(`${s.city} ${s.address} ${s.name}`).includes(q)),
    );
  }, [stations, filters, query, region]);

  const regionCounts = useMemo(() => {
    const c: Partial<Record<StationRegion, number>> = {};
    for (const s of stations) c[s.region] = (c[s.region] ?? 0) + 1;
    return c;
  }, [stations]);

  const selected = filtered.find((s) => s.id === selectedId);
  const toggle = (k: StationServiceKind) => setFilters((f) => (f.includes(k) ? f.filter((x) => x !== k) : [...f, k]));
  const fitKey = `${region}|${filters.join(',')}|${query.trim()}|${showAllNonce}|${stations.length}`;

  const priceLabel = (id: string) => {
    const p = prices[id]?.find((x) => x.fuel === fuel);
    return p ? formatPricePerL(cardPrice(p.pricePerL, fuel, rules), lang) : '—';
  };

  const mapButton = (icon: React.ComponentProps<typeof Ionicons>['name'], label: string, onPress: () => void) => (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      scaleTo={0.92}
      style={[{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }, shadows.md]}
    >
      <Ionicons name={icon} size={22} color={colors.primary} />
    </PressableScale>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Valdikliai */}
      <View style={{ gap: spacing.sm, paddingBottom: spacing.sm }}>
        <View style={{ flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg }}>
          <View
            style={[
              {
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                backgroundColor: colors.surface,
                borderRadius: radius.md,
                borderWidth: isDark ? 1 : 0,
                borderColor: colors.border,
                paddingHorizontal: spacing.md,
                height: 48,
              },
              shadows.sm,
            ]}
          >
            <Ionicons name="search-outline" size={18} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('stations.search')}
              placeholderTextColor={colors.textMuted}
              style={{ flex: 1, fontSize: 16, color: colors.text, height: '100%' }}
              clearButtonMode="while-editing"
              returnKeyType="search"
            />
            {query ? (
              <Pressable accessibilityRole="button" accessibilityLabel={t('common.clear')} onPress={() => setQuery('')} hitSlop={10}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
          {/* Žemėlapis / sąrašas */}
          <View style={[{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: 4, gap: 2 }, shadows.sm]}>
            {(['map', 'list'] as const).map((m) => (
              <Pressable
                key={m}
                accessibilityRole="button"
                accessibilityLabel={t(`stations.${m}`)}
                accessibilityState={{ selected: mode === m }}
                onPress={() => setMode(m)}
                style={{ width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: mode === m ? colors.primary : 'transparent' }}
              >
                <Ionicons name={m === 'map' ? 'map-outline' : 'list-outline'} size={20} color={mode === m ? colors.onPrimary : colors.textMuted} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Regionai */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: 4 }}>
          <Chip label={t('stations.allLithuania', { count: stations.length })} icon="globe" selected={region === 'all'} onPress={() => setRegion('all')} />
          {REGIONS.filter((r) => regionCounts[r]).map((r) => (
            <Chip key={r} label={`${t(`regions.${r}`)} · ${regionCounts[r]}`} selected={region === r} onPress={() => setRegion(region === r ? 'all' : r)} />
          ))}
        </ScrollView>

        {/* Paslaugos */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: 4 }}>
          {FILTERS.map((f) => (
            <Chip key={f.key} icon={f.icon} label={t(`services.${f.key}`)} selected={filters.includes(f.key)} onPress={() => toggle(f.key)} />
          ))}
        </ScrollView>

        {/* Degalai ir rezultatų skaičius */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg }}>
          <Text variant="small" tone="muted">
            {t('stations.priceFor')}
          </Text>
          <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, padding: 3 }}>
            {FUELS.map((f) => (
              <Pressable
                key={f}
                accessibilityRole="button"
                accessibilityState={{ selected: fuel === f }}
                onPress={() => setFuel(f)}
                style={[
                  { paddingHorizontal: 12, height: 32, borderRadius: radius.pill, justifyContent: 'center', backgroundColor: fuel === f ? colors.surface : 'transparent' },
                  fuel === f && shadows.sm,
                ]}
              >
                <Text variant="small" style={{ fontWeight: '700', color: fuel === f ? colors.primary : colors.textMuted }}>
                  {t(`fuel.short.${f}`)}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text variant="caption" tone="muted" style={{ marginLeft: 'auto' }} numberOfLines={1}>
            {t('stations.found', { count: filtered.length })}
          </Text>
        </View>
      </View>

      {mode === 'map' ? (
        <View style={{ flex: 1, overflow: 'hidden', borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl }}>
          <StationsMap
            stations={filtered}
            prices={prices}
            rules={rules}
            fuel={fuel}
            coords={coords}
            showUser={locationSource === 'device'}
            selectedId={selectedId}
            onSelect={setSelectedId}
            fitKey={fitKey}
            locateKey={locateKey}
          />

          {/* Žemėlapio mygtukai */}
          <View style={{ position: 'absolute', right: spacing.lg, bottom: selected ? 236 : spacing.xl, gap: spacing.sm }}>
            {locationSource === 'device' ? mapButton('locate', t('stations.myLocation'), () => setLocateKey((k) => k + 1)) : null}
            {mapButton('expand', t('stations.showAll'), () => {
              setSelectedId(undefined);
              setShowAllNonce((n) => n + 1);
            })}
          </View>

          {!filtered.length ? (
            <View style={{ position: 'absolute', left: spacing.lg, right: spacing.lg, top: spacing.lg }}>
              <Surface elevation="md">
                <Text tone="muted" center>
                  {t('stations.none')}
                </Text>
              </Surface>
            </View>
          ) : null}

          {/* Pasirinktos degalinės kortelė */}
          {selected ? (
            <View style={{ position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.xl }}>
              <Surface elevation="lg" style={{ gap: spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="h3" numberOfLines={1}>
                      {selected.name}
                    </Text>
                    <Text variant="small" tone="muted" numberOfLines={1}>
                      {selected.address}, {selected.city} · {formatDistance(selected.distanceKm, lang)}
                    </Text>
                    <OpenStatus station={selected} />
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 26, lineHeight: 30, fontWeight: '800', color: colors.text }}>{priceLabel(selected.id)}</Text>
                    <Text variant="caption" tone="primary">
                      {t(`fuel.short.${fuel}`)} · {t('prices.withCard')}
                    </Text>
                  </View>
                  <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={() => setSelectedId(undefined)} hitSlop={10}>
                    <Ionicons name="close" size={22} color={colors.textMuted} />
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {selected.services
                    .filter((k) => k !== 'shop')
                    .map((k) => (
                      <View key={k} style={{ backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
                        <Text variant="caption" tone="primary">
                          {t(`services.${k}`)}
                        </Text>
                      </View>
                    ))}
                </View>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <Button title={t('stations.navigate')} icon="navigate" style={{ flex: 1 }} onPress={() => openDirections(selected, t)} />
                  <Button title={t('stations.details')} variant="secondary" style={{ flex: 1, backgroundColor: colors.primarySoft }} onPress={() => router.push(`/stations/${selected.id}`)} />
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
                  <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{priceLabel(item.id)}</Text>
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
