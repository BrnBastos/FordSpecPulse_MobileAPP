import { Tabs } from "expo-router";
import { Car, Clock3, GitCompareArrows, Home } from "lucide-react-native";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/specpulseTheme";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.fordBlue,
        tabBarInactiveTintColor: colors.gray,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: "#E7ECF3",
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: 56 + Math.max(0, fontScale - 1) * 16 + bottomPadding,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: "Veículos",
          tabBarIcon: ({ color }) => <Car size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="compare"
        options={{
          title: "Comparar",
          tabBarIcon: ({ color }) => (
            <GitCompareArrows size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Histórico",
          tabBarIcon: ({ color }) => <Clock3 size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          href: null,
        }}
      />
    </Tabs>
  );
}
