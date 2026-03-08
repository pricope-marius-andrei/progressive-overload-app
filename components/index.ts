/**
 * Component Barrel Exports - Progressive Overload Gym App
 *
 * Centralized exports for all reusable components organized by screen
 */

// Auth components
export { AuthRequired } from "./auth";

// Home screen components
export {
    AddWorkoutForm,
    GymPickerModal,
    TrainingCalendar,
    WelcomeHeader,
    WorkoutItem,
    WorkoutsList
} from "./home";

// Workout screen components
export {
    AddExerciseButton,
    ExerciseItem,
    ExerciseModal,
    ExercisesList,
    WorkoutDatePicker,
    WorkoutHeader,
    XpGainPopup
} from "./workout";

