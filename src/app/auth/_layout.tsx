import { Stack } from 'expo-router';
import { brand } from '@/config/theme';
import { useTheme } from '@/theme';

export const unstable_settings = { anchor: 'index' };

export default function AuthLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerTransparent: false,
        headerTitle: '',
        headerStyle: { backgroundColor: brand.green },
        headerTintColor: '#FFFFFF',
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="phone" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="consents" />
      <Stack.Screen name="card-type" />
    </Stack>
  );
}
