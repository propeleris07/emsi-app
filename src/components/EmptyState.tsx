import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { Text } from './Text';

export function EmptyState({ icon, title, body }: { icon: keyof typeof Ionicons.glyphMap; title: string; body?: string }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ alignItems: 'center', padding: spacing.xxl, gap: spacing.sm }}>
      <Ionicons name={icon} size={48} color={colors.textMuted} />
      <Text variant="h3" center>
        {title}
      </Text>
      {body ? (
        <Text tone="muted" center>
          {body}
        </Text>
      ) : null}
    </View>
  );
}
