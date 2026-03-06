import { ApiExercise } from "@/types/api.types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface ExerciseSearchPanelProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: ApiExercise[];
  isSearching: boolean;
  selectedApiExercise: ApiExercise | null;
  setShowCustomEntry: (show: boolean) => void;
  setNewExerciseName: (name: string) => void;
  handleSearchExercises: (query: string) => void;
  selectApiExercise: (exercise: ApiExercise | null) => void;
}

const ExerciseSearchPanel: React.FC<ExerciseSearchPanelProps> = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  selectedApiExercise,
  setShowCustomEntry,
  setNewExerciseName,
  handleSearchExercises,
  selectApiExercise,
}) => {
  const handleClearSelection = () => {
    Alert.alert(
      "Remove selected exercise?",
      "The selected exercise will be cleared.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            selectApiExercise(null);
            setNewExerciseName("");
            setSearchQuery("");
          },
        },
      ],
    );
  };

  return (
    <View className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold text-gray-900">
          Search Exercises
        </Text>
        <TouchableOpacity
          className="bg-gray-100 rounded-xl px-3 py-2"
          onPress={() => setShowCustomEntry(true)}
        >
          <Text className="text-gray-700 font-medium">Create Custom</Text>
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

      {isSearching && (
        <View className="py-4 items-center">
          <Text className="text-gray-500">Searching exercises...</Text>
        </View>
      )}

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
                  <Ionicons name="chevron-forward" size={16} color="#6b7280" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

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
              onPress={handleClearSelection}
            >
              <Text className="text-indigo-700 text-sm">Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default ExerciseSearchPanel;
