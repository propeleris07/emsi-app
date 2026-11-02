import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { touchTarget } from '@/config/theme';
import { Text } from './Text';

interface Props {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  right?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  destructive?: boolean;
}

export function ListItem({ title, subtitle, icon, iconColor, right, onPress, chevron = !!onPress, destructive }: Props) {
  const { colors, spacing, radius } = useTheme();
  const tint = destructive ? colors.danger : (iconColor ?? colors.primary);
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: touchTarget + 8,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        backgroundColor: pressed ? colors.surfaceAlt : 'transparent',
      })}
    >
      {icon ? (
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: radius.sm,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: destructive ? colors.dangerSoft : colors.primarySoft,
          }}
        >
          <Ionicons name={icon} size={20} color={tint} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong" tone={destructive ? 'danger' : 'default'}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="small" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
      {chevron ? <Ionicons name="chevron-forward" size={20} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

export function Divider({ inset = 0 }: { inset?: number }) {
  const { colors } = useTheme();
  return <View style={{ height: 1, backgroundColor: colors.border, marginLeft: inset }} />;
}
