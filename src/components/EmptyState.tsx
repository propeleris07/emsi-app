import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { outlineIcon } from '@/utils/icons';
import { Text } from './Text';

export function EmptyState({ icon, title, body }: { icon: keyof typeof Ionicons.glyphMap; title: string; body?: string }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ alignItems: 'center', padding: spacing.xxl, gap: spacing.sm }}>
      <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }}>
        <Ionicons name={outlineIcon(icon)} size={40} color={colors.primary} />
      </View>
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
