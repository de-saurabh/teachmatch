/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // The "Chalkboard" theme — kept in sync by hand with
        // apps/web/src/theme.ts and apps/web/src/index.css.
        chalk: {
          board: "#24352b",
          boardDeep: "#1c2a22",
          panel: "#2b3e32",
          white: "#f4f1e6",
          yellow: "#e4be5e",
          blue: "#8fb3ac",
        },
      },
      fontFamily: {
        caveat: ["Caveat_700Bold"],
        figtree: ["Figtree_400Regular"],
        "figtree-medium": ["Figtree_500Medium"],
        "figtree-semibold": ["Figtree_600SemiBold"],
      },
    },
  },
  plugins: [],
};
