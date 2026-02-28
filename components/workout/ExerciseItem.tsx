/**
 * ExerciseItem Component - Progressive Overload Gym App
 *
 * Individual exercise item with sets display and edit functionality
 */

import { useWorkout } from "@/contexts/WorkoutContext";
import { Exercise } from "@/types/mappers/workout.mapper";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ExerciseItemProps {
  exercise: Exercise;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ exercise }) => {
  const { startEditingExercise, removeExercise, isHistoryMode } = useWorkout();
  const setLabel = `${exercise.sets.length} set${exercise.sets.length === 1 ? "" : "s"}`;

  return (
    <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1 pr-2">
          <Text className="text-lg font-semibold text-gray-900">
            {exercise.name}
          </Text>
          <Text className="text-sm text-gray-500 mt-0.5">{setLabel}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            className={`rounded-xl px-3 py-2 ${
              isHistoryMode ? "bg-gray-100" : "bg-indigo-50"
            }`}
            onPress={() => startEditingExercise(exercise)}
            disabled={isHistoryMode}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="pencil"
                size={16}
                color={isHistoryMode ? "#9ca3af" : "#6366f1"}
              />
              <Text
                className={`font-medium ml-1 ${
                  isHistoryMode ? "text-gray-400" : "text-primary"
                }`}
              >
                Edit
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            className={`rounded-xl px-3 py-2 ${
              isHistoryMode ? "bg-gray-100" : "bg-red-50"
            }`}
            onPress={() => removeExercise(exercise)}
            disabled={isHistoryMode}
          >
            <Text
              className={`font-medium ${
                isHistoryMode ? "text-gray-400" : "text-red-600"
              }`}
            >
              Remove
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {exercise.sets.map((set, index) => (
        <View
          key={set.id}
          className="flex-row justify-between items-center py-2.5 px-2 rounded-xl bg-gray-50 mb-2"
        >
          <Text className="text-gray-500">Set {index + 1}</Text>
          <Text className="text-gray-800 font-medium">
            {set.reps} reps × {set.weight} kg
          </Text>
        </View>
      ))}

      {exercise.sets.length === 0 && (
        <Text className="text-gray-500 italic">No sets added</Text>
      )}
    </View>
  );
};

export default ExerciseItem;
