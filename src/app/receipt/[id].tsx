import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button, EmptyState, ReceiptView, Screen, Text } from '@/components';
import { useLang } from '@/hooks/useLang';
import type { Receipt, Transaction } from '@/models';
import { services } from '@/services';
import { useSession } from '@/store';
import { useTheme } from '@/theme';
import { formatMoney } from '@/utils/format';
import { exportReceiptPdf } from '@/utils/receiptPdf';

export default function ReceiptScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const { colors, spacing, radius } = useTheme();
  const { id = '', fresh } = useLocalSearchParams<{ id?: string; fresh?: string }>();
  const userId = useSession((s) => s.user?.id);
  const [tx, setTx] = useState<Transaction | null | undefined>(undefined);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!userId) return;
    services.transactions.get(userId, id).then((x) => setTx(x ?? null));
    services.transactions.getReceipt(userId, id).then((r) => setReceipt(r ?? null));
  }, [userId, id]);

  if (tx === null) return <EmptyState icon="receipt" title={t('receipt.notFound')} />;
  if (!tx || !receipt) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <View style={{ gap: spacing.sm }}>
          <Button
            title={t('receipt.exportPdf')}
            icon="document-text"
            variant={fresh ? 'secondary' : 'primary'}
            loading={exporting}
            onPress={async () => {
              setExporting(true);
              try {
                await exportReceiptPdf(receipt, lang, t('receipt.title'));
              } finally {
                setExporting(false);
              }
            }}
          />
          {fresh ? (
            <Button
              title={t('receipt.backHome')}
              onPress={() => {
                router.dismissAll();
                router.navigate('/');
              }}
            />
          ) : null}
        </View>
      }
    >
      {fresh ? <Stack.Screen options={{ gestureEnabled: false, headerBackVisible: false }} /> : null}
      {fresh ? (
        <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
          <Ionicons name="checkmark-circle" size={36} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text variant="h3">{t('receipt.thanks')}</Text>
            <Text tone="primary" variant="bodyStrong">
              {t('receipt.youSaved', { amount: formatMoney(tx.discount, lang) })}
            </Text>
          </View>
        </View>
      ) : null}
      <ReceiptView receipt={receipt} />
    </Screen>
  );
}
