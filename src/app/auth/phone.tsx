import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Screen, Text } from '@/components';
import { services } from '@/services';
import { useTheme } from '@/theme';
import { normalizeLtPhone } from '@/utils/format';

export default function Phone() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, radius, spacing } = useTheme();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const phone = normalizeLtPhone(value);

  const submit = async () => {
    if (!phone) {
      setError(t('auth.invalidPhone'));
      return;
    }
    setLoading(true);
    try {
      const { requestId } = await services.auth.requestCode(phone);
      router.push({ pathname: '/auth/verify', params: { phone, requestId } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen footer={<Button title={t('auth.sendCode')} size="lg" loading={loading} disabled={!phone} onPress={submit} />}>
      <Text variant="h1">{t('auth.phoneTitle')}</Text>
      <Text tone="muted">{t('auth.phoneSubtitle')}</Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 64,
          borderRadius: radius.md,
          borderWidth: 2,
          borderColor: error ? colors.danger : phone ? colors.primary : colors.border,
          backgroundColor: colors.surface,
          paddingHorizontal: spacing.lg,
          gap: spacing.sm,
        }}
      >
        <Text variant="h3" tone="muted">
          🇱🇹 +370
        </Text>
        <TextInput
          autoFocus
          value={value}
          onChangeText={(v) => {
            setValue(v);
            setError(null);
          }}
          placeholder="6xx xxxxx"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          maxLength={13}
          onSubmitEditing={submit}
          style={{ flex: 1, fontSize: 22, fontWeight: '600', color: colors.text }}
          accessibilityLabel={t('auth.phoneTitle')}
        />
      </View>
      {error ? <Text tone="danger">{error}</Text> : null}
      <Text variant="small" tone="muted">
        {t('auth.smsNote')}
      </Text>
    </Screen>
  );
}
