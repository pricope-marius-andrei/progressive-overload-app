import { ExercisePerformanceBadges } from "@/contexts/workout/performance.types";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ExerciseStats, RepPrMilestone } from "./exercise-stats";

interface ExercisePerformancePanelProps {
  exerciseId: number;
  stats: ExerciseStats;
  performanceBadges: ExercisePerformanceBadges;
  setCount: number;
}

const MedalIcon = () => <Ionicons name="medal" size={16} color="#f59e0b" />;

const RepPrRow: React.FC<{
  milestone: RepPrMilestone;
  exerciseId: number;
  isPr: boolean;
}> = ({ milestone, exerciseId, isPr }) => (
  <View
    key={`${exerciseId}-${milestone.weight}`}
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
        {isPr && <MedalIcon />}
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
);

const ExercisePerformancePanel: React.FC<ExercisePerformancePanelProps> = ({
  exerciseId,
  stats,
  performanceBadges,
  setCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { totalVolume, bestSetE1RM, repPrMilestones } = stats;

  return (
    <View className="mt-2 rounded-2xl border border-gray-100 bg-gray-50 p-3">
      <TouchableOpacity
        className="flex-row items-center justify-between"
        onPress={() => setIsExpanded((previous) => !previous)}
        activeOpacity={0.8}
      >
        <Text className="text-gray-900 font-semibold">Performance</Text>
        <View className="flex-row items-center gap-2">
          <View className="rounded-full bg-white border border-gray-200 px-2.5 py-1">
            <Text className="text-xs font-medium text-gray-600">
              {setCount} logged set{setCount === 1 ? "" : "s"}
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="#6b7280"
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <>
          <View className="flex-row gap-2 mb-3 mt-3">
            <View className="flex-1 rounded-xl bg-white border border-gray-200 p-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-[11px] uppercase tracking-wide text-gray-500">
                  Total Volume
                </Text>
                {performanceBadges.totalVolume && <MedalIcon />}
              </View>
              <Text className="text-lg font-semibold text-gray-900 mt-1">
                {totalVolume}
                <Text className="text-sm font-medium text-gray-500"> kg</Text>
              </Text>
            </View>
            <View className="flex-1 rounded-xl bg-white border border-gray-200 p-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-[11px] uppercase tracking-wide text-gray-500">
                  Best Set e1RM
                </Text>
                {performanceBadges.bestSetE1RM && <MedalIcon />}
              </View>
              <Text className="text-lg font-semibold text-gray-900 mt-1">
                {bestSetE1RM.toFixed(1)}
                <Text className="text-sm font-medium text-gray-500"> kg</Text>
              </Text>
            </View>
          </View>

          <Text className="text-gray-500 text-xs uppercase tracking-wide mb-2">
            Rep PRs
          </Text>
          {repPrMilestones.length > 0 ? (
            <View className="gap-2">
              {repPrMilestones.map((milestone) => (
                <RepPrRow
                  key={`${exerciseId}-${milestone.weight}`}
                  milestone={milestone}
                  exerciseId={exerciseId}
                  isPr={
                    !!performanceBadges.repPrsByWeight[String(milestone.weight)]
                  }
                />
              ))}
            </View>
          ) : (
            <Text className="text-gray-500 italic">No valid sets for PRs</Text>
          )}
        </>
      )}
    </View>
  );
};

export default ExercisePerformancePanel;
