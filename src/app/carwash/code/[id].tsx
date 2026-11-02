import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Alert } from '@/utils/alert';
import { shareText } from '@/utils/share';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';
import { Button, Screen, Text } from '@/components';
import { useLang } from '@/hooks/useLang';
import type { WashCode } from '@/models';
import { services } from '@/services';
import { useSession } from '@/store';
import { useTheme } from '@/theme';
import { formatDate } from '@/utils/format';

export default function WashCodeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const { colors, spacing, radius } = useTheme();
  const { id = '', fresh } = useLocalSearchParams<{ id?: string; fresh?: string }>();
  const userId = useSession((s) => s.user?.id);
  const [code, setCode] = useState<WashCode | null>(null);
  const [busy, setBusy] = useState(false);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    if (userId) services.carwash.listCodes(userId).then((list) => setCode(list.find((c) => c.id === id) ?? null));
  }, [userId, id]);

  if (!code || !userId) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  const active = code.status === 'active';
  const daysLeft = Math.max(0, Math.ceil((new Date(code.expiresAt).getTime() - now) / 86_400_000));

  const forward = async () => {
    const message = t('carwash.shareMessage', { name: code.productName, code: code.code, date: formatDate(code.expiresAt, lang) });
    const res = await shareText(message);
    if (res.action === 'sharedAction' || res.action === 'copied') {
      setCode(await services.carwash.markForwarded(userId, code.id, t('carwash.friend')));
    }
  };

  const redeem = async () => {
    setBusy(true);
    setCode(await services.carwash.redeem(userId, code.id));
    setBusy(false);
    Alert.alert(t('carwash.redeemedTitle'), t('carwash.redeemedBody'));
  };

  return (
    <Screen
      footer={
        active ? (
          <View style={{ gap: spacing.sm }}>
            <Button title={t('carwash.forward')} icon="gift" variant="secondary" onPress={forward} />
            <Button title={t('carwash.redeemDemo')} icon="car" loading={busy} onPress={redeem} />
          </View>
        ) : (
          <Button title={t('common.done')} onPress={() => router.back()} />
        )
      }
    >
      <Stack.Screen options={{ title: t('carwash.program', { name: code.productName }) }} />
      {fresh ? (
        <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
          <Ionicons name="checkmark-circle" size={32} color={colors.primary} />
          <Text variant="bodyStrong" style={{ flex: 1 }}>
            {t('carwash.bought')}
          </Text>
        </View>
      ) : null}
      <View style={{ alignSelf: 'center', backgroundColor: '#fff', padding: spacing.xl, borderRadius: radius.lg, alignItems: 'center', gap: spacing.md, opacity: active ? 1 : 0.4 }}>
        <QRCode value={`EMSIWASH:${code.code}`} size={180} />
        <Text style={{ color: '#111', fontSize: 40, fontWeight: '800', letterSpacing: 8 }}>{code.code}</Text>
      </View>
      <Text variant="h3" center>
        {active ? t('carwash.daysLeft', { count: daysLeft, date: formatDate(code.expiresAt, lang) }) : t(`carwash.status.${code.status}`, { to: code.sentTo ?? '' })}
      </Text>
      {active ? (
        <Text tone="muted" center>
          {t('carwash.howToUse')}
        </Text>
      ) : null}
    </Screen>
  );
}
