import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';
import { Button, Screen, Text } from '@/components';
import { useLang } from '@/hooks/useLang';
import { useTheme } from '@/theme';
import { formatDateTime } from '@/utils/format';

/** Šiandienos kodas pagal abonementą (plovyklai arba kavai). */
export default function DailyCode() {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const { radius, spacing } = useTheme();
  const { code = '', until = '', kind = 'carwash' } = useLocalSearchParams<{ code?: string; until?: string; kind?: string }>();

  return (
    <Screen footer={<Button title={t('common.done')} onPress={() => router.back()} />}>
      <Text variant="h2" center>
        {t(`subs.codeTitle_${kind}`)}
      </Text>
      <View style={{ alignSelf: 'center', backgroundColor: '#fff', padding: spacing.xl, borderRadius: radius.lg, alignItems: 'center', gap: spacing.md }}>
        <QRCode value={`EMSI:${kind}:${code}`} size={200} />
        <Text style={{ color: '#111', fontSize: 40, fontWeight: '800', letterSpacing: 8 }}>{code}</Text>
      </View>
      <Text tone="muted" center>
        {t(`subs.codeHint_${kind}`)}
      </Text>
      <Text variant="small" tone="muted" center>
        {t('subs.validUntil', { date: formatDateTime(until, lang) })}
      </Text>
    </Screen>
  );
}
