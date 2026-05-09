/**
 * WorkoutItem Component - Progressive Overload Gym App
 *
 * Individual workout item with navigation and delete functionality
 */

import { useWorkoutsList } from "@/contexts";
import { Workout } from "@/types/mappers/workout.mapper";
import { COLORS } from "@/utils/theme";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as Haptics from "expo-haptics";
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
            void (async () => {
              await deleteWorkout(workout);
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
            })();
          },
        },
      ],
    );
  };

  return (
    <Pressable
      onLongPress={() => {
        onEnterDeleteMode();
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }}
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
      className={`relative mb-3 rounded-2xl px-6 py-4 border-2 shadow-sm ${
        isDeleteMode
          ? "border-dashed border-red-500 bg-red-100 dark:bg-red-950/40 dark:border-red-400"
          : "bg-white dark:bg-slate-900/80 border-indigo-200 dark:border-indigo-700"
      }`}
      style={({ pressed }) => [
        { elevation: 2 },
        pressed ? { opacity: 0.9, transform: [{ scale: 0.99 }] } : null,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Open workout ${workout.name}`}
      accessibilityHint={
        isDeleteMode
          ? "Delete mode enabled. Tap bin to delete or tap card to exit delete mode."
          : "Tap to open workout. Long press to enable delete mode."
      }
    >
      {isDeleteMode ? (
        <View className="absolute top-0 right-0 p-4">
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-2xl bg-red-200 dark:bg-red-900/40"
            onPress={handleConfirmDeleteWorkout}
            accessibilityRole="button"
            accessibilityLabel={`Delete workout ${workout.name}`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) =>
              pressed
                ? { opacity: 0.8, transform: [{ scale: 0.98 }] }
                : undefined
            }
          >
            <AntDesign name="delete" size={18} color={COLORS.danger} />
          </Pressable>
        </View>
      ) : null}

      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text
            className={`text-2xl font-black ${
              isDeleteMode
                ? "text-red-700 dark:text-red-300"
                : "text-indigo-950 dark:text-indigo-50"
            }`}
          >
            {workout.name}
          </Text>
          <Text
            className={`text-xl font-bold ${
              isDeleteMode
                ? "text-red-700 dark:text-red-300"
                : "text-indigo-800 dark:text-indigo-200"
            }`}
          >
            Number of exercises: {workout.exercises.length}
          </Text>
          <Text
            className={`text-xl font-bold ${
              isDeleteMode
                ? "text-red-700 dark:text-red-300"
                : "text-indigo-800 dark:text-indigo-200"
            }`}
          >
            Last time worked out: {"Never"}
          </Text>
          <Text
            className={`text-xl ${
              isDeleteMode
                ? "text-red-700 dark:text-red-300"
                : "text-indigo-700 dark:text-indigo-200"
            }`}
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
