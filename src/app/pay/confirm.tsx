import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Alert } from '@/utils/alert';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Button, Divider, FuelBadge, PaymentMethodRow, Screen, Surface, Text } from '@/components';
import { FULL_TANK_HOLD_EUR } from '@/config/payments';
import { useFleet } from '@/hooks/useFleet';
import { useLang } from '@/hooks/useLang';
import { useStations } from '@/hooks/useStations';
import type { FuelQuote, PaymentMethod } from '@/models';
import { services } from '@/services';
import { useCardStore, useSession } from '@/store';
import { usePayFlow } from '@/store/payFlow';
import { useTheme } from '@/theme';
import { formatLitres, formatMoney, formatPlate, formatPricePerL } from '@/utils/format';

function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: 'primary' }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 4 }}>
      <Text tone={tone ?? (strong ? 'default' : 'muted')} variant={strong ? 'bodyStrong' : 'body'} style={{ flex: 1 }}>
        {label}
      </Text>
      <Text variant={strong ? 'h3' : 'bodyStrong'} tone={tone}>
        {value}
      </Text>
    </View>
  );
}

/** 3 žingsnis: suvestinė, nuolaidos, mokėjimo priemonė ir patvirtinimas. */
export default function PayConfirm() {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const { colors, spacing } = useTheme();
  const flow = usePayFlow();
  const user = useSession((s) => s.user);
  const personalCard = useCardStore((s) => s.card);
  const fleet = useFleet();
  const card = fleet.active ? fleet.card : personalCard;
  const { stations } = useStations();
  const station = stations.find((s) => s.id === flow.stationId);
  const [quote, setQuote] = useState<FuelQuote | null>(null);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const setFlow = flow.set;
  const { stationId, fuel } = flow;
  useEffect(() => {
    if (!user || !card || !stationId || !fuel) return;
    services.fueling.quote({ userId: user.id, card, stationId, fuel }).then(setQuote);
    services.payments.listMethods(user.id).then((list) => {
      setMethods(list);
      // Numatytoji mokėjimo priemonė, jei vartotojas dar nepasirinko.
      if (!usePayFlow.getState().paymentMethodId) setFlow({ paymentMethodId: (list.find((m) => m.isDefault) ?? list[0])?.id });
    });
  }, [user, card, stationId, fuel, setFlow]);

  const fleetRemaining = fleet.account
    ? Math.min(fleet.account.limits.dailyEur - fleet.account.spentToday, fleet.account.limits.monthlyEur - fleet.account.spentMonth)
    : 0;

  if (!quote || !station || !flow.fuel) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  const amountLabel =
    flow.mode === 'amount'
      ? formatMoney(flow.value, lang)
      : flow.mode === 'litres'
        ? formatLitres(flow.value, lang)
        : t('pay.mode.full');

  const submit = async () => {
    if (!user || !card || (!fleet.active && !flow.paymentMethodId) || !flow.pumpNumber) return;
    setSubmitting(true);
    try {
      const session = await services.fueling.start({
        userId: user.id,
        card,
        stationId: station.id,
        fuel: quote.fuel,
        pumpNumber: flow.pumpNumber,
        mode: flow.mode,
        value: flow.value,
        paymentMethodId: fleet.active ? 'fleet' : (flow.paymentMethodId ?? ''),
        fleetAccountId: fleet.active ? fleet.account?.id : undefined,
        vehiclePlate: fleet.active ? flow.vehiclePlate : undefined,
        odometerKm: fleet.active ? flow.odometerKm : undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.replace({ pathname: '/pay/fueling', params: { sessionId: session.id } });
    } catch (e) {
      const code = e instanceof Error ? e.message : '';
      Alert.alert(t('pay.errorTitle'), code.startsWith('FLEET') ? t(`pay.${code === 'FLEET_LIMIT' ? 'fleetLimit' : 'fleetFuel'}`) : t('pay.errorBody'));
      setSubmitting(false);
    }
  };

  return (
    <Screen footer={<Button title={t('pay.confirmAndUnlock')} icon="lock-open" size="lg" loading={submitting} onPress={submit} />}>
      <View style={{ gap: 4 }}>
        <Text variant="caption" tone="primary" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {t('pay.step', { n: 3, total: 3 })}
        </Text>
        <Text variant="h2">{t('pay.confirmTitle')}</Text>
      </View>

      <Surface style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <FuelBadge fuel={quote.fuel} />
          <View style={{ flex: 1 }}>
            <Text variant="h3">{t(`fuel.long.${quote.fuel}`)}</Text>
            <Text variant="small" tone="muted">
              {station.name} · {t('pay.pumpN', { n: flow.pumpNumber })}
            </Text>
          </View>
        </View>
        <Divider />
        {fleet.active && flow.vehiclePlate ? (
          <Row label={t('pay.vehicle')} value={`${formatPlate(flow.vehiclePlate)}${flow.odometerKm ? ` · ${flow.odometerKm.toLocaleString('lt-LT')} km` : ''}`} />
        ) : null}
        <Row label={t('pay.amount')} value={amountLabel} />
        <Row label={t('pay.pumpPrice')} value={`${formatPricePerL(quote.pumpPricePerL, lang)} €/l`} />
        {quote.discounts.map((d) => (
          <Row
            key={d.offerId ?? d.kind}
            tone="primary"
            label={d.kind === 'card' ? t('pay.cardDiscount', { type: t(`cardType.${card?.type ?? 'general'}`) }) : (d.title ?? '')}
            value={`–${d.ctPerL} ct/l`}
          />
        ))}
        <Divider />
        <Row strong label={t('pay.yourPrice')} value={`${formatPricePerL(quote.finalPricePerL, lang)} €/l`} />
      </Surface>

      <Text variant="h3">{t('pay.paymentMethod')}</Text>
      {fleet.active && fleet.account ? (
        <Surface style={{ gap: 4, borderColor: colors.primary, borderWidth: 2 }}>
          <Text variant="bodyStrong">{t('pay.companyCard', { last4: fleet.account.cardNumber.slice(-4) })}</Text>
          <Text variant="small" tone="muted">
            {fleet.account.companyName} · {t('pay.fleetRemaining', { amount: formatMoney(fleetRemaining, lang) })}
          </Text>
        </Surface>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {methods.map((m) => (
            <PaymentMethodRow key={m.id} method={m} selected={flow.paymentMethodId === m.id} onPress={() => flow.set({ paymentMethodId: m.id })} />
          ))}
        </View>
      )}

      <Text variant="small" tone="muted">
        {fleet.active
          ? t('pay.fleetNote')
          : flow.mode === 'full'
            ? t('pay.holdNoteFull', { amount: formatMoney(FULL_TANK_HOLD_EUR, lang) })
            : t('pay.holdNote')}
      </Text>
    </Screen>
  );
}
