/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          50: '#f8f9fa',
          100: '#1a1a2e',
          200: '#16213e',
          300: '#0f3460',
          400: '#0a0a10',
          500: '#08080d',
        },
        primary: {
          50: '#f3e5ff',
          100: '#e1b9ff',
          200: '#ce8cff',
          300: '#b85eff',
          400: '#a431ff',
          500: '#c418ff',
          600: '#a014cc',
          700: '#7c0f99',
          800: '#580b66',
          900: '#340633',
        },
        secondary: {
          50: '#f2ffeb',
          100: '#d9ffbf',
          200: '#b3ff85',
          300: '#8cff4d',
          400: '#66ff1a',
          500: '#4de600',
          600: '#3db800',
          700: '#2e8a00',
          800: '#1e5c00',
          900: '#0f2e00',
        },
        tertiary: {
          50: '#e0f7ff',
          100: '#b3edff',
          200: '#80e2ff',
          300: '#4dd8ff',
          400: '#26cbff',
          500: '#00bfff',
          600: '#0099cc',
          700: '#007399',
          800: '#004d66',
          900: '#002633',
        },
        amber: '#ffb347',
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
