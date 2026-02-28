export interface ExercisePerformanceBadges {
  totalVolume: boolean;
  bestSetE1RM: boolean;
  repPrsByWeight: Record<string, boolean>;
}

export const EMPTY_EXERCISE_PERFORMANCE_BADGES: ExercisePerformanceBadges = {
  totalVolume: false,
  bestSetE1RM: false,
  repPrsByWeight: {},
};
