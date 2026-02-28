import { WorkoutInsert } from "@/types/entities";
import { Workout, toWorkout } from "@/types/mappers/workout.mapper";
import { supabase } from "@/utils/supabase";

export async function fetchWorkouts(): Promise<Workout[]> {
  const { data, error } = await supabase.from("workout").select();

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(toWorkout);
}

export async function createWorkout(workoutName: string): Promise<Workout> {
  const payload: WorkoutInsert = {
    name: workoutName,
  };

  const { data, error } = await supabase
    .from("workout")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return toWorkout(data);
}

export async function deleteWorkout(workoutId: number): Promise<void> {
  const { error } = await supabase.from("workout").delete().eq("id", workoutId);

  if (error) {
    throw new Error(error.message);
  }
}
