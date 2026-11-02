import { Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { CardType, DiscountRules } from '@/models';
import { services } from '@/services';
import { useTheme } from '@/theme';
import { Chip } from './Chip';
import { Text } from './Text';

export type SelectableCardType = Exclude<CardType, 'fleet'>;

export interface CardTypeForm {
  type: SelectableCardType;
  proofKind: 'LSP' | 'ISIC';
  proofNumber: string;
  farmerCode: string;
}

export const initialCardTypeForm: CardTypeForm = { type: 'general', proofKind: 'LSP', proofNumber: '', farmerCode: '' };

export function isCardTypeFormValid(f: CardTypeForm): boolean {
  if (f.type === 'student') return f.proofNumber.replace(/\s/g, '').length >= 6;
  if (f.type === 'farmer') return f.farmerCode.replace(/\s/g, '').length >= 5;
  return true;
}

export function cardTypeFormToInput(f: CardTypeForm) {
  return {
    type: f.type,
    proof:
      f.type === 'student'
        ? { kind: f.proofKind, number: f.proofNumber.trim(), validUntil: `${new Date().getFullYear() + 1}-09-30` }
        : undefined,
    farmerCode: f.type === 'farmer' ? f.farmerCode.trim() : undefined,
  };
}

/** Nuolaidų aprašymas iš taisyklių, pvz. „–3 ct/l degalams · –10 % kavai ir maistui“. */
export function useDescribeRules() {
  const { t } = useTranslation();
  return (rules: DiscountRules): string[] => {
    const fuel = rules.fuelCtPerL;
    const lines: string[] = [];
    if (fuel['95'] && fuel['95'] === fuel.D) lines.push(t('rules.fuel', { ct: fuel['95'] }));
    else {
      if (fuel['95']) lines.push(t('rules.petrol', { ct: fuel['95'] }));
      if (fuel.D) lines.push(t('rules.diesel', { ct: fuel.D }));
    }
    if (fuel.LPG) lines.push(t('rules.lpg', { ct: fuel.LPG }));
    if (fuel.ADBLUE) lines.push(t('rules.adblue', { ct: fuel.ADBLUE }));
    if (rules.goodsPct) lines.push(t('rules.goods', { pct: rules.goodsPct }));
    if (rules.foodCoffeePct) lines.push(t('rules.food', { pct: rules.foodCoffeePct }));
    return lines;
  };
}

const OPTIONS: { type: SelectableCardType; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: 'general', icon: 'card' },
  { type: 'student', icon: 'school' },
  { type: 'farmer', icon: 'leaf' },
];

export function CardTypePicker({ value, onChange }: { value: CardTypeForm; onChange: (f: CardTypeForm) => void }) {
  const { t } = useTranslation();
  const { colors, radius, spacing } = useTheme();
  const describe = useDescribeRules();

  const inputStyle = {
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    fontSize: 18,
    color: colors.text,
  };

  return (
    <View style={{ gap: spacing.md }}>
      {OPTIONS.map((o) => {
        const selected = value.type === o.type;
        return (
          <Pressable
            key={o.type}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange({ ...value, type: o.type })}
            style={{
              borderRadius: radius.lg,
              borderWidth: 2,
              borderColor: selected ? colors.primary : colors.border,
              backgroundColor: selected ? colors.primarySoft : colors.surface,
              padding: spacing.lg,
              gap: spacing.sm,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Ionicons name={o.icon} size={24} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text variant="h3">{t(`cardType.${o.type}`)}</Text>
                <Text variant="small" tone="muted">
                  {t(`cardType.${o.type}Hint`)}
                </Text>
              </View>
              <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={24} color={selected ? colors.primary : colors.textMuted} />
            </View>
            {selected ? (
              <View style={{ gap: 2, paddingLeft: 36 }}>
                {describe(services.loyalty.getRules(o.type)).map((l) => (
                  <Text key={l} variant="small">
                    • {l}
                  </Text>
                ))}
              </View>
            ) : null}
            {selected && o.type === 'student' ? (
              <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  {(['LSP', 'ISIC'] as const).map((k) => (
                    <Chip key={k} label={k} selected={value.proofKind === k} onPress={() => onChange({ ...value, proofKind: k })} />
                  ))}
                </View>
                <TextInput
                  value={value.proofNumber}
                  onChangeText={(v) => onChange({ ...value, proofNumber: v })}
                  placeholder={t('cardType.proofNumber', { kind: value.proofKind })}
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                  style={inputStyle}
                />
              </View>
            ) : null}
            {selected && o.type === 'farmer' ? (
              <TextInput
                value={value.farmerCode}
                onChangeText={(v) => onChange({ ...value, farmerCode: v })}
                placeholder={t('cardType.farmerCode')}
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                style={[inputStyle, { marginTop: spacing.sm }]}
              />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
