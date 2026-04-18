/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#3B82F6',
          cyan: '#22D3EE',
          purple: '#A78BFA',
        },
        status: {
          smooth: '#22C55E',
          congested: '#F43F5E',
          slow: '#FACC15',
        },
        dark: {
          bg: '#0B1220',
        },
      },
    },
  },
  plugins: [],
}

