import { useEffect, useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button, Chip, FuelBadge, Screen, Surface, Text } from '@/components';
import { useCardRules } from '@/hooks/useCardRules';
import { useFleet } from '@/hooks/useFleet';
import { useLang } from '@/hooks/useLang';
import { useOffers } from '@/hooks/useOffers';
import { useStations } from '@/hooks/useStations';
import type { FuelType, PayMode, Pump } from '@/models';
import { services } from '@/services';
import { FULL_TANK_HOLD_EUR } from '@/config/payments';
import { useCardStore } from '@/store';
import { usePayFlow } from '@/store/payFlow';
import { useTheme } from '@/theme';
import { formatLitres, formatMoney, formatPricePerL } from '@/utils/format';
import { buildFuelQuote, FUEL_ORDER } from '@/utils/pricing';

const PRESETS: Record<Exclude<PayMode, 'full'>, number[]> = {
  amount: [10, 20, 30, 50, 80],
  litres: [10, 20, 30, 40, 50],
};

/** 2 žingsnis: degalų rūšis ir kiekis (suma, litrai arba pilnas bakas). */
export default function PayFuel() {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const { colors, spacing, radius } = useTheme();
  const flow = usePayFlow();
  const personalType = useCardStore((s) => s.card?.type ?? 'general');
  const personalRules = useCardRules();
  const fleet = useFleet();
  const cardType = fleet.active ? 'fleet' : personalType;
  const rules = fleet.active ? services.loyalty.getRules('fleet') : personalRules;
  const { offers, activated } = useOffers();
  const { stations, prices } = useStations();
  const [pump, setPump] = useState<Pump | null>(null);
  const [custom, setCustom] = useState('');

  const station = stations.find((s) => s.id === flow.stationId);

  useEffect(() => {
    if (!flow.stationId) return;
    services.stations.getPumps(flow.stationId).then((list) => setPump(list.find((p) => p.number === flow.pumpNumber) ?? null));
  }, [flow.stationId, flow.pumpNumber]);

  const quotes = useMemo(() => {
    const list = (flow.stationId ? prices[flow.stationId] : undefined) ?? [];
    return (pump?.fuels ?? [])
      .filter((f) => !fleet.active || fleet.account?.limits.allowedFuels.includes(f))
      .slice()
      .sort((a, b) => FUEL_ORDER.indexOf(a) - FUEL_ORDER.indexOf(b))
      .map((fuel) => {
        const p = list.find((x) => x.fuel === fuel);
        return p ? buildFuelQuote({ fuel, pumpPricePerL: p.pricePerL, cardType, rules, offers, activatedOfferIds: activated }) : null;
      })
      .filter((q): q is NonNullable<typeof q> => !!q);
  }, [pump, prices, flow.stationId, cardType, rules, offers, activated, fleet.active, fleet.account]);

  // Pagal nutylėjimą – pirmasis kolonėlės degalų tipas (arba automobilio degalai, jei jų yra).
  const { fuel: selectedFuel, set: setFlow } = flow;
  useEffect(() => {
    if (quotes.length && !quotes.some((q) => q.fuel === selectedFuel)) setFlow({ fuel: quotes[0].fuel });
  }, [quotes, selectedFuel, setFlow]);

  const quote = quotes.find((q) => q.fuel === flow.fuel);
  const value = custom ? Number(custom.replace(',', '.')) || 0 : flow.value;
  const valid = !!quote && (flow.mode === 'full' || (value > 0 && value <= (flow.mode === 'amount' ? 300 : 200)));

  const estimate = !quote
    ? ''
    : flow.mode === 'amount'
      ? t('pay.estimateLitres', { litres: formatLitres(value / quote.finalPricePerL, lang) })
      : flow.mode === 'litres'
        ? t('pay.estimateAmount', { amount: formatMoney(value * quote.finalPricePerL, lang) })
        : t('pay.fullTankHold', { amount: formatMoney(FULL_TANK_HOLD_EUR, lang) });

  const setMode = (mode: PayMode) => {
    setCustom('');
    flow.set({ mode, value: mode === 'amount' ? 30 : mode === 'litres' ? 30 : 0 });
  };

  return (
    <Screen
      footer={
        <Button
          title={t('common.continue')}
          size="lg"
          disabled={!valid}
          onPress={() => {
            flow.set({ value });
            router.push('/pay/confirm');
          }}
        />
      }
    >
      <Stack.Screen options={{ title: t('pay.pumpN', { n: flow.pumpNumber }) }} />
      <View style={{ gap: 4 }}>
        <Text variant="caption" tone="primary" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {t('pay.step', { n: 2, total: 3 })}
        </Text>
        <Text variant="h2">{t('pay.chooseFuel')}</Text>
        <Text variant="small" tone="muted">
          {station?.name}
        </Text>
      </View>

      <View style={{ gap: spacing.sm }}>
        {quotes.map((q) => {
          const selected = q.fuel === flow.fuel;
          return (
            <Pressable
              key={q.fuel}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => flow.set({ fuel: q.fuel as FuelType })}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                padding: spacing.md,
                borderRadius: radius.lg,
                borderWidth: 2,
                borderColor: selected ? colors.primary : colors.border,
                backgroundColor: selected ? colors.primarySoft : colors.surface,
              }}
            >
              <FuelBadge fuel={q.fuel} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">{t(`fuel.long.${q.fuel}`)}</Text>
                <Text variant="caption" tone="muted">
                  {t('pay.atPump')} <Text variant="caption" tone="muted" style={{ textDecorationLine: 'line-through' }}>{formatPricePerL(q.pumpPricePerL, lang)}</Text>
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>{formatPricePerL(q.finalPricePerL, lang)}</Text>
                <Text variant="caption" tone="primary">
                  –{Math.round(q.discountPerL * 100)} ct/l
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text variant="h3">{t('pay.howMuch')}</Text>
      <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 4 }}>
        {(['amount', 'litres', 'full'] as PayMode[]).map((m) => (
          <Pressable
            key={m}
            accessibilityRole="tab"
            accessibilityState={{ selected: flow.mode === m }}
            onPress={() => setMode(m)}
            style={{
              flex: 1,
              height: 44,
              borderRadius: radius.sm,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: flow.mode === m ? colors.surface : 'transparent',
            }}
          >
            <Text variant="bodyStrong" tone={flow.mode === m ? 'default' : 'muted'}>
              {t(`pay.mode.${m}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      {flow.mode === 'full' ? (
        <Surface style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
          <Ionicons name="water" size={28} color={colors.primary} />
          <Text style={{ flex: 1 }}>{t('pay.fullTankInfo')}</Text>
        </Surface>
      ) : (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {PRESETS[flow.mode].map((v) => (
              <Chip
                key={v}
                label={flow.mode === 'amount' ? `${v} €` : `${v} l`}
                selected={!custom && flow.value === v}
                onPress={() => {
                  setCustom('');
                  flow.set({ value: v });
                }}
              />
            ))}
          </View>
          <TextInput
            value={custom}
            onChangeText={(v) => setCustom(v.replace(/[^0-9.,]/g, ''))}
            placeholder={flow.mode === 'amount' ? t('pay.customAmount') : t('pay.customLitres')}
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            style={{
              height: 56,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: custom ? colors.primary : colors.border,
              backgroundColor: colors.surface,
              paddingHorizontal: spacing.lg,
              fontSize: 20,
              color: colors.text,
            }}
          />
        </>
      )}
      {estimate ? (
        <Text tone="muted" center>
          {estimate}
        </Text>
      ) : null}
    </Screen>
  );
}
