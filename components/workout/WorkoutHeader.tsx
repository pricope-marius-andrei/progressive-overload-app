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
    <View className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
      <Text className="text-sm font-medium text-gray-500 mb-1">Workout</Text>
      <Text className="text-2xl font-bold text-gray-900 mb-4">
        {workoutName}
      </Text>
      <Text className="text-gray-500 mb-3">
        Pick a day to view and edit your exercise log.
      </Text>

      <WorkoutDatePicker />
    </View>
  );
};

export default WorkoutHeader;
