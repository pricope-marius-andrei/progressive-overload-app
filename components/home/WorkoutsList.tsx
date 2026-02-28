/**
 * WorkoutsList Component - Progressive Overload Gym App
 *
 * Scrollable list of all user workouts with empty state
 */

import { useHome } from "@/contexts";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import WorkoutItem from "./WorkoutItem";

const WorkoutsList: React.FC = () => {
  const { workoutsList } = useHome();

  return (
    <View className="flex-1 mt-6">
      <Text className="text-lg font-semibold text-gray-700 mb-2">
        Your Workouts ({workoutsList.length})
      </Text>

      <ScrollView className="flex-1">
        {workoutsList.length > 0 ? (
          workoutsList.map((workout) => (
            <WorkoutItem key={workout.id} workout={workout} />
          ))
        ) : (
          <View className="bg-gray-50 rounded-lg p-8 items-center mt-4">
            <Text className="text-gray-500 text-center text-lg mb-2">
              No workouts yet
            </Text>
            <Text className="text-gray-400 text-center">
              Create your first workout above to get started!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default WorkoutsList;
