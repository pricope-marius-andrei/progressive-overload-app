/**
 * Home Screen Component - Progressive Overload Gym App
 *
 * Main dashboard featuring daily streaks, training modules, and workout access.
 * Users can view their progress, start workouts, and track different training types.
 */

import { HomeProvider, useHome } from "@/contexts";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { AddWorkoutForm, WelcomeHeader, WorkoutsList } from "../../components";

const HomeContent: React.FC = () => {
  const { refreshHomeState } = useHome();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshHomeState();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshHomeState]);

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <View className="flex-1 bg-gray-50 px-5 pt-4 pb-2">
        <WelcomeHeader />
        <AddWorkoutForm />
        <WorkoutsList />
      </View>
    </ScrollView>
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
