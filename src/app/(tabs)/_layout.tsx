import { View, type ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const BAR_HEIGHT = 66;
const BAR_MARGIN = 12;

export default function TabsLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors, shadows, radius, isDark } = useTheme();
  const bottom = Math.max(insets.bottom, BAR_MARGIN);

  const icon = (name: IconName, outline: IconName) => {
    function TabIcon({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) {
      return (
        <View style={{ alignItems: 'center' }}>
          {/* Aktyvaus skirtuko žymė viršuje */}
          <View
            style={{
              position: 'absolute',
              top: -10,
              width: focused ? 26 : 0,
              height: 3,
              borderRadius: 2,
              backgroundColor: colors.primary,
            }}
          />
          <Ionicons name={focused ? name : outline} size={size} color={color as string} />
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
        tabBarInactiveTintColor: colors.tabInactive,
        // Plaukiojanti, apvali juosta su šešėliu.
        tabBarStyle: {
          height: BAR_HEIGHT + bottom,
          paddingTop: 10,
          paddingBottom: bottom + 8,
          paddingHorizontal: BAR_MARGIN,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View
              style={[
                {
                  position: 'absolute',
                  left: BAR_MARGIN,
                  right: BAR_MARGIN,
                  top: 0,
                  bottom: bottom - 4,
                  borderRadius: radius.xl,
                  backgroundColor: colors.surface,
                  borderWidth: isDark ? 1 : 0,
                  borderColor: colors.border,
                },
                shadows.lg,
              ]}
            />
          </View>
        ),
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: '600' },
        tabBarItemStyle: { paddingHorizontal: 0 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home'), tabBarIcon: icon('home', 'home-outline') }} />
      <Tabs.Screen
        name="pay"
        options={{
          title: t('tabs.pay'),
          tabBarIcon: ({ focused }) => (
            <View style={[{ width: 50, height: 50, borderRadius: 25, marginTop: -22, transform: [{ scale: focused ? 1.06 : 1 }] }, shadows.md]}>
              <LinearGradient
                colors={colors.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, borderRadius: 25, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.surface }}
              >
                <Ionicons name="speedometer" size={24} color={colors.onPrimary} />
              </LinearGradient>
            </View>
          ),
        }}
      />
      <Tabs.Screen name="card" options={{ title: t('tabs.card'), tabBarIcon: icon('qr-code', 'qr-code-outline') }} />
      <Tabs.Screen name="offers" options={{ title: t('tabs.offers'), tabBarIcon: icon('pricetags', 'pricetags-outline') }} />
      <Tabs.Screen name="more" options={{ title: t('tabs.more'), tabBarIcon: icon('person-circle', 'person-circle-outline') }} />
    </Tabs>
  );
}
