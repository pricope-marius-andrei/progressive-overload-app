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

import { useAuth } from "@/contexts";
import { Redirect, Stack } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Workouts layout component that provides SafeArea context and Stack navigation
 * @returns JSX.Element - SafeArea wrapped workout stack navigation
 */
export default function WorkoutsLayout() {
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
    <SafeAreaView className="flex-1">
      <Stack
        screenOptions={{
          headerShown: false, // Hide headers for clean full-screen experience
        }}
      />
    </SafeAreaView>
  );
}
