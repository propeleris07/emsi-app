import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { DemoBadge } from '@/components';
import { ThemeProvider, useTheme } from '@/theme';
import { configureNotifications } from '@/services/device/notifications';
import { setServiceLanguage } from '@/services/locale';
import { useSession, useSettings, useStoresHydrated } from '@/store';

function RootStack() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const isLoggedIn = useSession((s) => s.isLoggedIn);
  const router = useRouter();

  // Paspaudus pranešimą – atidaromas jame nurodytas ekranas.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    configureNotifications();
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request.content.data?.url;
      if (typeof url === 'string' && isLoggedIn) router.push(url as never);
    });
    return () => sub.remove();
  }, [isLoggedIn, router]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerTransparent: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Protected guard={!isLoggedIn} redirectTo="/">
          <Stack.Screen name="auth" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={isLoggedIn} redirectTo="/auth">
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="card-code" options={{ presentation: 'modal', title: t('card.showCode') }} />
          <Stack.Screen name="link-card" options={{ presentation: 'modal', title: t('linkCard.title') }} />
          <Stack.Screen name="card-upgrade" options={{ presentation: 'modal', title: t('cardUpgrade.title') }} />
          <Stack.Screen name="stations/index" options={{ title: t('stations.title') }} />
          <Stack.Screen name="stations/[id]" options={{ title: '' }} />
          <Stack.Screen name="prices/index" options={{ title: t('prices.title') }} />
          <Stack.Screen name="pay/fuel" options={{ title: '' }} />
          <Stack.Screen name="pay/confirm" options={{ title: t('pay.confirmShort') }} />
          <Stack.Screen name="pay/fueling" options={{ title: '', gestureEnabled: false }} />
          <Stack.Screen name="receipt/[id]" options={{ title: t('receipt.title') }} />
          <Stack.Screen name="history/index" options={{ title: t('history.title') }} />
          <Stack.Screen name="history/stats" options={{ title: t('history.stats') }} />
          <Stack.Screen name="checkout" options={{ presentation: 'modal', title: t('checkout.title') }} />
          <Stack.Screen name="daily-code" options={{ presentation: 'modal', title: '' }} />
          <Stack.Screen name="carwash/index" options={{ title: t('carwash.title') }} />
          <Stack.Screen name="carwash/code/[id]" options={{ title: '' }} />
          <Stack.Screen name="food/index" options={{ title: t('food.title') }} />
          <Stack.Screen name="plate/index" options={{ title: t('plate.title') }} />
          <Stack.Screen name="plate/vehicle" options={{ presentation: 'modal', title: '' }} />
          <Stack.Screen name="plate/arrive" options={{ title: t('plate.arriveTitle') }} />
          <Stack.Screen name="prices/alerts" options={{ title: t('alerts.title') }} />
          <Stack.Screen name="fleet/index" options={{ title: t('settings.fleet') }} />
          <Stack.Screen name="fleet/reports" options={{ title: t('fleet.reports') }} />
          <Stack.Screen name="settings/index" options={{ title: t('settings.title') }} />
          <Stack.Screen name="settings/profile" options={{ title: t('settings.profile') }} />
          <Stack.Screen name="settings/payments" options={{ title: t('settings.payments') }} />
          <Stack.Screen name="settings/notifications" options={{ title: t('settings.notifications') }} />
          <Stack.Screen name="settings/privacy" options={{ title: t('settings.privacy') }} />
          <Stack.Screen name="settings/help" options={{ title: t('settings.help') }} />
          <Stack.Screen name="settings/faq" options={{ title: t('settings.faq') }} />
        </Stack.Protected>
      </Stack>
      <DemoBadge />
    </View>
  );
}

export default function RootLayout() {
  const hydrated = useStoresHydrated();
  const language = useSettings((s) => s.language);

  useEffect(() => {
    setServiceLanguage(language);
    if (i18n.language !== language) i18n.changeLanguage(language);
  }, [language]);

  if (!hydrated) return null;

  return (
    <ThemeProvider>
      <RootStack />
    </ThemeProvider>
  );
}
