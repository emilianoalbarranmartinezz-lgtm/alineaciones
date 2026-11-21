import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#08090a', 900: '#0e1012', 800: '#15181b', 700: '#1d2125', 600: '#2a2f35' },
        pitch: { DEFAULT: '#16803c', dark: '#0f3d22' },
        accent: '#22c55e',
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
