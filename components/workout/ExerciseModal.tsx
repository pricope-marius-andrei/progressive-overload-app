/**
 * ExerciseModal Component - Progressive Overload Gym App
 *
 * Modal for adding/editing exercises with search functionality
 */

import { useWorkout } from "@/contexts/WorkoutContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
            <View className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-semibold text-gray-900">
                  Search Exercises
                </Text>
                <TouchableOpacity
                  className="bg-gray-100 rounded-xl px-3 py-2"
                  onPress={() => setShowCustomEntry(true)}
                >
                  <Text className="text-gray-700 font-medium">
                    Create Custom
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-3 text-base mb-3"
                placeholder="Search for exercises (e.g., Bench Press, Squats...)"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  handleSearchExercises(text);
                }}
                autoFocus
              />

              {/* Loading indicator */}
              {isSearching && (
                <View className="py-4 items-center">
                  <Text className="text-gray-500">Searching exercises...</Text>
                </View>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <View className="max-h-72">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Found {searchResults.length} exercise
                    {searchResults.length !== 1 ? "s" : ""}:
                  </Text>
                  <ScrollView>
                    {searchResults.map((exercise) => (
                      <TouchableOpacity
                        key={exercise.exerciseId}
                        className="flex-1 border border-gray-200 rounded-2xl p-3 mb-2 bg-gray-50"
                        onPress={() => selectApiExercise(exercise)}
                      >
                        <View className="flex-row justify-between items-start">
                          <View className="flex-1">
                            {exercise.imageUrl && (
                              <Image
                                source={{
                                  uri: exercise.imageUrl,
                                  width: 200,
                                  height: 150,
                                }}
                                className="w-full h-32 rounded-xl object-cover"
                              />
                            )}
                            <Text className="font-semibold text-gray-900">
                              {exercise.name}
                            </Text>
                            <Text className="text-sm text-gray-600 mt-1">
                              Exercise from database
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color="#6b7280"
                          />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* No results found */}
              {searchQuery.length >= 2 &&
                !isSearching &&
                searchResults.length === 0 && (
                  <View className="py-4 items-center border border-dashed border-gray-300 rounded-xl">
                    <Text className="text-gray-500 mb-2">
                      No exercises found for &quot;{searchQuery}&quot;
                    </Text>
                    <TouchableOpacity
                      className="bg-primary rounded-xl px-4 py-2"
                      onPress={() => {
                        setNewExerciseName(searchQuery);
                        setShowCustomEntry(true);
                      }}
                    >
                      <Text className="text-white font-medium">
                        Create &quot;{searchQuery}&quot;
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

              {/* Selected exercise preview */}
              {selectedApiExercise && (
                <View className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mt-3">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                      <Text className="font-semibold text-indigo-800">
                        Selected: {selectedApiExercise.name}
                      </Text>
                      <Text className="text-sm text-primary">
                        Ready to add to workout
                      </Text>
                    </View>
                    <TouchableOpacity
                      className="bg-white rounded-xl px-3 py-1 border border-indigo-200"
                      onPress={() => {
                        selectApiExercise(null);
                        setNewExerciseName("");
                        setSearchQuery("");
                      }}
                    >
                      <Text className="text-indigo-700 text-sm">Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ) : (
            // Custom Exercise Entry
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
                <View
                  key={set.id}
                  className="flex-row items-center justify-between py-3 border border-gray-100 rounded-xl px-2 mb-2"
                >
                  <View className="flex-row items-center flex-1">
                    <Text className="text-gray-600 w-12 font-medium">
                      Set {index + 1}
                    </Text>

                    {/* Reps Input */}
                    <View className="flex-1 mx-2">
                      <Text className="text-xs text-gray-500 mb-1">Reps</Text>
                      <TextInput
                        className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-center"
                        value={set.reps.toString()}
                        onChangeText={(text) => {
                          const reps = parseInt(text) || 0;
                          updateSetReps(set.id, reps);
                        }}
                        keyboardType="numeric"
                        placeholder="10"
                      />
                    </View>

                    {/* Weight Input */}
                    <View className="flex-1 mx-2">
                      <Text className="text-xs text-gray-500 mb-1">
                        Weight (kg)
                      </Text>
                      <TextInput
                        className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-center"
                        value={set.weight.toString()}
                        onChangeText={(text) => {
                          const weight = parseFloat(text) || 0;
                          updateSetWeight(set.id, weight);
                        }}
                        keyboardType="numeric"
                        placeholder="50"
                      />
                    </View>
                  </View>

                  {/* Remove Set Button */}
                  <TouchableOpacity
                    className="p-2 bg-red-50 rounded-lg"
                    onPress={() => removeSet(set.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default ExerciseModal;
