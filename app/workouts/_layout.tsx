/**
 * Workouts Layout Component - Progressive Overload Gym App
 *
 * This layout wraps all workout-related screens with SafeArea support
 * ensuring proper spacing on all devices and consistent navigation.
 *
 * Features:
 * - SafeArea protection for all workout screens
 * - Stack navigation for workout flows
 * - Automatic device compatibility
 */

import { Stack } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Workouts layout component that provides SafeArea context and Stack navigation
 * @returns JSX.Element - SafeArea wrapped workout stack navigation
 */
export default function WorkoutsLayout() {
  return (
    <SafeAreaView className="flex-1">
      <Stack
        screenOptions={{
          headerShown: false, // Hide headers for clean full-screen experience
        }}
      />
    </SafeAreaView>
  );
}
