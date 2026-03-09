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
    <View className="mb-4 rounded-3xl border border-slate-200 bg-white p-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-extrabold text-slate-900">My Gyms</Text>
        <View className="rounded-full bg-slate-100 px-3 py-1">
          <Text className="text-[11px] font-semibold text-slate-700">
            {myGyms.length} saved
          </Text>
        </View>
      </View>

      {myGyms.length === 0 ? (
        <View className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
          <Text className="text-sm text-slate-600">
            No gyms saved yet. Add from nearby gyms or save your current
            location.
          </Text>
        </View>
      ) : (
        myGyms.map((gym) => (
          <View
            key={`my-gym:${gym.id}`}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 mb-3"
          >
            <View className="flex-row items-center justify-between">
              <Text className="font-bold text-slate-900 flex-1 mr-2">
                {gym.name}
              </Text>
              <View className="rounded-full bg-emerald-100 px-2 py-1">
                <Text className="text-[10px] font-semibold text-emerald-800">
                  SAVED
                </Text>
              </View>
            </View>

            <Text className="text-xs text-slate-500 mt-2">
              {gym.latitude.toFixed(5)}, {gym.longitude.toFixed(5)}
            </Text>

            <View className="flex-row gap-2 mt-3">
              <Pressable
                className="flex-1 rounded-xl bg-slate-900 py-2.5 items-center justify-center"
                onPress={() =>
                  onFocusGym({
                    id: `saved:${gym.id}`,
                    name: gym.name,
                    latitude: gym.latitude,
                    longitude: gym.longitude,
                  })
                }
              >
                <Text className="text-white font-semibold text-xs">
                  Focus on Map
                </Text>
              </Pressable>

              <Pressable
                className={`rounded-xl px-4 py-2.5 items-center justify-center ${isSaving ? "bg-slate-200" : "bg-rose-100"}`}
                disabled={isSaving}
                onPress={() => onRemoveGym(gym)}
              >
                <Text
                  className={`font-semibold text-xs ${isSaving ? "text-slate-400" : "text-rose-700"}`}
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
