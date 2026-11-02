import { Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Screen, Surface, Text } from '@/components';
import { services } from '@/services';
import { useSession, useSettings } from '@/store';
import type { NotificationKind } from '@/store/settings';
import { useTheme } from '@/theme';

const KINDS: NotificationKind[] = ['priceAlerts', 'receipts', 'offers', 'reminders'];

export default function NotificationSettings() {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const { notifications, setNotification } = useSettings();
  const user = useSession((s) => s.user);
  const setConsents = useSession((s) => s.setConsents);

  const row = (key: string, title: string, desc: string, value: boolean, onChange: (v: boolean) => void, first?: boolean) => (
    <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderTopWidth: first ? 0 : 1, borderTopColor: colors.border }}>
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">{title}</Text>
        <Text variant="small" tone="muted">
          {desc}
        </Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary, false: colors.border }} accessibilityLabel={title} />
    </View>
  );

  return (
    <Screen>
      <Surface padded={false}>
        {KINDS.map((k, i) =>
          row(k, t(`settings.notif.${k}`), t(`settings.notif.${k}Desc`), notifications[k], async (on) => {
            if (on) await services.notifications.requestPermission();
            setNotification(k, on);
          }, i === 0),
        )}
      </Surface>
      {user ? (
        <Surface padded={false}>
          {row('marketing', t('consents.marketing'), t('consents.marketingDesc'), user.consents.marketing, async (on) => {
            const consents = { ...user.consents, marketing: on, acceptedAt: new Date().toISOString() };
            await services.auth.saveConsents(user.id, consents);
            setConsents(consents);
          }, true)}
        </Surface>
      ) : null}
      <Button
        title={t('settings.testNotification')}
        icon="notifications"
        variant="secondary"
        onPress={() => services.notifications.notify(t('settings.testTitle'), t('settings.testBody'))}
      />
    </Screen>
  );
}
