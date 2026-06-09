import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#F0C55A',
          500: '#D4A843',
          600: '#B8952E',
        },
        obsidian: {
          50: '#F8F8F8',
          900: '#0A0A0A',
        }
      },
      backgroundColor: {
        'glass': 'rgba(255, 255, 255, 0.04)',
      },
      backdropBlur: {
        'md': '12px',
      },
      borderColor: {
        'gold-light': 'rgba(212, 168, 67, 0.2)',
      }
    },
  },
  plugins: [],
} satisfies Config
