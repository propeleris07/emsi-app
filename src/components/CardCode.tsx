import { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme';
import { groupCardNumber } from '@/utils/format';
import { Barcode } from './Barcode';
import { Chip } from './Chip';
import { Text } from './Text';

interface Props {
  number: string;
  initialMode?: 'qr' | 'barcode';
}

/** Kortelės kodas skenavimui prie kasos: QR arba brūkšninis kodas. */
export function CardCode({ number, initialMode = 'qr' }: Props) {
  const { t } = useTranslation();
  const { colors, radius, spacing } = useTheme();
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState(initialMode);
  const codeWidth = Math.min(width - 96, 320);

  return (
    <View style={{ alignItems: 'center', gap: spacing.md }}>
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: radius.lg,
          padding: spacing.xl,
          alignItems: 'center',
          gap: spacing.sm,
          minHeight: codeWidth * 0.7 + 60,
          justifyContent: 'center',
        }}
      >
        {/* Skenavimo rėmelio kampai */}
        {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
          <View
            key={c}
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: 26,
              height: 26,
              borderColor: colors.primary,
              ...(c[0] === 't' ? { top: 6, borderTopWidth: 3 } : { bottom: 6, borderBottomWidth: 3 }),
              ...(c[1] === 'l' ? { left: 6, borderLeftWidth: 3 } : { right: 6, borderRightWidth: 3 }),
              ...(c === 'tl' && { borderTopLeftRadius: 10 }),
              ...(c === 'tr' && { borderTopRightRadius: 10 }),
              ...(c === 'bl' && { borderBottomLeftRadius: 10 }),
              ...(c === 'br' && { borderBottomRightRadius: 10 }),
            }}
          />
        ))}
        {mode === 'qr' ? (
          <QRCode value={number} size={codeWidth * 0.7} ecl="M" />
        ) : (
          <Barcode value={number} width={codeWidth} height={codeWidth * 0.38} />
        )}
        <Text style={{ color: '#111', letterSpacing: 2, fontWeight: '600', fontVariant: ['tabular-nums'] }}>
          {groupCardNumber(number)}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Chip label={t('card.qr')} icon="qr-code" selected={mode === 'qr'} onPress={() => setMode('qr')} />
        <Chip label={t('card.barcode')} icon="barcode" selected={mode === 'barcode'} onPress={() => setMode('barcode')} />
      </View>
    </View>
  );
}
