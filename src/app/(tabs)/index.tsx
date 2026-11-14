import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import QRCode from 'react-native-qrcode-svg';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import {
  BrandHeader,
  CompetitorBanner,
  Divider,
  FuelBadge,
  isPromoToday,
  Logo,
  OfferCard,
  OpenStatus,
  PressableScale,
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
import { formatDistance, formatMoney, formatPricePerL } from '@/utils/format';
import { cardPrice, FUEL_ORDER } from '@/utils/pricing';

type MciName = keyof typeof MaterialCommunityIcons.glyphMap;

function greetingKey(): string {
  const h = new Date().getHours();
  return h < 11 ? 'home.morning' : h < 18 ? 'home.day' : 'home.evening';
}

/** Kiek kortelė „užlipa“ ant žalios antraštės. */
const CARD_OVERLAP = 64;

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
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

  const quick: { icon: MciName; label: string; href: string }[] = [
    { icon: 'map-marker-outline', label: t('home.stations'), href: '/stations' },
    { icon: 'tag-outline', label: t('home.prices'), href: '/prices' },
    { icon: 'ticket-percent-outline', label: t('tabs.offers'), href: '/offers' },
    { icon: 'car-wash', label: t('home.carwash'), href: '/carwash' },
    { icon: 'coffee-outline', label: t('home.foodShort'), href: '/food' },
    { icon: 'card-text-outline', label: t('home.plateShort'), href: '/plate' },
    { icon: 'bell-ring-outline', label: t('home.alertsShort'), href: '/prices/alerts' },
    { icon: 'tshirt-crew-outline', label: t('home.merchShort'), href: '/merch' },
  ];
  const contentWidth = Math.min(width, 560) - spacing.lg * 2;

  return (
    <Screen padded={false} refreshing={loading} onRefresh={reload} contentStyle={{ gap: 0 }}>
      <BrandHeader
        size="hero"
        height={236}
        title={t(greetingKey()).replace(' ', '\n')}
        top={
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 6 }}>
              <Logo height={22} />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('settings.notifications')}
              onPress={() => router.push('/settings/notifications')}
              hitSlop={8}
              style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.14)' })}
            >
              <MaterialCommunityIcons name="bell-outline" size={22} color="#fff" />
            </Pressable>
          </View>
        }
      />

      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.lg, marginTop: -CARD_OVERLAP }}>
        {/* Nuolaidų kortelė su QR kodu */}
        {card ? (
          <Surface
            elevation="md"
            onPress={() => router.push('/card-code')}
            accessibilityLabel={t('card.showCode')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg }}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <MaterialCommunityIcons name="credit-card-outline" size={24} color={colors.primary} />
                <Text variant="bodyStrong" style={{ fontWeight: '700', flex: 1, fontSize: 15, lineHeight: 19 }} numberOfLines={2}>
                  {t('home.myDiscountCard')}
                </Text>
              </View>
              <Text variant="small" tone="muted" style={{ marginTop: 2, marginLeft: 32 }}>
                {t(`cardType.${card.type}`)}
              </Text>
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.md }} />
              <Text variant="caption" tone="muted">
                {t('home.savedLabel')}
              </Text>
              <Text style={{ fontSize: 24, lineHeight: 30, fontWeight: '800', color: colors.primary, fontVariant: ['tabular-nums'] }}>
                {formatMoney(savings?.thisYear ?? 0, lang)}
              </Text>
            </View>
            <View style={{ alignItems: 'center', gap: 6 }}>
              <View style={{ backgroundColor: '#fff', borderRadius: radius.sm, padding: 6 }}>
                <QRCode value={card.number} size={88} ecl="L" />
              </View>
              <Text variant="caption" tone="primary">
                {t('home.tapToEnlarge')}
              </Text>
            </View>
          </Surface>
        ) : null}

        {/* Pagrindinis veiksmas */}
        <PressableScale
          accessibilityRole="button"
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            router.push('/pay');
          }}
          style={({ pressed }) => [
            { height: 64, borderRadius: radius.md, backgroundColor: pressed ? colors.primaryPressed : colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md },
            shadows.md,
          ]}
        >
          <MaterialCommunityIcons name="gas-station-outline" size={30} color={colors.onPrimary} />
          <Text variant="h2" style={{ color: colors.onPrimary, fontSize: 22 }}>
            {t('home.payForFuel')}
          </Text>
        </PressableScale>

        {/* Greitosios funkcijos – be rėmelių, vienodo stiliaus ikonos */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.lg }}>
          {quick.map((q) => (
            <PressableScale
              key={q.href}
              accessibilityRole="button"
              onPress={() => router.push(q.href as never)}
              scaleTo={0.92}
              style={{ width: contentWidth / 4, alignItems: 'center', gap: 6, paddingVertical: 4 }}
            >
              <MaterialCommunityIcons name={q.icon} size={32} color={colors.text} />
              <Text variant="caption" style={{ fontWeight: '700', fontSize: 12.5 }} center numberOfLines={1}>
                {q.label}
              </Text>
            </PressableScale>
          ))}
        </View>

        {/* Artimiausia degalinė */}
        {nearest ? (
          <Surface padded={false}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(`/stations/${nearest.id}`)}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, opacity: pressed ? 0.7 : 1 })}
            >
              <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="map-marker-outline" size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="caption" tone="primary" style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  {locationSource === 'device' ? t('home.nearest') : t('home.nearestDefault')}
                </Text>
                <Text variant="h3" numberOfLines={1}>
                  {nearest.name}
                </Text>
                <Text variant="small" tone="muted" numberOfLines={1}>
                  {nearest.address} · {formatDistance(nearest.distanceKm, lang)}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.tabInactive} />
            </Pressable>
            <Divider inset={spacing.lg} />
            {/* Kainos su kortele */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, rowGap: spacing.md }}>
              {nearestPrices.map((p) => {
                const withCard = cardPrice(p.pricePerL, p.fuel, rules);
                return (
                  <View key={p.fuel} style={{ width: '50%', flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <FuelBadge fuel={p.fuel} size={36} />
                    <View>
                      <Text variant="price" style={{ fontSize: 22, lineHeight: 26 }}>
                        {formatPricePerL(withCard, lang)}
                      </Text>
                      {withCard < p.pricePerL ? (
                        <Text variant="caption" tone="muted" style={{ textDecorationLine: 'line-through', fontWeight: '500' }}>
                          {formatPricePerL(p.pricePerL, lang)}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <OpenStatus station={nearest} />
                <Text variant="caption" tone="muted">
                  {t('home.pricesWithCard')}
                </Text>
              </View>
              <CompetitorBanner stationId={nearest.id} />
            </View>
            <Divider />
            <View style={{ flexDirection: 'row' }}>
              {(
                [
                  { icon: 'navigation-variant-outline', label: t('stations.navigate'), onPress: () => openDirections(nearest, t) },
                  { icon: 'map-outline', label: t('home.allStations'), onPress: () => router.push('/stations') },
                ] as const
              ).map((a, i) => (
                <Pressable
                  key={a.icon}
                  accessibilityRole="button"
                  onPress={a.onPress}
                  style={({ pressed }) => ({
                    flex: 1,
                    height: 52,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing.sm,
                    borderLeftWidth: i ? 1 : 0,
                    borderLeftColor: colors.border,
                    backgroundColor: pressed ? colors.surfaceAlt : 'transparent',
                    borderBottomLeftRadius: i ? 0 : radius.lg,
                    borderBottomRightRadius: i ? radius.lg : 0,
                  })}
                >
                  <MaterialCommunityIcons name={a.icon} size={20} color={colors.primary} />
                  <Text variant="bodyStrong" tone="primary" style={{ fontWeight: '700' }}>
                    {a.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Surface>
        ) : null}

        {/* Kavos akcija: geltona plokštuma su įstrižu kirpimu ir nuotrauka */}
        <PressableScale onPress={() => router.push('/food')} accessibilityRole="button" scaleTo={0.98} style={[{ height: 148, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: brand.yellow }, shadows.sm]}>
          <Image source={photos.promoCoffee} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '64%' }} contentFit="cover" contentPosition="right" transition={250} />
          <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
            <Path d="M0 0 L62 0 L42 100 L0 100 Z" fill={brand.yellow} />
          </Svg>
          <View style={{ flex: 1, justifyContent: 'center', paddingLeft: spacing.lg, width: '52%', gap: 4 }}>
            <Text variant="h1" style={{ color: brand.ink, fontSize: 25, lineHeight: 27 }}>
              {t('home.coffeePromoTitle')}
            </Text>
            <Text variant="caption" style={{ color: brand.ink, fontWeight: '600' }}>
              {t('home.coffeePromoBody')}
            </Text>
          </View>
        </PressableScale>

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
