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
        brand: {
          DEFAULT: "#1b4332",
          dark: "#012d1d",
          muted: "#274e3d",
          tint: "rgba(27,67,50,0.1)",
        },
        surface: {
          DEFAULT: "#fbf9f8",
          card: "#ffffff",
          inset: "#f5f3f3",
          border: "#c1c8c2",
          "border-light": "#e9e0d9",
        },
        text: {
          primary: "#1b1c1c",
          secondary: "#414844",
          muted: "#605e5c",
          disabled: "#717973",
        },
        status: {
          mint: "#b1f0ce",
          "mint-bg": "rgba(193,236,212,0.2)",
          open: "#dc2626",
          investigating: "#1b4332",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
      },
      boxShadow: {
        card: "0px 20px 40px -10px rgba(1,45,29,0.08)",
        cta: "0px 10px 15px -3px rgba(27,67,50,0.1), 0px 4px 6px -4px rgba(27,67,50,0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
