import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Switch, View } from 'react-native';
import { Alert } from '@/utils/alert';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button, Chip, Screen, SectionHeader, Surface, Text } from '@/components';
import { useLang } from '@/hooks/useLang';
import { useStations } from '@/hooks/useStations';
import type { FuelType, PriceAlert } from '@/models';
import { services } from '@/services';
import { useSession } from '@/store';
import { useStationsStore } from '@/store/stations';
import { useTheme } from '@/theme';
import { formatPricePerL, round3 } from '@/utils/format';
import { newId } from '@/utils/random';
import { notifyUser } from '@/utils/notify';

const FUELS: FuelType[] = ['95', 'D', 'LPG', '98'];

function StepButton({ icon, label, onPress }: { icon: 'add' | 'remove'; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}
    >
      <Ionicons name={icon} size={26} color={colors.text} />
    </Pressable>
  );
}

export default function PriceAlerts() {
  const { t } = useTranslation();
  const lang = useLang();
  const { colors, spacing, radius } = useTheme();
  const params = useLocalSearchParams<{ stationId?: string }>();
  const userId = useSession((s) => s.user?.id);
  const { stations, prices, nearest } = useStations();
  const reloadPrices = useStationsStore((s) => s.load);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [stationId, setStationId] = useState(params.stationId);
  const [fuel, setFuel] = useState<FuelType>('D');
  const [override, setOverride] = useState<{ key: string; value: number } | null>(null);
  const [simulating, setSimulating] = useState<string | null>(null);

  const activeStationId = stationId ?? nearest?.id;
  const station = stations.find((s) => s.id === activeStationId);
  const current = activeStationId ? prices[activeStationId]?.find((p) => p.fuel === fuel)?.pricePerL : undefined;

  useFocusEffect(
    useCallback(() => {
      if (userId) services.priceAlerts.list(userId).then(setAlerts);
    }, [userId]),
  );

  // Numatytasis slenkstis – 3 ct žemiau dabartinės kainos (kol vartotojas jo nekeitė).
  const thresholdKey = `${activeStationId}:${fuel}`;
  const threshold =
    override?.key === thresholdKey ? override.value : current !== undefined ? round3(current - 0.03) : null;
  const setThreshold = (fn: (v: number | null) => number | null) => {
    const v = fn(threshold);
    if (v !== null) setOverride({ key: thresholdKey, value: v });
  };

  const create = async () => {
    if (!userId || !activeStationId || threshold === null) return;
    const allowed = await services.notifications.requestPermission();
    if (!allowed) Alert.alert(t('alerts.noPermissionTitle'), t('alerts.noPermissionBody'));
    setAlerts(await services.priceAlerts.save(userId, { id: newId('pa'), stationId: activeStationId, fuel, threshold, active: true }));
  };

  const simulate = async (a: PriceAlert) => {
    if (!userId) return;
    const now = prices[a.stationId]?.find((p) => p.fuel === a.fuel)?.pricePerL ?? a.threshold;
    setSimulating(a.id);
    const hits = await services.demo.simulatePriceDrop(userId, a.stationId, a.fuel, round3(Math.max(0.01, now - a.threshold + 0.01)));
    await reloadPrices(true);
    const name = stations.find((s) => s.id === a.stationId)?.name ?? '';
    for (const h of hits) {
      await notifyUser('priceAlerts',
        t('notif.priceTitle', { fuel: t(`fuel.long.${h.alert.fuel}`) }),
        t('notif.priceBody', { station: name, price: formatPricePerL(h.newPrice, lang) }),
        `/stations/${h.alert.stationId}`,
      );
    }
    setSimulating(null);
  };

  return (
    <Screen>
      <Text tone="muted">{t('alerts.intro')}</Text>

      {alerts.length ? (
        <>
          <SectionHeader title={t('alerts.mine')} />
          {alerts.map((a) => {
            const s = stations.find((x) => x.id === a.stationId);
            const now = prices[a.stationId]?.find((p) => p.fuel === a.fuel)?.pricePerL;
            return (
              <Surface key={a.id} style={{ gap: spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <Ionicons name="notifications" size={22} color={a.active ? colors.primary : colors.textMuted} />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyStrong">
                      {t('alerts.when', { fuel: t(`fuel.long.${a.fuel}`), price: formatPricePerL(a.threshold, lang) })}
                    </Text>
                    <Text variant="small" tone="muted">
                      {s?.name} · {t('alerts.now', { price: now !== undefined ? formatPricePerL(now, lang) : '—' })}
                    </Text>
                  </View>
                  <Switch
                    value={a.active}
                    onValueChange={async (on) => {
                      if (userId) setAlerts(await services.priceAlerts.save(userId, { ...a, active: on }));
                    }}
                    trackColor={{ true: colors.primary, false: colors.border }}
                  />
                </View>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <Button title={t('alerts.simulate')} icon="trending-down" variant="secondary" style={{ flex: 1 }} loading={simulating === a.id} disabled={!a.active} onPress={() => simulate(a)} />
                  <Button title="" icon="trash" variant="danger" style={{ width: 56, paddingHorizontal: 0 }} onPress={async () => {
                      if (userId) setAlerts(await services.priceAlerts.remove(userId, a.id));
                    }} />
                </View>
              </Surface>
            );
          })}
        </>
      ) : null}

      <SectionHeader title={t('alerts.new')} />
      <Surface style={{ gap: spacing.md }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          {stations.slice(0, 6).map((s) => (
            <Chip key={s.id} label={s.name.replace(/^EMSI /, '')} selected={s.id === activeStationId} onPress={() => setStationId(s.id)} />
          ))}
        </ScrollView>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {FUELS.filter((f) => station?.fuels.includes(f) ?? true).map((f) => (
            <Chip key={f} label={t(`fuel.long.${f}`)} selected={fuel === f} onPress={() => setFuel(f)} />
          ))}
        </View>
        {threshold !== null ? (
          <View style={{ alignItems: 'center', gap: spacing.sm }}>
            <Text tone="muted">{t('alerts.notifyBelow')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
              <StepButton icon="remove" label="−1 ct" onPress={() => setThreshold((v) => (v === null ? v : round3(v - 0.01)))} />
              <Text style={{ fontSize: 34, fontWeight: '800', color: colors.text, minWidth: 110, textAlign: 'center' }}>
                {formatPricePerL(threshold, lang)}
              </Text>
              <StepButton icon="add" label="+1 ct" onPress={() => setThreshold((v) => (v === null ? v : round3(v + 0.01)))} />
            </View>
            <Text variant="small" tone="muted">
              {t('alerts.currentPrice', { price: current !== undefined ? formatPricePerL(current, lang) : '—' })}
            </Text>
          </View>
        ) : null}
        <Button title={t('alerts.create')} icon="notifications" onPress={create} />
      </Surface>
      <View style={{ borderRadius: radius.md, backgroundColor: colors.surfaceAlt, padding: spacing.md }}>
        <Text variant="small" tone="muted">
          {t('alerts.demoNote')}
        </Text>
      </View>
    </Screen>
  );
}
