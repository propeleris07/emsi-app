import { useState } from 'react';
import { TextInput } from 'react-native';
import { Alert } from '@/utils/alert';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Screen, Text } from '@/components';
import { services } from '@/services';
import { useCardStore } from '@/store';
import { useTheme } from '@/theme';
import { groupCardNumber } from '@/utils/format';

export default function LinkCard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, radius, spacing } = useTheme();
  const card = useCardStore((s) => s.card);
  const setCard = useCardStore((s) => s.setCard);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const digits = value.replace(/\D/g, '');

  const submit = async () => {
    if (!card) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await services.loyalty.linkPhysicalCard(card, digits);
      setCard(updated);
      Alert.alert(t('linkCard.successTitle'), t('linkCard.success'));
      router.back();
    } catch {
      setError(t('linkCard.invalid'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen footer={<Button title={t('linkCard.submit')} size="lg" disabled={digits.length !== 16} loading={loading} onPress={submit} />}>
      <Text tone="muted">{t('linkCard.subtitle')}</Text>
      <TextInput
        autoFocus
        value={groupCardNumber(value)}
        onChangeText={(v) => setValue(v.replace(/\D/g, '').slice(0, 16))}
        placeholder="7300 0000 0000 0000"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        style={{
          height: 64,
          borderRadius: radius.md,
          borderWidth: 2,
          borderColor: error ? colors.danger : digits.length === 16 ? colors.primary : colors.border,
          backgroundColor: colors.surface,
          paddingHorizontal: spacing.lg,
          fontSize: 22,
          letterSpacing: 1.5,
          color: colors.text,
        }}
      />
      {error ? <Text tone="danger">{error}</Text> : null}
      <Text variant="small" tone="muted">
        {t('linkCard.hint')}
      </Text>
    </Screen>
  );
}
