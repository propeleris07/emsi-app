import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  Button,
  CompetitorBanner,
  isPromoToday,
  Logo,
  OfferCard,
  OpenStatus,
  PriceRow,
  Screen,
  SectionHeader,
  Surface,
  Text,
} from '@/components';
import { useCardRules } from '@/hooks/useCardRules';
import { useLang } from '@/hooks/useLang';
import { useStations } from '@/hooks/useStations';
import { useOffers } from '@/hooks/useOffers';
import { useSavings } from '@/hooks/useSavings';
import { useCardStore } from '@/store';
import { useTheme } from '@/theme';
import { openDirections } from '@/utils/directions';
import { formatDistance, formatMoney } from '@/utils/format';
import { FUEL_ORDER } from '@/utils/pricing';

function greetingKey(): string {
  const h = new Date().getHours();
  return h < 11 ? 'home.morning' : h < 18 ? 'home.day' : 'home.evening';
}

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const { colors, spacing, radius } = useTheme();
  const card = useCardStore((s) => s.card);
  const rules = useCardRules();
  const { nearest, prices, loading, reload, locationSource } = useStations();
  const { offers, activated } = useOffers();
  const savings = useSavings();

  const nearestPrices = nearest
    ? (prices[nearest.id] ?? [])
        .filter((p) => p.fuel !== 'ADBLUE')
        .sort((a, b) => FUEL_ORDER.indexOf(a.fuel) - FUEL_ORDER.indexOf(b.fuel))
    : [];

  return (
    <Screen safeTop refreshing={loading} onRefresh={reload}>
      {/* Antraštė */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md }}>
        <View style={{ gap: 4 }}>
          <Logo height={34} />
          <Text tone="muted">{t(greetingKey())}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('card.showCode')}
          onPress={() => router.push('/card-code')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.pill,
            paddingHorizontal: 14,
            height: 48,
          }}
        >
          <Ionicons name="qr-code" size={22} color={colors.primary} />
          <Text variant="bodyStrong">{t('home.myCard')}</Text>
        </Pressable>
      </View>

      {/* Sutaupymų skaitliukas */}
      {card && savings ? (
        <Pressable onPress={() => router.push('/card')} style={{ backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Ionicons name="sparkles" size={20} color={colors.primary} />
          <Text variant="bodyStrong" tone="primary" style={{ flex: 1 }}>
            {t('card.savedThisYear', { amount: formatMoney(savings.thisYear, lang) })}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </Pressable>
      ) : null}

      {/* Artimiausia degalinė */}
      {nearest ? (
        <Surface style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="caption" tone="primary" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {locationSource === 'device' ? t('home.nearest') : t('home.nearestDefault')}
              </Text>
              <Text variant="h3">{nearest.name}</Text>
              <Text variant="small" tone="muted">
                {nearest.address} · {formatDistance(nearest.distanceKm, lang)}
              </Text>
              <OpenStatus station={nearest} />
            </View>
          </View>
          <View>
            {nearestPrices.map((p) => (
              <PriceRow key={p.fuel} price={p} rules={rules} compact />
            ))}
          </View>
          <CompetitorBanner stationId={nearest.id} />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Button
              title={t('stations.navigate')}
              icon="navigate"
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() => openDirections(nearest, t)}
            />
            <Button
              title={t('home.allStations')}
              icon="map"
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() => router.push('/stations')}
            />
          </View>
        </Surface>
      ) : null}

      {/* Pagrindinis veiksmas */}
      <Button title={t('home.payForFuel')} icon="speedometer" size="lg" onPress={() => router.push('/pay')} />

      {/* Greitos nuorodos */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {(
          [
            { icon: 'trending-down', label: t('home.prices'), href: '/prices' },
            { icon: 'location', label: t('home.stations'), href: '/stations' },
            { icon: 'water', label: t('home.carwash'), href: '/carwash' },
            { icon: 'cafe', label: t('home.food'), href: '/food' },
            { icon: 'car', label: t('home.plate'), href: '/plate' },
            { icon: 'notifications', label: t('home.alerts'), href: '/prices/alerts' },
          ] as const
        ).map((q) => (
          <Surface key={q.href} onPress={() => router.push(q.href)} style={{ width: '31.5%', flexGrow: 1, alignItems: 'center', gap: 6, paddingVertical: spacing.lg }}>
            <Ionicons name={q.icon} size={26} color={colors.primary} />
            <Text variant="small" style={{ fontWeight: '600' }} center>
              {q.label}
            </Text>
          </Surface>
        ))}
      </View>

      {/* Pasiūlymai */}
      {offers.length ? (
        <>
          <SectionHeader title={t('home.activeOffers')} action={t('common.seeAll')} onAction={() => router.push('/offers')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md, paddingRight: spacing.lg }} style={{ marginHorizontal: -spacing.lg, paddingLeft: spacing.lg }}>
            {[...offers].sort((a, b) => Number(isPromoToday(b)) - Number(isPromoToday(a))).slice(0, 5).map((o) => (
              <OfferCard key={o.id} offer={o} activated={activated.includes(o.id)} width={240} onPress={() => router.push('/offers')} />
            ))}
          </ScrollView>
        </>
      ) : null}
    </Screen>
  );
}
