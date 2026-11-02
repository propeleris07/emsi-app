import { Pressable, View } from 'react-native';
import { Text } from './Text';

interface Props {
  title: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, action, onAction }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: -4 }}>
      <Text variant="h3">{title}</Text>
      {action ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={12}>
          <Text variant="bodyStrong" tone="primary">
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
