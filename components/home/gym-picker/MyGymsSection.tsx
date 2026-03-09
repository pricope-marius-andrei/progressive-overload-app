import { SavedGymPlace } from "@/contexts/home/home.repository";
import React from "react";
import { Pressable, Text, View } from "react-native";

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
    <View className="mb-4 rounded-3xl border border-white/70 bg-white/65 p-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-semibold text-indigo-950">My Gyms</Text>
        <View className="rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1">
          <Text className="text-[11px] font-semibold text-indigo-700">
            {myGyms.length} saved
          </Text>
        </View>
      </View>

      {myGyms.length === 0 ? (
        <View className="rounded-2xl border border-dashed border-indigo-200 bg-white/70 px-4 py-4">
          <Text className="text-sm text-indigo-700">
            No gyms saved yet. Add from nearby gyms or save your current
            location.
          </Text>
        </View>
      ) : (
        myGyms.map((gym) => (
          <View
            key={`my-gym:${gym.id}`}
            className="mb-3 rounded-2xl border border-indigo-100 bg-white/80 px-4 py-4"
          >
            <View className="flex-row items-center justify-between">
              <Text className="mr-2 flex-1 font-semibold text-indigo-950">
                {gym.name}
              </Text>
              <View className="rounded-full border border-indigo-100 bg-indigo-50/80 px-2 py-1">
                <Text className="text-[10px] font-semibold text-indigo-600">
                  SAVED
                </Text>
              </View>
            </View>

            <Text className="mt-2 text-xs text-indigo-700">
              {gym.latitude.toFixed(5)}, {gym.longitude.toFixed(5)}
            </Text>

            <View className="flex-row gap-2 mt-3">
              <Pressable
                className="flex-1 items-center justify-center rounded-xl bg-indigo-500 py-2.5"
                onPress={() =>
                  onFocusGym({
                    id: `saved:${gym.id}`,
                    name: gym.name,
                    latitude: gym.latitude,
                    longitude: gym.longitude,
                  })
                }
              >
                <Text className="text-xs font-semibold text-white">
                  Focus on Map
                </Text>
              </Pressable>

              <Pressable
                className={`items-center justify-center rounded-xl border border-indigo-100 px-4 py-2.5 ${isSaving ? "bg-indigo-100" : "bg-white/70"}`}
                disabled={isSaving}
                onPress={() => onRemoveGym(gym)}
              >
                <Text
                  className={`text-xs font-semibold ${isSaving ? "text-indigo-400" : "text-indigo-700"}`}
                >
                  Remove
                </Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </View>
  );
};

export default MyGymsSection;
