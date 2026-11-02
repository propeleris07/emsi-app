import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Chip, FuelBadge, LimitBar, Screen, StationCard, Surface, Text } from '@/components';
import { useFleet } from '@/hooks/useFleet';
import { useStations } from '@/hooks/useStations';
import type { Pump } from '@/models';
import { services } from '@/services';
import { usePayFlow } from '@/store/payFlow';
import { useTheme } from '@/theme';
import { formatDistance, formatPlate } from '@/utils/format';
import { useLang } from '@/hooks/useLang';

/** 1 žingsnis: degalinė (automatiškai artimiausia) ir kolonėlės numeris. */
export default function PayTab() {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const { colors, spacing, radius } = useTheme();
  const { stations, nearest, locationSource } = useStations();
  const flow = usePayFlow();
  const [picking, setPicking] = useState(false);
  const [loadedPumps, setLoadedPumps] = useState<{ stationId: string; pumps: Pump[] } | null>(null);
  const fleet = useFleet();
  const [odo, setOdo] = useState('');
  const fleetVehicle = fleet.account?.vehicles.find((v) => v.plate === flow.vehiclePlate);
  const odoNum = Number(odo.replace(/\D/g, ''));
  const odoValid = !!fleetVehicle && odoNum > (fleetVehicle.lastOdometerKm ?? 0);
  const fleetReady = !fleet.active || (!!fleetVehicle && (!fleet.account?.requireOdometer || odoValid));

  const station = stations.find((s) => s.id === flow.stationId) ?? nearest;

  const stationId = station?.id;
  useEffect(() => {
    if (!stationId) return;
    services.stations.getPumps(stationId).then((pumps) => setLoadedPumps({ stationId, pumps }));
  }, [stationId]);
  const pumps = loadedPumps && loadedPumps.stationId === stationId ? loadedPumps.pumps : null;

  if (!station) {
    return (
      <Screen safeTop>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  const far = locationSource === 'device' && station.distanceKm > 0.5;

  const choosePump = (p: Pump) => {
    if (!fleetReady) return;
    flow.set({
      stationId: station.id,
      pumpNumber: p.number,
      fuel: fleet.active ? fleetVehicle?.fuel : undefined,
      vehiclePlate: fleet.active ? fleetVehicle?.plate : undefined,
      odometerKm: fleet.active && odoValid ? odoNum : undefined,
    });
    router.push('/pay/fuel');
  };

  return (
    <Screen safeTop>
      <View style={{ marginTop: spacing.md, gap: 4 }}>
        <Text variant="caption" tone="primary" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {t('pay.step', { n: 1, total: 3 })}
        </Text>
        <Text variant="h1">{t('pay.title')}</Text>
      </View>

      {fleet.account ? (
        <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 4 }}>
          {[false, true].map((on) => (
            <Pressable
              key={String(on)}
              accessibilityRole="tab"
              accessibilityState={{ selected: fleet.active === on }}
              onPress={() => fleet.setFleetMode(on)}
              style={{
                flex: 1,
                height: 44,
                borderRadius: radius.sm,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 6,
                backgroundColor: fleet.active === on ? colors.surface : 'transparent',
              }}
            >
              <Ionicons name={on ? 'business' : 'person'} size={16} color={fleet.active === on ? colors.primary : colors.textMuted} />
              <Text variant="bodyStrong" tone={fleet.active === on ? 'default' : 'muted'}>
                {on ? t('pay.company') : t('pay.personal')}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {fleet.active && fleet.account ? (
        <Surface style={{ gap: spacing.md, borderColor: colors.primary, borderWidth: 2 }}>
          <Text variant="bodyStrong">{fleet.account.companyName}</Text>
          <LimitBar label={t('fleet.today')} spent={fleet.account.spentToday} limit={fleet.account.limits.dailyEur} />
          <Text variant="small" tone="muted">
            {t('pay.chooseVehicle')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {fleet.account.vehicles.map((v) => (
              <Chip
                key={v.id}
                icon="car"
                label={formatPlate(v.plate)}
                selected={flow.vehiclePlate === v.plate}
                onPress={() => {
                  flow.set({ vehiclePlate: v.plate });
                  setOdo('');
                }}
              />
            ))}
          </View>
          {fleetVehicle && fleet.account.requireOdometer ? (
            <View style={{ gap: 4 }}>
              <TextInput
                value={odo}
                onChangeText={(v) => setOdo(v.replace(/\D/g, '').slice(0, 7))}
                keyboardType="number-pad"
                placeholder={t('pay.odometerPh')}
                placeholderTextColor={colors.textMuted}
                style={{
                  height: 52,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: odo && !odoValid ? colors.danger : odoValid ? colors.primary : colors.border,
                  backgroundColor: colors.surface,
                  paddingHorizontal: spacing.lg,
                  fontSize: 18,
                  color: colors.text,
                }}
              />
              <Text variant="caption" tone={odo && !odoValid ? 'danger' : 'muted'}>
                {t('fleet.lastOdometer', { km: (fleetVehicle.lastOdometerKm ?? 0).toLocaleString('lt-LT') })}
              </Text>
            </View>
          ) : null}
        </Surface>
      ) : null}

      <StationCard
        station={station}
        onPress={() => setPicking((v) => !v)}
        right={
          <Text variant="bodyStrong" tone="primary">
            {picking ? t('common.close') : t('pay.change')}
          </Text>
        }
      />
      {picking ? (
        <Surface padded={false} style={{ overflow: 'hidden' }}>
          {stations.slice(0, 6).map((s, i) => (
            <Pressable
              key={s.id}
              onPress={() => {
                flow.set({ stationId: s.id });
                setPicking(false);
              }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                padding: spacing.lg,
                gap: spacing.md,
                borderTopWidth: i ? 1 : 0,
                borderTopColor: colors.border,
                backgroundColor: pressed ? colors.surfaceAlt : 'transparent',
              })}
            >
              <Ionicons name={s.id === station.id ? 'radio-button-on' : 'radio-button-off'} size={22} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">{s.name}</Text>
                <Text variant="small" tone="muted">
                  {formatDistance(s.distanceKm, lang)} · {s.address}
                </Text>
              </View>
            </Pressable>
          ))}
        </Surface>
      ) : null}

      {far ? (
        <View style={{ flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md }}>
          <Ionicons name="information-circle" size={20} color={colors.info} />
          <Text variant="small" style={{ flex: 1 }}>
            {t('pay.farAway', { distance: formatDistance(station.distanceKm, lang) })}
          </Text>
        </View>
      ) : null}

      <View style={{ gap: 2 }}>
        <Text variant="h3">{t('pay.choosePump')}</Text>
        <Text variant="small" tone={fleetReady ? 'muted' : 'danger'}>
          {fleetReady ? t('pay.choosePumpHint') : t('pay.fleetFirst')}
        </Text>
      </View>

      {pumps ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
          {pumps.map((p) => {
            const disabled = p.status !== 'free' || !fleetReady;
            return (
              <Pressable
                key={p.id}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={t('pay.pumpN', { n: p.number })}
                onPress={() => choosePump(p)}
                style={({ pressed }) => ({
                  width: '47%',
                  flexGrow: 1,
                  minHeight: 112,
                  borderRadius: radius.lg,
                  borderWidth: 2,
                  borderColor: disabled ? colors.border : colors.primary,
                  backgroundColor: pressed ? colors.primarySoft : colors.surface,
                  padding: spacing.md,
                  gap: 6,
                  opacity: disabled ? 0.5 : 1,
                })}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 40, fontWeight: '800', color: disabled ? colors.textMuted : colors.text }}>{p.number}</Text>
                  <Text variant="caption" tone={disabled ? 'danger' : 'primary'}>
                    {t(`pay.pumpStatus.${p.status}`)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                  {p.fuels.map((f) => (
                    <FuelBadge key={f} fuel={f} size={26} />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <ActivityIndicator color={colors.primary} />
      )}
    </Screen>
  );
}
