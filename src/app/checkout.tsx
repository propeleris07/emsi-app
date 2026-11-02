import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Alert } from '@/utils/alert';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button, Divider, PaymentMethodRow, Screen, Surface, Text } from '@/components';
import { useLang } from '@/hooks/useLang';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import type { SubscriptionPlan } from '@/models';
import { services } from '@/services';
import { useSession } from '@/store';
import { useTheme } from '@/theme';
import { formatDate, formatMoney } from '@/utils/format';
import { scheduleForUser } from '@/utils/notify';

interface Item {
  title: string;
  description: string;
  price: number;
  discount: number;
  couponTitle?: string;
  icon: 'water' | 'cafe' | 'repeat';
  note?: string;
}

/** Bendras pirkimo ekranas: plovimo programa arba abonementas. */
export default function Checkout() {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const { colors, spacing, radius } = useTheme();
  const { kind = 'wash', id = '' } = useLocalSearchParams<{ kind?: 'wash' | 'sub'; id?: string }>();
  const userId = useSession((s) => s.user?.id);
  const { methods, defaultMethod } = usePaymentMethods();
  const [methodId, setMethodId] = useState<string | undefined>();
  const [item, setItem] = useState<Item | null>(null);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    if (!userId) return;
    if (kind === 'wash') {
      Promise.all([services.carwash.listProducts(), services.carwash.quote(userId, id)]).then(([products, q]) => {
        const p = products.find((x) => x.id === id);
        if (!p) return;
        const until = new Date();
        until.setDate(until.getDate() + 14);
        setItem({
          title: t('carwash.program', { name: p.name }),
          description: p.description,
          price: q.price,
          discount: q.discount,
          couponTitle: q.couponTitle,
          icon: 'water',
          note: t('checkout.washNote', { date: formatDate(until.toISOString(), lang) }),
        });
      });
    } else {
      services.subscriptions.listPlans().then((plans) => {
        const p = plans.find((x: SubscriptionPlan) => x.kind === id);
        if (!p) return;
        setItem({
          title: p.name,
          description: p.description,
          price: p.priceMonthly,
          discount: 0,
          icon: p.kind === 'coffee' ? 'cafe' : 'repeat',
          note: t('checkout.subNote'),
        });
      });
    }
  }, [userId, kind, id, t, lang]);

  const selected = methodId ?? defaultMethod?.id;

  const buy = async () => {
    if (!userId || !selected) return;
    setBuying(true);
    try {
      if (kind === 'wash') {
        const { code } = await services.carwash.buy(userId, id, selected);
        const remind = new Date(code.expiresAt);
        remind.setDate(remind.getDate() - 1);
        scheduleForUser('reminders', remind, t('notif.washExpiryTitle'), t('notif.washExpiryBody', { name: code.productName }), `/carwash/code/${code.id}`);
        router.replace({ pathname: '/carwash/code/[id]', params: { id: code.id, fresh: '1' } });
      } else {
        await services.subscriptions.subscribe(userId, id as 'carwash' | 'coffee', selected);
        Alert.alert(t('checkout.subSuccessTitle'), t('checkout.subSuccess'));
        router.back();
      }
    } catch {
      Alert.alert(t('pay.errorTitle'), t('checkout.error'));
      setBuying(false);
    }
  };

  if (!item) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  return (
    <Screen
      footer={<Button title={t('checkout.payAmount', { amount: formatMoney(item.price, lang) })} icon="lock-closed" size="lg" loading={buying} disabled={!selected} onPress={buy} />}
    >
      <Surface style={{ gap: spacing.md }}>
        <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
          <View style={{ width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={item.icon} size={28} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="h3">{item.title}</Text>
            <Text variant="small" tone="muted">
              {item.description}
            </Text>
          </View>
        </View>
        <Divider />
        {item.discount ? (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text tone="primary">{item.couponTitle}</Text>
            <Text tone="primary">–{formatMoney(item.discount, lang)}</Text>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="bodyStrong">{t('receipt.total')}</Text>
          <Text variant="h2">{formatMoney(item.price, lang)}</Text>
        </View>
      </Surface>
      <Text variant="h3">{t('pay.paymentMethod')}</Text>
      <View style={{ gap: spacing.sm }}>
        {methods.map((m) => (
          <PaymentMethodRow key={m.id} method={m} selected={selected === m.id} onPress={() => setMethodId(m.id)} />
        ))}
      </View>
      {item.note ? (
        <Text variant="small" tone="muted">
          {item.note}
        </Text>
      ) : null}
    </Screen>
  );
}
