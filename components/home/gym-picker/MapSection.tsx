import React from "react";
import { LayoutChangeEvent, Platform, Text, View } from "react-native";
import MapView, { LongPressEvent, Marker } from "react-native-maps";

import {
    Coordinates,
    DiscoverableGym,
    FOCUSED_PIN_COLOR,
    FocusedGym,
} from "./types";

type MapSectionProps = {
  mapRef: React.RefObject<MapView | null>;
  mapCenter: Coordinates | null;
  deviceCoordinates: Coordinates | null;
  nearbyGyms: DiscoverableGym[];
  focusedGym: FocusedGym | null;
  selectedMapCoordinates: Coordinates | null;
  customGymName: string;
  onMapSectionLayout: (event: LayoutChangeEvent) => void;
  onMapLongPress: (event: LongPressEvent) => void;
};

const MapSection: React.FC<MapSectionProps> = ({
  mapRef,
  mapCenter,
  deviceCoordinates,
  nearbyGyms,
  focusedGym,
  selectedMapCoordinates,
  customGymName,
  onMapSectionLayout,
  onMapLongPress,
}) => {
  if (Platform.OS === "web") {
    return (
      <View
        className="rounded-2xl border border-white/70 bg-white/65 px-4 py-4"
        onLayout={onMapSectionLayout}
      >
        <Text className="text-sm font-semibold text-indigo-900">
          Map preview unavailable on web
        </Text>
        <Text className="mt-1 text-xs leading-5 text-indigo-700">
          Map preview is available on iOS/Android. You can still browse nearby
          gyms below or save your current location as a custom gym.
        </Text>
      </View>
    );
  }

  return (
    <View onLayout={onMapSectionLayout}>
      <View className="mb-3 flex-row flex-wrap gap-2">
        <View className="rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1">
          <Text className="text-[11px] font-semibold text-indigo-600">You</Text>
        </View>
        <View className="rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1">
          <Text className="text-[11px] font-semibold text-indigo-600">
            Saved
          </Text>
        </View>
        <View className="rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1">
          <Text className="text-[11px] font-semibold text-indigo-600">
            Custom pin
          </Text>
        </View>
      </View>

      <View className="overflow-hidden rounded-2xl border border-white/70 bg-white/70">
        {mapCenter ? (
          <MapView
            ref={mapRef}
            style={{ width: "100%", height: 290 }}
            initialRegion={{
              latitude: mapCenter.latitude,
              longitude: mapCenter.longitude,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
            }}
            onLongPress={onMapLongPress}
          >
            {deviceCoordinates ? (
              <Marker
                coordinate={deviceCoordinates}
                title="Your Location"
                pinColor="#4F46E5"
              />
            ) : null}

            {nearbyGyms.map((gym) => (
              <Marker
                key={gym.id}
                coordinate={{
                  latitude: gym.latitude,
                  longitude: gym.longitude,
                }}
                title={gym.name}
                description={gym.address ?? `${gym.distanceMeters} m away`}
                pinColor={
                  focusedGym?.id === gym.id
                    ? FOCUSED_PIN_COLOR
                    : gym.source === "saved"
                      ? "#3730A3"
                      : "#6366F1"
                }
              />
            ))}

            {focusedGym &&
            !nearbyGyms.some((gym) => gym.id === focusedGym.id) ? (
              <Marker
                coordinate={{
                  latitude: focusedGym.latitude,
                  longitude: focusedGym.longitude,
                }}
                title={focusedGym.name}
                description="Focused gym"
                pinColor={FOCUSED_PIN_COLOR}
              />
            ) : null}

            {selectedMapCoordinates ? (
              <Marker
                coordinate={selectedMapCoordinates}
                title={customGymName.trim() || "Selected custom location"}
                description="Custom location picked from the map"
                pinColor="#818CF8"
              />
            ) : null}
          </MapView>
        ) : (
          <View
            style={{ height: 290 }}
            className="items-center justify-center bg-white/70 px-4"
          >
            <Text className="text-center text-indigo-700">
              Loading your location and nearby gyms...
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default MapSection;
