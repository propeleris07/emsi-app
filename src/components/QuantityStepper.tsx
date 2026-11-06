import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme';
import { Text } from './Text';

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

/** Kiekio parinkiklis „– 1 +“. */
export function QuantityStepper({ value, onChange, min = 0, max = 20 }: Props) {
  const { t } = useTranslation();
  const { colors, radius } = useTheme();
  const btn = (icon: 'remove' | 'add', next: number, disabled: boolean, label: string) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => onChange(next)}
      hitSlop={6}
      style={({ pressed }) => ({
        width: 36,
        height: 36,
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: pressed ? colors.primarySoft : colors.surface,
        opacity: disabled ? 0.4 : 1,
      })}
    >
      <Ionicons name={icon} size={18} color={colors.primary} />
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 3 }}>
      {btn('remove', value - 1, value <= min, t('merch.less'))}
      <Text variant="bodyStrong" style={{ minWidth: 24, textAlign: 'center', fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
      {btn('add', value + 1, value >= max, t('merch.more'))}
    </View>
  );
}
