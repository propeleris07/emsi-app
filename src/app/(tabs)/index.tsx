import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  Button,
  CompetitorBanner,
  isPromoToday,
  Logo,
  OfferCard,
  OpenStatus,
  PressableScale,
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
import { outlineIcon } from '@/utils/icons';
import { FUEL_ORDER } from '@/utils/pricing';

function greetingKey(): string {
  const h = new Date().getHours();
  return h < 11 ? 'home.morning' : h < 18 ? 'home.day' : 'home.evening';
}

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radius, shadows, isDark } = useTheme();
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
      {/* Švelnus žalias fonas viršuje su dekoratyviais apskritimais */}
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top + 230, overflow: 'hidden' }}>
        <LinearGradient colors={colors.heroGradient} style={StyleSheet.absoluteFill} />
        <View style={{ position: 'absolute', width: 220, height: 220, borderRadius: 110, right: -70, top: insets.top - 60, backgroundColor: colors.primary, opacity: isDark ? 0.12 : 0.07 }} />
        <View style={{ position: 'absolute', width: 120, height: 120, borderRadius: 60, right: 90, top: insets.top + 110, backgroundColor: colors.accent, opacity: isDark ? 0.08 : 0.12 }} />
      </View>

      {/* Antraštė */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md }}>
        <View style={{ gap: 6 }}>
          <Logo height={34} />
          <Text variant="bodyStrong" tone="muted">
            {t(greetingKey())}
          </Text>
        </View>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={t('card.showCode')}
          onPress={() => router.push('/card-code')}
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: colors.surface,
              borderRadius: radius.pill,
              paddingHorizontal: 16,
              height: 48,
            },
            shadows.sm,
          ]}
        >
          <Ionicons name="qr-code-outline" size={20} color={colors.primary} />
          <Text variant="bodyStrong">{t('home.myCard')}</Text>
        </PressableScale>
      </View>

      {/* Sutaupymų skaitliukas */}
      {card && savings ? (
        <PressableScale onPress={() => router.push('/card')} style={[{ borderRadius: radius.lg, overflow: 'hidden' }, shadows.md]}>
          <LinearGradient
            colors={colors.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="sparkles" size={20} color={colors.onAccent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="caption" style={{ color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                {t('tabs.card')}
              </Text>
              <Text variant="bodyStrong" style={{ color: '#fff' }}>
                {t('card.savedThisYear', { amount: formatMoney(savings.thisYear, lang) })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </LinearGradient>
        </PressableScale>
      ) : null}

      {/* Artimiausia degalinė */}
      {nearest ? (
        <Surface style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
            <View style={{ width: 44, height: 44, borderRadius: radius.sm + 2, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="location-outline" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="caption" tone="primary" style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
                {locationSource === 'device' ? t('home.nearest') : t('home.nearestDefault')}
              </Text>
              <Text variant="h3">{nearest.name}</Text>
              <Text variant="small" tone="muted">
                {nearest.address} · {formatDistance(nearest.distanceKm, lang)}
              </Text>
              <OpenStatus station={nearest} />
            </View>
          </View>
          <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 2 }}>
            {nearestPrices.map((p) => (
              <PriceRow key={p.fuel} price={p} rules={rules} compact />
            ))}
          </View>
          <CompetitorBanner stationId={nearest.id} />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Button
              title={t('stations.navigate')}
              icon="navigate-outline"
              variant="secondary"
              style={{ flex: 1, backgroundColor: colors.primarySoft }}
              onPress={() => openDirections(nearest, t)}
            />
            <Button
              title={t('home.allStations')}
              icon="map-outline"
              variant="secondary"
              style={{ flex: 1, backgroundColor: colors.primarySoft }}
              onPress={() => router.push('/stations')}
            />
          </View>
        </Surface>
      ) : null}

      {/* Pagrindinis veiksmas */}
      <Button title={t('home.payForFuel')} icon="speedometer" size="lg" onPress={() => router.push('/pay')} />

      {/* Greitos nuorodos */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
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
          <Surface
            key={q.href}
            onPress={() => router.push(q.href)}
            style={{ width: '30%', flexGrow: 1, alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg, paddingHorizontal: spacing.sm }}
          >
            <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={outlineIcon(q.icon)} size={22} color={colors.primary} />
            </View>
            <Text variant="small" style={{ fontWeight: '600' }} center numberOfLines={2}>
              {q.label}
            </Text>
          </Surface>
        ))}
      </View>

      {/* Pasiūlymai */}
      {offers.length ? (
        <>
          <SectionHeader title={t('home.activeOffers')} action={t('common.seeAll')} onAction={() => router.push('/offers')} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.md, paddingLeft: spacing.lg, paddingRight: spacing.lg, paddingVertical: spacing.md }}
            style={{ marginHorizontal: -spacing.lg, marginVertical: -spacing.md }}
          >
            {[...offers].sort((a, b) => Number(isPromoToday(b)) - Number(isPromoToday(a))).slice(0, 5).map((o) => (
              <OfferCard key={o.id} offer={o} activated={activated.includes(o.id)} width={256} onPress={() => router.push('/offers')} />
            ))}
          </ScrollView>
        </>
      ) : null}

      {/* Atributika */}
      <PressableScale onPress={() => router.push('/merch')} style={[{ borderRadius: radius.xl, overflow: 'hidden' }, shadows.sm]}>
        <LinearGradient
          colors={colors.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}
        >
          {/* Vėliavos juostų motyvas iš logotipo */}
          <View pointerEvents="none" style={{ position: 'absolute', right: -30, top: -6, transform: [{ rotate: '-18deg' }], opacity: 0.16 }}>
            {[colors.accent, '#ffffff'].map((c) => (
              <View key={c} style={{ width: 180, height: 18, backgroundColor: c, marginBottom: 6, borderRadius: 9 }} />
            ))}
          </View>
          <View style={{ width: 52, height: 52, borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="shirt-outline" size={26} color="#fff" />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="h3" style={{ color: '#fff' }}>
              {t('merch.title')}
            </Text>
            <Text variant="small" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {t('home.merchBody')}
            </Text>
          </View>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="arrow-forward" size={18} color={colors.onAccent} />
          </View>
        </LinearGradient>
      </PressableScale>
    </Screen>
  );
}
