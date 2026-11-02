import { Linking, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Divider, ListItem, Screen, Surface, Text } from '@/components';

/** Viešai skelbiama EMSI INFO linija (emsi.lt). */
const INFO_PHONE = '+370 5 215 9780';

export default function Help() {
  const { t } = useTranslation();
  const router = useRouter();
  const items = [
    { icon: 'call' as const, title: t('help.call'), subtitle: INFO_PHONE, onPress: () => Linking.openURL(`tel:${INFO_PHONE.replace(/\s/g, '')}`) },
    { icon: 'globe' as const, title: t('help.website'), subtitle: 'emsi.lt', onPress: () => Linking.openURL('https://www.emsi.lt') },
    { icon: 'open' as const, title: t('fleet.manoEmsi'), subtitle: 'mano.emsi.lt', onPress: () => Linking.openURL('https://mano.emsi.lt') },
    { icon: 'help-circle' as const, title: t('settings.faq'), onPress: () => router.push('/settings/faq') },
  ];
  return (
    <Screen>
      <Text tone="muted">{t('help.intro')}</Text>
      <Surface padded={false} style={{ overflow: 'hidden' }}>
        {items.map((it, i) => (
          <View key={it.title}>
            {i ? <Divider inset={66} /> : null}
            <ListItem icon={it.icon} title={it.title} subtitle={it.subtitle} onPress={it.onPress} />
          </View>
        ))}
      </Surface>
      <Text variant="small" tone="muted">
        {t('help.demo')}
      </Text>
    </Screen>
  );
}
