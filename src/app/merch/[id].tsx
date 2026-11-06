import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Button, Chip, MerchImage, QuantityStepper, Screen, Surface, Text } from '@/components';
import { useMerchProducts } from '@/hooks/useMerch';
import { useLang } from '@/hooks/useLang';
import { useCart } from '@/store/cart';
import { useTheme } from '@/theme';
import { formatMoney } from '@/utils/format';

/** Prekės kortelė: dydis, kiekis, „Į krepšelį“. */
export default function MerchProductScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const { colors, spacing } = useTheme();
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const product = useMerchProducts().find((p) => p.id === id);
  const add = useCart((s) => s.add);
  const [size, setSize] = useState<string | undefined>();
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  const needsSize = !!product.sizes?.length && !size;

  return (
    <Screen
      footer={
        <Button
          title={needsSize ? t('merch.chooseSize') : t('merch.addAmount', { amount: formatMoney(product.price * qty, lang) })}
          icon="bag-add"
          size="lg"
          disabled={needsSize}
          onPress={() => {
            add(product.id, size, qty);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            router.back();
          }}
        />
      }
    >
      <Stack.Screen options={{ title: product.name }} />
      <Surface padded={false} style={{ padding: 8 }}>
        <MerchImage product={product} style={{ aspectRatio: 1, maxHeight: 420 }} />
      </Surface>

      <View style={{ gap: spacing.xs }}>
        <Text variant="caption" tone="primary" style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {t(`merch.cat.${product.category}`)}
        </Text>
        <Text variant="h1">{product.name}</Text>
        <Text variant="h2" tone="primary">
          {formatMoney(product.price, lang)}
        </Text>
      </View>
      <Text tone="muted">{product.description}</Text>

      {product.sizes?.length ? (
        <View style={{ gap: spacing.sm }}>
          <Text variant="bodyStrong">{t('merch.size')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {product.sizes.map((s) => (
              <Chip key={s} label={s} selected={size === s} onPress={() => setSize(s)} />
            ))}
          </View>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="bodyStrong">{t('merch.quantity')}</Text>
        <QuantityStepper value={qty} onChange={setQty} min={1} max={20} />
      </View>

      <Text variant="small" tone="muted">
        {t('merch.pickupNote')}
      </Text>
    </Screen>
  );
}
