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
  const [isPerformanceExpanded, setIsPerformanceExpanded] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const detailedExercise = getLoadedExerciseDetails(exercise.id);
  const sets = detailedExercise?.sets || [];
  const setLabel = `${exercise.setCount} set${exercise.setCount === 1 ? "" : "s"}`;
  const { totalVolume, bestSetE1RM, repPrMilestones } = getExerciseStats(sets);
  const performanceBadges = getExercisePerformanceBadges(exercise.id);

  const renderMedal = () => <Ionicons name="medal" size={16} color="#f59e0b" />;

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
    <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
      <View className="flex-row justify-between items-center mb-3">
        <TouchableOpacity
          className="flex-1 pr-2"
          onPress={handleToggleExpand}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-between">
            <View className="pr-2 flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                {exercise.name}
              </Text>
              <Text className="text-sm text-gray-500 mt-0.5">{setLabel}</Text>
            </View>
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={18}
              color="#6b7280"
            />
          </View>
        </TouchableOpacity>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            className={`rounded-xl px-3 py-2 ${
              isHistoryMode ? "bg-gray-100" : "bg-indigo-50"
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
                    ? "text-gray-400"
                    : "text-primary"
                }`}
              >
                Edit
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            className={`rounded-xl px-3 py-2 ${
              isHistoryMode ? "bg-gray-100" : "bg-red-50"
            }`}
            onPress={handleConfirmRemoveExercise}
            disabled={isHistoryMode}
          >
            <Text
              className={`font-medium ${
                isHistoryMode ? "text-gray-400" : "text-red-600"
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
            <Text className="text-gray-500 italic mb-2">
              Loading details...
            </Text>
          )}

          {sets.map((set, index) => (
            <View
              key={set.id}
              className="flex-row justify-between items-center py-2.5 px-2 rounded-xl bg-gray-50 mb-2"
            >
              <Text className="text-gray-500">Set {index + 1}</Text>
              <Text className="text-gray-800 font-medium">
                {set.reps} reps × {set.weight} kg
              </Text>
            </View>
          ))}

          {sets.length > 0 && (
            <View className="mt-2 rounded-2xl border border-gray-100 bg-gray-50 p-3">
              <TouchableOpacity
                className="flex-row items-center justify-between"
                onPress={() =>
                  setIsPerformanceExpanded((previous) => !previous)
                }
                activeOpacity={0.8}
              >
                <Text className="text-gray-900 font-semibold">Performance</Text>
                <View className="flex-row items-center gap-2">
                  <View className="rounded-full bg-white border border-gray-200 px-2.5 py-1">
                    <Text className="text-xs font-medium text-gray-600">
                      {sets.length} logged set
                      {sets.length === 1 ? "" : "s"}
                    </Text>
                  </View>
                  <Ionicons
                    name={isPerformanceExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#6b7280"
                  />
                </View>
              </TouchableOpacity>

              {isPerformanceExpanded && (
                <>
                  <View className="flex-row gap-2 mb-3 mt-3">
                    <View className="flex-1 rounded-xl bg-white border border-gray-200 p-3">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-[11px] uppercase tracking-wide text-gray-500">
                          Total Volume
                        </Text>
                        {performanceBadges.totalVolume && renderMedal()}
                      </View>
                      <Text className="text-lg font-semibold text-gray-900 mt-1">
                        {totalVolume}
                        <Text className="text-sm font-medium text-gray-500">
                          {" "}
                          kg
                        </Text>
                      </Text>
                    </View>
                    <View className="flex-1 rounded-xl bg-white border border-gray-200 p-3">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-[11px] uppercase tracking-wide text-gray-500">
                          Best Set e1RM
                        </Text>
                        {performanceBadges.bestSetE1RM && renderMedal()}
                      </View>
                      <Text className="text-lg font-semibold text-gray-900 mt-1">
                        {bestSetE1RM.toFixed(1)}
                        <Text className="text-sm font-medium text-gray-500">
                          {" "}
                          kg
                        </Text>
                      </Text>
                    </View>
                  </View>

                  <Text className="text-gray-500 text-xs uppercase tracking-wide mb-2">
                    Rep PRs
                  </Text>
                  {repPrMilestones.length > 0 ? (
                    <View className="gap-2">
                      {repPrMilestones.map((milestone) => (
                        <View
                          key={`${exercise.id}-${milestone.weight}`}
                          className="rounded-xl bg-white border border-gray-200 px-3 py-2.5 flex-row items-center justify-between"
                        >
                          <View>
                            <Text className="text-[11px] uppercase tracking-wide text-gray-500">
                              Weight
                            </Text>
                            <View className="flex-row items-center gap-1.5 mt-0.5">
                              <Text className="text-sm font-semibold text-gray-900">
                                {milestone.weight} kg
                              </Text>
                              {performanceBadges.repPrsByWeight[
                                String(milestone.weight)
                              ] && renderMedal()}
                            </View>
                          </View>
                          <View className="items-end">
                            <Text className="text-[11px] uppercase tracking-wide text-gray-500">
                              Best Reps
                            </Text>
                            <Text className="text-base font-semibold text-gray-900">
                              {milestone.maxReps}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text className="text-gray-500 italic">
                      No valid sets for PRs
                    </Text>
                  )}
                </>
              )}
            </View>
          )}

          {!isLoadingDetails && sets.length === 0 && (
            <Text className="text-gray-500 italic">No sets added</Text>
          )}
        </>
      )}

      {!isExpanded && (
        <Text className="text-gray-500 text-sm italic">
          Collapsed — tap the header to expand.
        </Text>
      )}
    </View>
  );
};

export default ExerciseItem;
