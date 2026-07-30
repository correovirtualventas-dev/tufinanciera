/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: { DEFAULT: '#0a0a10', light: '#1a1a2e', card: '#16213e' },
        primary: { DEFAULT: '#c418ff', hover: '#a014cc' },
        secondary: { DEFAULT: '#b3ff85' },
        tertiary: { DEFAULT: '#26cbff' },
        amber: '#ffb347',
      },
      animation: {
        'pulse-primary': 'pulse-primary 2s infinite',
        'pulse-secondary': 'pulse-secondary 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        'pulse-primary': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.7 } },
        'pulse-secondary': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.7 } },
        fadeIn: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
