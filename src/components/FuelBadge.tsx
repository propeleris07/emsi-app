import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { FuelType } from '@/models';
import { FUEL_COLORS } from '@/utils/pricing';
import { Text } from './Text';

export function FuelBadge({ fuel, size = 44 }: { fuel: FuelType; size?: number }) {
  const { t } = useTranslation();
  const label = t(`fuel.short.${fuel}`);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 4,
        backgroundColor: FUEL_COLORS[fuel],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: label.length > 3 ? size * 0.24 : size * 0.36 }}>
        {label}
      </Text>
    </View>
  );
}
