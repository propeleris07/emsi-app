import { useState } from 'react';
import { Linking, TextInput, View } from 'react-native';
import { Alert } from '@/utils/alert';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button, CardCode, Divider, FuelBadge, LimitBar, ListItem, LoyaltyCardVisual, Screen, SectionHeader, Surface, Text } from '@/components';
import { useFleet } from '@/hooks/useFleet';
import { useTheme } from '@/theme';
import { formatPlate } from '@/utils/format';
import fleetJson from '@/data/fleet.json';

const MANO_EMSI_URL = 'https://mano.emsi.lt';

function LinkForm({ onLink }: { onLink: (code: string, pin: string) => Promise<void> }) {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const input = {
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: error ? colors.danger : colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    fontSize: 18,
    color: colors.text,
  };

  return (
    <Screen
      footer={
        <Button
          title={t('fleet.link')}
          size="lg"
          disabled={!code || !pin}
          loading={loading}
          onPress={async () => {
            setLoading(true);
            setError(false);
            try {
              await onLink(code, pin);
            } catch {
              setError(true);
            } finally {
              setLoading(false);
            }
          }}
        />
      }
    >
      <View style={{ alignItems: 'center', gap: spacing.sm, marginVertical: spacing.lg }}>
        <Ionicons name="business" size={56} color={colors.primary} />
        <Text variant="h2" center>
          {t('fleet.linkTitle')}
        </Text>
        <Text tone="muted" center>
          {t('fleet.linkBody')}
        </Text>
      </View>
      <Text variant="bodyStrong">{t('fleet.companyCode')}</Text>
      <TextInput value={code} onChangeText={setCode} keyboardType="number-pad" placeholder="304123456" placeholderTextColor={colors.textMuted} style={input} />
      <Text variant="bodyStrong">{t('fleet.driverPin')}</Text>
      <TextInput value={pin} onChangeText={setPin} keyboardType="number-pad" secureTextEntry placeholder="••••" placeholderTextColor={colors.textMuted} style={input} />
      {error ? <Text tone="danger">{t('fleet.linkError')}</Text> : null}
      <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.md }}>
        <Text variant="small" tone="primary">
          {t('fleet.demoHint', { code: fleetJson.demoCredentials.companyCode, pin: fleetJson.demoCredentials.driverPin })}
        </Text>
      </View>
    </Screen>
  );
}

/** Verslo klientų (Fleet) centras: įmonės kortelė, limitai, automobiliai, ataskaitos. */
export default function FleetHub() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { account, loaded, card, link, unlink, setFleetMode } = useFleet();
  const [showCode, setShowCode] = useState(false);

  if (!loaded) return <Screen>{null}</Screen>;
  if (!account || !card) return <LinkForm onLink={link} />;

  return (
    <Screen
      footer={
        <Button
          title={t('fleet.refuel')}
          icon="speedometer"
          size="lg"
          onPress={() => {
            setFleetMode(true);
            router.navigate('/pay');
          }}
        />
      }
    >
      <View style={{ gap: 2 }}>
        <Text variant="h2">{account.companyName}</Text>
        <Text tone="muted">{t('fleet.driver', { name: account.driverName })}</Text>
      </View>

      <LoyaltyCardVisual card={card} />
      <Button title={showCode ? t('fleet.hideCode') : t('fleet.showCode')} icon="qr-code" variant="secondary" onPress={() => setShowCode((v) => !v)} />
      {showCode ? (
        <Surface>
          <CardCode number={card.number} initialMode="barcode" />
        </Surface>
      ) : null}

      <Surface style={{ gap: spacing.md }}>
        <Text variant="h3">{t('fleet.limits')}</Text>
        <LimitBar label={t('fleet.today')} spent={account.spentToday} limit={account.limits.dailyEur} />
        <LimitBar label={t('fleet.month')} spent={account.spentMonth} limit={account.limits.monthlyEur} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Text variant="small" tone="muted">
            {t('fleet.allowedFuels')}
          </Text>
          {account.limits.allowedFuels.map((f) => (
            <FuelBadge key={f} fuel={f} size={30} />
          ))}
        </View>
        {account.requireOdometer ? (
          <Text variant="small" tone="muted">
            {t('fleet.odometerRequired')}
          </Text>
        ) : null}
      </Surface>

      <SectionHeader title={t('fleet.vehicles')} />
      <Surface padded={false} style={{ overflow: 'hidden' }}>
        {account.vehicles.map((v, i) => (
          <View key={v.id}>
            {i ? <Divider inset={66} /> : null}
            <ListItem
              icon="car"
              title={`${formatPlate(v.plate)} · ${v.nickname}`}
              subtitle={t('fleet.lastOdometer', { km: (v.lastOdometerKm ?? 0).toLocaleString('lt-LT') })}
            />
          </View>
        ))}
      </Surface>

      <Surface padded={false} style={{ overflow: 'hidden' }}>
        <ListItem icon="bar-chart" title={t('fleet.reports')} subtitle={t('fleet.reportsHint')} onPress={() => router.push('/fleet/reports')} />
        <Divider inset={66} />
        <ListItem
          icon="open"
          title={t('fleet.manoEmsi')}
          subtitle={account.manoEmsiLinked ? t('fleet.manoEmsiLinked') : ''}
          onPress={() => Linking.openURL(MANO_EMSI_URL)}
        />
        <Divider inset={66} />
        <ListItem
          icon="unlink"
          title={t('fleet.unlink')}
          destructive
          chevron={false}
          onPress={() =>
            Alert.alert(t('fleet.unlink'), t('fleet.unlinkConfirm'), [
              { text: t('common.cancel'), style: 'cancel' },
              { text: t('fleet.unlink'), style: 'destructive', onPress: unlink },
            ])
          }
        />
      </Surface>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Ionicons name="information-circle" size={18} color={colors.textMuted} />
        <Text variant="small" tone="muted" style={{ flex: 1 }}>
          {t('fleet.note')}
        </Text>
      </View>
    </Screen>
  );
}
