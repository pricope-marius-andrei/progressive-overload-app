/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./components/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        // Status colors
        "status-selected": {
          border: "#3B3DC9",
          bg: "#4B4DD9",
          text: "#E1E2F4",
        },
        "status-completed": {
          border: "#bbf7d0",
          bg: "#dcfce7",
          text: "#166534",
        },
        "status-default": {
          border: "#e0e7ff",
          bg: "rgba(255, 255, 255, 0.8)",
          text: "#000000",
        },
      },
    },
  },
  plugins: [],
};
