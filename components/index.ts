/**
 * Component Barrel Exports - Progressive Overload Gym App
 *
 * Centralized exports for all reusable components organized by screen
 */

// Auth components
export { AuthRequired } from "./auth";

// Home screen components
export { AddWorkoutForm, GymPickerModal, Header, WorkoutItem } from "./home";

export { TrainingCalendar } from "./training-calendar";

// Workout screen components
export {
    AddExerciseButton,
    ExerciseItem,
    ExerciseModal,
    ExercisesList,
    WorkoutDatePicker,
    WorkoutHeader,
    WorkoutsList,
    XpGainPopup
} from "./workout";

