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
    <View className="bg-white rounded-lg shadow p-4 mb-4">
      <View className="flex-row justify-between items-center">
        <Pressable
          onPress={() => navigateToWorkout(workout)}
          className="flex-1"
        >
          <Text className="text-gray-800 font-medium">{workout.name}</Text>
        </Pressable>
        <TouchableOpacity
          className="bg-red-100 rounded-lg p-2 ml-3"
          onPress={() => handleDeleteWorkout(workout)}
        >
          <AntDesign name="delete" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WorkoutItem;
