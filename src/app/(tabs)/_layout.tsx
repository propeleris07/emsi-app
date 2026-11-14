import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { fonts } from '@/config/fonts';
import { useTheme } from '@/theme';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const BAR_HEIGHT = 76;

export default function TabsLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors, shadows, isDark } = useTheme();

  // Pasirinktas skirtukas paryškinamas žalia „piliule“ su balta ikona; kiti – be fono.
  const icon = (name: IconName, outline: IconName) => {
    function TabIcon({ focused }: { focused: boolean }) {
      return (
        <View
          style={{
            width: 56,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: focused ? colors.primary : 'transparent',
          }}
        >
          <MaterialCommunityIcons name={focused ? name : outline} size={24} color={focused ? colors.onPrimary : colors.text} />
        </View>
      );
    }
    return TabIcon;
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        // Užrašas visada po ikona – ir plačiame ekrane (kitaip jie atsiduria greta ir persidengia).
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          height: BAR_HEIGHT + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom,
          backgroundColor: colors.surface,
          borderTopWidth: isDark ? 1 : 0,
          borderTopColor: colors.border,
          ...shadows.lg,
        },
        tabBarIconStyle: { width: 56, height: 32 },
        tabBarLabelStyle: { fontSize: 11, fontFamily: fonts.bodyBold, marginTop: 4 },
        tabBarItemStyle: { paddingHorizontal: 0 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home'), tabBarIcon: icon('home', 'home-outline') }} />
      <Tabs.Screen name="pay" options={{ title: t('tabs.pay'), tabBarIcon: icon('gas-station', 'gas-station-outline') }} />
      <Tabs.Screen name="card" options={{ title: t('tabs.card'), tabBarIcon: icon('credit-card', 'credit-card-outline') }} />
      <Tabs.Screen name="offers" options={{ title: t('tabs.offers'), tabBarIcon: icon('ticket-percent', 'ticket-percent-outline') }} />
      <Tabs.Screen name="more" options={{ title: t('tabs.more'), tabBarIcon: icon('menu', 'menu') }} />
    </Tabs>
  );
}
