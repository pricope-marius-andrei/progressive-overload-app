/**
 * ExerciseItem Component - Progressive Overload Gym App
 *
 * Individual exercise item with sets display and edit functionality
 */

import { useWorkout } from "@/contexts/WorkoutContext";
import { ExerciseSummary } from "@/types/mappers/workout.mapper";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { getExerciseStats } from "./exercise-stats";
import ExercisePerformancePanel from "./ExercisePerformancePanel";

interface ExerciseItemProps {
  exercise: ExerciseSummary;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ exercise }) => {
  const {
    startEditingExercise,
    removeExercise,
    isHistoryMode,
    getExercisePerformanceBadges,
    loadExerciseDetails,
    getLoadedExerciseDetails,
  } = useWorkout();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const detailedExercise = getLoadedExerciseDetails(exercise.id);
  const sets = detailedExercise?.sets || [];
  const setLabel = `${exercise.setCount} set${exercise.setCount === 1 ? "" : "s"}`;
  const stats = getExerciseStats(sets);
  const performanceBadges = getExercisePerformanceBadges(exercise.id);

  const handleToggleExpand = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    setIsExpanded(true);
    if (detailedExercise || isLoadingDetails) {
      return;
    }

    setIsLoadingDetails(true);
    try {
      await loadExerciseDetails(exercise.id);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleEditPress = async () => {
    setIsLoadingDetails(true);
    try {
      await startEditingExercise(exercise.id);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleConfirmRemoveExercise = () => {
    Alert.alert(
      "Remove exercise?",
      `This will permanently remove \"${exercise.name}\" and all of its sets.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            void removeExercise(exercise);
          },
        },
      ],
    );
  };

  return (
    <View className="mb-3 rounded-2xl border border-white/70 bg-white/65 p-4">
      <View className="flex-row justify-between items-center mb-3">
        <TouchableOpacity
          className="flex-1 pr-2"
          onPress={handleToggleExpand}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-between">
            <View className="pr-2 flex-1">
              <Text className="text-lg font-semibold text-indigo-950">
                {exercise.name}
              </Text>
              <Text className="mt-0.5 text-sm text-indigo-700">{setLabel}</Text>
            </View>
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={18}
              color="#6366F1"
            />
          </View>
        </TouchableOpacity>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            className={`rounded-xl px-3 py-2 ${
              isHistoryMode ? "bg-indigo-100" : "bg-indigo-50/90"
            }`}
            onPress={handleEditPress}
            disabled={isHistoryMode || isLoadingDetails}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="pencil"
                size={16}
                color={isHistoryMode ? "#9ca3af" : "#6366f1"}
              />
              <Text
                className={`font-medium ml-1 ${
                  isHistoryMode || isLoadingDetails
                    ? "text-indigo-300"
                    : "text-primary"
                }`}
              >
                Edit
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            className={`rounded-xl px-3 py-2 ${
              isHistoryMode ? "bg-indigo-100" : "bg-indigo-50/90"
            }`}
            onPress={handleConfirmRemoveExercise}
            disabled={isHistoryMode}
          >
            <Text
              className={`font-medium ${
                isHistoryMode ? "text-indigo-300" : "text-indigo-700"
              }`}
            >
              Remove
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isExpanded && (
        <>
          {isLoadingDetails && !detailedExercise && (
            <Text className="mb-2 italic text-indigo-600">
              Loading details...
            </Text>
          )}

          {sets.map((set, index) => (
            <View
              key={set.id}
              className="mb-2 flex-row items-center justify-between rounded-xl bg-white/80 px-2 py-2.5"
            >
              <Text className="text-indigo-700">Set {index + 1}</Text>
              <Text className="font-medium text-indigo-900">
                {set.reps} reps × {set.weight} kg
              </Text>
            </View>
          ))}

          {sets.length > 0 && (
            <ExercisePerformancePanel
              exerciseId={exercise.id}
              stats={stats}
              performanceBadges={performanceBadges}
              setCount={sets.length}
            />
          )}

          {!isLoadingDetails && sets.length === 0 && (
            <Text className="italic text-indigo-600">No sets added</Text>
          )}
        </>
      )}

      {!isExpanded && (
        <Text className="text-sm italic text-indigo-600">
          Collapsed — tap the header to expand.
        </Text>
      )}
    </View>
  );
};

export default ExerciseItem;
