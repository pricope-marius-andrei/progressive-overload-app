import { ApiExercise } from "@/types/api.types";
import { COLORS } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import {
    Alert,
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
    <View className="mb-4 rounded-2xl border border-white/70 dark:border-indigo-900/60 bg-white/70 dark:bg-slate-900/70 p-4">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold text-indigo-950 dark:text-indigo-50">
          Search Exercises
        </Text>
        <TouchableOpacity
          className="rounded-xl border border-indigo-100 dark:border-indigo-800 bg-white/80 dark:bg-slate-900/60 px-4 h-11 items-center justify-center"
          onPress={() => setShowCustomEntry(true)}
          accessibilityRole="button"
          accessibilityLabel="Create custom exercise"
        >
          <Text className="font-medium text-indigo-700 dark:text-indigo-200">
            Create Custom
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        className="mb-3 rounded-xl border border-indigo-100 dark:border-indigo-800 bg-white/80 dark:bg-slate-900/60 px-3 py-3 text-base text-indigo-950 dark:text-indigo-50"
        placeholder="Search for exercises (e.g., Bench Press, Squats...)"
        placeholderTextColor={COLORS.muted}
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          handleSearchExercises(text);
        }}
        autoFocus
      />

      {isSearching && (
        <View className="py-4 items-center">
          <Text className="text-indigo-600 dark:text-indigo-200">
            Searching exercises...
          </Text>
        </View>
      )}

      {searchResults.length > 0 && (
        <View className="max-h-72">
          <Text className="mb-2 text-sm font-medium text-indigo-700 dark:text-indigo-200">
            Found {searchResults.length} exercise
            {searchResults.length !== 1 ? "s" : ""}:
          </Text>
          <ScrollView>
            {searchResults.map((exercise) => (
              <TouchableOpacity
                key={exercise.exerciseId}
                className="mb-2 flex-1 rounded-2xl border border-indigo-100 dark:border-indigo-800 bg-white/80 dark:bg-slate-900/60 p-3"
                onPress={() => selectApiExercise(exercise)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${exercise.name}`}
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    {exercise.imageUrl && (
                      <Image
                        source={exercise.imageUrl}
                        style={{ height: 150, width: "100%" }}
                        contentFit="cover"
                        className="w-full h-32 rounded-xl object-cover"
                      />
                    )}
                    <Text className="font-semibold text-indigo-950 dark:text-indigo-50">
                      {exercise.name}
                    </Text>
                    <Text className="mt-1 text-sm text-indigo-700 dark:text-indigo-200">
                      Exercise from database
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={COLORS.primary}
                  />
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
            <Text className="mb-2 text-indigo-600 dark:text-indigo-200">
              No exercises found for &quot;{searchQuery}&quot;
            </Text>
            <TouchableOpacity
              className="rounded-xl bg-indigo-600 px-4 h-11 items-center justify-center"
              onPress={() => {
                setNewExerciseName(searchQuery);
                setShowCustomEntry(true);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Create ${searchQuery}`}
            >
              <Text className="text-white font-medium">
                Create &quot;{searchQuery}&quot;
              </Text>
            </TouchableOpacity>
          </View>
        )}

      {selectedApiExercise && (
        <View className="mt-3 rounded-xl border border-indigo-100 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-900/40 p-3">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="font-semibold text-indigo-800 dark:text-indigo-100">
                Selected: {selectedApiExercise.name}
              </Text>
              <Text className="text-sm text-indigo-600 dark:text-indigo-200">
                Ready to add to workout
              </Text>
            </View>
            <TouchableOpacity
              className="rounded-xl border border-indigo-100 dark:border-indigo-800 bg-white/80 dark:bg-slate-900/60 px-4 h-11 items-center justify-center"
              onPress={handleClearSelection}
              accessibilityRole="button"
              accessibilityLabel="Remove selected exercise"
            >
              <Text className="text-indigo-700 dark:text-indigo-200 text-sm">
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default ExerciseSearchPanel;
