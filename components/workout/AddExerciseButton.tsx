/**
 * AddExerciseButton Component - Progressive Overload Gym App
 *
 * Button to trigger adding a new exercise
 */

import { useWorkout } from "@/contexts/WorkoutContext";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

const AddExerciseButton: React.FC = () => {
  const { startCreatingExercise, isHistoryMode } = useWorkout();

  return (
    <TouchableOpacity
      className={`rounded-lg p-4 mb-4 ${isHistoryMode ? "bg-gray-300" : "bg-primary"}`}
      onPress={startCreatingExercise}
      disabled={isHistoryMode}
    >
      <Text className="text-white text-center font-semibold text-lg">
        {isHistoryMode ? "History Mode (Read only)" : "Add New Exercise"}
      </Text>
    </TouchableOpacity>
  );
};

export default AddExerciseButton;
