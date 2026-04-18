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

import CustomTabBar from "@/components/utils/CustomTabBar";
import { useAuth } from "@/contexts";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Main tab layout component that renders the bottom tab navigation
 * Wrapped with SafeArea to ensure proper spacing on all devices
 * @returns JSX.Element - The tab navigation component with SafeArea support
 */
export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="small" color="#2563eb" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/prerequisite" />;
  }

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      ></Tabs>
    </SafeAreaView>
  );
}
