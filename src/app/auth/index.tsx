import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button, Logo, Screen, Segmented, Text } from '@/components';
import { photos } from '@/config/images';
import type { Language } from '@/models';
import { useSettings } from '@/store';
import { brand } from '@/config/theme';
import { useTheme } from '@/theme';

const FEATURES: { icon: keyof typeof MaterialCommunityIcons.glyphMap; key: string }[] = [
  { icon: 'credit-card-outline', key: 'welcome.f1' },
  { icon: 'gas-station-outline', key: 'welcome.f2' },
  { icon: 'ticket-percent-outline', key: 'welcome.f3' },
  { icon: 'map-marker-outline', key: 'welcome.f4' },
];

const HERO_HEIGHT = 380;

export default function Welcome() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radius } = useTheme();
  const language = useSettings((s) => s.language);
  const setLanguage = useSettings((s) => s.setLanguage);

  return (
    <Screen
      padded={false}
      contentStyle={{ gap: 0 }}
      footer={
        <View style={{ gap: spacing.sm }}>
          <Button title={t('welcome.start')} size="lg" onPress={() => router.push('/auth/phone')} />
          <Text variant="caption" tone="muted" center>
            {t('welcome.demoNote')}
          </Text>
        </View>
      }
    >
      {/* Degalinės nuotrauka, pereinanti į žalią */}
      <View style={{ height: insets.top + HERO_HEIGHT, backgroundColor: brand.green, overflow: 'hidden' }}>
        <Image source={photos.station} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
        <LinearGradient colors={['rgba(5,60,30,0.45)', 'rgba(8,120,61,0)', 'rgba(8,120,61,0.75)', brand.green]} locations={[0, 0.35, 0.72, 1]} style={StyleSheet.absoluteFill} />
        <View style={{ paddingTop: insets.top + spacing.lg, paddingHorizontal: spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 8 }}>
            <Logo height={30} />
          </View>
          <View style={{ width: 112 }}>
            <Segmented<Language>
              value={language}
              onChange={setLanguage}
              options={[
                { value: 'lt', label: 'LT' },
                { value: 'en', label: 'EN' },
              ]}
            />
          </View>
        </View>
        <View style={{ position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.lg }}>
          <Text variant="hero" style={{ color: '#fff', fontSize: 34, lineHeight: 37 }}>
            {t('welcome.title')}
          </Text>
        </View>
      </View>

      <View style={{ padding: spacing.lg, gap: spacing.lg }}>
        <Text tone="muted">{t('welcome.subtitle')}</Text>
        <View style={{ gap: spacing.md }}>
          {FEATURES.map((f) => (
            <View key={f.key} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name={f.icon} size={24} color={colors.primary} />
              </View>
              <Text variant="bodyStrong" style={{ flex: 1 }}>
                {t(f.key)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}
