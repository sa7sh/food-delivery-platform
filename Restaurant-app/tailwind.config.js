/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E23744',
        secondary: '#1C1C1C',
        success: '#5CAD4E',
        warning: '#FFA500',
        danger: '#DC3545',
        dark: '#2D2D2D',
        light: '#F5F5F5',
      },
    },
  },
  plugins: [],
}