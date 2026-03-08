/**
 * Home Screen Component - Progressive Overload Gym App
 *
 * Main dashboard featuring daily streaks, training modules, and workout access.
 * Users can view their progress, start workouts, and track different training types.
 */

import {
    AddWorkoutForm,
    GymPickerModal,
    TrainingCalendar,
    WelcomeHeader,
    WorkoutsList,
} from "@/components";
import { HomeProvider, useHome } from "@/contexts";
import React, { useCallback, useState } from "react";
import { RefreshControl, View } from "react-native";

type HomeHeaderProps = {
  onOpenGymPicker: () => void;
};

const HomeHeader: React.FC<HomeHeaderProps> = ({ onOpenGymPicker }) => (
  <View className="mb-5">
    <WelcomeHeader onOpenGymPicker={onOpenGymPicker} />
    <TrainingCalendar />
    <AddWorkoutForm />
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
    <View className="flex-1 bg-gray-50">
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
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
};

/**
 * Home screen component - Main dashboard
 * Wrapped with HomeProvider for state management
 */
const Home: React.FC = () => {
  return (
    <HomeProvider>
      <HomeContent />
    </HomeProvider>
  );
};

export default Home;
