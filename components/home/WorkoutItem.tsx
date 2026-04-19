/**
 * WorkoutItem Component - Progressive Overload Gym App
 *
 * Individual workout item with navigation and delete functionality
 */

import { useWorkoutsList } from "@/contexts";
import { Workout } from "@/types/mappers/workout.mapper";
import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import { Alert, Pressable, Text, View } from "react-native";

interface WorkoutItemProps {
  workout: Workout;
  isDeleteMode: boolean;
  hasAnyDeleteModeActive: boolean;
  onEnterDeleteMode: () => void;
  onExitDeleteMode: () => void;
  onOpenWorkout?: (workout: Workout) => void;
  onDeleteWorkout?: (workout: Workout) => Promise<void>;
  subtitle?: string;
}

function WorkoutItem({
  workout,
  isDeleteMode,
  hasAnyDeleteModeActive,
  onEnterDeleteMode,
  onExitDeleteMode,
  onOpenWorkout,
  onDeleteWorkout,
  subtitle,
}: WorkoutItemProps) {
  const { navigateToWorkout, handleDeleteWorkout } = useWorkoutsList();

  const openWorkout = onOpenWorkout ?? navigateToWorkout;
  const deleteWorkout = onDeleteWorkout ?? handleDeleteWorkout;

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
          onPress: () => {
            void deleteWorkout(workout);
          },
        },
      ],
    );
  };

  return (
    <Pressable
      onLongPress={onEnterDeleteMode}
      delayLongPress={250}
      onPress={() => {
        if (hasAnyDeleteModeActive && !isDeleteMode) {
          onExitDeleteMode();
          return;
        }

        if (isDeleteMode) {
          onExitDeleteMode();
          return;
        }

        openWorkout(workout);
      }}
      className={`relative mb-3 rounded-2xl border-solid border-4 p-4 ${
        isDeleteMode
          ? "border-dashed border-red-500 bg-red-100"
          : "border-status-selected-border bg-status-selected-bg"
      }`}
      accessibilityRole="button"
      accessibilityLabel={`Open workout ${workout.name}`}
      accessibilityHint={
        isDeleteMode
          ? "Delete mode enabled. Tap bin to delete or tap card to exit delete mode."
          : "Tap to open workout. Long press to enable delete mode."
      }
    >
      {isDeleteMode ? (
        <View className="absolute top-0 right-0 p-5">
          <Pressable
            className="rounded-xl bg-red-200 p-2"
            onPress={handleConfirmDeleteWorkout}
            accessibilityRole="button"
            accessibilityLabel={`Delete workout ${workout.name}`}
          >
            <AntDesign name="delete" size={18} color="#B91C1C" />
          </Pressable>
        </View>
      ) : null}

      <View className="flex-row items-center justify-between">
        <View className="flex-1 px-10">
          <Text
            className={`text-2xl font-black ${isDeleteMode ? "text-red-700" : "text-status-selected-text"}`}
          >
            {workout.name}
          </Text>
          <Text
            className={`text-xl font-bold ${isDeleteMode ? "text-red-700" : "text-status-selected-text"}`}
          >
            Number of exercises: {workout.exercises.length}
          </Text>
          <Text
            className={`text-xl font-bold ${isDeleteMode ? "text-red-700" : "text-status-selected-text"}`}
          >
            Last time worked out: {"Never"}
          </Text>
          <Text
            className={`text-xl ${isDeleteMode ? "text-red-700" : "text-status-selected-text"}`}
          >
            {isDeleteMode
              ? "Delete mode active"
              : (subtitle ?? "Tap to open and log sets")}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default WorkoutItem;
