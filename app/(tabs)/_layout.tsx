/**
 * Tab Layout Component - Progressive Overload Gym App
 *
 * This component defines the main tab navigation layout for the app.
 * It sets up two primary tabs: Home and Profile with respective icons and styling.
 * Wrapped with SafeAreaView to ensure proper spacing on all devices.
 *
 * Features:
 * - Home tab: Main dashboard for gym progress tracking
 * - Profile tab: User information and fitness goals
 * - Dynamic icons that change based on focus state (filled vs outline)
 * - Indigo color theme for active tabs
 */

import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Main tab layout component that renders the bottom tab navigation
 * Wrapped with SafeArea to ensure proper spacing on all devices
 * @returns JSX.Element - The tab navigation component with SafeArea support
 */
export default function TabLayout() {
  return (
    <SafeAreaView className="flex-1">
      <Tabs
        screenOptions={{
          // Active tab color - Indigo theme
          tabBarActiveTintColor: "#6366f1",
          // Hide the header since we're using tabs
          headerShown: false,
        }}
      >
        {/* Home Tab - Main screen for gym progress tracking */}
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            /**
             * Dynamic home icon that changes based on focus state
             * @param color - Current tab color (active/inactive)
             * @param focused - Whether this tab is currently selected
             */
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                color={color}
                size={24}
              />
            ),
          }}
        />

        {/* Profile Tab - User information and goals */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            /**
             * Dynamic profile icon that changes based on focus state
             * @param color - Current tab color (active/inactive)
             * @param focused - Whether this tab is currently selected
             */
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                color={color}
                size={24}
              />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
