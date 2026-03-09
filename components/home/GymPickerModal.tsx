import { findNearbyGyms, NearbyGym } from "@/contexts/home/gym-search.service";
import {
  CustomGymSection,
  MapSection,
  MyGymsSection,
  NearbyGymsSection,
} from "./gym-picker/index";
import {
  dedupeGyms,
  DiscoverableGym,
  FocusedGym,
  NEARBY_GYM_SEARCH_RADIUS_METERS,
} from "./gym-picker/types";

import {
  deleteKnownGymPlace,
  fetchMyGyms,
  fetchNearbyKnownGyms,
  SavedGymPlace,
  saveKnownGymPlace,
} from "@/contexts/home/home.repository";
import { getCurrentDeviceCoordinates } from "@/utils/location";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  LayoutChangeEvent,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import MapView, { LongPressEvent } from "react-native-maps";

type GymPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => Promise<void> | void;
};

const GymPickerModal: React.FC<GymPickerModalProps> = ({
  visible,
  onClose,
  onSaved,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customGymName, setCustomGymName] = useState("");
  const [deviceCoordinates, setDeviceCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [nearbyGyms, setNearbyGyms] = useState<DiscoverableGym[]>([]);
  const [myGyms, setMyGyms] = useState<SavedGymPlace[]>([]);
  const [focusedGym, setFocusedGym] = useState<FocusedGym | null>(null);
  const [selectedMapCoordinates, setSelectedMapCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const mapSectionTopRef = useRef(0);
  const hasShownOpenStreetWarningRef = useRef(false);

  const mapCenter = useMemo(() => {
    if (focusedGym) {
      return {
        latitude: focusedGym.latitude,
        longitude: focusedGym.longitude,
      };
    }

    if (deviceCoordinates) {
      return {
        latitude: deviceCoordinates.latitude,
        longitude: deviceCoordinates.longitude,
      };
    }

    return nearbyGyms[0]
      ? {
          latitude: nearbyGyms[0].latitude,
          longitude: nearbyGyms[0].longitude,
        }
      : null;
  }, [deviceCoordinates, focusedGym, nearbyGyms]);

  const focusMapOnGym = useCallback((gym: FocusedGym) => {
    const nextRegion = {
      latitude: gym.latitude,
      longitude: gym.longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    };

    setFocusedGym(gym);
    scrollViewRef.current?.scrollTo({
      y: Math.max(0, mapSectionTopRef.current - 8),
      animated: true,
    });
    mapRef.current?.animateToRegion(nextRegion, 450);
  }, []);

  const handleMapSectionLayout = useCallback((event: LayoutChangeEvent) => {
    mapSectionTopRef.current = event.nativeEvent.layout.y;
  }, []);

  const handleMapLongPress = useCallback((event: LongPressEvent) => {
    const coordinate = event.nativeEvent.coordinate;
    setSelectedMapCoordinates({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
    setFocusedGym(null);
  }, []);

  const loadNearbyGyms = useCallback(async () => {
    setIsLoading(true);
    try {
      const coordinates = await getCurrentDeviceCoordinates();
      if (!coordinates) {
        Alert.alert(
          "Location Required",
          "Please allow location access to discover gyms near you.",
        );
        return;
      }

      setDeviceCoordinates(coordinates);

      const [openStreetGymsResult, nearbySavedGymsResult, savedGymsListResult] =
        await Promise.allSettled([
          findNearbyGyms({
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            radiusMeters: NEARBY_GYM_SEARCH_RADIUS_METERS,
          }),
          fetchNearbyKnownGyms({
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            radiusMeters: NEARBY_GYM_SEARCH_RADIUS_METERS,
          }),
          fetchMyGyms(),
        ]);

      const openStreetGyms =
        openStreetGymsResult.status === "fulfilled"
          ? openStreetGymsResult.value
          : [];
      const nearbySavedGyms =
        nearbySavedGymsResult.status === "fulfilled"
          ? nearbySavedGymsResult.value
          : [];
      const savedGymsList =
        savedGymsListResult.status === "fulfilled"
          ? savedGymsListResult.value
          : [];

      if (
        openStreetGymsResult.status === "rejected" &&
        !hasShownOpenStreetWarningRef.current
      ) {
        hasShownOpenStreetWarningRef.current = true;
        Alert.alert(
          "Nearby Service Busy",
          "Live nearby gyms are temporarily unavailable (rate limit). Showing your saved gyms instead.",
        );
      }

      const normalizedOpenStreetGyms: DiscoverableGym[] = openStreetGyms.map(
        (gym: NearbyGym) => ({
          id: `osm:${gym.id}`,
          name: gym.name,
          latitude: gym.latitude,
          longitude: gym.longitude,
          distanceMeters: gym.distanceMeters,
          address: gym.address,
          source: "openstreetmap",
        }),
      );

      const normalizedSavedGyms: DiscoverableGym[] = nearbySavedGyms.map(
        (gym) => ({
          id: `saved:${gym.id}`,
          name: gym.name,
          latitude: gym.latitude,
          longitude: gym.longitude,
          distanceMeters: gym.distanceMeters,
          address: "Saved in your gyms list",
          source: "saved",
        }),
      );

      const dedupedGyms = dedupeGyms([
        ...normalizedSavedGyms,
        ...normalizedOpenStreetGyms,
      ]);

      setNearbyGyms(dedupedGyms);
      setMyGyms(savedGymsList);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error loading nearby gyms:", message);
      Alert.alert("Error", "Unable to load nearby gyms right now.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }

    void loadNearbyGyms();
  }, [loadNearbyGyms, visible]);

  const saveGymWithCoordinates = useCallback(
    async (input: {
      latitude: number;
      longitude: number;
      successMessage: string;
      clearSelectedMapPin?: boolean;
    }) => {
      const normalizedGymName = customGymName.trim();
      if (!normalizedGymName) {
        Alert.alert("Gym Name Required", "Please enter a name for your gym.");
        return;
      }

      setIsSaving(true);
      try {
        await saveKnownGymPlace({
          name: normalizedGymName,
          latitude: input.latitude,
          longitude: input.longitude,
        });

        if (onSaved) {
          await onSaved();
        }

        await loadNearbyGyms();
        setCustomGymName("");

        if (input.clearSelectedMapPin) {
          setSelectedMapCoordinates(null);
        }

        Alert.alert("Saved", input.successMessage);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error saving custom gym:", message);
        Alert.alert("Error", "Unable to save this custom gym.");
      } finally {
        setIsSaving(false);
      }
    },
    [customGymName, loadNearbyGyms, onSaved],
  );

  const handleAddGymToList = useCallback(
    async (gym: DiscoverableGym) => {
      if (gym.source === "saved") {
        return;
      }

      setIsSaving(true);
      try {
        await saveKnownGymPlace({
          name: gym.name,
          latitude: gym.latitude,
          longitude: gym.longitude,
        });

        if (onSaved) {
          await onSaved();
        }

        await loadNearbyGyms();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error adding gym to list:", message);
        Alert.alert("Error", "Unable to add this gym to your list.");
      } finally {
        setIsSaving(false);
      }
    },
    [loadNearbyGyms, onSaved],
  );

  const handleUseCurrentLocation = useCallback(async () => {
    try {
      const latestCoordinates =
        deviceCoordinates ?? (await getCurrentDeviceCoordinates());

      if (!latestCoordinates) {
        Alert.alert(
          "Location Required",
          "Location permission is needed to save your current location as a gym.",
        );
        return;
      }

      setDeviceCoordinates(latestCoordinates);

      setSelectedMapCoordinates({
        latitude: latestCoordinates.latitude,
        longitude: latestCoordinates.longitude,
      });
      setFocusedGym(null);

      scrollViewRef.current?.scrollTo({
        y: Math.max(0, mapSectionTopRef.current - 8),
        animated: true,
      });
      mapRef.current?.animateToRegion(
        {
          latitude: latestCoordinates.latitude,
          longitude: latestCoordinates.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        450,
      );

      Alert.alert(
        "Location Selected",
        "Now enter a gym name in the custom gym section and tap Save.",
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error getting current location:", message);
      Alert.alert("Error", "Unable to get your current location.");
    }
  }, [deviceCoordinates]);

  const handleSavePickedMapGym = useCallback(async () => {
    if (!selectedMapCoordinates) {
      Alert.alert(
        "Select a location",
        "Long-press anywhere on the map to pick your gym location first.",
      );
      return;
    }

    await saveGymWithCoordinates({
      latitude: selectedMapCoordinates.latitude,
      longitude: selectedMapCoordinates.longitude,
      clearSelectedMapPin: true,
      successMessage: `${customGymName.trim()} added to your gyms list from the selected location.`,
    });
  }, [customGymName, saveGymWithCoordinates, selectedMapCoordinates]);

  const handleRemoveGym = useCallback(
    (gym: SavedGymPlace) => {
      Alert.alert("Remove gym", `Remove ${gym.name} from My Gyms?`, [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setIsSaving(true);
              try {
                await deleteKnownGymPlace(gym.id);

                if (onSaved) {
                  await onSaved();
                }

                await loadNearbyGyms();
              } catch (error: unknown) {
                const message =
                  error instanceof Error ? error.message : String(error);
                console.error("Error removing gym:", message);
                Alert.alert("Error", "Unable to remove gym.");
              } finally {
                setIsSaving(false);
              }
            })();
          },
        },
      ]);
    },
    [loadNearbyGyms, onSaved],
  );

  const handleCloseModal = useCallback(() => {
    setSelectedMapCoordinates(null);
    onClose();
  }, [onClose]);

  const savedGymsCount = myGyms.length;
  const nearbyGymsCount = nearbyGyms.length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCloseModal}
    >
      <View className="flex-1 bg-slate-100">
        <View className="px-5 pt-6 pb-4 bg-white border-b border-slate-200">
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="text-2xl font-extrabold text-slate-900">
                Nearby Gyms
              </Text>
              <Text className="text-xs text-slate-500 mt-1">
                {savedGymsCount} saved • {nearbyGymsCount} nearby
              </Text>
            </View>

            <Pressable
              onPress={handleCloseModal}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2"
            >
              <Text className="text-slate-700 font-semibold">Close</Text>
            </Pressable>
          </View>

          <View className="mt-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2">
            <Text className="text-xs text-sky-800">
              Explore gyms on the map, save favorites, or pin your own location.
            </Text>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 44 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="rounded-3xl border border-slate-200 bg-white p-4 mb-4">
            <Text className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase">
              Discovery Map
            </Text>

            <Text className="text-sm text-slate-700 mt-1 mb-3">
              Tap a gym card to focus it, or long-press the map to drop a custom
              pin.
            </Text>

            <MapSection
              mapRef={mapRef}
              mapCenter={mapCenter}
              deviceCoordinates={deviceCoordinates}
              nearbyGyms={nearbyGyms}
              focusedGym={focusedGym}
              selectedMapCoordinates={selectedMapCoordinates}
              customGymName={customGymName}
              onMapSectionLayout={handleMapSectionLayout}
              onMapLongPress={handleMapLongPress}
            />
          </View>

          <CustomGymSection
            customGymName={customGymName}
            isSaving={isSaving}
            selectedMapCoordinates={selectedMapCoordinates}
            onCustomGymNameChange={setCustomGymName}
            onUseCurrentLocation={() => {
              void handleUseCurrentLocation();
            }}
            onSavePickedMapGym={() => {
              void handleSavePickedMapGym();
            }}
          />

          <View className="rounded-2xl border border-slate-200 bg-white p-3 mb-4">
            <Pressable
              className={`rounded-xl py-3 items-center justify-center ${isLoading ? "bg-slate-300" : "bg-slate-900"}`}
              onPress={loadNearbyGyms}
              disabled={isLoading || isSaving}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-semibold">
                  Refresh Nearby Gyms
                </Text>
              )}
            </Pressable>
          </View>

          <MyGymsSection
            myGyms={myGyms}
            isSaving={isSaving}
            onFocusGym={focusMapOnGym}
            onRemoveGym={handleRemoveGym}
          />

          <NearbyGymsSection
            nearbyGyms={nearbyGyms}
            isSaving={isSaving}
            onFocusGym={focusMapOnGym}
            onAddGymToList={(gym) => {
              void handleAddGymToList(gym);
            }}
          />
        </ScrollView>
      </View>
    </Modal>
  );
};

export default GymPickerModal;
