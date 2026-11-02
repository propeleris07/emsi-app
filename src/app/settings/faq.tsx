import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Screen, Surface, Text } from '@/components';
import { useTheme } from '@/theme';

const KEYS = ['card', 'wallet', 'pay', 'hold', 'plate', 'wash', 'stamps', 'fleet', 'data'];

export default function Faq() {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const [open, setOpen] = useState<string | null>(KEYS[0]);
  return (
    <Screen>
      <Surface padded={false} style={{ overflow: 'hidden' }}>
        {KEYS.map((k, i) => {
          const isOpen = open === k;
          return (
            <View key={k} style={{ borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
                onPress={() => setOpen(isOpen ? null : k)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, minHeight: 56 }}
              >
                <Text variant="bodyStrong" style={{ flex: 1 }}>
                  {t(`faq.${k}.q`)}
                </Text>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
              </Pressable>
              {isOpen ? (
                <Text tone="muted" style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
                  {t(`faq.${k}.a`)}
                </Text>
              ) : null}
            </View>
          );
        })}
      </Surface>
    </Screen>
  );
}
