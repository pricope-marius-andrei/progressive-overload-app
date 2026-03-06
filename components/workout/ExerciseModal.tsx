/**
 * ExerciseModal Component - Progressive Overload Gym App
 *
 * Modal for adding/editing exercises with search functionality
 */

import { useWorkout } from "@/contexts/WorkoutContext";
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
      <View className="flex-1 bg-gray-50">
        {/* Modal Header */}
        <View className="bg-white px-4 pt-3 pb-4 border-b border-gray-100">
          <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-3" />
          <View className="flex-row justify-between items-center">
            <TouchableOpacity
              className="bg-gray-100 rounded-xl px-3 py-2"
              onPress={cancelExerciseCreation}
            >
              <Text className="text-gray-700 text-sm font-medium">Cancel</Text>
            </TouchableOpacity>
            <View className="items-center">
              <Text className="text-xs text-gray-500">Workout exercise</Text>
              <Text className="text-lg font-semibold text-gray-900">
                {isEditMode ? "Edit" : "Create"}
              </Text>
            </View>
            <TouchableOpacity
              className="bg-primary rounded-xl px-3 py-2"
              onPress={handleAddNewExercise}
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
            <View className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-semibold text-gray-900">
                  {isEditMode ? "Exercise Name" : "Custom Exercise Name"}
                </Text>
                {!isEditMode && (
                  <TouchableOpacity
                    className="bg-gray-100 rounded-xl px-3 py-2"
                    onPress={() => setShowCustomEntry(false)}
                  >
                    <Text className="text-gray-700 font-medium">
                      Search Instead
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-3 text-base"
                placeholder="Enter custom exercise name..."
                value={newExerciseName}
                onChangeText={setNewExerciseName}
                autoFocus
              />
            </View>
          )}

          {/* Sets Section */}
          <View className="bg-white rounded-2xl p-4 border border-gray-100">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-gray-900">Sets</Text>
              <TouchableOpacity
                className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2 flex-row items-center"
                onPress={addNewSet}
              >
                <Ionicons name="add" size={16} color="#6366f1" />
                <Text className="text-primary font-semibold ml-1">Add Set</Text>
              </TouchableOpacity>
            </View>

            {newExerciseSets.length === 0 ? (
              <View className="bg-gray-50 rounded-xl p-8 items-center">
                <Text className="text-gray-500 text-center mb-2">
                  No sets added yet
                </Text>
                <Text className="text-gray-400 text-sm text-center">
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
