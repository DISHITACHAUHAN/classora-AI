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
        dark: {
          900: '#07090E',
          800: '#0E131F',
          700: '#161D2F',
          600: '#1F293D',
        },
        ai: {
          listen: '#10B981', // Emerald green
          think: '#F59E0B',  // Amber yellow
          speak: '#06B6D4',  // Cyan blue
          wait: '#94A3B8',   // Slate white/grey
          override: '#EF4444' // Rose red
        },
        brand: {
          50: '#F0F5FF',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 2s linear infinite',
        'orb-glow': 'orbGlow 4s ease-in-out infinite alternate',
      },
      keyframes: {
        orbGlow: {
          '0%': { transform: 'scale(1)', opacity: '0.8', filter: 'drop-shadow(0 0 20px rgba(6,182,212,0.4))' },
          '100%': { transform: 'scale(1.08)', opacity: '1', filter: 'drop-shadow(0 0 35px rgba(6,182,212,0.8))' }
        }
      }
    },
  },
  plugins: [],
}
