import { View, type ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();

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
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home'), tabBarIcon: icon('home', 'home-outline') }} />
      <Tabs.Screen
        name="pay"
        options={{
          title: t('tabs.pay'),
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: focused ? colors.primaryPressed : colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="speedometer" size={22} color={colors.onPrimary} />
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
