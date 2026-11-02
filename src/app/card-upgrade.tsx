import { useState } from 'react';
import { Alert } from '@/utils/alert';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Button,
  CardTypePicker,
  Screen,
  Text,
  cardTypeFormToInput,
  initialCardTypeForm,
  isCardTypeFormValid,
  type SelectableCardType,
} from '@/components';
import { services } from '@/services';
import { useCardStore } from '@/store';

export default function CardUpgrade() {
  const { t } = useTranslation();
  const router = useRouter();
  const card = useCardStore((s) => s.card);
  const setCard = useCardStore((s) => s.setCard);
  const [form, setForm] = useState({
    ...initialCardTypeForm,
    type: (card?.type === 'fleet' ? 'general' : (card?.type ?? 'general')) as SelectableCardType,
  });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!card) return;
    setLoading(true);
    const updated = await services.loyalty.changeCardType(card, cardTypeFormToInput(form));
    setCard(updated);
    setLoading(false);
    Alert.alert(t('cardUpgrade.successTitle'), t('cardUpgrade.success', { type: t(`cardType.${updated.type}`) }));
    router.back();
  };

  return (
    <Screen
      footer={
        <Button
          title={t('common.save')}
          size="lg"
          disabled={!isCardTypeFormValid(form) || form.type === card?.type}
          loading={loading}
          onPress={submit}
        />
      }
    >
      <Text tone="muted">{t('cardUpgrade.subtitle')}</Text>
      <CardTypePicker value={form} onChange={setForm} />
    </Screen>
  );
}
