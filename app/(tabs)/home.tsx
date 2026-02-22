/**
 * Home Screen Component - Progressive Overload Gym App
 *
 * Main dashboard featuring daily streaks, training modules, and workout access.
 * Users can view their progress, start workouts, and track different training types.
 */

import { HomeProvider } from "@/contexts";
import React from "react";
import { View } from "react-native";
import { AddWorkoutForm, WelcomeHeader, WorkoutsList } from "../../components";

/**
 * Home screen component - Main dashboard
 * Wrapped with HomeProvider for state management
 */
const Home: React.FC = () => {
  return (
    <HomeProvider>
      <View className="flex-1 p-6">
        <WelcomeHeader />
        <AddWorkoutForm />
        <WorkoutsList />
      </View>
    </HomeProvider>
  );
};

export default Home;
