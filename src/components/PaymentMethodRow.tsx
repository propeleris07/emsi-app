import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { PaymentMethod } from '@/models';
import { useTheme } from '@/theme';
import { Text } from './Text';

const ICON: Record<PaymentMethod['brand'], keyof typeof Ionicons.glyphMap> = {
  visa: 'card',
  mastercard: 'card',
  applepay: 'logo-apple',
  googlepay: 'logo-google',
};

export function paymentMethodLabel(m: PaymentMethod): string {
  switch (m.brand) {
    case 'applepay':
      return 'Apple Pay';
    case 'googlepay':
      return 'Google Pay';
    case 'visa':
      return `Visa •••• ${m.last4}`;
    case 'mastercard':
      return `Mastercard •••• ${m.last4}`;
  }
}

export function PaymentMethodRow({ method, selected, onPress }: { method: PaymentMethod; selected?: boolean; onPress?: () => void }) {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        minHeight: 60,
        borderRadius: radius.md,
        borderWidth: 2,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: colors.surface,
      }}
    >
      <View style={{ width: 44, height: 30, borderRadius: 6, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={ICON[method.brand]} size={18} color={colors.text} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">{paymentMethodLabel(method)}</Text>
        {method.expiry ? (
          <Text variant="caption" tone="muted">
            {t('payment.expires', { date: method.expiry })}
          </Text>
        ) : null}
      </View>
      <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected ? colors.primary : colors.textMuted} />
    </Pressable>
  );
}
