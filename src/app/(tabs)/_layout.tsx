import { View, type ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { fonts } from '@/config/fonts';
import { useTheme } from '@/theme';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const BAR_HEIGHT = 62;

export default function TabsLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors, shadows, isDark } = useTheme();

  const icon = (name: IconName, outline: IconName) => {
    function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
      return <MaterialCommunityIcons name={focused ? name : outline} size={28} color={color as string} />;
    }
    return TabIcon;
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          height: BAR_HEIGHT + insets.bottom,
          paddingTop: 6,
          backgroundColor: colors.surface,
          borderTopWidth: isDark ? 1 : 0,
          borderTopColor: colors.border,
          ...shadows.lg,
        },
        tabBarLabelStyle: { fontSize: 11, fontFamily: fonts.bodyBold },
        tabBarItemStyle: { paddingHorizontal: 0 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home'), tabBarIcon: icon('home', 'home-outline') }} />
      <Tabs.Screen
        name="pay"
        options={{
          title: t('tabs.pay'),
          // Pagrindinis veiksmas – iškeltas apvalus mygtukas virš juostos.
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                {
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  marginTop: -30,
                  backgroundColor: focused ? colors.primaryPressed : colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 4,
                  borderColor: colors.surface,
                },
                shadows.md,
              ]}
            >
              <MaterialCommunityIcons name="gas-station-outline" size={28} color={colors.onPrimary} />
            </View>
          ),
        }}
      />
      <Tabs.Screen name="card" options={{ title: t('tabs.card'), tabBarIcon: icon('credit-card', 'credit-card-outline') }} />
      <Tabs.Screen name="offers" options={{ title: t('tabs.offers'), tabBarIcon: icon('ticket-percent', 'ticket-percent-outline') }} />
      <Tabs.Screen name="more" options={{ title: t('tabs.more'), tabBarIcon: icon('menu', 'menu') }} />
    </Tabs>
  );
}
