/**
 * WorkoutsList Component - Progressive Overload Gym App
 *
 * Scrollable list of all user workouts with empty state
 */

import { useHome } from "@/contexts";
import React from "react";
import { Text, View } from "react-native";
import WorkoutItem from "./WorkoutItem";

const WorkoutsList: React.FC = () => {
  const { workoutsList } = useHome();

  return (
    <View className="flex-1 mt-5">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-semibold text-gray-900">
          Start workout
        </Text>
        <View className="bg-white border border-gray-100 rounded-full px-3 py-1">
          <Text className="text-sm font-semibold text-gray-600">
            {workoutsList.length}
          </Text>
        </View>
      </View>

      <View>
        {workoutsList.length > 0 ? (
          workoutsList.map((workout) => (
            <WorkoutItem key={workout.id} workout={workout} />
          ))
        ) : (
          <View className="bg-white rounded-2xl border border-gray-100 p-8 items-center mt-2">
            <Text className="text-gray-700 text-center text-lg font-semibold mb-2">
              No workouts yet
            </Text>
            <Text className="text-gray-500 text-center">
              Create one above to start your first training session.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default WorkoutsList;
