/**
 * Workout Details Screen - Progressive Overload Gym App
 *
 * Main workout screen with exercises management.
 * Refactored into reusable components with context-based state management.
 */

import React from "react";
import { View } from "react-native";
import {
    AddExerciseButton,
    ExerciseModal,
    ExercisesList,
    WorkoutHeader,
} from "../../../components";

const DayWorkoutScreen: React.FC = () => {
  return (
    <View className="flex-1 p-4">
      <WorkoutHeader />
      <AddExerciseButton />
      <ExercisesList />
      <ExerciseModal />
    </View>
  );
};

export default DayWorkoutScreen;
