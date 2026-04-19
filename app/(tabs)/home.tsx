/**
 * Home Screen Component - Progressive Overload Gym App
 *
 * Main dashboard featuring daily streaks, training modules, and workout access.
 * Users can view their progress, start workouts, and track different training types.
 *
 * Note: Wrapped with DashboardProvider at TabLayout level for state management
 */

import { GymPickerModal, Header, TrainingCalendar } from "@/components";
import { useAuth, useDashboard, useWorkoutsList } from "@/contexts";
import { Redirect } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

type HomeHeaderProps = {
  onOpenGymPicker: () => void;
};

function HomeHeader({ onOpenGymPicker }: HomeHeaderProps) {
  return (
    <View className="mb-6">
      <Header onOpenGymPicker={onOpenGymPicker} />
      <TrainingCalendar />
    </View>
  );
}

function HomeContent() {
  const { refreshDashboard } = useDashboard();
  const { workoutsList } = useWorkoutsList();
  const [isGymPickerVisible, setIsGymPickerVisible] = useState(false);

  return (
    <View className="p-5 relative flex-1 bg-white">
      <View className="flex-1" style={{ zIndex: 1 }}>
        <GymPickerModal
          visible={isGymPickerVisible}
          onClose={() => setIsGymPickerVisible(false)}
          onSaved={refreshDashboard}
        />

        <ScrollView className="flex-1">
          <HomeHeader onOpenGymPicker={() => setIsGymPickerVisible(true)} />

          <View className="rounded-3xl border border-white/70 bg-white/65 p-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-2xl font-black text-indigo-950">
                Today&apos;s Activity
              </Text>
              <View className="rounded-full bg-indigo-50 px-3 py-1">
                <Text className="text-sm font-semibold text-indigo-700">
                  {workoutsList.length}
                </Text>
              </View>
            </View>

            <Text className="text-sm text-indigo-700">
              {workoutsList.length > 0
                ? "Use the Workouts tab to open or manage your created workouts."
                : "No workouts created yet. Go to the Workouts tab to create your first one."}
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

/**
 * Home screen component - Main dashboard
 */
function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EEF2FF]">
        <ActivityIndicator size="small" color="#6366F1" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/prerequisite" />;
  }

  return <HomeContent />;
}

export default Home;
