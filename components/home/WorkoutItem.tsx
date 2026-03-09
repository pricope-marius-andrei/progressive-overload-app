/**
 * WorkoutItem Component - Progressive Overload Gym App
 *
 * Individual workout item with navigation and delete functionality
 */

import { useHome } from "@/contexts";
import { Workout } from "@/types/mappers/workout.mapper";
import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import { Alert, Pressable, Text, TouchableOpacity, View } from "react-native";

interface WorkoutItemProps {
  workout: Workout;
}

const WorkoutItem: React.FC<WorkoutItemProps> = ({ workout }) => {
  const { navigateToWorkout, handleDeleteWorkout } = useHome();

  const handleConfirmDeleteWorkout = () => {
    Alert.alert(
      "Delete workout?",
      `This will permanently remove \"${workout.name}\" and all of its exercises.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeleteWorkout(workout),
        },
      ],
    );
  };

  return (
    <View className="mb-3 rounded-3xl border border-white/70 bg-white/65 p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="rounded-full border border-indigo-100 bg-indigo-50/80 px-2.5 py-1">
          <Text className="text-[10px] font-semibold uppercase tracking-[1px] text-indigo-600">
            Workout
          </Text>
        </View>

        <TouchableOpacity
          className="ml-3 rounded-xl border border-indigo-100 bg-indigo-50/80 p-2"
          onPress={handleConfirmDeleteWorkout}
          accessibilityRole="button"
          accessibilityLabel={`Delete workout ${workout.name}`}
        >
          <AntDesign name="delete" size={18} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={() => navigateToWorkout(workout)}
          className="flex-1 flex-row items-center"
          accessibilityRole="button"
          accessibilityLabel={`Open workout ${workout.name}`}
        >
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full border border-indigo-200 bg-indigo-500">
            <AntDesign name="caret-right" size={12} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-indigo-950">
              {workout.name}
            </Text>
            <Text className="text-sm text-indigo-700">
              Tap to open and log sets
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default WorkoutItem;
