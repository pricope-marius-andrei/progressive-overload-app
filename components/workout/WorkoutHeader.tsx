/**
 * WorkoutHeader Component - Progressive Overload Gym App
 *
 * Displays the workout title and details
 */

import { useWorkout } from "@/contexts/WorkoutContext";
import React from "react";
import { Text, View } from "react-native";
import WorkoutDatePicker from "./WorkoutDatePicker";

const WorkoutHeader: React.FC = () => {
  const { workoutName } = useWorkout();

  return (
    <View className="mb-4 rounded-2xl border border-white/70 bg-white/65 p-5">
      <Text className="mb-1 text-sm font-medium text-indigo-500">Workout</Text>
      <Text className="mb-4 text-2xl font-semibold text-indigo-950">
        {workoutName}
      </Text>
      <Text className="mb-3 text-indigo-700">
        Pick a day to view and edit your exercise log.
      </Text>

      <WorkoutDatePicker />
    </View>
  );
};

export default WorkoutHeader;
