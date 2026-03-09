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
    className="flex-row items-center justify-between rounded-xl border border-indigo-100 bg-white/80 px-3 py-2.5"
  >
    <View>
      <Text className="text-[11px] uppercase tracking-wide text-indigo-500">
        Weight
      </Text>
      <View className="flex-row items-center gap-1.5 mt-0.5">
        <Text className="text-sm font-semibold text-indigo-900">
          {milestone.weight} kg
        </Text>
        {isPr && <MedalIcon />}
      </View>
    </View>
    <View className="items-end">
      <Text className="text-[11px] uppercase tracking-wide text-indigo-500">
        Best Reps
      </Text>
      <Text className="text-base font-semibold text-indigo-900">
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
    <View className="mt-2 rounded-2xl border border-indigo-100 bg-white/70 p-3">
      <TouchableOpacity
        className="flex-row items-center justify-between"
        onPress={() => setIsExpanded((previous) => !previous)}
        activeOpacity={0.8}
      >
        <Text className="font-semibold text-indigo-900">Performance</Text>
        <View className="flex-row items-center gap-2">
          <View className="rounded-full border border-indigo-100 bg-indigo-50/80 px-2.5 py-1">
            <Text className="text-xs font-medium text-indigo-700">
              {setCount} logged set{setCount === 1 ? "" : "s"}
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="#6366F1"
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <>
          <View className="flex-row gap-2 mb-3 mt-3">
            <View className="flex-1 rounded-xl border border-indigo-100 bg-white/80 p-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-[11px] uppercase tracking-wide text-indigo-500">
                  Total Volume
                </Text>
                {performanceBadges.totalVolume && <MedalIcon />}
              </View>
              <Text className="mt-1 text-lg font-semibold text-indigo-900">
                {totalVolume}
                <Text className="text-sm font-medium text-indigo-500"> kg</Text>
              </Text>
            </View>
            <View className="flex-1 rounded-xl border border-indigo-100 bg-white/80 p-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-[11px] uppercase tracking-wide text-indigo-500">
                  Best Set e1RM
                </Text>
                {performanceBadges.bestSetE1RM && <MedalIcon />}
              </View>
              <Text className="mt-1 text-lg font-semibold text-indigo-900">
                {bestSetE1RM.toFixed(1)}
                <Text className="text-sm font-medium text-indigo-500"> kg</Text>
              </Text>
            </View>
          </View>

          <Text className="mb-2 text-xs uppercase tracking-wide text-indigo-500">
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
            <Text className="italic text-indigo-600">
              No valid sets for PRs
            </Text>
          )}
        </>
      )}
    </View>
  );
};

export default ExercisePerformancePanel;
