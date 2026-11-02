import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Receipt } from '@/models';
import { useLang } from '@/hooks/useLang';
import { useTheme } from '@/theme';
import { formatDateTime, formatMoney } from '@/utils/format';
import { Logo } from './Logo';
import { Text } from './Text';

/** Elektroninio kvito vaizdas (popierinio kvito stiliumi). */
export function ReceiptView({ receipt }: { receipt: Receipt }) {
  const { t } = useTranslation();
  const lang = useLang();
  const { colors, spacing, radius } = useTheme();
  const m = (v: number) => formatMoney(v, lang);
  const dashed = { borderBottomWidth: 1, borderStyle: 'dashed' as const, borderColor: colors.border };

  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Logo height={32} />
        <Text variant="small" tone="muted" center>
          {receipt.seller.name}
        </Text>
        <Text variant="caption" tone="muted" center>
          {receipt.station.name}, {receipt.station.address}
        </Text>
        <Text variant="caption" tone="muted" center>
          {t('receipt.number', { n: receipt.number })} · {formatDateTime(receipt.issuedAt, lang)}
        </Text>
      </View>
      <View style={dashed} />
      {receipt.items.map((i, idx) => (
        <View key={idx} style={{ gap: 2 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="bodyStrong" style={{ flex: 1 }}>
              {i.name}
            </Text>
            <Text variant="bodyStrong">{m(i.qty * i.unitPrice)}</Text>
          </View>
          <Text variant="caption" tone="muted">
            {i.qty.toFixed(2).replace('.', lang === 'lt' ? ',' : '.')} {i.unit === 'l' ? 'l' : t('receipt.pcs')} × {i.unitPrice.toFixed(3).replace('.', lang === 'lt' ? ',' : '.')} €
          </Text>
          {i.discount ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="small" tone="primary">
                {t('receipt.discount')}
              </Text>
              <Text variant="small" tone="primary">
                –{m(i.discount)}
              </Text>
            </View>
          ) : null}
        </View>
      ))}
      <View style={dashed} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text tone="muted">{t('receipt.subtotal')}</Text>
        <Text>{m(receipt.subtotal)}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text tone="primary">{t('receipt.savings')}</Text>
        <Text tone="primary">–{m(receipt.discount)}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="h3">{t('receipt.total')}</Text>
        <Text variant="h1">{m(receipt.total)}</Text>
      </View>
      {receipt.vat.map((v) => (
        <View key={v.rate} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="caption" tone="muted">
            {t('receipt.vat', { rate: Math.round(v.rate * 100), base: m(v.base) })}
          </Text>
          <Text variant="caption" tone="muted">
            {m(v.amount)}
          </Text>
        </View>
      ))}
      <View style={dashed} />
      <Text variant="caption" tone="muted" center>
        {receipt.paymentLabel}
      </Text>
      <Text variant="caption" tone="muted" center>
        {t('receipt.demo')}
      </Text>
    </View>
  );
}
