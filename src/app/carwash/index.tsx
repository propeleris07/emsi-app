import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button, Divider, ListItem, Screen, SectionHeader, SubscriptionCard, Surface, Text } from '@/components';
import { useLang } from '@/hooks/useLang';
import type { CarWashProduct, WashCode } from '@/models';
import { services } from '@/services';
import { useSession } from '@/store';
import { useTheme } from '@/theme';
import { formatDate, formatMoney } from '@/utils/format';

export default function CarWash() {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const { colors, spacing, radius } = useTheme();
  const userId = useSession((s) => s.user?.id);
  const [products, setProducts] = useState<CarWashProduct[]>([]);
  const [codes, setCodes] = useState<WashCode[]>([]);

  useFocusEffect(
    useCallback(() => {
      services.carwash.listProducts().then(setProducts);
      if (userId) services.carwash.listCodes(userId).then(setCodes);
    }, [userId]),
  );

  const activeCodes = codes.filter((c) => c.status === 'active');
  const otherCodes = codes.filter((c) => c.status !== 'active').slice(0, 3);

  return (
    <Screen>
      <Text tone="muted">{t('carwash.intro')}</Text>

      {activeCodes.length + otherCodes.length > 0 ? (
        <>
          <SectionHeader title={t('carwash.myCodes')} />
          <Surface padded={false} style={{ overflow: 'hidden' }}>
            {[...activeCodes, ...otherCodes].map((c, i) => (
              <View key={c.id}>
                {i ? <Divider inset={66} /> : null}
                <ListItem
                  icon={c.status === 'active' ? 'ticket' : c.status === 'sent' ? 'paper-plane' : 'checkmark-done'}
                  iconColor={c.status === 'active' ? colors.primary : colors.textMuted}
                  title={t('carwash.program', { name: c.productName })}
                  subtitle={
                    c.status === 'active'
                      ? t('carwash.validUntil', { date: formatDate(c.expiresAt, lang) })
                      : t(`carwash.status.${c.status}`, { to: c.sentTo ?? '' })
                  }
                  onPress={() => router.push({ pathname: '/carwash/code/[id]', params: { id: c.id } })}
                />
              </View>
            ))}
          </Surface>
        </>
      ) : null}

      <SubscriptionCard kind="carwash" />

      <SectionHeader title={t('carwash.programs')} />
      {products.map((p) => (
        <Surface key={p.id} style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="water" size={24} color={colors.info} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="h3">{p.name}</Text>
              <Text variant="small" tone="muted">
                {t('carwash.duration', { min: p.durationMin })}
              </Text>
            </View>
            <Text variant="h2">{formatMoney(p.price, lang)}</Text>
          </View>
          <Text tone="muted">{p.description}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {p.features.map((f) => (
              <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="checkmark" size={14} color={colors.primary} />
                <Text variant="small">{f}</Text>
              </View>
            ))}
          </View>
          <Button title={t('carwash.buy')} variant="secondary" onPress={() => router.push({ pathname: '/checkout', params: { kind: 'wash', id: p.id } })} />
        </Surface>
      ))}
    </Screen>
  );
}
