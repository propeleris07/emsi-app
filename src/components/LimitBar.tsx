import { View } from 'react-native';
import { useLang } from '@/hooks/useLang';
import { useTheme } from '@/theme';
import { formatMoney } from '@/utils/format';
import { Text } from './Text';

/** Išnaudoto limito juosta (dienos / mėnesio). */
export function LimitBar({ label, spent, limit }: { label: string; spent: number; limit: number }) {
  const lang = useLang();
  const { colors, radius } = useTheme();
  const share = Math.min(1, limit ? spent / limit : 0);
  const color = share > 0.9 ? colors.danger : share > 0.7 ? colors.warning : colors.primary;
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="small" tone="muted">
          {label}
        </Text>
        <Text variant="small" style={{ fontWeight: '700' }}>
          {formatMoney(spent, lang)} / {formatMoney(limit, lang)}
        </Text>
      </View>
      <View style={{ height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}>
        <View style={{ width: `${share * 100}%`, height: '100%', backgroundColor: color }} />
      </View>
    </View>
  );
}
