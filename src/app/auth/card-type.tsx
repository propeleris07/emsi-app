import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  Button,
  CardTypePicker,
  Screen,
  Text,
  cardTypeFormToInput,
  initialCardTypeForm,
  isCardTypeFormValid,
} from '@/components';
import { services } from '@/services';
import { useCardStore, useSession } from '@/store';
import { useTheme } from '@/theme';
import { groupCardNumber } from '@/utils/format';

export default function CardTypeScreen() {
  const { t } = useTranslation();
  const { colors, radius, spacing } = useTheme();
  const user = useSession((s) => s.user);
  const completeOnboarding = useSession((s) => s.completeOnboarding);
  const setCard = useCardStore((s) => s.setCard);
  const [form, setForm] = useState(initialCardTypeForm);
  const [hasPhysical, setHasPhysical] = useState(false);
  const [physical, setPhysical] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const physicalDigits = physical.replace(/\D/g, '');
  const valid = isCardTypeFormValid(form) && (!hasPhysical || physicalDigits.length === 16);

  const submit = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      let card = await services.loyalty.issueCard({ userId: user.id, ...cardTypeFormToInput(form) });
      if (hasPhysical) card = await services.loyalty.linkPhysicalCard(card, physicalDigits);
      setCard(card);
      // Apsaugoti maršrutai patys nukreips į pradžios ekraną.
      completeOnboarding();
    } catch {
      setError(t('linkCard.invalid'));
      setLoading(false);
    }
  };

  return (
    <Screen footer={<Button title={t('cardType.getCard')} size="lg" disabled={!valid} loading={loading} onPress={submit} />}>
      <Text variant="h1">{t('cardType.title')}</Text>
      <Text tone="muted">{t('cardType.subtitle')}</Text>
      <CardTypePicker value={form} onChange={setForm} />

      <Pressable
        onPress={() => setHasPhysical((v) => !v)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: hasPhysical }}
      >
        <Ionicons name={hasPhysical ? 'checkbox' : 'square-outline'} size={26} color={colors.primary} />
        <Text variant="bodyStrong" style={{ flex: 1 }}>
          {t('cardType.havePhysical')}
        </Text>
      </Pressable>
      {hasPhysical ? (
        <View style={{ gap: spacing.sm }}>
          <TextInput
            value={groupCardNumber(physical)}
            onChangeText={(v) => setPhysical(v.replace(/\D/g, '').slice(0, 16))}
            placeholder="7300 0000 0000 0000"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            style={{
              height: 56,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              paddingHorizontal: spacing.lg,
              fontSize: 20,
              letterSpacing: 1.5,
              color: colors.text,
            }}
          />
          <Text variant="small" tone="muted">
            {t('linkCard.hint')}
          </Text>
        </View>
      ) : null}
      {error ? <Text tone="danger">{error}</Text> : null}
    </Screen>
  );
}
