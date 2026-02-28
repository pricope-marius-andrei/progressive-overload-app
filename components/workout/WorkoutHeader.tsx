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
  const { workoutId, isHistoryMode } = useWorkout();

  return (
    <View>
      <Text className="text-2xl font-bold text-gray-800 mb-4">
        Workout Details - {workoutId}
      </Text>
      <WorkoutDatePicker />
      {isHistoryMode && (
        <Text className="text-amber-700 bg-amber-100 rounded-lg px-3 py-2 mb-4">
          Viewing history snapshot. Switch to today to edit this workout.
        </Text>
      )}
    </View>
  );
};

export default WorkoutHeader;
