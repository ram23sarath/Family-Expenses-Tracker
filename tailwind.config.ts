import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "#f8fafc",
        card: "#ffffff",
        primary: "#0f172a",
        accent: "#2563eb",
        success: "#16a34a",
        danger: "#dc2626"
      },
      boxShadow: {
        soft: "0 8px 24px rgba(15, 23, 42, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
