/**
 * Home Screen Component - Progressive Overload Gym App
 *
 * Main dashboard featuring daily streaks, training modules, and workout access.
 * Users can view their progress, start workouts, and track different training types.
 */

import { GymPickerModal, TrainingCalendar, WorkoutsList } from "@/components";
import { HomeProvider, useAuth, useHome } from "@/contexts";
import { Redirect } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, View } from "react-native";

type HomeHeaderProps = {
  onOpenGymPicker: () => void;
};

const HomeHeader: React.FC<HomeHeaderProps> = ({ onOpenGymPicker }) => (
  <View className="mb-6">
    {/* <WelcomeHeader onOpenGymPicker={onOpenGymPicker} /> */}
    <TrainingCalendar />
    {/* <AddWorkoutForm /> */}
  </View>
);

const HomeContent: React.FC = () => {
  const { refreshHomeState } = useHome();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGymPickerVisible, setIsGymPickerVisible] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshHomeState();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshHomeState]);

  return (
    <View className="relative flex-1 bg-[#EEF2FF]">
      <View
        pointerEvents="none"
        style={{ zIndex: 0 }}
        className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-[#6366F1]/15"
      />
      <View
        pointerEvents="none"
        style={{ zIndex: 0 }}
        className="absolute top-32 -left-20 h-56 w-56 rounded-full bg-[#6366F1]/10"
      />

      <View className="flex-1" style={{ zIndex: 1 }}>
        <GymPickerModal
          visible={isGymPickerVisible}
          onClose={() => setIsGymPickerVisible(false)}
          onSaved={refreshHomeState}
        />

        <WorkoutsList
          ListHeaderComponent={() => (
            <HomeHeader onOpenGymPicker={() => setIsGymPickerVisible(true)} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
        />
      </View>
    </View>
  );
};

/**
 * Home screen component - Main dashboard
 * Wrapped with HomeProvider for state management
 */
const Home: React.FC = () => {
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

  return (
    <HomeProvider>
      <HomeContent />
    </HomeProvider>
  );
};

export default Home;
