/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        /* EXISTING */
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        popUp: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        blockUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },

        /* 🔥 NEW – INTRO / TRANSITION ANIMATIONS */
        fadeOut: {
          "0%": { opacity: "1" },
          "85%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        fadeInScale: {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        /* EXISTING */
        fadeIn: "fadeIn 0.3s ease-out forwards",
        slideUp: "slideUp 0.4s ease-out forwards",
        popUp: "popUp 0.35s ease-out forwards",
        blockUp: "blockUp 0.25s ease-out forwards",

        /* 🔥 NEW */
        fadeOut: "fadeOut 4s ease-in forwards",
        fadeInScale: "fadeInScale 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};
