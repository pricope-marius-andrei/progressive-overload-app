/**
 * WorkoutItem Component - Progressive Overload Gym App
 *
 * Individual workout item with navigation and delete functionality
 */

import { useHome } from "@/contexts";
import { Workout } from "@/types/mappers/workout.mapper";
import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

interface WorkoutItemProps {
  workout: Workout;
}

const WorkoutItem: React.FC<WorkoutItemProps> = ({ workout }) => {
  const { navigateToWorkout, handleDeleteWorkout } = useHome();

  return (
    <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
      <View className="flex-row justify-between items-center">
        <Pressable
          onPress={() => navigateToWorkout(workout)}
          className="flex-1 flex-row items-center"
        >
          <View className="h-9 w-9 rounded-full bg-indigo-50 items-center justify-center mr-3">
            <AntDesign name="caret-right" size={12} color="#6366f1" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 font-semibold text-base">
              {workout.name}
            </Text>
            <Text className="text-gray-500 text-sm">Tap to open workout</Text>
          </View>
        </Pressable>
        <TouchableOpacity
          className="bg-red-50 rounded-xl p-2 ml-3"
          onPress={() => handleDeleteWorkout(workout)}
        >
          <AntDesign name="delete" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WorkoutItem;
