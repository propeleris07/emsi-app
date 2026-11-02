import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, CardCode, Logo, Screen, Text } from '@/components';
import { useCardStore } from '@/store';
import { useTheme } from '@/theme';

/** Kortelės kodas per visą ekraną – greitam skenavimui prie kasos. */
export default function CardCodeModal() {
  const { t } = useTranslation();
  const router = useRouter();
  const { spacing } = useTheme();
  const card = useCardStore((s) => s.card);
  if (!card) return null;

  return (
    <Screen footer={<Button title={t('common.done')} onPress={() => router.back()} />}>
      <View style={{ alignItems: 'center', gap: spacing.sm }}>
        <Logo height={40} />
        <Text variant="h3">{t(`cardType.${card.type}`)}</Text>
      </View>
      <CardCode number={card.number} />
      <Text tone="muted" center>
        {t('card.scanHint')}
      </Text>
    </Screen>
  );
}
