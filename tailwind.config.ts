import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-space)", "sans-serif"],
        hindi: ["var(--font-noto-sans)", "sans-serif"],
      },
      colors: {
        // Architectural Palette
        background: "#050505", // Deepest black
        surface: "#0a0a0a",    // Slightly lighter for cards
        border: {
          subtle: "#27272a",
          DEFAULT: "#18181b",
        },
        accent: {
          DEFAULT: "#6366f1", // Indigo
          glow: "rgba(99, 102, 241, 0.5)",
        },
        // Keeping legacy colors for compatibility until refactor is complete
        zinc: {
            950: '#09090b',
            900: '#18181b',
            800: '#27272a',
        },
        indigo: {
            600: '#4f46e5',
            500: '#6366f1',
        }
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          from: { backgroundPosition: '0 0' },
          to: { backgroundPosition: '-200% 0' },
        }
      }
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
};
export default config;
