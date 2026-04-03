import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#FAFAF8",
        surface: "#FFFFFF",
        "surface-2": "#F4F4F1",
        border: "#EBEBEB",
        "border-strong": "#D4D4D0",
        ink: "#0A0A0A",
        "ink-2": "#6B6B6B",
        "ink-3": "#A8A8A4",
        gold: "#F5C518",
        "gold-hover": "#E6B800",
      },
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        sans: ["DM Sans", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.08)",
        modal: "0 24px 80px rgba(0,0,0,0.14)",
      },
    },
  },
  plugins: [],
};
export default config;
