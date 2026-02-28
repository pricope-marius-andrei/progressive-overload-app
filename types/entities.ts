import { Database } from "./database.types";

export type WorkoutRow = Database["public"]["Tables"]["workout"]["Row"];
export type ExerciseRow = Database["public"]["Tables"]["exercise"]["Row"];
export type ExerciseSetRow =
  Database["public"]["Tables"]["excercise_set"]["Row"];

export type WorkoutInsert = Database["public"]["Tables"]["workout"]["Insert"];
export type ExerciseInsert = Database["public"]["Tables"]["exercise"]["Insert"];
export type ExerciseSetInsert =
  Database["public"]["Tables"]["excercise_set"]["Insert"];

export type WorkoutUpdate = Database["public"]["Tables"]["workout"]["Update"];
export type ExerciseUpdate = Database["public"]["Tables"]["exercise"]["Update"];
export type ExerciseSetUpdate =
  Database["public"]["Tables"]["excercise_set"]["Update"];
