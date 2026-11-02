import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button, Logo, Screen, Segmented, Text } from '@/components';
import type { Language } from '@/models';
import { useSettings } from '@/store';
import { brand } from '@/config/theme';
import { useTheme } from '@/theme';

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; key: string }[] = [
  { icon: 'card', key: 'welcome.f1' },
  { icon: 'speedometer', key: 'welcome.f2' },
  { icon: 'pricetags', key: 'welcome.f3' },
  { icon: 'map', key: 'welcome.f4' },
];

export default function Welcome() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const language = useSettings((s) => s.language);
  const setLanguage = useSettings((s) => s.setLanguage);

  return (
    <Screen
      safeTop
      footer={
        <View style={{ gap: spacing.sm }}>
          <Button title={t('welcome.start')} size="lg" onPress={() => router.push('/auth/phone')} />
          <Text variant="caption" tone="muted" center>
            {t('welcome.demoNote')}
          </Text>
        </View>
      }
    >
      <View style={{ alignSelf: 'flex-end', width: 120, marginTop: spacing.lg }}>
        <Segmented<Language>
          value={language}
          onChange={setLanguage}
          options={[
            { value: 'lt', label: 'LT' },
            { value: 'en', label: 'EN' },
          ]}
        />
      </View>
      <View style={{ alignItems: 'center', marginTop: spacing.md, gap: spacing.lg }}>
        <Logo height={72} />
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[brand.yellow, brand.green, brand.red].map((c) => (
            <View key={c} style={{ width: 28, height: 6, borderRadius: 3, backgroundColor: c }} />
          ))}
        </View>
        <Text variant="h1" center>
          {t('welcome.title')}
        </Text>
        <Text tone="muted" center>
          {t('welcome.subtitle')}
        </Text>
      </View>
      <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
        {FEATURES.map((f) => (
          <View key={f.key} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View
              style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name={f.icon} size={22} color={colors.primary} />
            </View>
            <Text variant="bodyStrong" style={{ flex: 1 }}>
              {t(f.key)}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}
