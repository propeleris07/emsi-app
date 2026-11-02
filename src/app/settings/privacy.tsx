import { useState } from 'react';
import { Switch, View } from 'react-native';
import { Alert } from '@/utils/alert';
import { shareText } from '@/utils/share';
import { useTranslation } from 'react-i18next';
import { Button, Screen, Surface, Text } from '@/components';
import type { Consents } from '@/models';
import { services } from '@/services';
import { resetAllStores, useSession } from '@/store';
import { useTheme } from '@/theme';
import { formatDate } from '@/utils/format';
import { useLang } from '@/hooks/useLang';

const OPTIONAL: (keyof Consents)[] = ['marketing', 'personalizedOffers', 'location'];

/** BDAR: sutikimų valdymas, duomenų kopija, paskyros ištrynimas. */
export default function Privacy() {
  const { t } = useTranslation();
  const lang = useLang();
  const { colors, spacing } = useTheme();
  const user = useSession((s) => s.user);
  const setConsents = useSession((s) => s.setConsents);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  const toggle = async (k: keyof Consents, on: boolean) => {
    const consents = { ...user.consents, [k]: on, acceptedAt: new Date().toISOString() };
    await services.auth.saveConsents(user.id, consents);
    setConsents(consents);
  };

  const deleteAccount = () =>
    Alert.alert(t('privacy.deleteTitle'), t('privacy.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('privacy.deleteConfirm'),
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          await services.auth.deleteAccount(user.id);
          resetAllStores();
        },
      },
    ]);

  return (
    <Screen>
      <Surface style={{ gap: 4 }}>
        <Text variant="bodyStrong">{t('privacy.required')}</Text>
        <Text variant="small" tone="muted">
          {t('privacy.acceptedAt', { date: user.consents.acceptedAt ? formatDate(user.consents.acceptedAt, lang) : '—' })}
        </Text>
      </Surface>
      <Surface padded={false}>
        {OPTIONAL.map((k, i) => (
          <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{t(`consents.${k}`)}</Text>
              <Text variant="small" tone="muted">
                {t(`consents.${k}Desc`)}
              </Text>
            </View>
            <Switch value={!!user.consents[k]} onValueChange={(on) => toggle(k, on)} trackColor={{ true: colors.primary, false: colors.border }} />
          </View>
        ))}
      </Surface>
      <Button
        title={t('privacy.export')}
        icon="download"
        variant="secondary"
        loading={exporting}
        onPress={async () => {
          setExporting(true);
          const data = await services.auth.exportData(user.id);
          setExporting(false);
          await shareText(data, t('privacy.export'));
        }}
      />
      <Text variant="small" tone="muted">
        {t('privacy.exportHint')}
      </Text>
      <Button title={t('privacy.delete')} icon="trash" variant="danger" loading={deleting} onPress={deleteAccount} />
      <Text variant="small" tone="muted">
        {t('privacy.deleteHint')}
      </Text>
    </Screen>
  );
}
