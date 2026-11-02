import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { Divider, ListItem, Screen, Surface, Text } from '@/components';
import { useSession } from '@/store';
import { useTheme } from '@/theme';
import { formatPhone } from '@/utils/format';

export default function MoreTab() {
  const { t } = useTranslation();
  const router = useRouter();
  const { spacing } = useTheme();
  const user = useSession((s) => s.user);

  return (
    <Screen safeTop>
      <Text variant="h1" style={{ marginTop: spacing.md }}>
        {t('more.title')}
      </Text>
      {user ? (
        <Text tone="muted" style={{ marginTop: -spacing.sm }}>
          {formatPhone(user.phone)}
        </Text>
      ) : null}

      <Surface padded={false} style={{ overflow: 'hidden' }}>
        <ListItem icon="water" title={t('carwash.title')} subtitle={t('more.carwashHint')} onPress={() => router.push('/carwash')} />
        <Divider inset={66} />
        <ListItem icon="cafe" title={t('food.title')} subtitle={t('more.foodHint')} onPress={() => router.push('/food')} />
        <Divider inset={66} />
        <ListItem icon="car" title={t('plate.title')} subtitle={t('more.plateHint')} onPress={() => router.push('/plate')} />
      </Surface>

      <Surface padded={false} style={{ overflow: 'hidden' }}>
        <ListItem icon="receipt" title={t('history.title')} subtitle={t('more.historyHint')} onPress={() => router.push('/history')} />
        <Divider inset={66} />
        <ListItem icon="pie-chart" title={t('history.stats')} subtitle={t('more.statsHint')} onPress={() => router.push('/history/stats')} />
      </Surface>

      <Surface padded={false} style={{ overflow: 'hidden' }}>
        <ListItem icon="location" title={t('stations.title')} subtitle={t('more.stationsHint')} onPress={() => router.push('/stations')} />
        <Divider inset={66} />
        <ListItem icon="trending-down" title={t('prices.title')} subtitle={t('more.pricesHint')} onPress={() => router.push('/prices')} />
        <Divider inset={66} />
        <ListItem icon="notifications" title={t('alerts.title')} subtitle={t('more.alertsHint')} onPress={() => router.push('/prices/alerts')} />
      </Surface>

      <Surface padded={false} style={{ overflow: 'hidden' }}>
        <ListItem icon="business" title={t('settings.fleet')} subtitle={t('settings.fleetHint')} onPress={() => router.push('/fleet')} />
        <Divider inset={66} />
        <ListItem icon="settings" title={t('settings.title')} subtitle={t('more.settingsHint')} onPress={() => router.push('/settings')} />
        <Divider inset={66} />
        <ListItem icon="help-circle" title={t('settings.faq')} onPress={() => router.push('/settings/faq')} />
      </Surface>
      <Text variant="caption" tone="muted" center>
        {t('more.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}
      </Text>
    </Screen>
  );
}
