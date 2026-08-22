/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#090A0F",
        surface: {
          DEFAULT: "rgba(18, 20, 29, 0.7)",
          solid: "#12141D",
          light: "rgba(28, 31, 46, 0.6)",
          hover: "rgba(38, 43, 64, 0.8)",
          border: "rgba(255, 255, 255, 0.08)",
          borderGlow: "rgba(6, 182, 212, 0.3)",
        },
        pet: {
          cyan: "#06B6D4",
          teal: "#14B8A6",
          purple: "#A855F7",
          amber: "#F59E0B",
          rose: "#F43F5E",
          emerald: "#10B981",
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 15px rgba(6,182,212,0.4))' },
          '100%': { filter: 'drop-shadow(0 0 28px rgba(6,182,212,0.8))' },
        }
      }
    },
  },
  plugins: [],
}
