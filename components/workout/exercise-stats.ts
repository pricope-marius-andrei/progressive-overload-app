import { ExerciseSet } from "@/types/mappers/workout.mapper";

export interface RepPrMilestone {
  weight: number;
  maxReps: number;
}

export interface ExerciseStats {
  totalVolume: number;
  bestSetE1RM: number;
  repPrMilestones: RepPrMilestone[];
}

export function getExerciseStats(sets: ExerciseSet[]): ExerciseStats {
  const totalVolume = sets.reduce((sum, set) => {
    if (set.reps <= 0 || set.weight < 0) {
      return sum;
    }

    return sum + set.weight * set.reps;
  }, 0);

  const bestSetE1RM = sets.reduce((best, set) => {
    if (set.reps <= 0 || set.weight <= 0) {
      return best;
    }

    const e1RM = set.weight * (1 + set.reps / 30);
    return Math.max(best, e1RM);
  }, 0);

  const repsByWeight = new Map<number, number>();
  for (const set of sets) {
    if (set.reps <= 0 || set.weight < 0) {
      continue;
    }

    const currentMaxReps = repsByWeight.get(set.weight) ?? 0;
    if (set.reps > currentMaxReps) {
      repsByWeight.set(set.weight, set.reps);
    }
  }

  const repPrMilestones: RepPrMilestone[] = Array.from(repsByWeight.entries())
    .map(([weight, maxReps]) => ({ weight, maxReps }))
    .sort((first, second) => first.weight - second.weight);

  return {
    totalVolume,
    bestSetE1RM,
    repPrMilestones,
  };
}
