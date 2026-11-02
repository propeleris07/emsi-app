import { Linking, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button, CompetitorBanner, EmptyState, OpenStatus, PriceRow, Screen, Surface, Text } from '@/components';
import { useCardRules } from '@/hooks/useCardRules';
import { useLang } from '@/hooks/useLang';
import { useStations } from '@/hooks/useStations';
import type { StationServiceKind } from '@/models';
import { usePayFlow } from '@/store/payFlow';
import { useTheme } from '@/theme';
import { openDirections } from '@/utils/directions';
import { formatDateTime, formatDistance } from '@/utils/format';
import { FUEL_ORDER } from '@/utils/pricing';

const SERVICE_ICONS: Record<StationServiceKind, React.ComponentProps<typeof Ionicons>['name']> = {
  open24h: 'time',
  carwash: 'water',
  lpg: 'flame',
  adblue: 'beaker',
  food: 'fast-food',
  coffee: 'cafe',
  ev: 'flash',
  shop: 'basket',
};

export default function StationDetail() {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const { colors, spacing, radius } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const rules = useCardRules();
  const { stations, prices } = useStations();
  const station = stations.find((s) => s.id === id);
  const setFlow = usePayFlow((s) => s.set);

  if (!station) return <EmptyState icon="location" title={t('stations.notFound')} />;

  const stationPrices = (prices[station.id] ?? []).slice().sort((a, b) => FUEL_ORDER.indexOf(a.fuel) - FUEL_ORDER.indexOf(b.fuel));

  return (
    <Screen
      footer={
        <View style={{ gap: spacing.sm }}>
        <Button
          title={t('stations.payHere')}
          icon="speedometer"
          size="lg"
          onPress={() => {
            setFlow({ stationId: station.id, pumpNumber: undefined, fuel: undefined });
            router.navigate('/pay');
          }}
        />
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Button title={t('stations.navigate')} icon="navigate" style={{ flex: 1 }} onPress={() => openDirections(station, t)} />
          <Button
            title={t('stations.call')}
            icon="call"
            variant="secondary"
            style={{ flex: 1 }}
            onPress={() => Linking.openURL(`tel:${station.phone.replace(/\s/g, '')}`)}
          />
        </View>
        </View>
      }
    >
      <Stack.Screen options={{ title: station.city }} />
      <View style={{ gap: 4 }}>
        <Text variant="h1">{station.name}</Text>
        <Text tone="muted">
          {station.address}, {station.city} · {formatDistance(station.distanceKm, lang)}
        </Text>
        <OpenStatus station={station} />
      </View>

      <Surface>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="h3">{t('prices.today')}</Text>
          <Text variant="caption" tone="muted">
            {stationPrices[0] ? formatDateTime(stationPrices[0].updatedAt, lang) : ''}
          </Text>
        </View>
        {stationPrices.map((p) => (
          <PriceRow key={p.fuel} price={p} rules={rules} />
        ))}
        <CompetitorBanner stationId={station.id} fuel="95" />
        <Button
          title={t('prices.chart30')}
          icon="analytics"
          variant="ghost"
          onPress={() => router.push({ pathname: '/prices', params: { stationId: station.id } })}
        />
      </Surface>

      <Surface style={{ gap: spacing.md }}>
        <Text variant="h3">{t('stations.services')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {station.services.map((s) => (
            <View
              key={s}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: colors.primarySoft,
                borderRadius: radius.pill,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Ionicons name={SERVICE_ICONS[s]} size={16} color={colors.primary} />
              <Text variant="small" tone="primary" style={{ fontWeight: '600' }}>
                {t(`services.${s}`)}
              </Text>
            </View>
          ))}
        </View>
      </Surface>

      <Surface style={{ gap: spacing.sm }}>
        <Text variant="h3">{t('stations.hours')}</Text>
        {station.open24h || !station.hours ? (
          <Text>{t('stations.open24hLong')}</Text>
        ) : (
          (
            [
              ['stations.weekdays', station.hours.weekdays],
              ['stations.saturday', station.hours.saturday],
              ['stations.sunday', station.hours.sunday],
            ] as const
          ).map(([k, v]) => (
            <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text tone="muted">{t(k)}</Text>
              <Text variant="bodyStrong">{v}</Text>
            </View>
          ))
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text tone="muted">{t('stations.phone')}</Text>
          <Text variant="bodyStrong">{station.phone}</Text>
        </View>
      </Surface>
    </Screen>
  );
}
