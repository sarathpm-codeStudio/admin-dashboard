import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2c1452',
          navy: '#2c1452',
          'navy-end': '#2c1452',
        },
        surface: {
          page: '#f8f9fb',
          sidebar: '#f2f4f6',
          card: '#ffffff',
          input: '#f2f4f6',
          topbar: 'rgba(255, 255, 255, 0.7)',
        },
        nav: {
          DEFAULT: '#64748b',
          active: '#ffffff',
        },
        admin: {
          name: '#312e81',
        },
        primary: {
          DEFAULT: '#2c1452',
          end: '#2c1452',
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4338ca',
          700: '#312e81',
          800: '#2c1452',
          900: '#2c1452',
          950: '#1d0d38',
        },
        ink: {
          DEFAULT: '#191c1e',
          heading: '#2c1452',
          label: '#454652',
          subtle: '#5f5e5e',
          muted: '#767683',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'Lexend', 'Inter', 'system-ui', 'sans-serif'],
        brand: ['Manrope', 'Lexend', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #2c1452 0%, #2c1452 100%)',
        'primary-gradient-r': 'linear-gradient(to right, #2c1452 0%, #2c1452 100%)',
      },
      borderRadius: {
        card: '12px',
        nav: '8px',
      },
    },
  },
  plugins: [],
} satisfies Config
