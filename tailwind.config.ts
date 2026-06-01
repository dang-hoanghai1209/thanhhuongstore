import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f7f5ff",
          100: "#f0ebff",
          200: "#e0d6ff",
          300: "#c7b3ff",
          400: "#a988ff",
          500: "#8a57ff", // Primordial Brand Purple
          600: "#752eff",
          700: "#6014fa",
          800: "#510fd1",
          900: "#440dae",
          950: "#270477",
        },
        accent: {
          pink: "#ff4d94",
          gold: "#e6b800",
          teal: "#00b3b3",
        },
      },
      borderRadius: {
        'brand-sm': '0.375rem',
        'brand-md': '0.75rem',
        'brand-lg': '1.25rem',
        'brand-xl': '2rem',
      },
      animation: {
        fadeIn: "fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        slideUp: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        slideRight: "slideRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        shimmer: "shimmer 2s infinite linear",
        float: "float 6s ease-in-out infinite",
        pulseSubtle: "pulseSubtle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(15px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideRight: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.02)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
