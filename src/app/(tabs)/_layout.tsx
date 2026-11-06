import { View, type ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors, shadows, isDark } = useTheme();

  const icon = (name: IconName, outline: IconName) => {
    function TabIcon({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) {
      return <Ionicons name={focused ? name : outline} size={size} color={color as string} />;
    }
    return TabIcon;
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: { backgroundColor: colors.surface, borderTopWidth: isDark ? 1 : 0, borderTopColor: colors.border, ...shadows.lg },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home'), tabBarIcon: icon('home', 'home-outline') }} />
      <Tabs.Screen
        name="pay"
        options={{
          title: t('tabs.pay'),
          tabBarIcon: ({ focused }) => (
            <View style={[{ width: 44, height: 44, borderRadius: 22, marginTop: -6, transform: [{ scale: focused ? 1.06 : 1 }] }, shadows.md]}>
              <LinearGradient
                colors={colors.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.surface }}
              >
                <Ionicons name="speedometer" size={22} color={colors.onPrimary} />
              </LinearGradient>
            </View>
          ),
        }}
      />
      <Tabs.Screen name="card" options={{ title: t('tabs.card'), tabBarIcon: icon('card', 'card-outline') }} />
      <Tabs.Screen name="offers" options={{ title: t('tabs.offers'), tabBarIcon: icon('pricetags', 'pricetags-outline') }} />
      <Tabs.Screen name="more" options={{ title: t('tabs.more'), tabBarIcon: icon('menu', 'menu-outline') }} />
    </Tabs>
  );
}
