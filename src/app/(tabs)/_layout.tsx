import { Tabs } from "expo-router";
import {
  Car,
  Clock3,
  GitCompareArrows,
  Home,
  UserRound,
} from "lucide-react-native";
import { colors } from "../../constants/specpulseTheme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.fordBlue,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: "#E7ECF3",
          height: 74,
          paddingTop: 8,
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
          title: "Home",
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
          tabBarIcon: ({ color }) => <UserRound size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}