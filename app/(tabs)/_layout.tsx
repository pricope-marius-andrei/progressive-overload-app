/**
 * Tab Layout Component - Progressive Overload Gym App
 *
 * This component defines the main tab navigation layout for the app.
 * It sets up two primary tabs: Home and Profile with respective icons and styling.
 * Wrapped with SafeAreaView to ensure proper spacing on all devices.
 *
 * Features:
 * - Home tab: Main dashboard for gym progress tracking
 * - Workouts tab: Workouts list and management
 * - Profile tab: User information and fitness goals
 * - Dynamic icons that change based on focus state (filled vs outline)
 * - Indigo color theme for active tabs
 */

import CustomTabBar from "@/components/utils/CustomTabBar";
import {
  DashboardProvider,
  TodayActivityProvider,
  useAuth,
  WorkoutsListProvider,
} from "@/contexts";
import type { TabConfig } from "@/types/tab.types";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Main tab layout component that renders the bottom tab navigation
 * Wrapped with SafeArea to ensure proper spacing on all devices
 * Wrapped with Dashboard and WorkoutsList providers for state management
 * @returns JSX.Element - The tab navigation component with SafeArea support
 */
export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // Define tab configuration here - easy to extend by adding new entries
  // Each tab specifies its focused and unfocused icon names from Ionicons
  const tabConfig: TabConfig = {
    Home: {
      name: "Home",
      focused: "home",
      unfocused: "home-outline",
    },
    Workouts: {
      name: "Workouts",
      focused: "barbell",
      unfocused: "barbell-outline",
    },
    Profile: {
      name: "Profile",
      focused: "person",
      unfocused: "person-outline",
    },
  };

  // Control the order of tabs - arrange them as you prefer
  const tabOrder = ["Home", "Workouts", "Profile"];

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="small" color="#2563eb" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/prerequisite" />;
  }

  return (
    <DashboardProvider>
      <WorkoutsListProvider>
        <TodayActivityProvider>
          <SafeAreaView className="flex-1" edges={["top"]}>
            <Tabs
              tabBar={(props) => (
                <CustomTabBar
                  {...props}
                  tabConfig={tabConfig}
                  tabOrder={tabOrder}
                  activeColor="#6366f1"
                  inactiveColor="#9ca3af"
                />
              )}
              screenOptions={{
                headerShown: false,
              }}
            ></Tabs>
          </SafeAreaView>
        </TodayActivityProvider>
      </WorkoutsListProvider>
    </DashboardProvider>
  );
}
