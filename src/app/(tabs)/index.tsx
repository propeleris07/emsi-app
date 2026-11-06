import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import Svg, { Path } from 'react-native-svg';
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
import { brand } from '@/config/theme';
import { photos } from '@/config/images';
import { useCardRules } from '@/hooks/useCardRules';
import { useLang } from '@/hooks/useLang';
import { useStations } from '@/hooks/useStations';
import { useOffers } from '@/hooks/useOffers';
import { useSavings } from '@/hooks/useSavings';
import { useCardStore } from '@/store';
import { useTheme } from '@/theme';
import { openDirections } from '@/utils/directions';
import { formatDistance, formatMoney } from '@/utils/format';
import type { IconName } from '@/utils/icons';
import { FUEL_ORDER } from '@/utils/pricing';

function greetingKey(): string {
  const h = new Date().getHours();
  return h < 11 ? 'home.morning' : h < 18 ? 'home.day' : 'home.evening';
}

const HERO_HEIGHT = 290;

/** Geltonos „bangos“ dekoracija kortelės kampe. */
function YellowSwoosh({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 200 100" preserveAspectRatio="none" style={{ position: 'absolute', right: 0, bottom: 0 }}>
      <Path d="M200 18 C150 40 95 70 40 100 L200 100 Z" fill={brand.yellow} opacity={0.22} />
      <Path d="M200 52 C165 66 130 84 96 100 L200 100 Z" fill={brand.yellow} opacity={0.55} />
    </Svg>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors, spacing, radius, shadows } = useTheme();
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

  const quick: { icon: IconName; title: string; sub: string; href: string }[] = [
    { icon: 'location', title: t('home.quick.stations'), sub: t('home.quick.stationsSub'), href: '/stations' },
    { icon: 'pricetag', title: t('home.quick.prices'), sub: t('home.quick.pricesSub'), href: '/prices' },
    { icon: 'gift', title: t('home.quick.offers'), sub: t('home.quick.offersSub'), href: '/offers' },
    { icon: 'card', title: t('home.quick.card'), sub: t('home.quick.cardSub'), href: '/card' },
    { icon: 'water', title: t('home.quick.carwash'), sub: t('home.quick.carwashSub'), href: '/carwash' },
    { icon: 'car', title: t('home.quick.plate'), sub: t('home.quick.plateSub'), href: '/plate' },
    { icon: 'notifications', title: t('home.quick.alerts'), sub: t('home.quick.alertsSub'), href: '/prices/alerts' },
    { icon: 'shirt', title: t('home.quick.merch'), sub: t('home.quick.merchSub'), href: '/merch' },
  ];
  const tileWidth = (Math.min(width, 520) - spacing.lg * 2 - spacing.sm * 3) / 4;

  return (
    <Screen padded={false} refreshing={loading} onRefresh={reload}>
      {/* Žalia antraštė su degalinės nuotrauka ir banguotu kraštu */}
      <View style={{ height: insets.top + HERO_HEIGHT, overflow: 'hidden' }}>
        <LinearGradient colors={['#0B8C48', brand.green, '#05592D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '68%' }}>
          <Image source={photos.station} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
          {/* Nuotrauka švelniai susilieja su žalia spalva kairėje */}
          <LinearGradient
            colors={[brand.green, 'rgba(8,120,61,0.55)', 'rgba(8,120,61,0)']}
            locations={[0, 0.4, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
        <Svg width="100%" height={56} viewBox="0 0 400 56" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
          <Path d="M0 56 L0 30 C120 62 260 -6 400 22 L400 56 Z" fill={colors.background} />
        </Svg>
        <View style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg, gap: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={[{ backgroundColor: '#fff', borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 8 }, shadows.sm]}>
              <Logo height={26} />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('settings.notifications')}
              onPress={() => router.push('/settings/notifications')}
              hitSlop={8}
              style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.14)' })}
            >
              <Ionicons name="notifications-outline" size={22} color="#fff" />
            </Pressable>
          </View>
          <Text variant="h1" style={{ color: '#fff', marginTop: spacing.sm, maxWidth: '62%' }}>
            {t(greetingKey())}
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.lg, marginTop: -72 }}>
        {/* Nuolaidų kortelė su QR kodu */}
        {card ? (
          <PressableScale onPress={() => router.push('/card-code')} accessibilityRole="button" accessibilityLabel={t('card.showCode')} scaleTo={0.98}>
            <Surface elevation="md" style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, overflow: 'hidden', paddingVertical: spacing.lg }}>
              <YellowSwoosh width={180} height={70} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="small" tone="primary" style={{ fontWeight: '700' }}>
                  {t('home.myDiscountCard')}
                </Text>
                <Text variant="h2" style={{ fontStyle: 'italic', fontWeight: '800' }}>
                  {t(`cardType.${card.type}`)}
                </Text>
                {savings ? (
                  <Text variant="small" tone="muted">
                    {t('home.savedShort', { amount: formatMoney(savings.thisYear, lang) })}
                  </Text>
                ) : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Ionicons name="qr-code-outline" size={14} color={colors.primary} />
                  <Text variant="small" tone="primary" style={{ fontWeight: '600' }}>
                    {t('card.showCode')}
                  </Text>
                </View>
              </View>
              <View style={[{ backgroundColor: '#fff', borderRadius: radius.md, padding: 8 }, shadows.sm]}>
                <QRCode value={card.number} size={64} ecl="L" />
              </View>
            </Surface>
          </PressableScale>
        ) : null}

        {/* Pagrindinis veiksmas */}
        <Button title={t('home.payForFuel')} icon="speedometer" size="lg" onPress={() => router.push('/pay')} />

        {/* Greitosios funkcijos */}
        <SectionHeader title={t('home.quickTitle')} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {quick.map((q) => (
            <Surface
              key={q.href}
              onPress={() => router.push(q.href as never)}
              style={{ width: tileWidth, alignItems: 'center', gap: 6, paddingVertical: spacing.md, paddingHorizontal: 4, borderRadius: radius.md }}
            >
              <Ionicons name={q.icon} size={28} color={colors.primary} />
              <View style={{ alignItems: 'center' }}>
                <Text variant="caption" style={{ fontWeight: '700', fontSize: 12.5 }} center numberOfLines={1}>
                  {q.title}
                </Text>
                <Text variant="caption" tone="muted" style={{ fontWeight: '500', fontSize: 11.5 }} center numberOfLines={1}>
                  {q.sub}
                </Text>
              </View>
            </Surface>
          ))}
        </View>

        {/* Geltona kavos akcija */}
        <PressableScale onPress={() => router.push('/food')} accessibilityRole="button" scaleTo={0.98} style={[{ borderRadius: radius.xl, overflow: 'hidden' }, shadows.md]}>
          <LinearGradient colors={['#FFE36B', brand.yellow]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ minHeight: 150, flexDirection: 'row' }}>
            <Svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
              <Path d="M150 150 C190 110 240 120 300 70 L300 150 Z" fill={brand.green} opacity={0.9} />
              <Path d="M120 150 C170 125 230 135 300 100 L300 150 Z" fill="#0B8C48" opacity={0.5} />
            </Svg>
            <View style={{ flex: 1, padding: spacing.lg, justifyContent: 'center', gap: 4 }}>
              <Text style={{ fontSize: 26, lineHeight: 30, fontWeight: '800', color: brand.green, letterSpacing: -0.5 }}>{t('home.coffeePromoTitle')}</Text>
              <Text variant="small" style={{ color: brand.ink }}>
                {t('home.coffeePromoBody')}
              </Text>
            </View>
            <View style={{ width: '42%', justifyContent: 'center', paddingRight: spacing.md }}>
              <Image source={photos.coffeeToGo} style={{ width: '100%', aspectRatio: 1, borderRadius: radius.lg, borderWidth: 3, borderColor: '#fff' }} contentFit="cover" />
            </View>
            <View style={[{ position: 'absolute', right: 12, bottom: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: brand.yellow, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' }, shadows.sm]}>
              <Ionicons name="chevron-forward" size={20} color={brand.ink} />
            </View>
          </LinearGradient>
        </PressableScale>

        {/* Artimiausia degalinė */}
        {nearest ? (
          <Surface style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
              <View style={{ width: 44, height: 44, borderRadius: radius.sm + 2, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="location" size={22} color={colors.primary} />
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
      </View>
    </Screen>
  );
}
