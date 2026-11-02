import { View } from 'react-native';
import { Alert } from '@/utils/alert';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Divider, ListItem, Screen, Segmented, Surface, Text } from '@/components';
import type { Language } from '@/models';
import { resetAllStores, useSession, useSettings } from '@/store';
import type { ThemeMode } from '@/store/settings';
import { useTheme } from '@/theme';
import { formatPhone } from '@/utils/format';
import Constants from 'expo-constants';

export default function Settings() {
  const { t } = useTranslation();
  const router = useRouter();
  const { spacing } = useTheme();
  const user = useSession((s) => s.user);
  const { language, setLanguage, themeMode, setThemeMode } = useSettings();
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  const items: { icon: Parameters<typeof ListItem>[0]['icon']; title: string; subtitle?: string; href: string }[][] = [
    [
      { icon: 'person', title: t('settings.profile'), subtitle: name || (user ? formatPhone(user.phone) : ''), href: '/settings/profile' },
      { icon: 'car', title: t('settings.vehicles'), href: '/plate' },
      { icon: 'card', title: t('settings.payments'), href: '/settings/payments' },
      { icon: 'business', title: t('settings.fleet'), subtitle: t('settings.fleetHint'), href: '/fleet' },
    ],
    [
      { icon: 'notifications', title: t('settings.notifications'), href: '/settings/notifications' },
      { icon: 'shield-checkmark', title: t('settings.privacy'), subtitle: t('settings.privacyHint'), href: '/settings/privacy' },
    ],
    [
      { icon: 'help-circle', title: t('settings.faq'), href: '/settings/faq' },
      { icon: 'chatbubbles', title: t('settings.help'), href: '/settings/help' },
    ],
  ];

  return (
    <Screen>
      {items.map((group, gi) => (
        <Surface key={gi} padded={false} style={{ overflow: 'hidden' }}>
          {group.map((it, i) => (
            <View key={it.href}>
              {i ? <Divider inset={66} /> : null}
              <ListItem icon={it.icon} title={it.title} subtitle={it.subtitle} onPress={() => router.push(it.href as never)} />
            </View>
          ))}
        </Surface>
      ))}

      <Surface style={{ gap: spacing.md }}>
        <Text variant="bodyStrong">{t('settings.language')}</Text>
        <Segmented<Language>
          value={language}
          onChange={setLanguage}
          options={[
            { value: 'lt', label: 'Lietuvių' },
            { value: 'en', label: 'English' },
          ]}
        />
        <Text variant="bodyStrong">{t('more.theme')}</Text>
        <Segmented<ThemeMode>
          value={themeMode}
          onChange={setThemeMode}
          options={(['system', 'light', 'dark'] as const).map((m) => ({ value: m, label: t(`more.theme_${m}`) }))}
        />
      </Surface>

      <Surface padded={false} style={{ overflow: 'hidden' }}>
        <ListItem
          icon="log-out"
          title={t('more.logout')}
          destructive
          chevron={false}
          onPress={() =>
            Alert.alert(t('more.logout'), t('more.logoutConfirm'), [
              { text: t('common.cancel'), style: 'cancel' },
              { text: t('more.logout'), style: 'destructive', onPress: resetAllStores },
            ])
          }
        />
      </Surface>
      <Text variant="caption" tone="muted" center>
        {t('more.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}
      </Text>
    </Screen>
  );
}
