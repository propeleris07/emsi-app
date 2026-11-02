import { useState } from 'react';
import { Platform, View } from 'react-native';
import { Alert } from '@/utils/alert';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  Button,
  CardCode,
  Divider,
  ListItem,
  LoyaltyCardVisual,
  Screen,
  Surface,
  Text,
  useDescribeRules,
} from '@/components';
import { featureFlags } from '@/config/featureFlags';
import { useCardRules } from '@/hooks/useCardRules';
import { useLang } from '@/hooks/useLang';
import { useSavings } from '@/hooks/useSavings';
import { services } from '@/services';
import type { WalletProvider } from '@/services/types';
import { useCardStore } from '@/store';
import { useTheme } from '@/theme';
import { formatMoney } from '@/utils/format';

export default function CardTab() {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const { colors, spacing, radius } = useTheme();
  const card = useCardStore((s) => s.card);
  const wallet = useCardStore((s) => s.wallet);
  const setWalletAdded = useCardStore((s) => s.setWalletAdded);
  const rules = useCardRules();
  const describe = useDescribeRules();
  const [adding, setAdding] = useState(false);
  const savings = useSavings();

  if (!card) return null;

  const provider: WalletProvider = Platform.OS === 'ios' ? 'apple' : 'google';
  const added = wallet[provider];

  const addToWallet = async () => {
    setAdding(true);
    await services.wallet.addToWallet(card, provider);
    setWalletAdded(provider);
    setAdding(false);
    Alert.alert(t(`wallet.${provider}`), t('wallet.addedDemo'));
  };

  return (
    <Screen safeTop>
      <Text variant="h1" style={{ marginTop: spacing.md }}>
        {t('card.title')}
      </Text>
      <LoyaltyCardVisual card={card} />

      <Surface style={{ alignItems: 'center', gap: spacing.sm }}>
        <Text variant="small" tone="muted" center>
          {t('card.scanHint')}
        </Text>
        <CardCode number={card.number} />
      </Surface>

      {featureFlags.walletButtons ? (
        <Button
          title={added ? t('wallet.added', { wallet: t(`wallet.${provider}`) }) : t('wallet.add', { wallet: t(`wallet.${provider}`) })}
          icon={added ? 'checkmark-circle' : 'wallet'}
          variant={added ? 'secondary' : 'wallet'}
          disabled={added}
          loading={adding}
          onPress={addToWallet}
        />
      ) : null}

      {/* Sutaupymų skaitliukas */}
      <Surface style={{ gap: spacing.xs, backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Ionicons name="sparkles" size={20} color={colors.primary} />
          <Text variant="bodyStrong" tone="primary">
            {t('card.savingsTitle')}
          </Text>
        </View>
        <Text variant="hero" tone="primary">
          {formatMoney(savings?.thisYear ?? 0, lang)}
        </Text>
        {savings ? (
          <Text variant="small" tone="muted">
            {t('card.savedBreakdown', {
              fuel: formatMoney(savings.byCategory.fuel, lang),
              other: formatMoney(savings.thisYear - savings.byCategory.fuel, lang),
            })}
          </Text>
        ) : null}
      </Surface>

      {/* Nuolaidos */}
      <Surface style={{ gap: spacing.sm }}>
        <Text variant="h3">{t('card.yourDiscounts', { type: t(`cardType.${card.type}`) })}</Text>
        {describe(rules).map((l) => (
          <View key={l} style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <Text>{l}</Text>
          </View>
        ))}
        {card.proof ? (
          <Text variant="small" tone="muted">
            {t('card.proofInfo', { kind: card.proof.kind, number: card.proof.number })}
          </Text>
        ) : null}
      </Surface>

      <Surface padded={false} style={{ overflow: 'hidden', borderRadius: radius.lg }}>
        {card.linkedPhysicalNumber ? (
          <ListItem icon="link" title={t('card.physicalLinked')} subtitle={t('card.physicalLinkedHint')} />
        ) : (
          <ListItem icon="link" title={t('linkCard.title')} subtitle={t('card.linkHint')} onPress={() => router.push('/link-card')} />
        )}
        <Divider inset={66} />
        <ListItem icon="swap-horizontal" title={t('cardUpgrade.title')} subtitle={t('card.upgradeHint')} onPress={() => router.push('/card-upgrade')} />
        <Divider inset={66} />
        <ListItem icon="expand" title={t('card.fullscreen')} onPress={() => router.push('/card-code')} />
      </Surface>
    </Screen>
  );
}
