import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  const { colors, radius } = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 4 }}>
      {options.map((o) => (
        <Pressable
          key={o.value}
          accessibilityRole="tab"
          accessibilityState={{ selected: value === o.value }}
          onPress={() => onChange(o.value)}
          style={{ flex: 1, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: value === o.value ? colors.surface : 'transparent' }}
        >
          <Text variant="small" style={{ fontWeight: '700' }} tone={value === o.value ? 'default' : 'muted'}>
            {o.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
