/**
 * Workout Details Screen - Progressive Overload Gym App
 *
 * Main workout screen with exercises management.
 * Refactored into reusable components with context-based state management.
 */

import {
    AddExerciseButton,
    ExerciseModal,
    ExercisesList,
    WorkoutHeader,
    XpGainPopup,
} from "@/components";
import { useWorkout } from "@/contexts/WorkoutContext";
import React, { useCallback, useMemo, useRef } from "react";
import { PanResponder, View } from "react-native";

const SWIPE_THRESHOLD = 40;
const SWIPE_ACTIVATION_DISTANCE = 14;
const SWIPE_HORIZONTAL_BIAS = 1.2;

const DayWorkoutScreen: React.FC = () => {
  const {
    isModalVisible,
    selectableSnapshotDates,
    selectedSnapshotDate,
    setSelectedSnapshotDate,
  } = useWorkout();

  const orderedSnapshotDates = useMemo(
    () => [...selectableSnapshotDates].reverse(),
    [selectableSnapshotDates],
  );

  const changeDateBySwipe = useCallback(
    (direction: "left" | "right") => {
      if (orderedSnapshotDates.length === 0) {
        return;
      }

      const selectedIndex = orderedSnapshotDates.indexOf(selectedSnapshotDate);
      if (selectedIndex < 0) {
        return;
      }

      const targetIndex =
        direction === "left"
          ? Math.min(selectedIndex + 1, orderedSnapshotDates.length - 1)
          : Math.max(selectedIndex - 1, 0);

      if (targetIndex === selectedIndex) {
        return;
      }

      setSelectedSnapshotDate(orderedSnapshotDates[targetIndex]);
    },
    [orderedSnapshotDates, selectedSnapshotDate, setSelectedSnapshotDate],
  );

  // Store latest callbacks in refs so PanResponder doesn't need recreation
  const changeDateBySwipeRef = useRef(changeDateBySwipe);
  changeDateBySwipeRef.current = changeDateBySwipe;
  const isModalVisibleRef = useRef(isModalVisible);
  isModalVisibleRef.current = isModalVisible;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          if (isModalVisibleRef.current) {
            return false;
          }

          const horizontalDistance = Math.abs(gestureState.dx);
          const verticalDistance = Math.abs(gestureState.dy);

          return (
            horizontalDistance > SWIPE_ACTIVATION_DISTANCE &&
            horizontalDistance > verticalDistance * SWIPE_HORIZONTAL_BIAS
          );
        },
        onPanResponderRelease: (_, gestureState) => {
          const horizontalDistance = Math.abs(gestureState.dx);
          const verticalDistance = Math.abs(gestureState.dy);

          if (
            horizontalDistance < SWIPE_THRESHOLD ||
            horizontalDistance <= verticalDistance
          ) {
            return;
          }

          if (gestureState.dx < 0) {
            changeDateBySwipeRef.current("left");
            return;
          }

          changeDateBySwipeRef.current("right");
        },
      }),
    [],
  );

  return (
    <View
      className="relative flex-1 bg-[#EEF2FF] px-5 pt-4 pb-2"
      {...panResponder.panHandlers}
    >
      <View
        pointerEvents="none"
        style={{ zIndex: 0 }}
        className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-[#6366F1]/15"
      />
      <View
        pointerEvents="none"
        style={{ zIndex: 0 }}
        className="absolute top-32 -left-16 h-56 w-56 rounded-full bg-[#6366F1]/10"
      />

      <View className="flex-1" style={{ zIndex: 1 }}>
        <WorkoutHeader />
        <AddExerciseButton />
        <ExercisesList />
        <ExerciseModal />
        <XpGainPopup />
      </View>
    </View>
  );
};

export default DayWorkoutScreen;
