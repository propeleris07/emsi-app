import { useState } from 'react';
import { Switch, TextInput, View } from 'react-native';
import { Alert } from '@/utils/alert';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Chip, Screen, Text } from '@/components';
import { useVehicles } from '@/hooks/useVehicles';
import type { FuelType, Vehicle } from '@/models';
import { useTheme } from '@/theme';
import { normalizePlate } from '@/utils/format';
import { newId } from '@/utils/random';

const FUELS: FuelType[] = ['95', '98', 'D', 'LPG'];

/** Automobilio pridėjimas / redagavimas. */
export default function VehicleScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const vehiclesApi = useVehicles();
  const existing = vehiclesApi.vehicles.find((v) => v.id === id);
  // Redaguojant – laukiame, kol automobilis bus užkrautas, kad forma gautų pradines reikšmes.
  if (id && !existing) return <Screen>{null}</Screen>;
  return <VehicleForm key={existing?.id ?? 'new'} existing={existing} save={vehiclesApi.save} remove={vehiclesApi.remove} />;
}

function VehicleForm({
  existing,
  save,
  remove,
}: {
  existing?: Vehicle;
  save: (v: Vehicle) => Promise<void>;
  remove: (id: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const [plate, setPlate] = useState(existing?.plate ?? '');
  const [nickname, setNickname] = useState(existing?.nickname ?? '');
  const [fuel, setFuel] = useState<FuelType>(existing?.fuel ?? '95');
  const [autopay, setAutopay] = useState(existing?.plateAutopay ?? true);
  const [saving, setSaving] = useState(false);

  const normalized = normalizePlate(plate);
  const input = {
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    fontSize: 18,
    color: colors.text,
  };

  const submit = async () => {
    if (!normalized) return;
    setSaving(true);
    const v: Vehicle = {
      id: existing?.id ?? newId('veh'),
      plate: normalized,
      nickname: nickname.trim() || t('plate.defaultNickname'),
      fuel,
      plateAutopay: autopay,
      isFleet: existing?.isFleet ?? false,
    };
    try {
      await save(v);
      router.back();
    } catch {
      Alert.alert(t('plate.exists'));
      setSaving(false);
    }
  };

  return (
    <Screen
      footer={
        <View style={{ gap: spacing.sm }}>
          <Button title={t('common.save')} size="lg" disabled={!normalized} loading={saving} onPress={submit} />
          {existing ? (
            <Button
              title={t('plate.remove')}
              variant="danger"
              onPress={async () => {
                await remove(existing.id);
                router.back();
              }}
            />
          ) : null}
        </View>
      }
    >
      <Stack.Screen options={{ title: existing ? t('plate.editVehicle') : t('plate.addVehicle') }} />
      <Text variant="bodyStrong">{t('plate.plateLabel')}</Text>
      <TextInput
        autoFocus={!existing}
        value={plate}
        onChangeText={(v) => setPlate(v.toUpperCase())}
        placeholder="ABC 123"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={10}
        style={[input, { fontSize: 24, fontWeight: '800', letterSpacing: 2 }]}
      />
      {plate && !normalized ? <Text tone="danger">{t('plate.invalid')}</Text> : null}
      <Text variant="bodyStrong">{t('plate.nickname')}</Text>
      <TextInput value={nickname} onChangeText={setNickname} placeholder={t('plate.nicknamePh')} placeholderTextColor={colors.textMuted} style={input} />
      <Text variant="bodyStrong">{t('plate.fuel')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {FUELS.map((f) => (
          <Chip key={f} label={t(`fuel.long.${f}`)} selected={fuel === f} onPress={() => setFuel(f)} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Text variant="bodyStrong">{t('plate.autopay')}</Text>
          <Text variant="small" tone="muted">
            {t('plate.autopayHint')}
          </Text>
        </View>
        <Switch value={autopay} onValueChange={setAutopay} trackColor={{ true: colors.primary, false: colors.border }} />
      </View>
    </Screen>
  );
}
