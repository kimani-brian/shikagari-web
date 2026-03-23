import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Brand Colours ──────────────────────────────────────────────
      colors: {
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e3a8a",
          900: "#1e2f6b",
          950: "#0f1729",
        },
        navy: {
          DEFAULT: "#0f1e45",
          light:   "#1a2f5e",
          dark:    "#080f22",
        },
        gold: {
          DEFAULT: "#f59e0b",
          light:   "#fcd34d",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted:   "#f8fafc",
          subtle:  "#f1f5f9",
        },
      },

      // ── Typography ────────────────────────────────────────────────
      fontFamily: {
        sans:    ["DM Sans", "sans-serif"],
        display: ["Sora", "sans-serif"],
      },

      // ── Spacing & Sizing ──────────────────────────────────────────
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },

      // ── Shadows ───────────────────────────────────────────────────
      boxShadow: {
        card:    "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-hover": "0 10px 30px -5px rgb(0 0 0 / 0.12), 0 4px 6px -2px rgb(0 0 0 / 0.05)",
        nav:     "0 1px 0 0 rgb(0 0 0 / 0.06)",
        blue:    "0 4px 24px 0 rgb(37 99 235 / 0.25)",
      },

      // ── Animations ────────────────────────────────────────────────
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up":   "fade-up 0.5s ease-out both",
        "fade-in":   "fade-in 0.4s ease-out both",
        "shimmer":   "shimmer 1.8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;