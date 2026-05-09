/**
 * ExerciseModal Component - Progressive Overload Gym App
 *
 * Modal for adding/editing exercises with search functionality
 */

import { useWorkout } from "@/contexts/WorkoutContext";
import { COLORS } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import ExerciseSearchPanel from "./ExerciseSearchPanel";
import SetEditorRow from "./SetEditorRow";

const ExerciseModal: React.FC = () => {
  const {
    isModalVisible,
    isEditMode,
    newExerciseName,
    setNewExerciseName,
    newExerciseSets,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    showCustomEntry,
    setShowCustomEntry,
    selectedApiExercise,
    handleAddNewExercise,
    cancelExerciseCreation,
    handleSearchExercises,
    selectApiExercise,
    addNewSet,
    removeSet,
    updateSetReps,
    updateSetWeight,
  } = useWorkout();

  return (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-indigo-50 dark:bg-indigo-950">
        {/* Modal Header */}
        <View className="border-b border-white/70 dark:border-indigo-900/60 bg-white/70 dark:bg-slate-900/70 px-4 pb-4 pt-3">
          <View className="mb-3 h-1 w-10 self-center rounded-full bg-indigo-200 dark:bg-indigo-700" />
          <View className="flex-row justify-between items-center">
            <TouchableOpacity
              className="rounded-xl border border-indigo-100 dark:border-indigo-800 bg-white/80 dark:bg-slate-900/60 px-4 h-11 items-center justify-center"
              onPress={cancelExerciseCreation}
              accessibilityRole="button"
              accessibilityLabel="Cancel exercise"
            >
              <Text className="text-sm font-medium text-indigo-700 dark:text-indigo-200">
                Cancel
              </Text>
            </TouchableOpacity>
            <View className="items-center">
              <Text className="text-xs text-indigo-500">Workout exercise</Text>
              <Text className="text-lg font-semibold text-indigo-950 dark:text-indigo-50">
                {isEditMode ? "Edit" : "Create"}
              </Text>
            </View>
            <TouchableOpacity
              className="rounded-xl bg-indigo-600 px-4 h-11 items-center justify-center"
              onPress={handleAddNewExercise}
              accessibilityRole="button"
              accessibilityLabel={
                isEditMode ? "Update exercise" : "Save exercise"
              }
            >
              <Text className="text-white text-sm font-semibold">
                {isEditMode ? "Update" : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          className="flex-1 p-4"
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Exercise Search/Selection Section */}
          {!isEditMode && !showCustomEntry ? (
            <ExerciseSearchPanel
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchResults={searchResults}
              isSearching={isSearching}
              selectedApiExercise={selectedApiExercise}
              setShowCustomEntry={setShowCustomEntry}
              setNewExerciseName={setNewExerciseName}
              handleSearchExercises={handleSearchExercises}
              selectApiExercise={selectApiExercise}
            />
          ) : (
            <View className="mb-4 rounded-2xl border border-white/70 dark:border-indigo-900/60 bg-white/70 dark:bg-slate-900/70 p-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-semibold text-indigo-950 dark:text-indigo-50">
                  {isEditMode ? "Exercise Name" : "Custom Exercise Name"}
                </Text>
                {!isEditMode && (
                  <TouchableOpacity
                    className="rounded-xl border border-indigo-100 dark:border-indigo-800 bg-white/80 dark:bg-slate-900/60 px-4 h-11 items-center justify-center"
                    onPress={() => setShowCustomEntry(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Search exercises"
                  >
                    <Text className="font-medium text-indigo-700 dark:text-indigo-200">
                      Search Instead
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                className="rounded-xl border border-indigo-100 dark:border-indigo-800 bg-white/80 dark:bg-slate-900/60 px-3 py-3 text-base text-indigo-950 dark:text-indigo-50"
                placeholder="Enter custom exercise name..."
                placeholderTextColor={COLORS.muted}
                value={newExerciseName}
                onChangeText={setNewExerciseName}
                autoFocus
              />
            </View>
          )}

          {/* Sets Section */}
          <View className="rounded-2xl border border-white/70 dark:border-indigo-900/60 bg-white/70 dark:bg-slate-900/70 p-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-indigo-950 dark:text-indigo-50">
                Sets
              </Text>
              <TouchableOpacity
                className="flex-row items-center rounded-xl border border-indigo-100 dark:border-indigo-800 bg-indigo-50/90 dark:bg-indigo-900/40 px-4 h-11"
                onPress={addNewSet}
                accessibilityRole="button"
                accessibilityLabel="Add set"
              >
                <Ionicons name="add" size={16} color={COLORS.primary} />
                <Text className="text-primary font-semibold ml-1">Add Set</Text>
              </TouchableOpacity>
            </View>

            {newExerciseSets.length === 0 ? (
              <View className="items-center rounded-xl bg-white/80 dark:bg-slate-900/60 p-8">
                <Text className="mb-2 text-center text-indigo-700 dark:text-indigo-200">
                  No sets added yet
                </Text>
                <Text className="text-center text-sm text-indigo-500">
                  Tap &quot;Add Set&quot; to create your first set
                </Text>
              </View>
            ) : (
              newExerciseSets.map((set, index) => (
                <SetEditorRow
                  key={set.id}
                  set={set}
                  index={index}
                  updateSetReps={updateSetReps}
                  updateSetWeight={updateSetWeight}
                  removeSet={removeSet}
                />
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default ExerciseModal;
