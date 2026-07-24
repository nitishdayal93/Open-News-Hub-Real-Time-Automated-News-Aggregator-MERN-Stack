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
        luxury: {
          bg: '#F8F7F4',
          'bg-secondary': '#F1EFE9',
          card: '#FFFFFF',
          primary: '#0F172A',
          accent: '#C89B63',
          'accent-hover': '#A97843',
          'accent-light': '#EADBC8',
          text: '#111827',
          muted: '#6B7280',
          border: '#EAE6DF',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
        },
        dark: {
          bg: '#0B0F17',
          card: '#161F30',
          border: '#25334D',
        },
        primary: {
          50: '#fcfaf6',
          100: '#f7f2e9',
          200: '#eadbc8',
          300: '#d9be9e',
          400: '#c89b63',
          500: '#a97843',
          600: '#8c5e31',
          700: '#6f4625',
          800: '#533119',
          900: '#0f172a',
        },
      },
      borderRadius: {
        '24': '24px',
        '30': '30px',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
