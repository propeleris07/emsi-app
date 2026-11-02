import { useCallback, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Alert } from '@/utils/alert';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button, Chip, Screen, SectionHeader, SubscriptionCard, Surface, Text } from '@/components';
import { useCardRules } from '@/hooks/useCardRules';
import { useLang } from '@/hooks/useLang';
import type { MenuItem, StampCard } from '@/models';
import { services } from '@/services';
import { useSession } from '@/store';
import { useTheme } from '@/theme';
import { formatMoney } from '@/utils/format';
import { notifyUser } from '@/utils/notify';

type Cat = 'all' | MenuItem['category'];
const CATS: Cat[] = ['all', 'coffee', 'hotfood', 'snack', 'drink'];

function StampCardView({ card, onAdd, onRedeem }: { card: StampCard; onAdd: () => void; onRedeem: () => void }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const left = card.required - card.stamps;
  return (
    <Surface style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="h3">{t('food.stampTitle')}</Text>
        <Text variant="small" tone="muted">
          {t('food.stampRule')}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {Array.from({ length: card.required + 1 }, (_, i) => {
          const isGift = i === card.required;
          const filled = i < card.stamps;
          return (
            <View
              key={i}
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isGift ? colors.accent : filled ? colors.primary : colors.surfaceAlt,
                borderWidth: filled || isGift ? 0 : 2,
                borderColor: colors.border,
                borderStyle: 'dashed',
              }}
            >
              <Ionicons name={isGift ? 'gift' : 'cafe'} size={22} color={isGift ? colors.onAccent : filled ? colors.onPrimary : colors.textMuted} />
            </View>
          );
        })}
      </View>
      {card.freeAvailable > 0 ? (
        <View style={{ gap: spacing.sm }}>
          <Text variant="bodyStrong" tone="primary">
            {t('food.freeReady', { count: card.freeAvailable })}
          </Text>
          <Button title={t('food.showCard')} icon="qr-code" onPress={() => router.push('/card-code')} />
          <Button title={t('food.redeemDemo')} variant="ghost" onPress={onRedeem} />
        </View>
      ) : (
        <Text tone="muted">{t('food.stampsLeft', { count: left })}</Text>
      )}
      <Button title={t('food.addStampDemo')} icon="add-circle" variant="secondary" onPress={onAdd} />
    </Surface>
  );
}

export default function Food() {
  const { t } = useTranslation();
  const lang = useLang();
  const { spacing } = useTheme();
  const rules = useCardRules();
  const userId = useSession((s) => s.user?.id);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [stamps, setStamps] = useState<StampCard | null>(null);
  const [cat, setCat] = useState<Cat>('all');

  useFocusEffect(
    useCallback(() => {
      services.food.getMenu().then(setMenu);
      if (userId) services.food.getStampCard(userId).then(setStamps);
    }, [userId]),
  );

  const items = useMemo(() => menu.filter((m) => cat === 'all' || m.category === cat), [menu, cat]);
  const pct = rules.foodCoffeePct;

  return (
    <Screen>
      {stamps && userId ? (
        <StampCardView
          card={stamps}
          onAdd={async () => {
            const next = await services.food.addStamp(userId);
            setStamps(next);
            if (next.freeAvailable > stamps.freeAvailable) {
              notifyUser('offers', t('notif.freeCoffeeTitle'), t('notif.freeCoffeeBody'), '/food');
            }
          }}
          onRedeem={async () => {
            setStamps(await services.food.redeemFreeCoffee(userId));
            Alert.alert(t('food.redeemedTitle'), t('food.redeemedBody'));
          }}
        />
      ) : null}

      <SubscriptionCard kind="coffee" />

      <SectionHeader title={t('food.menu')} />
      <Text variant="small" tone="muted">
        {t('food.menuNote', { pct })}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }} style={{ marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg }}>
        {CATS.map((c) => (
          <Chip key={c} label={t(`food.cat.${c}`)} selected={cat === c} onPress={() => setCat(c)} />
        ))}
      </ScrollView>
      <Surface padded={false} style={{ overflow: 'hidden' }}>
        {items.map((m, i) => {
          const cardPrice = Math.round(m.price * (100 - pct)) / 100;
          return (
            <View
              key={m.id}
              style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md, borderTopWidth: i ? 1 : 0, borderTopColor: 'rgba(127,127,127,0.15)' }}
            >
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">{m.name}</Text>
                {m.description ? (
                  <Text variant="small" tone="muted">
                    {m.description}
                  </Text>
                ) : null}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text variant="h3">{formatMoney(cardPrice, lang)}</Text>
                {pct ? (
                  <Text variant="caption" tone="muted" style={{ textDecorationLine: 'line-through' }}>
                    {formatMoney(m.price, lang)}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </Surface>
    </Screen>
  );
}
