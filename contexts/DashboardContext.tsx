/**
 * Dashboard Context - Progressive Overload Gym App
 *
 * Provides state management for the home dashboard including user data,
 * daily streaks, and training information.
 */

import { getCurrentDeviceCoordinates } from "@/utils/location";
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Alert } from "react-native";
import {
    fetchAndUpdateAppProgress,
    fetchMyGyms,
    fetchTrainingDateKeys,
} from "./home/home.repository";
import { DashboardContextType, User } from "./home/home.types";

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<User>({
    username: "Athlete",
    gymName: null,
    dailyStreak: 0,
    experienceScore: 0,
  });

  const [trainingDateKeys, setTrainingDateKeys] = useState<string[]>([]);
  const hasShownMissingGymListWarningRef = useRef(false);

  const refreshDashboard = useCallback(async () => {
    let deviceLocation: { latitude: number; longitude: number } | null = null;

    try {
      deviceLocation = await getCurrentDeviceCoordinates();
    } catch (error: unknown) {
      console.error("Error loading device location:", error);
    }

    const [progressResult, trainingDatesResult, myGymsResult] =
      await Promise.allSettled([
        fetchAndUpdateAppProgress(deviceLocation),
        fetchTrainingDateKeys(),
        fetchMyGyms(),
      ]);

    if (progressResult.status === "fulfilled") {
      const progress = progressResult.value;
      setUser((prev) => ({
        ...prev,
        gymName: progress.currentGymName,
        dailyStreak: progress.dailyStreak,
        experienceScore: progress.experienceScore,
      }));
    } else {
      const error = progressResult.reason;
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error refreshing app progress:", message);
      setUser((prev) => ({ ...prev, gymName: null }));
    }

    if (trainingDatesResult.status === "fulfilled") {
      setTrainingDateKeys(trainingDatesResult.value);
    } else {
      const error = trainingDatesResult.reason;
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error loading training dates:", message);
      setTrainingDateKeys([]);
    }

    if (myGymsResult.status === "fulfilled") {
      const hasAnySavedGyms = myGymsResult.value.length > 0;

      if (!hasAnySavedGyms && !hasShownMissingGymListWarningRef.current) {
        hasShownMissingGymListWarningRef.current = true;
        Alert.alert(
          "Gym List Required",
          "The app will not work correctly if your My Gyms list is empty. Tap the map icon and add at least one gym.",
        );
      }

      if (hasAnySavedGyms) {
        hasShownMissingGymListWarningRef.current = false;
      }
    } else {
      const error = myGymsResult.reason;
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error loading saved gyms:", message);
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const value: DashboardContextType = useMemo(
    () => ({
      refreshDashboard,
      user,
      trainingDateKeys,
    }),
    [refreshDashboard, user, trainingDateKeys],
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

export default DashboardContext;
