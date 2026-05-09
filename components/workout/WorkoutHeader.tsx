/**
 * WorkoutHeader Component - Progressive Overload Gym App
 *
 * Displays the workout title and details
 */

import { useWorkout } from "@/contexts/WorkoutContext";
import React from "react";
import { Text, View } from "react-native";

const WorkoutHeader: React.FC = () => {
  const { workoutName } = useWorkout();

  return (
    <View className="mb-4 rounded-2xl border border-white/70 dark:border-indigo-900/60 bg-white/70 dark:bg-slate-900/70 p-5">
      <Text className="mb-1 text-sm font-medium text-indigo-500">Workout</Text>
      <Text className="mb-4 text-2xl font-semibold text-indigo-950 dark:text-indigo-50">
        {workoutName}
      </Text>
      <Text className="text-indigo-700 dark:text-indigo-200">
        Log sets and track performance evolution per exercise.
      </Text>
    </View>
  );
};

export default WorkoutHeader;
