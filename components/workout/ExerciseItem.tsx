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
  const { startEditingExercise, removeExercise } = useWorkout();

  return (
    <View className="bg-white rounded-lg shadow p-4 mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-semibold text-gray-800 flex-1">
          {exercise.name}
        </Text>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            className="bg-indigo-100 rounded-lg px-3 py-2"
            onPress={() => startEditingExercise(exercise)}
          >
            <View className="flex-row items-center">
              <Ionicons name="pencil" size={16} color="#6366f1" />
              <Text className="text-primary font-medium ml-1">Edit</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-100 rounded-lg px-3 py-2"
            onPress={() => removeExercise(exercise)}
          >
            <Text className="text-red-600 font-medium">Remove</Text>
          </TouchableOpacity>
        </View>
      </View>

      {exercise.sets.map((set, index) => (
        <View
          key={set.id}
          className="flex-row justify-between items-center py-2 border-b border-gray-200"
        >
          <Text className="text-gray-600">Set {index + 1}</Text>
          <Text className="text-gray-800">
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
