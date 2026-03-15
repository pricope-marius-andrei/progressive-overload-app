import type { CameraRef } from "@maplibre/maplibre-react-native";
import Constants from "expo-constants";
import React from "react";
import {
  LayoutChangeEvent,
  Platform,
  Text,
  UIManager,
  View,
} from "react-native";

import {
  Coordinates,
  DiscoverableGym,
  FOCUSED_PIN_COLOR,
  FocusedGym,
} from "./types";

type MapSectionProps = {
  cameraRef: React.RefObject<CameraRef | null>;
  mapCenter: Coordinates | null;
  deviceCoordinates: Coordinates | null;
  nearbyGyms: DiscoverableGym[];
  focusedGym: FocusedGym | null;
  selectedMapCoordinates: Coordinates | null;
  onMapSectionLayout: (event: LayoutChangeEvent) => void;
  onMapLongPress: (coordinates: Coordinates) => void;
};

type MapLibreModule = typeof import("@maplibre/maplibre-react-native");

const OPEN_FREE_MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

function hasMapLibreNativeViewsRegistered(): boolean {
  const getViewManagerConfig = UIManager.getViewManagerConfig;
  if (typeof getViewManagerConfig !== "function") {
    return false;
  }

  return Boolean(
    getViewManagerConfig("MLRNMapView") && getViewManagerConfig("MLRNCamera"),
  );
}

function extractCoordinatesFromFeature(feature: unknown): Coordinates | null {
  if (!feature || typeof feature !== "object") {
    return null;
  }

  const geometry = (feature as { geometry?: unknown }).geometry;
  if (!geometry || typeof geometry !== "object") {
    return null;
  }

  const coordinates = (geometry as { coordinates?: unknown }).coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return null;
  }

  const [longitude, latitude] = coordinates;
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return null;
  }

  return { latitude, longitude };
}

type MapPinProps = {
  color: string;
};

const MapPin: React.FC<MapPinProps> = ({ color }) => (
  <View
    style={{
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: "#FFFFFF",
      backgroundColor: color,
      shadowColor: "#0F172A",
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 3,
    }}
  />
);

const MapSection: React.FC<MapSectionProps> = ({
  cameraRef,
  mapCenter,
  deviceCoordinates,
  nearbyGyms,
  focusedGym,
  selectedMapCoordinates,
  onMapSectionLayout,
  onMapLongPress,
}) => {
  const isExpoGo = Constants.appOwnership === "expo";
  const [mapLibreModule, setMapLibreModule] =
    React.useState<MapLibreModule | null>(null);
  const [hasTriedLoadingMapLibre, setHasTriedLoadingMapLibre] =
    React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    if (Platform.OS === "web" || isExpoGo) {
      setHasTriedLoadingMapLibre(true);
      return () => {
        isMounted = false;
      };
    }

    void import("@maplibre/maplibre-react-native")
      .then((module) => {
        if (!isMounted) {
          return;
        }

        setMapLibreModule(module);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setMapLibreModule(null);
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }

        setHasTriedLoadingMapLibre(true);
      });

    return () => {
      isMounted = false;
    };
  }, [isExpoGo]);

  const isNativeMapLibreReady =
    Platform.OS !== "web" &&
    Boolean(mapLibreModule) &&
    hasMapLibreNativeViewsRegistered();

  const unavailableReason = isExpoGo
    ? "Map preview unavailable in Expo Go"
    : "Map native module is not registered";

  const unavailableDescription = isExpoGo
    ? "Use a development build (expo run:android or EAS preview build) to use MapLibre maps. Nearby gym lists and custom save flows still work below."
    : "Rebuild and reinstall your development client so MapLibre native views are included (run expo run:android, then start with --clear).";

  if (Platform.OS !== "web" && !isExpoGo && !hasTriedLoadingMapLibre) {
    return (
      <View
        className="rounded-2xl border border-white/70 bg-white/65 px-4 py-4"
        onLayout={onMapSectionLayout}
      >
        <Text className="text-sm font-semibold text-indigo-900">
          Preparing map module...
        </Text>
        <Text className="mt-1 text-xs leading-5 text-indigo-700">
          Loading map capabilities for this device.
        </Text>
      </View>
    );
  }

  if (Platform.OS === "web" || !isNativeMapLibreReady) {
    return (
      <View
        className="rounded-2xl border border-white/70 bg-white/65 px-4 py-4"
        onLayout={onMapSectionLayout}
      >
        <Text className="text-sm font-semibold text-indigo-900">
          {Platform.OS === "web"
            ? "Map preview unavailable on web"
            : unavailableReason}
        </Text>
        <Text className="mt-1 text-xs leading-5 text-indigo-700">
          {Platform.OS === "web"
            ? "Map preview is available on iOS/Android. You can still browse nearby gyms below or save your current location as a custom gym."
            : unavailableDescription}
        </Text>
      </View>
    );
  }

  const MapLibre = mapLibreModule as MapLibreModule;

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
          <MapLibre.MapView
            style={{ width: "100%", height: 290 }}
            mapStyle={OPEN_FREE_MAP_STYLE_URL}
            onLongPress={(feature) => {
              const coordinates = extractCoordinatesFromFeature(feature);
              if (!coordinates) {
                return;
              }

              onMapLongPress(coordinates);
            }}
          >
            <MapLibre.Camera
              ref={cameraRef}
              defaultSettings={{
                centerCoordinate: [mapCenter.longitude, mapCenter.latitude],
                zoomLevel: 13,
              }}
            />

            {deviceCoordinates ? (
              <MapLibre.MarkerView
                coordinate={[
                  deviceCoordinates.longitude,
                  deviceCoordinates.latitude,
                ]}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <MapPin color="#4F46E5" />
              </MapLibre.MarkerView>
            ) : null}

            {nearbyGyms.map((gym) => (
              <MapLibre.MarkerView
                key={gym.id}
                coordinate={[gym.longitude, gym.latitude]}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <MapPin
                  color={
                    focusedGym?.id === gym.id
                      ? FOCUSED_PIN_COLOR
                      : gym.source === "saved"
                        ? "#3730A3"
                        : "#6366F1"
                  }
                />
              </MapLibre.MarkerView>
            ))}

            {focusedGym &&
            !nearbyGyms.some((gym) => gym.id === focusedGym.id) ? (
              <MapLibre.MarkerView
                coordinate={[focusedGym.longitude, focusedGym.latitude]}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <MapPin color={FOCUSED_PIN_COLOR} />
              </MapLibre.MarkerView>
            ) : null}

            {selectedMapCoordinates ? (
              <MapLibre.MarkerView
                coordinate={[
                  selectedMapCoordinates.longitude,
                  selectedMapCoordinates.latitude,
                ]}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <MapPin color="#818CF8" />
              </MapLibre.MarkerView>
            ) : null}
          </MapLibre.MapView>
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
