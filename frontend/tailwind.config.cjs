/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          50: '#faf9f7',
          100: '#1a1612',
          200: '#241e15',
          300: '#2e261a',
          400: '#0d0b08',
          500: '#090806',
        },
        primary: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        secondary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        tertiary: {
          50: '#fef7e8',
          100: '#fbe7bc',
          200: '#f7d58a',
          300: '#f0bf54',
          400: '#e8a92e',
          500: '#d1911a',
          600: '#a97114',
          700: '#845710',
          800: '#5c3c0b',
          900: '#3a2406',
        },
        amber: '#f59e0b',
      },
      width: {
        sidebar: '240px',
      },
      height: {
        topbar: '64px',
      },
    },
  },
  plugins: [],
};
