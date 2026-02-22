/**
 * WorkoutHeader Component - Progressive Overload Gym App
 *
 * Displays the workout title and details
 */

import { useWorkout } from "@/contexts/WorkoutContext";
import React from "react";
import { Text, View } from "react-native";

const WorkoutHeader: React.FC = () => {
  const { workoutId } = useWorkout();

  return (
    <View>
      <Text className="text-2xl font-bold text-gray-800 mb-4">
        Workout Details - {workoutId}
      </Text>
    </View>
  );
};

export default WorkoutHeader;
