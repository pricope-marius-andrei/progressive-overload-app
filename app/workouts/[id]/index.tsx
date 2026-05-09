/**
 * Workout Details Screen - Progressive Overload Gym App
 *
 * Main workout screen with exercises management.
 * Refactored into reusable components with context-based state management.
 */

import {
    AddExerciseButton,
    ExerciseModal,
    ExercisesList,
    WorkoutHeader,
    XpGainPopup,
} from "@/components";
import React from "react";
import { View } from "react-native";

const DayWorkoutScreen: React.FC = () => {
  return (
    <View className="flex-1 bg-indigo-50 dark:bg-indigo-950 px-5 pt-4 pb-2">
      <View className="flex-1">
        <WorkoutHeader />
        <AddExerciseButton />
        <ExercisesList />
        <ExerciseModal />
        <XpGainPopup />
      </View>
    </View>
  );
};

export default DayWorkoutScreen;
