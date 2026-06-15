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
      colors: {
        amazon: {
          DEFAULT: "#FF9900",
          orange: "#FF9900",
          "orange-dk": "#E47911",
          blue: "#007185",
          "blue-dk": "#004B6E",
          blueDark: "#67B8E3",
          yellow: "#FFD814",
          "yellow-dk": "#F7CA00",
          background: {
            light: "#FFFFFF",
            dark: "#0F1111",
          },
          secondaryBg: {
            light: "#F0F2F2",
            dark: "#131A22",
          },
          surface: {
            dark: "#1F2937",
          },
          card: {
            light: "#FFFFFF",
            dark: "#1A1C1E",
          },
          border: {
            light: "#D5D9D9",
            dark: "#374151",
          },
          text: {
            primary: {
              light: "#0F1111",
              dark: "#F3F4F4",
            },
            secondary: {
              light: "#37475A",
              dark: "#D5DBDB",
            },
            muted: {
              light: "#565959",
              dark: "#A7ADB2",
            },
          },
          success: {
            light: "#067D62",
            dark: "#46C995",
          },
          error: {
            light: "#CC0C39",
            dark: "#FF8A9D",
          },
          warning: {
            light: "#B45309",
            dark: "#FBBF24",
          },
        },
        bg: {
          light: "var(--bg-light)",
          card: "var(--bg-card)",
          hover: "var(--bg-hover)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          blue: "var(--text-blue)",
          red: "var(--text-red)",
        },
        border: {
          light: "var(--border-light)",
          medium: "var(--border-medium)",
        },
        badge: {
          eta: {
            bg: "var(--eta-bg)",
            text: "var(--eta-text)",
            border: "var(--eta-border)",
          },
          discount: {
            bg: "var(--discount-bg)",
            text: "var(--discount-text)",
          },
        },
        status: {
          success: "var(--success)",
          star: "var(--star)",
        },
      },
      borderRadius: {
        button: "8px",
        card: "4px", // Amazon style
        input: "4px",
        modal: "16px",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0,0,0,0.08)",
        medium: "0 4px 12px rgba(0,0,0,0.12)",
        large: "0 12px 32px rgba(0,0,0,0.18)",
        "hover-lift": "0 8px 24px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
