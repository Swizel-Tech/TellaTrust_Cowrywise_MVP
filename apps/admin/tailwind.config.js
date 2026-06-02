/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0F0C',
        forest: { deep: '#0F2A18', DEFAULT: '#1C7A3E', dark: '#103A22' },
        green: { brand: '#2FA84F', accent: '#33B85A', bright: '#3CC264' },
        mint: '#9FE2B4',
        soft: '#F4F8F5',
        line: '#DDE7E0',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
