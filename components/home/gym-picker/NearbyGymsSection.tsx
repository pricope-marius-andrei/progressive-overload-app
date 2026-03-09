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
      <View className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
        <Text className="text-sm text-slate-600">
          No gyms found nearby yet. Try refresh or save your current location as
          a gym.
        </Text>
      </View>
    );
  }

  return (
    <View className="mb-4 rounded-3xl border border-slate-200 bg-white p-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-extrabold text-slate-900">
          Nearby Gyms
        </Text>
        <View className="rounded-full bg-blue-100 px-3 py-1">
          <Text className="text-[11px] font-semibold text-blue-800">
            {nearbyGyms.length} found
          </Text>
        </View>
      </View>

      {nearbyGyms.slice(0, 14).map((gym) => {
        const isSavedGym = gym.source === "saved";

        return (
          <View
            key={gym.id}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 mb-3"
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
                <Text className="font-bold text-slate-900 flex-1">
                  {gym.name}
                </Text>
                <View
                  className={`rounded-full px-2 py-1 ${isSavedGym ? "bg-emerald-100" : "bg-indigo-100"}`}
                >
                  <Text
                    className={`text-[10px] font-semibold ${isSavedGym ? "text-emerald-800" : "text-indigo-800"}`}
                  >
                    {isSavedGym ? "SAVED" : "NEARBY"}
                  </Text>
                </View>
              </View>

              <Text className="text-xs text-slate-500 mt-2">
                {gym.address ?? "Address unavailable"}
              </Text>

              <Text className="text-xs text-slate-500 mt-1 mb-3">
                {gym.distanceMeters} m away
              </Text>
            </Pressable>

            <View className="flex-row gap-2">
              <Pressable
                className="flex-1 rounded-xl bg-slate-900 py-2.5 items-center justify-center"
                onPress={() =>
                  onFocusGym({
                    id: gym.id,
                    name: gym.name,
                    latitude: gym.latitude,
                    longitude: gym.longitude,
                  })
                }
              >
                <Text className="text-white font-semibold text-xs">Focus</Text>
              </Pressable>

              <Pressable
                className={`flex-1 rounded-xl py-2.5 items-center justify-center ${isSavedGym || isSaving ? "bg-slate-300" : "bg-primary"}`}
                disabled={isSavedGym || isSaving}
                onPress={() => onAddGymToList(gym)}
              >
                <Text className="text-white font-semibold text-xs">
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
