export interface ExercisePerformanceBadges {
  totalVolume: boolean;
  bestSetE1RM: boolean;
  repPrsByWeight: Record<string, boolean>;
}

export const EMPTY_EXERCISE_PERFORMANCE_BADGES: Readonly<ExercisePerformanceBadges> =
  Object.freeze({
    totalVolume: false,
    bestSetE1RM: false,
    repPrsByWeight: Object.freeze({} as Record<string, boolean>),
  });
