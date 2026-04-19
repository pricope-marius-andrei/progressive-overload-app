import type { IoniconName } from "@expo/vector-icons/build/Ionicons";

export interface TabIconConfig {
  name: string;
  focused: IoniconName;
  unfocused: IoniconName;
}

export interface TabConfig {
  [routeName: string]: TabIconConfig;
}

export interface TabsLayoutConfig {
  config: TabConfig;
  order: string[]; // Ordered array of route names
}
