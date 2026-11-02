import { Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button, EmptyState, Screen, SectionHeader, Surface, Text, paymentMethodLabel } from '@/components';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useVehicles } from '@/hooks/useVehicles';
import { useTheme } from '@/theme';
import { formatPlate } from '@/utils/format';

const STEPS = ['plate.step1', 'plate.step2', 'plate.step3'] as const;

export default function PlatePay() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const { vehicles, loaded, save } = useVehicles();
  const { defaultMethod } = usePaymentMethods();
  const enabled = vehicles.filter((v) => v.plateAutopay);

  return (
    <Screen
      footer={
        <Button
          title={t('plate.simulate')}
          icon="car-sport"
          size="lg"
          disabled={enabled.length === 0}
          onPress={() => router.push({ pathname: '/plate/arrive', params: { vehicleId: enabled[0]?.id } })}
        />
      }
    >
      <Surface style={{ gap: spacing.md }}>
        <Text variant="h3">{t('plate.howTitle')}</Text>
        {STEPS.map((k, i) => (
          <View key={k} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.onPrimary, fontWeight: '800' }}>{i + 1}</Text>
            </View>
            <Text style={{ flex: 1 }}>{t(k)}</Text>
          </View>
        ))}
      </Surface>

      <SectionHeader title={t('plate.vehicles')} action={t('plate.add')} onAction={() => router.push('/plate/vehicle')} />
      {loaded && vehicles.length === 0 ? (
        <Surface>
          <EmptyState icon="car-outline" title={t('plate.noVehicles')} body={t('plate.noVehiclesBody')} />
          <Button title={t('plate.addVehicle')} icon="add" onPress={() => router.push('/plate/vehicle')} />
        </Surface>
      ) : null}
      {vehicles.map((v) => (
        <Surface key={v.id} onPress={() => router.push({ pathname: '/plate/vehicle', params: { id: v.id } })} style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            {/* LT numerio ženklo stilius */}
            <View style={{ flexDirection: 'row', borderRadius: radius.sm, borderWidth: 2, borderColor: '#111', backgroundColor: '#fff', overflow: 'hidden' }}>
              <View style={{ backgroundColor: '#003399', paddingHorizontal: 4, justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>LT</Text>
              </View>
              <Text style={{ color: '#111', fontSize: 20, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 2, letterSpacing: 1 }}>{formatPlate(v.plate)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{v.nickname}</Text>
              <Text variant="small" tone="muted">
                {t(`fuel.long.${v.fuel}`)}
              </Text>
            </View>
            <Switch
              value={v.plateAutopay}
              onValueChange={(on) => save({ ...v, plateAutopay: on })}
              trackColor={{ true: colors.primary, false: colors.border }}
              accessibilityLabel={t('plate.autopay')}
            />
          </View>
          <Text variant="small" tone={v.plateAutopay ? 'primary' : 'muted'}>
            {v.plateAutopay
              ? t('plate.autopayOn', { method: defaultMethod ? paymentMethodLabel(defaultMethod) : '' })
              : t('plate.autopayOff')}
          </Text>
        </Surface>
      ))}
      <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
        <Ionicons name="shield-checkmark" size={18} color={colors.textMuted} />
        <Text variant="small" tone="muted" style={{ flex: 1 }}>
          {t('plate.privacy')}
        </Text>
      </View>
    </Screen>
  );
}
