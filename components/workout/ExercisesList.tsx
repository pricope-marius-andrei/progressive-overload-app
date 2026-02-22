/**
 * ExercisesList Component - Progressive Overload Gym App
 *
 * Scrollable list of exercises with empty state
 */

import { useWorkout } from "@/contexts/WorkoutContext";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import ExerciseItem from "./ExerciseItem";

const ExercisesList: React.FC = () => {
  const { workoutExercises } = useWorkout();

  return (
    <View className="flex-1">
      <Text className="text-lg font-semibold text-gray-700 mb-2">
        Exercises in this Workout ({workoutExercises.length})
      </Text>

      <ScrollView className="flex-1">
        {workoutExercises.length > 0 ? (
          workoutExercises.map((exercise) => (
            <ExerciseItem key={exercise.id} exercise={exercise} />
          ))
        ) : (
          <View className="bg-gray-50 rounded-lg p-8 items-center">
            <Text className="text-gray-500 text-center">
              No exercises added yet. Tap &quot;Add New Exercise&quot; to get
              started!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ExercisesList;
