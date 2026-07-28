import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0F0F0F",
        charcoal: "#1C1C1C",
        gold: {
          DEFAULT: "#C8A96A",
          light: "#E2CBA0",
          dark: "#9C7C42",
        },
        cream: "#F7F3EE",
        paper: "#FFFFFF",
        /* Semantic tokens — flip automatically via the .light class on <html> */
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        edge: "rgb(var(--edge) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.32em",
      },
      maxWidth: {
        content: "1400px",
      },
      boxShadow: {
        soft: "0 30px 80px -20px rgba(0,0,0,0.35)",
        gold: "0 20px 60px -15px rgba(200,169,106,0.45)",
        card: "0 10px 40px -10px rgba(0,0,0,0.25)",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
          "25%": { transform: "scale(1.04) rotate(-1.5deg)", opacity: "0.92" },
          "50%": { transform: "scale(0.98) rotate(1deg)", opacity: "1" },
          "75%": { transform: "scale(1.02) rotate(-0.5deg)", opacity: "0.95" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "50%": { transform: "translateY(-22px) translateX(8px)" },
        },
        ember: {
          "0%": { transform: "translateY(0) translateX(0)", opacity: "0" },
          "10%": { opacity: "0.8" },
          "100%": { transform: "translateY(-140px) translateX(var(--drift, 12px))", opacity: "0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "reveal-up": {
          "0%": { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(200,169,106,0.55)" },
          "100%": { boxShadow: "0 0 0 16px rgba(200,169,106,0)" },
        },
      },
      animation: {
        flicker: "flicker 4.5s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 9s ease-in-out infinite",
        marquee: "marquee 32s linear infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "reveal-up": "reveal-up 0.8s cubic-bezier(0.16,1,0.3,1) forwards",
        "pulse-ring": "pulse-ring 2.2s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
