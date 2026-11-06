import { useMemo, useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Button, Chip, MerchImage, PressableScale, Screen, Surface, Text } from '@/components';
import { useCartSummary, useMerchProducts } from '@/hooks/useMerch';
import { useLang } from '@/hooks/useLang';
import type { MerchCategory, MerchProduct } from '@/models';
import { useCart } from '@/store/cart';
import { useTheme } from '@/theme';
import { formatMoney } from '@/utils/format';

type Cat = 'all' | MerchCategory;
const CATS: Cat[] = ['all', 'apparel', 'drinkware', 'accessories', 'car'];

function ProductTile({ product, width }: { product: MerchProduct; width: number }) {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const { colors, spacing, radius } = useTheme();
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  const open = () => router.push({ pathname: '/merch/[id]', params: { id: product.id } });

  const quickAdd = () => {
    // Drabužiams reikia pasirinkti dydį – atidarome prekės kortelę.
    if (product.sizes?.length) {
      open();
      return;
    }
    add(product.id, undefined, 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  // Kortelė ir „+“ mygtukas – atskiri paspaudžiami elementai (ne vienas kitame).
  return (
    <Surface padded={false} style={{ width, overflow: 'hidden' }}>
      <PressableScale accessibilityRole="button" accessibilityLabel={product.name} onPress={open} scaleTo={0.98}>
        <View style={{ padding: 6 }}>
          <MerchImage product={product} style={{ aspectRatio: 1, borderRadius: radius.md }} />
          {product.featured ? (
            <View style={{ position: 'absolute', top: 14, left: 14, backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text variant="caption" style={{ color: colors.onAccent, fontWeight: '800' }}>
                {t('merch.popular')}
              </Text>
            </View>
          ) : null}
        </View>
        <Text variant="bodyStrong" numberOfLines={2} style={{ minHeight: 44, paddingHorizontal: spacing.md, paddingTop: 4 }}>
          {product.name}
        </Text>
      </PressableScale>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingBottom: spacing.md, paddingTop: 6 }}>
        <Text variant="h3">{formatMoney(product.price, lang)}</Text>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={t('merch.addToCart')}
          onPress={quickAdd}
          scaleTo={0.9}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: added ? colors.accent : colors.primary, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name={added ? 'checkmark' : 'add'} size={20} color={added ? colors.onAccent : colors.onPrimary} />
        </PressableScale>
      </View>
    </Surface>
  );
}

/** Atributikos katalogas. */
export default function MerchCatalog() {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const { spacing } = useTheme();
  const { width } = useWindowDimensions();
  const products = useMerchProducts();
  const { count, total } = useCartSummary(products);
  const [cat, setCat] = useState<Cat>('all');

  const items = useMemo(
    () => products.filter((p) => cat === 'all' || p.category === cat).sort((a, b) => Number(!!b.featured) - Number(!!a.featured)),
    [products, cat],
  );
  // Dvi kolonos; naršyklėje plotis ribojamas, kad kortelės neištįstų.
  const tileWidth = (Math.min(width, 520) - spacing.lg * 2 - spacing.md) / 2;

  return (
    <Screen
      footer={
        count ? (
          <Button
            title={t('merch.cartButton', { count, amount: formatMoney(total, lang) })}
            icon="bag-handle"
            size="lg"
            onPress={() => router.push('/merch/cart')}
          />
        ) : undefined
      }
    >
      <Text tone="muted">{t('merch.intro')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: 6 }}
        style={{ marginHorizontal: -spacing.lg, marginVertical: -6 }}
      >
        {CATS.map((c) => (
          <Chip key={c} label={t(`merch.cat.${c}`)} selected={cat === c} onPress={() => setCat(c)} />
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
        {items.map((p) => (
          <ProductTile key={p.id} product={p} width={tileWidth} />
        ))}
      </View>
      <Text variant="caption" tone="muted" center>
        {t('merch.demoNote')}
      </Text>
    </Screen>
  );
}
