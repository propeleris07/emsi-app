import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Chip, Divider, Screen, SectionHeader, Surface, Text, TransactionRow } from '@/components';
import { useFleet } from '@/hooks/useFleet';
import { useLang } from '@/hooks/useLang';
import type { FleetReport } from '@/models';
import { services } from '@/services';
import { useSession } from '@/store';
import { useTheme } from '@/theme';
import { exportFleetReportPdf, fleetReportText } from '@/utils/fleetReport';
import { shareText } from '@/utils/share';
import { formatLitres, formatMoney, formatPlate } from '@/utils/format';
import { lastMonthKeys, monthTitle } from '@/utils/months';

/** Ataskaitos įmonės vadovui: išlaidos ir sąnaudos pagal automobilius. */
export default function FleetReports() {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const { colors, spacing } = useTheme();
  const userId = useSession((s) => s.user?.id);
  const { account } = useFleet();
  const months = lastMonthKeys(2).reverse();
  const [month, setMonth] = useState(months[0]);
  const [loaded, setLoaded] = useState<FleetReport | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!userId) return;
    services.fleet.report(userId, month).then(setLoaded);
  }, [userId, month]);
  const report = loaded?.month === month ? loaded : null;

  if (!account) return null;

  return (
    <Screen
      footer={
        report ? (
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Button
              title={t('fleet.sendToManager')}
              icon="share-outline"
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() => shareText(fleetReportText(account, report, lang, t('fleet.reports')))}
            />
            <Button
              title="PDF"
              icon="document-text"
              style={{ flex: 1 }}
              loading={exporting}
              onPress={async () => {
                setExporting(true);
                try {
                  await exportFleetReportPdf(account, report, lang, t('fleet.reports'));
                } finally {
                  setExporting(false);
                }
              }}
            />
          </View>
        ) : undefined
      }
    >
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {months.map((m) => (
          <Chip key={m} label={monthTitle(m, lang)} selected={m === month} onPress={() => setMonth(m)} />
        ))}
      </View>
      {!report ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {[
              [t('fleet.total'), formatMoney(report.total, lang)],
              [t('stats.litres'), formatLitres(report.litres, lang)],
              [t('fleet.saved'), formatMoney(report.saved, lang)],
            ].map(([label, value]) => (
              <Surface key={label} style={{ flex: 1, gap: 2, padding: spacing.md }}>
                <Text variant="caption" tone="muted">
                  {label}
                </Text>
                <Text variant="bodyStrong">{value}</Text>
              </Surface>
            ))}
          </View>

          <SectionHeader title={t('fleet.byVehicle')} />
          {report.byVehicle.map((v) => (
            <Surface key={v.vehicle.id} style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="bodyStrong">
                  {formatPlate(v.vehicle.plate)} · {v.vehicle.nickname}
                </Text>
                <Text variant="bodyStrong">{formatMoney(v.amount, lang)}</Text>
              </View>
              <Text variant="small" tone="muted">
                {t('fleet.vehicleLine', {
                  fills: v.fills,
                  litres: v.litres.toFixed(1),
                  km: v.distanceKm.toLocaleString('lt-LT'),
                  avg: v.avgL100 !== undefined ? v.avgL100.toFixed(1) : '–',
                })}
              </Text>
            </Surface>
          ))}

          <SectionHeader title={t('fleet.fills')} />
          <Surface padded={false} style={{ overflow: 'hidden' }}>
            {report.transactions.map((tx, i) => (
              <View key={tx.id}>
                {i ? <Divider inset={72} /> : null}
                <TransactionRow tx={tx} onPress={() => router.push({ pathname: '/receipt/[id]', params: { id: tx.id } })} />
              </View>
            ))}
            {report.transactions.length === 0 ? (
              <Text tone="muted" style={{ padding: spacing.lg }}>
                {t('stats.noData')}
              </Text>
            ) : null}
          </Surface>
        </>
      )}
    </Screen>
  );
}
