/**
 * AddExerciseButton Component - Progressive Overload Gym App
 *
 * Button to trigger adding a new exercise
 */

import { useWorkout } from "@/contexts/WorkoutContext";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

const AddExerciseButton: React.FC = () => {
  const { startCreatingExercise } = useWorkout();

  return (
    <TouchableOpacity
      className="bg-primary rounded-lg p-4 mb-4"
      onPress={startCreatingExercise}
    >
      <Text className="text-white text-center font-semibold text-lg">
        Add New Exercise
      </Text>
    </TouchableOpacity>
  );
};

export default AddExerciseButton;
