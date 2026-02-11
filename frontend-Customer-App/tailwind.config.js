/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx}",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5e6ff',
          100: '#e6ccff',
          200: '#d199ff',
          300: '#bb66ff',
          400: '#a64dff',
          500: '#9139BA',
          600: '#7a2e9e',
          700: '#632482',
          800: '#4c1a66',
          900: '#35104a',
        },
      },
    },
  },
  plugins: [],
}