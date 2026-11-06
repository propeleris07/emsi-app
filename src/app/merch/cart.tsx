import { useState } from 'react';
import { View } from 'react-native';
import { Alert } from '@/utils/alert';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Divider,
  EmptyState,
  ListItem,
  MerchImage,
  PaymentMethodRow,
  QuantityStepper,
  Screen,
  SectionHeader,
  Surface,
  Text,
} from '@/components';
import { useCartSummary, useMerchProducts } from '@/hooks/useMerch';
import { useLang } from '@/hooks/useLang';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useStations } from '@/hooks/useStations';
import type { MerchOrder } from '@/models';
import { services } from '@/services';
import { useSession } from '@/store';
import { useCart } from '@/store/cart';
import { useTheme } from '@/theme';
import { formatDistance, formatMoney } from '@/utils/format';

/** Krepšelis: kiekiai, atsiėmimo degalinė, mokėjimas ir patvirtinimas. */
export default function MerchCart() {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const { colors, spacing, radius } = useTheme();
  const userId = useSession((s) => s.user?.id);
  const products = useMerchProducts();
  const { rows, total, count } = useCartSummary(products);
  const setQty = useCart((s) => s.setQty);
  const clear = useCart((s) => s.clear);
  const { stations, nearest } = useStations();
  const { methods, defaultMethod } = usePaymentMethods();
  const [stationId, setStationId] = useState<string | undefined>();
  const [choosing, setChoosing] = useState(false);
  const [methodId, setMethodId] = useState<string | undefined>();
  const [buying, setBuying] = useState(false);
  const [order, setOrder] = useState<MerchOrder | null>(null);

  const station = stations.find((s) => s.id === (stationId ?? nearest?.id));
  const selectedMethod = methodId ?? defaultMethod?.id;

  // Užsakymas pateiktas – atsiėmimo kodas.
  if (order) {
    return (
      <Screen>
        <View style={{ alignItems: 'center', gap: spacing.md, paddingTop: spacing.xl }}>
          <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="checkmark-circle" size={56} color={colors.primary} />
          </View>
          <Text variant="h2" center>
            {t('merch.orderedTitle')}
          </Text>
          <Text tone="muted" center>
            {t('merch.orderedBody', { station: order.stationName })}
          </Text>
        </View>
        <Surface elevation="md" style={{ alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xl }}>
          <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
            {t('merch.pickupCode')}
          </Text>
          <Text style={{ fontSize: 40, lineHeight: 50, fontWeight: '800', letterSpacing: 8, color: colors.text, fontVariant: ['tabular-nums'] }}>{order.pickupCode}</Text>
          <Text variant="small" tone="muted" center>
            {t('merch.pickupHint')}
          </Text>
        </Surface>
        <Button title={t('merch.viewReceipt')} icon="receipt-outline" variant="secondary" onPress={() => router.replace({ pathname: '/receipt/[id]', params: { id: order.transactionId } })} />
        <Button title={t('merch.backToShop')} variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (!rows.length) {
    return (
      <Screen>
        <EmptyState icon="bag-handle" title={t('merch.emptyTitle')} body={t('merch.emptyBody')} />
        <Button title={t('merch.backToShop')} variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  const buy = async () => {
    if (!userId || !station || !selectedMethod) return;
    setBuying(true);
    try {
      const o = await services.merch.placeOrder({
        userId,
        lines: rows.map(({ productId, size, qty }) => ({ productId, size, qty })),
        stationId: station.id,
        paymentMethodId: selectedMethod,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      clear();
      setOrder(o);
    } catch {
      Alert.alert(t('pay.errorTitle'), t('checkout.error'));
    } finally {
      setBuying(false);
    }
  };

  return (
    <Screen
      footer={
        <Button
          title={t('checkout.payAmount', { amount: formatMoney(total, lang) })}
          icon="lock-closed"
          size="lg"
          loading={buying}
          disabled={!selectedMethod || !station}
          onPress={buy}
        />
      }
    >
      {/* Prekės */}
      <Surface padded={false} style={{ overflow: 'hidden' }}>
        {rows.map((r, i) => (
          <View key={`${r.productId}-${r.size ?? ''}`}>
            {i ? <Divider inset={84} /> : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md }}>
              <MerchImage product={r.product} compact style={{ width: 60, height: 60, borderRadius: radius.md }} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="bodyStrong" numberOfLines={2}>
                  {r.product.name}
                </Text>
                <Text variant="small" tone="muted">
                  {r.size ? `${t('merch.size')}: ${r.size} · ` : ''}
                  {formatMoney(r.product.price, lang)}
                </Text>
              </View>
              <QuantityStepper value={r.qty} onChange={(q) => setQty(r.productId, r.size, q)} />
            </View>
          </View>
        ))}
        <Divider />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg }}>
          <Text variant="bodyStrong">{t('merch.totalItems', { count })}</Text>
          <Text variant="h2">{formatMoney(total, lang)}</Text>
        </View>
      </Surface>

      {/* Atsiėmimo degalinė */}
      <SectionHeader title={t('merch.pickupStation')} action={choosing ? undefined : t('merch.change')} onAction={() => setChoosing(true)} />
      <Surface padded={false} style={{ overflow: 'hidden' }}>
        {choosing ? (
          stations.slice(0, 8).map((s, i) => (
            <View key={s.id}>
              {i ? <Divider inset={68} /> : null}
              <ListItem
                icon="location"
                title={s.name}
                subtitle={`${s.address} · ${formatDistance(s.distanceKm, lang)}`}
                chevron={false}
                right={s.id === station?.id ? <Ionicons name="checkmark-circle" size={22} color={colors.primary} /> : undefined}
                onPress={() => {
                  setStationId(s.id);
                  setChoosing(false);
                }}
              />
            </View>
          ))
        ) : station ? (
          <ListItem
            icon="location"
            title={station.name}
            subtitle={`${station.address}, ${station.city} · ${formatDistance(station.distanceKm, lang)}`}
            onPress={() => setChoosing(true)}
          />
        ) : null}
      </Surface>

      {/* Mokėjimas */}
      <Text variant="h3">{t('pay.paymentMethod')}</Text>
      <View style={{ gap: spacing.sm }}>
        {methods.map((m) => (
          <PaymentMethodRow key={m.id} method={m} selected={selectedMethod === m.id} onPress={() => setMethodId(m.id)} />
        ))}
      </View>
      <Text variant="small" tone="muted">
        {t('merch.pickupNote')}
      </Text>
    </Screen>
  );
}
