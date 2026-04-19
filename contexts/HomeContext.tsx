/**
 * Home Context - Progressive Overload Gym App
 *
 * @deprecated Use DashboardProvider with useDashboard and WorkoutsListProvider with useWorkoutsList instead
 *
 * This context is kept for backward compatibility. It wraps DashboardProvider and WorkoutsListProvider
 * to provide a unified provider for the home screen.
 */

import React, { ReactNode } from "react";
import { DashboardProvider, useDashboard } from "./DashboardContext";
import { useWorkoutsList, WorkoutsListProvider } from "./WorkoutsListContext";
import { HomeContextType } from "./home/home.types";

interface HomeProviderProps {
  children: ReactNode;
}

export const HomeProvider: React.FC<HomeProviderProps> = ({ children }) => {
  return (
    <DashboardProvider>
      <WorkoutsListProvider>{children}</WorkoutsListProvider>
    </DashboardProvider>
  );
};

/**
 * @deprecated Use useDashboard and useWorkoutsList instead
 *
 * Combines both DashboardContextType and WorkoutsListContextType for backward compatibility.
 */
export const useHome = (): HomeContextType => {
  const dashboard = useDashboard();
  const workoutsList = useWorkoutsList();

  return {
    ...dashboard,
    ...workoutsList,
    refreshHomeState: dashboard.refreshDashboard,
  } as HomeContextType;
};
