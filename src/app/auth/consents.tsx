import { useState } from 'react';
import { Pressable, Switch, View } from 'react-native';
import { Alert } from '@/utils/alert';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Screen, Surface, Text } from '@/components';
import type { Consents } from '@/models';
import { services } from '@/services';
import { useSession } from '@/store';
import { useTheme } from '@/theme';

type Key = Exclude<keyof Consents, 'acceptedAt'>;
const ITEMS: { key: Key; required: boolean }[] = [
  { key: 'terms', required: true },
  { key: 'privacy', required: true },
  { key: 'marketing', required: false },
  { key: 'personalizedOffers', required: false },
  { key: 'location', required: false },
];

export default function ConsentsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const user = useSession((s) => s.user);
  const setConsents = useSession((s) => s.setConsents);
  const [values, setValues] = useState<Record<Key, boolean>>({
    terms: false,
    privacy: false,
    marketing: false,
    personalizedOffers: false,
    location: false,
  });
  const [loading, setLoading] = useState(false);
  const canContinue = values.terms && values.privacy;

  const submit = async () => {
    if (!user) return;
    setLoading(true);
    const consents: Consents = { ...values, acceptedAt: new Date().toISOString() };
    await services.auth.saveConsents(user.id, consents);
    setConsents(consents);
    setLoading(false);
    router.push('/auth/card-type');
  };

  return (
    <Screen
      footer={
        <View style={{ gap: spacing.sm }}>
          <Button
            title={t('consents.acceptAll')}
            variant="secondary"
            onPress={() => setValues({ terms: true, privacy: true, marketing: true, personalizedOffers: true, location: true })}
          />
          <Button title={t('common.continue')} size="lg" disabled={!canContinue} loading={loading} onPress={submit} />
        </View>
      }
    >
      <Text variant="h1">{t('consents.title')}</Text>
      <Text tone="muted">{t('consents.subtitle')}</Text>
      <Surface padded={false}>
        {ITEMS.map((item, i) => (
          <View
            key={item.key}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
              padding: spacing.lg,
              borderTopWidth: i ? 1 : 0,
              borderTopColor: colors.border,
            }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="bodyStrong">
                {t(`consents.${item.key}`)}
                {item.required ? <Text tone="danger"> *</Text> : null}
              </Text>
              <Text variant="small" tone="muted">
                {t(`consents.${item.key}Desc`)}
              </Text>
              {item.key === 'terms' || item.key === 'privacy' ? (
                <Pressable hitSlop={8} onPress={() => Alert.alert(t(`consents.${item.key}`), t('consents.docDemo'))}>
                  <Text variant="small" tone="primary">
                    {t('consents.read')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
            <Switch
              value={values[item.key]}
              onValueChange={(v) => setValues((s) => ({ ...s, [item.key]: v }))}
              trackColor={{ true: colors.primary, false: colors.border }}
              accessibilityLabel={t(`consents.${item.key}`)}
            />
          </View>
        ))}
      </Surface>
      <Text variant="caption" tone="muted">
        {t('consents.footer')}
      </Text>
    </Screen>
  );
}
