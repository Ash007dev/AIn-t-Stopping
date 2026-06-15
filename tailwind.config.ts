import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-sora)", "sans-serif"],
        sora: ["Sora", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        // Design system custom colors
        "bg-primary": "#0a0a0a",
        "bg-card": "#111111",
        "bg-elevated": "#1a1a1a",
        "border-default": "#222222",
        "border-bright": "#333333",
        "accent-primary": "#E8170A",
        "accent-hover": "#FF2010",
        "accent-orange": "#FF9900",
        "text-primary": "#FFFFFF",
        "text-secondary": "#A0A0A0",
        "text-muted": "#555555",
        success: "#22C55E",
        star: "#FBBF24",

        // Prefix-less keys (from HEAD / legacy components support)
        primary: "#0a0a0a",
        card: "#111111",
        elevated: "#1a1a1a",
        "accent-green": "#22C55E",
        "accent-star": "#FBBF24",
        amazon: {
          DEFAULT: "#FF9900",
          hover: "#E88A00",
          blue: "#007185", // Amazon Link Blue
          blueDark: "#5EB6C6",
          background: {
            light: "#FFFFFF",
            dark: "#0F1111", // Amazon true dark mode bg
          },
          secondaryBg: {
            light: "#EAEDED", // Amazon standard grey bg
            dark: "#19222B",
          },
          card: {
            light: "#FFFFFF",
            dark: "#232F3E", // Amazon header/card dark
          },
          surface: {
            dark: "#2B3645",
          },
          border: {
            light: "#D5D9D9", // Amazon standard border
            dark: "#3A4553",
          },
          text: {
            primary: {
              light: "#0F1111",
              dark: "#FFFFFF",
            },
            secondary: {
              light: "#565959",
              dark: "#D5D9D9",
            },
            muted: {
              light: "#6B7280",
              dark: "#AAB7B8",
            },
          },
          success: {
            light: "#067D62",
            dark: "#3DDC97",
          },
          warning: {
            light: "#FF9900",
            dark: "#FFB84D",
          },
          error: {
            light: "#C62828",
            dark: "#FF6B6B",
          },
        },
      },
      borderRadius: {
        button: "8px",
        card: "12px",
        input: "8px",
        modal: "16px",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0,0,0,0.08)",
        medium: "0 4px 12px rgba(0,0,0,0.12)",
        large: "0 12px 32px rgba(0,0,0,0.18)",
        "hover-lift": "0 8px 24px rgba(0,0,0,0.15)",
      },
      transitionDuration: {
        200: "200ms",
      },
    },
  },
  plugins: [],
};
export default config;
