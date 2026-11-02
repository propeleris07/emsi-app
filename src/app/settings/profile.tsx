import { useState } from 'react';
import { TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Screen, Text } from '@/components';
import { services } from '@/services';
import { useSession } from '@/store';
import { useTheme } from '@/theme';
import { formatPhone } from '@/utils/format';

export default function Profile() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const user = useSession((s) => s.user);
  const updateUser = useSession((s) => s.updateUser);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const emailValid = !email || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const input = { height: 56, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: spacing.lg, fontSize: 17, color: colors.text };

  if (!user) return null;

  return (
    <Screen
      footer={
        <Button
          title={t('common.save')}
          size="lg"
          disabled={!emailValid}
          loading={saving}
          onPress={async () => {
            setSaving(true);
            const patch = { firstName: firstName.trim() || undefined, lastName: lastName.trim() || undefined, email: email.trim() || undefined };
            await services.auth.updateProfile(user.id, patch);
            updateUser(patch);
            router.back();
          }}
        />
      }
    >
      <Text variant="bodyStrong">{t('settings.phone')}</Text>
      <Text tone="muted">{formatPhone(user.phone)}</Text>
      <Text variant="bodyStrong">{t('settings.firstName')}</Text>
      <TextInput value={firstName} onChangeText={setFirstName} autoComplete="given-name" style={input} />
      <Text variant="bodyStrong">{t('settings.lastName')}</Text>
      <TextInput value={lastName} onChangeText={setLastName} autoComplete="family-name" style={input} />
      <Text variant="bodyStrong">{t('settings.email')}</Text>
      <TextInput value={email} onChangeText={setEmail} autoComplete="email" keyboardType="email-address" autoCapitalize="none" style={[input, !emailValid && { borderColor: colors.danger }]} />
      <Text variant="small" tone="muted">
        {t('settings.emailHint')}
      </Text>
    </Screen>
  );
}
