import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { DiscoverableGym, FocusedGym } from "./types";

type NearbyGymsSectionProps = {
  nearbyGyms: DiscoverableGym[];
  isSaving: boolean;
  onFocusGym: (gym: FocusedGym) => void;
  onAddGymToList: (gym: DiscoverableGym) => void;
};

const NearbyGymsSection: React.FC<NearbyGymsSectionProps> = ({
  nearbyGyms,
  isSaving,
  onFocusGym,
  onAddGymToList,
}) => {
  if (nearbyGyms.length === 0) {
    return (
      <View className="mb-4 rounded-2xl border border-white/70 dark:border-indigo-900/60 bg-white/70 dark:bg-slate-900/70 px-4 py-4">
        <Text className="text-sm text-indigo-700 dark:text-indigo-200">
          No gyms found nearby yet. Try refresh or save your current location as
          a gym.
        </Text>
      </View>
    );
  }

  return (
    <View className="mb-4 rounded-3xl border border-white/70 dark:border-indigo-900/60 bg-white/70 dark:bg-slate-900/70 p-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-semibold text-indigo-950 dark:text-indigo-50">
          Nearby Gyms
        </Text>
        <View className="rounded-full border border-indigo-100 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-900/40 px-3 py-1">
          <Text className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-200">
            {nearbyGyms.length} found
          </Text>
        </View>
      </View>

      <FlatList
        data={nearbyGyms.slice(0, 14)}
        keyExtractor={(item) => item.id}
        renderItem={({ item: gym }) => {
          const isSavedGym = gym.source === "saved";

          return (
            <View className="mb-3 rounded-2xl border border-indigo-100 dark:border-indigo-800 bg-white/80 dark:bg-slate-900/70 px-4 py-4">
              <Pressable
                onPress={() =>
                  onFocusGym({
                    id: gym.id,
                    name: gym.name,
                    latitude: gym.latitude,
                    longitude: gym.longitude,
                  })
                }
                className="gap-1"
                accessibilityRole="button"
                accessibilityLabel={`Focus ${gym.name} on map`}
                style={({ pressed }) =>
                  pressed
                    ? { opacity: 0.8, transform: [{ scale: 0.99 }] }
                    : undefined
                }
              >
                <View className="flex-row items-center justify-between gap-2">
                  <Text className="flex-1 font-semibold text-indigo-950 dark:text-indigo-50">
                    {gym.name}
                  </Text>
                  <View className="rounded-full border border-indigo-100 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-900/40 px-2 py-1">
                    <Text className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-200">
                      {isSavedGym ? "SAVED" : "NEARBY"}
                    </Text>
                  </View>
                </View>

                <Text className="mt-2 text-xs text-indigo-700 dark:text-indigo-200">
                  {gym.address ?? "Address unavailable"}
                </Text>

                <Text className="mb-3 mt-1 text-xs text-indigo-600 dark:text-indigo-300">
                  {gym.distanceMeters} m away
                </Text>
              </Pressable>

              <View className="flex-row gap-2">
                <Pressable
                  className="flex-1 items-center justify-center rounded-xl h-11 bg-indigo-600"
                  onPress={() =>
                    onFocusGym({
                      id: gym.id,
                      name: gym.name,
                      latitude: gym.latitude,
                      longitude: gym.longitude,
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Focus ${gym.name}`}
                  style={({ pressed }) =>
                    pressed
                      ? { opacity: 0.85, transform: [{ scale: 0.99 }] }
                      : undefined
                  }
                >
                  <Text className="text-xs font-semibold text-white">
                    Focus
                  </Text>
                </Pressable>

                <Pressable
                  className={`flex-1 items-center justify-center rounded-xl h-11 ${isSavedGym || isSaving ? "bg-indigo-200" : "bg-indigo-600"}`}
                  disabled={isSavedGym || isSaving}
                  onPress={() => onAddGymToList(gym)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isSavedGym
                      ? `${gym.name} already saved`
                      : `Add ${gym.name} to My Gyms`
                  }
                  style={({ pressed }) =>
                    !isSavedGym && !isSaving && pressed
                      ? { opacity: 0.85, transform: [{ scale: 0.99 }] }
                      : undefined
                  }
                >
                  <Text
                    className={`text-xs font-semibold ${isSavedGym ? "text-indigo-500" : "text-white"}`}
                  >
                    {isSavedGym ? "Saved" : "Add to My Gyms"}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        }}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: 4 }}
      />
    </View>
  );
};

export default NearbyGymsSection;
