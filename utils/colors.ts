/**
 * Color Constants - Status Colors
 * Generic status colors used across the app for consistent styling
 */

export const statusColors = {
  selected: {
    border: "#3B3DC9",
    bg: "#4B4DD9",
    text: "#E1E2F4",
  },
  completed: {
    border: "#bbf7d0",
    bg: "#dcfce7",
    text: "#166534",
  },
  default: {
    border: "#e0e7ff",
    bg: "rgba(255, 255, 255, 0.8)",
    text: "#000000",
  },
};

export type StatusType = keyof typeof statusColors;
