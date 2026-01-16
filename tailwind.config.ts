import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // === BRAND IDENTITY: AN CONNECT (TEAL/LIME) ===
        primary: {
          DEFAULT: "#189cab", // Teal Primary
          foreground: "#ffffff",
          50: "#e8fcfd",
          100: "#cbf7fa",
          500: "#189cab", // Main
          600: "#13ecda", // Legacy bright teal from code.html
          700: "#0d9488",
        },
        secondary: {
          DEFAULT: "#8bc540", // Lime Secondary
          foreground: "#ffffff",
          500: "#8bc540",
        },

        // === BRAND IDENTITY: AN CAREER (GOOGLE BLUE) ===
        career: {
          primary: "#4285F4", // Google Blue
          success: "#34A853", // Green
          warning: "#FBBC04", // Yellow
          error: "#EA4335",   // Red
        },

        // === SURFACE COLORS (To fix the Brown issue) ===
        // We explicitly define these to override any 'brown' defaults
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "#ffffff", // Force White
          foreground: "#1e293b",
          active: "#e8fcfd", // Light Teal
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'xl': '1rem',
        '2xl': '1.5rem', // For An Connect
        '3xl': '2rem',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(90deg, #189cab 0%, #8bc540 100%)', // Teal -> Lime
        'career-gradient': 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)', // Blue -> Green
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
