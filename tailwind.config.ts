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
          tint: "rgba(27,67,50,0.08)",
        },
        accent: {
          DEFAULT: "#d97706",
          muted: "rgba(217,119,6,0.12)",
          foreground: "#b45309",
        },
        surface: {
          DEFAULT: "#f8fafc",
          card: "#ffffff",
          inset: "#f1f5f9",
          border: "#e2e8f0",
          "border-light": "#f1f5f9",
          sidebar: "#ffffff",
        },
        text: {
          primary: "#0f172a",
          secondary: "#475569",
          muted: "#64748b",
          disabled: "#94a3b8",
        },
        status: {
          mint: "#16a34a",
          "mint-bg": "rgba(22,163,74,0.12)",
          open: "#dc2626",
          investigating: "#1b4332",
        },
      },
      fontFamily: {
        sans: ["var(--font-fira-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-fira-code)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)",
        soft: "0 2px 8px rgba(15,23,42,0.06)",
        cta: "0 4px 12px rgba(27,67,50,0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.35s ease-out",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
