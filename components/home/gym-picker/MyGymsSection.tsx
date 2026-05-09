import { SavedGymPlace } from "@/contexts/home/home.repository";
import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { FocusedGym } from "./types";

type MyGymsSectionProps = {
  myGyms: SavedGymPlace[];
  isSaving: boolean;
  onFocusGym: (gym: FocusedGym) => void;
  onRemoveGym: (gym: SavedGymPlace) => void;
};

const MyGymsSection: React.FC<MyGymsSectionProps> = ({
  myGyms,
  isSaving,
  onFocusGym,
  onRemoveGym,
}) => {
  return (
    <View className="mb-4 rounded-3xl border border-white/70 dark:border-indigo-900/60 bg-white/70 dark:bg-slate-900/70 p-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-semibold text-indigo-950 dark:text-indigo-50">
          My Gyms
        </Text>
        <View className="rounded-full border border-indigo-100 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-900/40 px-3 py-1">
          <Text className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-200">
            {myGyms.length} saved
          </Text>
        </View>
      </View>

      {myGyms.length === 0 ? (
        <View className="rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-800 bg-white/70 dark:bg-slate-900/60 px-4 py-4">
          <Text className="text-sm text-indigo-700 dark:text-indigo-200">
            No gyms saved yet. Add from nearby gyms or save your current
            location.
          </Text>
        </View>
      ) : (
        <FlatList
          data={myGyms}
          keyExtractor={(gym) => `my-gym:${gym.id}`}
          renderItem={({ item: gym }) => (
            <View className="mb-3 rounded-2xl border border-indigo-100 dark:border-indigo-800 bg-white/80 dark:bg-slate-900/70 px-4 py-4">
              <View className="flex-row items-center justify-between">
                <Text className="mr-2 flex-1 font-semibold text-indigo-950 dark:text-indigo-50">
                  {gym.name}
                </Text>
                <View className="rounded-full border border-indigo-100 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-900/40 px-2 py-1">
                  <Text className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-200">
                    SAVED
                  </Text>
                </View>
              </View>

              <Text className="mt-2 text-xs text-indigo-700 dark:text-indigo-200">
                {gym.latitude.toFixed(5)}, {gym.longitude.toFixed(5)}
              </Text>

              <View className="flex-row gap-2 mt-3">
                <Pressable
                  className="flex-1 items-center justify-center rounded-xl bg-indigo-600 h-11"
                  onPress={() =>
                    onFocusGym({
                      id: `saved:${gym.id}`,
                      name: gym.name,
                      latitude: gym.latitude,
                      longitude: gym.longitude,
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Focus ${gym.name} on map`}
                  style={({ pressed }) =>
                    pressed
                      ? { opacity: 0.85, transform: [{ scale: 0.99 }] }
                      : undefined
                  }
                >
                  <Text className="text-xs font-semibold text-white">
                    Focus on Map
                  </Text>
                </Pressable>

                <Pressable
                  className={`items-center justify-center rounded-xl border border-indigo-100 dark:border-indigo-800 px-4 h-11 ${isSaving ? "bg-indigo-100" : "bg-white/70 dark:bg-slate-900/60"}`}
                  disabled={isSaving}
                  onPress={() => onRemoveGym(gym)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${gym.name}`}
                  style={({ pressed }) =>
                    !isSaving && pressed
                      ? { opacity: 0.85, transform: [{ scale: 0.99 }] }
                      : undefined
                  }
                >
                  <Text
                    className={`text-xs font-semibold ${isSaving ? "text-indigo-400" : "text-indigo-700 dark:text-indigo-200"}`}
                  >
                    Remove
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 4 }}
        />
      )}
    </View>
  );
};

export default MyGymsSection;
