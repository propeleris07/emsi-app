import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Screen, Text } from '@/components';
import { services } from '@/services';
import { useSession } from '@/store';
import { useTheme } from '@/theme';
import { formatPhone } from '@/utils/format';

const LENGTH = 4;

export default function Verify() {
  const { t } = useTranslation();
  const router = useRouter();
  const { phone = '', requestId = '' } = useLocalSearchParams<{ phone?: string; requestId?: string }>();
  const { colors, radius, spacing } = useTheme();
  const setUser = useSession((s) => s.setUser);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(30);
  const input = useRef<ComponentRef<typeof TextInput>>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  const verify = async (value: string) => {
    setLoading(true);
    setError(null);
    try {
      const { user } = await services.auth.verifyCode(requestId, phone, value);
      setUser(user);
      router.push('/auth/consents');
    } catch {
      setError(t('auth.invalidCode'));
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen footer={<Button title={t('common.continue')} size="lg" loading={loading} disabled={code.length < LENGTH} onPress={() => verify(code)} />}>
      <Text variant="h1">{t('auth.codeTitle')}</Text>
      <Text tone="muted">{t('auth.codeSubtitle', { phone: formatPhone(phone) })}</Text>

      <Pressable onPress={() => input.current?.focus()} style={{ flexDirection: 'row', gap: spacing.md, justifyContent: 'center', marginVertical: spacing.lg }}>
        {Array.from({ length: LENGTH }, (_, i) => (
          <View
            key={i}
            style={{
              width: 64,
              height: 72,
              borderRadius: radius.md,
              borderWidth: 2,
              borderColor: error ? colors.danger : i === code.length ? colors.primary : colors.border,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text variant="h1">{code[i] ?? ''}</Text>
          </View>
        ))}
      </Pressable>
      <TextInput
        ref={input}
        autoFocus
        value={code}
        onChangeText={(v) => {
          const digits = v.replace(/\D/g, '').slice(0, LENGTH);
          setCode(digits);
          setError(null);
          if (digits.length === LENGTH) verify(digits);
        }}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={LENGTH}
        style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
      />
      {error ? (
        <Text tone="danger" center>
          {error}
        </Text>
      ) : null}
      <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.md }}>
        <Text variant="small" tone="primary" center>
          {t('auth.demoCodeHint')}
        </Text>
      </View>
      <Pressable
        disabled={resendIn > 0}
        onPress={async () => {
          await services.auth.requestCode(phone);
          setResendIn(30);
        }}
        style={{ alignSelf: 'center', padding: spacing.md }}
      >
        <Text tone={resendIn > 0 ? 'muted' : 'primary'} variant="bodyStrong">
          {resendIn > 0 ? t('auth.resendIn', { s: resendIn }) : t('auth.resend')}
        </Text>
      </Pressable>
    </Screen>
  );
}
