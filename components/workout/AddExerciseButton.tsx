/**
 * AddExerciseButton Component - Progressive Overload Gym App
 *
 * Button to trigger adding a new exercise
 */

import { useWorkout } from "@/contexts/WorkoutContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const AddExerciseButton: React.FC = () => {
  const { startCreatingExercise, isHistoryMode } = useWorkout();

  return (
    <TouchableOpacity
      className={`rounded-2xl px-4 py-4 mb-4 border ${
        isHistoryMode
          ? "bg-gray-100 border-gray-200"
          : "bg-white border-indigo-100"
      }`}
      onPress={startCreatingExercise}
      disabled={isHistoryMode}
      activeOpacity={0.85}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View
            className={`h-10 w-10 rounded-full items-center justify-center mr-3 ${
              isHistoryMode ? "bg-gray-200" : "bg-indigo-50"
            }`}
          >
            <Ionicons
              name="add"
              size={20}
              color={isHistoryMode ? "#9ca3af" : "#6366f1"}
            />
          </View>

          <View className="flex-1">
            <Text
              className={`font-semibold text-base ${
                isHistoryMode ? "text-gray-500" : "text-gray-900"
              }`}
            >
              {isHistoryMode ? "History mode" : "Add exercise"}
            </Text>
            <Text
              className={`text-sm ${
                isHistoryMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {isHistoryMode
                ? "Switch to today to create exercises"
                : "Create a new exercise for this workout"}
            </Text>
          </View>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={isHistoryMode ? "#9ca3af" : "#6366f1"}
        />
      </View>
    </TouchableOpacity>
  );
};

export default AddExerciseButton;
