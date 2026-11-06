import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { outlineIcon } from '@/utils/icons';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function Chip({ label, selected, onPress, icon }: Props) {
  const { colors, radius, shadows, isDark } = useTheme();
  const fg = selected ? colors.onPrimary : colors.text;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      scaleTo={0.95}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          minHeight: 40,
          paddingHorizontal: 14,
          borderRadius: radius.pill,
          backgroundColor: selected ? colors.primary : colors.surface,
          borderWidth: 1,
          borderColor: selected ? colors.primary : isDark ? colors.border : 'transparent',
        },
        !selected && shadows.sm,
      ]}
    >
      {icon ? <Ionicons name={selected ? icon : outlineIcon(icon)} size={16} color={selected ? fg : colors.primary} /> : null}
      <Text variant="small" style={{ color: fg, fontWeight: '600' }}>
        {label}
      </Text>
    </PressableScale>
  );
}
