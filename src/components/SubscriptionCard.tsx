import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Alert } from '@/utils/alert';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { Subscription } from '@/models';
import { useLang } from '@/hooks/useLang';
import { useSubscription } from '@/hooks/useSubscriptions';
import { services } from '@/services';
import { useSession } from '@/store';
import { useTheme } from '@/theme';
import { formatDate, formatMoney } from '@/utils/format';
import { Button } from './Button';
import { Surface } from './Surface';
import { Text } from './Text';

/** Abonemento kortelė: pasiūlymas užsisakyti arba aktyvaus abonemento valdymas. */
export function SubscriptionCard({ kind }: { kind: Subscription['kind'] }) {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const { colors, spacing } = useTheme();
  const userId = useSession((s) => s.user?.id);
  const { plan, subscription, reload } = useSubscription(kind);
  const [loading, setLoading] = useState(false);

  if (!plan) return null;
  const usedToday = subscription?.lastUsedAt?.slice(0, 10) === new Date().toISOString().slice(0, 10);

  const getCode = async () => {
    if (!userId || !subscription) return;
    setLoading(true);
    try {
      const code = await services.subscriptions.useToday(userId, subscription.id);
      reload();
      router.push({ pathname: '/daily-code', params: { code: code.code, until: code.validUntil, kind } });
    } catch {
      Alert.alert(t('subs.usedTitle'), t('subs.usedBody'));
    } finally {
      setLoading(false);
    }
  };

  if (!subscription) {
    return (
      <Surface style={{ gap: spacing.sm, borderColor: colors.primary, borderWidth: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Ionicons name="repeat" size={22} color={colors.primary} />
          <Text variant="h3" style={{ flex: 1 }}>
            {plan.name}
          </Text>
          <Text variant="h3" tone="primary">
            {t('subs.perMonth', { price: formatMoney(plan.priceMonthly, lang) })}
          </Text>
        </View>
        <Text tone="muted">{plan.description}</Text>
        <Button title={t('subs.subscribe')} onPress={() => router.push({ pathname: '/checkout', params: { kind: 'sub', id: kind } })} />
      </Surface>
    );
  }

  return (
    <Surface style={{ gap: spacing.sm, backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
        <Text variant="h3" style={{ flex: 1 }}>
          {plan.name}
        </Text>
      </View>
      <Text>
        {subscription.status === 'cancelled'
          ? t('subs.cancelledUntil', { date: formatDate(subscription.endsAt, lang) })
          : t('subs.activeUntil', { date: formatDate(subscription.endsAt, lang) })}
      </Text>
      <Text variant="small" tone="muted">
        {t('subs.rule', { rule: plan.rule, n: subscription.usesCount })}
      </Text>
      <Button
        title={usedToday ? t('subs.usedTodayBtn') : t(`subs.getCode_${kind}`)}
        icon="qr-code"
        disabled={usedToday}
        loading={loading}
        onPress={getCode}
      />
      {subscription.status === 'active' ? (
        <Pressable
          hitSlop={8}
          onPress={() =>
            Alert.alert(t('subs.cancelTitle'), t('subs.cancelBody', { date: formatDate(subscription.endsAt, lang) }), [
              { text: t('common.cancel'), style: 'cancel' },
              {
                text: t('subs.cancelConfirm'),
                style: 'destructive',
                onPress: async () => {
                  if (userId) await services.subscriptions.cancel(userId, subscription.id);
                  reload();
                },
              },
            ])
          }
        >
          <Text variant="small" tone="muted" center style={{ textDecorationLine: 'underline' }}>
            {t('subs.cancel')}
          </Text>
        </Pressable>
      ) : null}
    </Surface>
  );
}
