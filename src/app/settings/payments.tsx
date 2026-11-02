import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Alert } from '@/utils/alert';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button, PaymentMethodRow, Screen, Text } from '@/components';
import type { PaymentMethod } from '@/models';
import { services } from '@/services';
import { useSession } from '@/store';
import { useTheme } from '@/theme';

/** Mokėjimo kortelės (demonstracinės). Tikrų kortelių duomenų programėlė niekada nemato. */
export default function Payments() {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const userId = useSession((s) => s.user?.id);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (userId) services.payments.listMethods(userId).then(setMethods);
  }, [userId]);

  if (!userId) return null;

  return (
    <Screen
      footer={
        <Button
          title={t('settings.addCard')}
          icon="add"
          loading={adding}
          onPress={() =>
            Alert.alert(t('settings.addCard'), t('settings.addCardDemo'), [
              { text: t('common.cancel'), style: 'cancel' },
              {
                text: t('common.continue'),
                onPress: async () => {
                  setAdding(true);
                  setMethods(await services.payments.addDemoCard(userId));
                  setAdding(false);
                },
              },
            ])
          }
        />
      }
    >
      <Text tone="muted">{t('settings.paymentsIntro')}</Text>
      {methods.map((m) => (
        <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <PaymentMethodRow method={m} selected={m.isDefault} onPress={async () => setMethods(await services.payments.setDefault(userId, m.id))} />
          </View>
          {m.brand === 'visa' || m.brand === 'mastercard' ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('settings.removeCard')}
              hitSlop={8}
              onPress={() =>
                Alert.alert(t('settings.removeCard'), '', [
                  { text: t('common.cancel'), style: 'cancel' },
                  { text: t('settings.remove'), style: 'destructive', onPress: async () => setMethods(await services.payments.remove(userId, m.id)) },
                ])
              }
            >
              <Ionicons name="trash-outline" size={22} color={colors.danger} />
            </Pressable>
          ) : null}
        </View>
      ))}
      <Text variant="small" tone="muted">
        {t('settings.defaultHint')}
      </Text>
    </Screen>
  );
}
