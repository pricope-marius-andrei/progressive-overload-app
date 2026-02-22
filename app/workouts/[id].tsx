/**
 * Workout Details Screen - Progressive Overload Gym App
 *
 * Main workout screen with exercises management.
 * Refactored into reusable components with context-based state management.
 */

import { WorkoutProvider } from "@/contexts";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import {
    AddExerciseButton,
    ExerciseModal,
    ExercisesList,
    WorkoutHeader,
} from "../../components";

const DayWorkoutScreen: React.FC = () => {
  const { id } = useLocalSearchParams();
  const workoutId = Array.isArray(id) ? id[0] : id || "";

  return (
    <WorkoutProvider workoutId={workoutId}>
      <View className="flex-1 p-4">
        <WorkoutHeader />
        <AddExerciseButton />
        <ExercisesList />
        <ExerciseModal />
      </View>
    </WorkoutProvider>
  );
};

export default DayWorkoutScreen;
