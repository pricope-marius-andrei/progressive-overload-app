import React from "react";
import { Pressable, Text, View } from "react-native";

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
      <View className="mb-4 rounded-2xl border border-white/70 bg-white/65 px-4 py-4">
        <Text className="text-sm text-indigo-700">
          No gyms found nearby yet. Try refresh or save your current location as
          a gym.
        </Text>
      </View>
    );
  }

  return (
    <View className="mb-4 rounded-3xl border border-white/70 bg-white/65 p-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-semibold text-indigo-950">
          Nearby Gyms
        </Text>
        <View className="rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1">
          <Text className="text-[11px] font-semibold text-indigo-700">
            {nearbyGyms.length} found
          </Text>
        </View>
      </View>

      {nearbyGyms.slice(0, 14).map((gym) => {
        const isSavedGym = gym.source === "saved";

        return (
          <View
            key={gym.id}
            className="mb-3 rounded-2xl border border-indigo-100 bg-white/80 px-4 py-4"
          >
            <Pressable
              onPress={() =>
                onFocusGym({
                  id: gym.id,
                  name: gym.name,
                  latitude: gym.latitude,
                  longitude: gym.longitude,
                })
              }
            >
              <View className="flex-row items-center justify-between gap-2">
                <Text className="flex-1 font-semibold text-indigo-950">
                  {gym.name}
                </Text>
                <View className="rounded-full border border-indigo-100 bg-indigo-50/80 px-2 py-1">
                  <Text className="text-[10px] font-semibold text-indigo-600">
                    {isSavedGym ? "SAVED" : "NEARBY"}
                  </Text>
                </View>
              </View>

              <Text className="mt-2 text-xs text-indigo-700">
                {gym.address ?? "Address unavailable"}
              </Text>

              <Text className="mb-3 mt-1 text-xs text-indigo-600">
                {gym.distanceMeters} m away
              </Text>
            </Pressable>

            <View className="flex-row gap-2">
              <Pressable
                className="flex-1 items-center justify-center rounded-xl bg-indigo-500 py-2.5"
                onPress={() =>
                  onFocusGym({
                    id: gym.id,
                    name: gym.name,
                    latitude: gym.latitude,
                    longitude: gym.longitude,
                  })
                }
              >
                <Text className="text-xs font-semibold text-white">Focus</Text>
              </Pressable>

              <Pressable
                className={`flex-1 items-center justify-center rounded-xl py-2.5 ${isSavedGym || isSaving ? "bg-indigo-200" : "bg-indigo-500"}`}
                disabled={isSavedGym || isSaving}
                onPress={() => onAddGymToList(gym)}
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
      })}
    </View>
  );
};

export default NearbyGymsSection;
