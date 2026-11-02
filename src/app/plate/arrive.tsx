import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Alert } from '@/utils/alert';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button, Chip, Screen, StationCard, Surface, Text } from '@/components';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useStations } from '@/hooks/useStations';
import { useVehicles } from '@/hooks/useVehicles';
import { services } from '@/services';
import { useCardStore, useSession } from '@/store';
import { useTheme } from '@/theme';
import { formatPlate } from '@/utils/format';

type Phase = 'idle' | 'scanning' | 'recognized' | 'unlocking';
const PHASES: Phase[] = ['scanning', 'recognized', 'unlocking'];

/**
 * Demonstracija: automobilis privažiuoja prie kolonėlės, kamera atpažįsta numerį,
 * kolonėlė atrakinama ir pylimas apmokamas automatiškai.
 */
export default function PlateArrive() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const params = useLocalSearchParams<{ vehicleId?: string }>();
  const user = useSession((s) => s.user);
  const card = useCardStore((s) => s.card);
  const { vehicles } = useVehicles();
  const { nearest } = useStations();
  const { defaultMethod } = usePaymentMethods();
  const enabled = vehicles.filter((v) => v.plateAutopay);
  const [vehicleId, setVehicleId] = useState(params.vehicleId);
  const [phase, setPhase] = useState<Phase>('idle');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const vehicle = enabled.find((v) => v.id === vehicleId) ?? enabled[0];
  const pumpNumber = 2;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const start = () => {
    if (!vehicle || !nearest || !user || !card || !defaultMethod) return;
    const fuel = nearest.fuels.includes(vehicle.fuel) ? vehicle.fuel : nearest.fuels[0];
    setPhase('scanning');
    timers.current.push(setTimeout(() => setPhase('recognized'), 1800));
    timers.current.push(setTimeout(() => setPhase('unlocking'), 3200));
    timers.current.push(
      setTimeout(async () => {
        try {
          const session = await services.fueling.start({
            userId: user.id,
            card,
            stationId: nearest.id,
            fuel,
            pumpNumber,
            mode: 'full',
            value: 0,
            paymentMethodId: defaultMethod.id,
            byPlate: true,
            vehiclePlate: vehicle.plate,
          });
          router.replace({ pathname: '/pay/fueling', params: { sessionId: session.id } });
        } catch {
          Alert.alert(t('pay.errorTitle'), t('pay.errorBody'));
          setPhase('idle');
        }
      }, 4000),
    );
  };

  if (!nearest) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  return (
    <Screen footer={phase === 'idle' ? <Button title={t('plate.arriveNow')} icon="car-sport" size="lg" disabled={!vehicle} onPress={start} /> : undefined}>
      <Text tone="muted">{t('plate.arriveIntro')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {enabled.map((v) => (
          <Chip key={v.id} icon="car" label={`${formatPlate(v.plate)} · ${v.nickname}`} selected={vehicle?.id === v.id} onPress={() => setVehicleId(v.id)} />
        ))}
      </View>
      <StationCard station={nearest} />

      {phase !== 'idle' ? (
        <Surface style={{ gap: spacing.lg }}>
          {PHASES.map((p, i) => {
            const idx = PHASES.indexOf(phase);
            const done = i < idx;
            const current = i === idx;
            return (
              <View key={p} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, opacity: i > idx ? 0.35 : 1 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: radius.pill,
                    backgroundColor: done ? colors.primary : colors.primarySoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {current ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons name={done ? 'checkmark' : 'ellipse-outline'} size={20} color={done ? colors.onPrimary : colors.primary} />
                  )}
                </View>
                <Text variant="bodyStrong" style={{ flex: 1 }}>
                  {t(`plate.phase.${p}`, { plate: vehicle ? formatPlate(vehicle.plate) : '', n: pumpNumber })}
                </Text>
              </View>
            );
          })}
        </Surface>
      ) : null}
    </Screen>
  );
}
