/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './frontend/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 22px 60px rgba(16, 24, 40, 0.08)',
      },
    },
  },
  plugins: [],
};
