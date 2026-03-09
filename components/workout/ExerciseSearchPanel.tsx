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
    <View className="mb-4 rounded-2xl border border-white/70 bg-white/65 p-4">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold text-indigo-950">
          Search Exercises
        </Text>
        <TouchableOpacity
          className="rounded-xl border border-indigo-100 bg-white/80 px-3 py-2"
          onPress={() => setShowCustomEntry(true)}
        >
          <Text className="font-medium text-indigo-700">Create Custom</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        className="mb-3 rounded-xl border border-indigo-100 bg-white/80 px-3 py-3 text-base text-indigo-950"
        placeholder="Search for exercises (e.g., Bench Press, Squats...)"
        placeholderTextColor="#6366F1"
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          handleSearchExercises(text);
        }}
        autoFocus
      />

      {isSearching && (
        <View className="py-4 items-center">
          <Text className="text-indigo-600">Searching exercises...</Text>
        </View>
      )}

      {searchResults.length > 0 && (
        <View className="max-h-72">
          <Text className="mb-2 text-sm font-medium text-indigo-700">
            Found {searchResults.length} exercise
            {searchResults.length !== 1 ? "s" : ""}:
          </Text>
          <ScrollView>
            {searchResults.map((exercise) => (
              <TouchableOpacity
                key={exercise.exerciseId}
                className="mb-2 flex-1 rounded-2xl border border-indigo-100 bg-white/80 p-3"
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
                    <Text className="font-semibold text-indigo-950">
                      {exercise.name}
                    </Text>
                    <Text className="mt-1 text-sm text-indigo-700">
                      Exercise from database
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#6366F1" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {searchQuery.length >= 2 &&
        !isSearching &&
        searchResults.length === 0 && (
          <View className="items-center rounded-xl border border-dashed border-indigo-200 py-4">
            <Text className="mb-2 text-indigo-600">
              No exercises found for &quot;{searchQuery}&quot;
            </Text>
            <TouchableOpacity
              className="rounded-xl bg-indigo-500 px-4 py-2"
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
        <View className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/80 p-3">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="font-semibold text-indigo-800">
                Selected: {selectedApiExercise.name}
              </Text>
              <Text className="text-sm text-indigo-600">
                Ready to add to workout
              </Text>
            </View>
            <TouchableOpacity
              className="rounded-xl border border-indigo-100 bg-white/80 px-3 py-1"
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
