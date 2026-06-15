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
          orange: "var(--amazon-orange)",
          "orange-dk": "var(--amazon-orange-dk)",
          blue: "var(--amazon-blue)",
          "blue-dk": "var(--amazon-blue-dk)",
          yellow: "var(--amazon-yellow)",
          "yellow-dk": "var(--amazon-yellow-dk)",
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
