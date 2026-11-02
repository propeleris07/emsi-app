import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Chip, LineChart, PriceRow, Screen, Surface, Text } from '@/components';
import { useCardRules } from '@/hooks/useCardRules';
import { useLang } from '@/hooks/useLang';
import { useStations } from '@/hooks/useStations';
import type { FuelType, PricePoint } from '@/models';
import { services } from '@/services';
import { useTheme } from '@/theme';
import { formatDate, formatDistance, formatPricePerL } from '@/utils/format';
import { cardPrice, FUEL_COLORS, FUEL_ORDER } from '@/utils/pricing';

export default function PricesScreen() {
  const { t } = useTranslation();
  const lang = useLang();
  const { spacing } = useTheme();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ stationId?: string }>();
  const router = useRouter();
  const rules = useCardRules();
  const { stations, prices, nearest } = useStations();
  const [stationId, setStationId] = useState<string | undefined>(params.stationId);
  const [selectedFuel, setFuel] = useState<FuelType>('95');
  const [history, setHistory] = useState<PricePoint[]>([]);

  const activeId = stationId ?? nearest?.id;
  const station = stations.find((s) => s.id === activeId);
  const stationPrices = useMemo(
    () => (activeId ? (prices[activeId] ?? []) : []).slice().sort((a, b) => FUEL_ORDER.indexOf(a.fuel) - FUEL_ORDER.indexOf(b.fuel)),
    [prices, activeId],
  );
  const fuel = station && !station.fuels.includes(selectedFuel) ? station.fuels[0] : selectedFuel;

  // Rodome artimiausias 6 degalines ir pasirinktąją (jei ji toliau).
  const choices = useMemo(() => {
    const near = stations.slice(0, 6);
    return station && !near.includes(station) ? [station, ...near] : near;
  }, [stations, station]);


  useEffect(() => {
    if (!activeId) return;
    services.prices.getPriceHistory(activeId, fuel, 30).then(setHistory);
  }, [activeId, fuel]);

  const chartData = history.map((p) => ({ label: formatDate(p.date, lang), value: cardPrice(p.price, fuel, rules) }));
  const change = chartData.length > 1 ? chartData[chartData.length - 1].value - chartData[0].value : 0;

  return (
    <Screen>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }} style={{ marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg }}>
        {choices.map((s) => (
          <Chip key={s.id} label={`${s.city} · ${formatDistance(s.distanceKm, lang)}`} selected={s.id === activeId} onPress={() => setStationId(s.id)} />
        ))}
      </ScrollView>

      {station ? (
        <Surface>
          <Text variant="h3">{station.name}</Text>
          <Text variant="small" tone="muted" style={{ marginBottom: spacing.sm }}>
            {t('prices.cardNote')}
          </Text>
          {stationPrices.map((p) => (
            <PriceRow key={p.fuel} price={p} rules={rules} />
          ))}
          <Button
            title={t('alerts.cta')}
            icon="notifications"
            variant="secondary"
            style={{ marginTop: spacing.sm }}
            onPress={() => router.push({ pathname: '/prices/alerts', params: { stationId: station.id } })}
          />
        </Surface>
      ) : null}

      <Surface style={{ gap: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="h3">{t('prices.chart30')}</Text>
          {chartData.length > 1 ? (
            <Text variant="bodyStrong" tone={change <= 0 ? 'primary' : 'danger'}>
              {change <= 0 ? '▼' : '▲'} {formatPricePerL(Math.abs(change), lang)}
            </Text>
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {(station?.fuels ?? FUEL_ORDER).map((f) => (
            <Chip key={f} label={t(`fuel.short.${f}`)} selected={fuel === f} onPress={() => setFuel(f)} />
          ))}
        </View>
        <LineChart
          data={chartData}
          width={width - spacing.lg * 4}
          color={fuel === 'D' ? undefined : FUEL_COLORS[fuel]}
          formatValue={(v) => `${formatPricePerL(v, lang)} €/l`}
        />
        <Text variant="caption" tone="muted">
          {t('prices.chartHint')}
        </Text>
      </Surface>
    </Screen>
  );
}
