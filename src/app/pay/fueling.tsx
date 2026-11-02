import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Button, FuelBadge, Screen, Surface, Text } from '@/components';
import { useLang } from '@/hooks/useLang';
import type { FuelingSession } from '@/models';
import { services } from '@/services';
import { usePayFlow } from '@/store/payFlow';
import { notifyUser } from '@/utils/notify';
import { useTheme } from '@/theme';
import { formatMoney, formatPlate, formatPricePerL } from '@/utils/format';

const POLL_MS = 350;

/** Pylimo būsena realiu laiku. */
export default function Fueling() {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const { colors, spacing, radius } = useTheme();
  const { sessionId = '' } = useLocalSearchParams<{ sessionId?: string }>();
  const resetFlow = usePayFlow((s) => s.reset);
  const [session, setSession] = useState<FuelingSession | null>(null);
  const [stopping, setStopping] = useState(false);
  const [lost, setLost] = useState(false);
  const [pulse] = useState(() => new Animated.Value(0));
  const navigated = useRef(false);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const s = await services.fueling.poll(sessionId);
        if (!alive) return;
        setSession(s);
        if (s.status === 'completed' && s.transactionId && !navigated.current) {
          navigated.current = true;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          resetFlow();
          if (s.byPlate) {
            notifyUser('receipts',
              t('notif.plateDoneTitle'),
              t('notif.plateDoneBody', { plate: formatPlate(s.vehiclePlate ?? ''), amount: formatMoney(s.amount, lang), litres: s.litres.toFixed(2) }),
              `/receipt/${s.transactionId}`,
            );
          }
          setTimeout(() => router.replace({ pathname: '/receipt/[id]', params: { id: s.transactionId!, fresh: '1' } }), 1400);
          return;
        }
        if (s.status === 'cancelled') return;
      } catch {
        if (alive) setLost(true);
        return;
      }
      if (alive) setTimeout(tick, POLL_MS);
    };
    tick();
    return () => {
      alive = false;
    };
  }, [sessionId, lang, resetFlow, router, t]);

  if (lost) {
    return (
      <Screen footer={<Button title={t('receipt.backHome')} onPress={() => router.replace('/')} />}>
        <Text variant="h2" center>
          {t('fueling.lostTitle')}
        </Text>
        <Text tone="muted" center>
          {t('fueling.lostBody')}
        </Text>
      </Screen>
    );
  }

  if (!session) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  const { status, quote } = session;
  const progress = session.mode === 'full' ? null : Math.min(1, session.litres / session.targetLitres);
  const headline =
    status === 'waiting_nozzle'
      ? t('fueling.unlocked', { n: session.pumpNumber })
      : status === 'fueling'
        ? t('fueling.inProgress')
        : status === 'completed'
          ? t('fueling.done')
          : t('fueling.cancelled');

  const stop = async () => {
    setStopping(true);
    const s = await services.fueling.stop(sessionId);
    setSession(s);
    if (s.status === 'cancelled') {
      resetFlow();
      router.replace('/pay');
    }
  };

  return (
    <Screen
      footer={
        status === 'waiting_nozzle' ? (
          <Button title={t('fueling.cancel')} variant="danger" loading={stopping} onPress={stop} />
        ) : status === 'fueling' ? (
          <Button title={t('fueling.stop')} variant="secondary" icon="stop-circle" loading={stopping} onPress={stop} />
        ) : status === 'cancelled' ? (
          <Button title={t('common.done')} onPress={() => router.replace('/pay')} />
        ) : undefined
      }
    >
      <Stack.Screen options={{ title: t('pay.pumpN', { n: session.pumpNumber }), gestureEnabled: false, headerBackVisible: false }} />

      <View style={{ alignItems: 'center', gap: spacing.md, marginTop: spacing.lg }}>
        <Animated.View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: status === 'completed' ? colors.primary : colors.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: status === 'completed' ? 1 : pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }],
          }}
        >
          <Ionicons
            name={status === 'completed' ? 'checkmark' : status === 'waiting_nozzle' ? 'hand-left' : 'water'}
            size={56}
            color={status === 'completed' ? colors.onPrimary : colors.primary}
          />
        </Animated.View>
        <Text variant="h2" center>
          {headline}
        </Text>
        {session.byPlate ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 }}>
            <Ionicons name="car" size={16} color={colors.primary} />
            <Text variant="small" tone="primary" style={{ fontWeight: '700' }}>
              {t('fueling.byPlate', { plate: formatPlate(session.vehiclePlate ?? '') })}
            </Text>
          </View>
        ) : null}
        {status === 'waiting_nozzle' ? (
          <Text tone="muted" center>
            {t('fueling.takeNozzle', { fuel: t(`fuel.long.${quote.fuel}`) })}
          </Text>
        ) : null}
      </View>

      <Surface style={{ gap: spacing.md }}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text variant="caption" tone="muted">
              {t('fueling.litres')}
            </Text>
            <Text style={{ fontSize: 44, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] }}>
              {session.litres.toFixed(2).replace('.', lang === 'lt' ? ',' : '.')}
            </Text>
          </View>
          <View style={{ width: 1, backgroundColor: colors.border }} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text variant="caption" tone="muted">
              {t('fueling.toPay')}
            </Text>
            <Text style={{ fontSize: 44, fontWeight: '800', color: colors.primary, fontVariant: ['tabular-nums'] }}>
              {session.amount.toFixed(2).replace('.', lang === 'lt' ? ',' : '.')}
            </Text>
          </View>
        </View>
        {progress !== null ? (
          <View style={{ height: 10, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}>
            <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: colors.primary }} />
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <FuelBadge fuel={quote.fuel} size={32} />
          <Text variant="small" tone="muted" style={{ flex: 1 }}>
            {t('fueling.priceLine', {
              price: formatPricePerL(quote.finalPricePerL, lang),
              discount: Math.round(quote.discountPerL * 100),
            })}
          </Text>
        </View>
        <Text variant="caption" tone="muted">
          {t('fueling.authorized', { amount: formatMoney(session.authorizedAmount, lang) })}
        </Text>
      </Surface>
    </Screen>
  );
}
