/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'sw-black': '#000000',
        'sw-yellow': '#FFE81F',
        'sw-gray': {
          dark: '#1A1A1A',
          light: '#333333',
        },
        'sw-accent': '#2F3640',
      },
      fontFamily: {
        'star-wars': ['Star Wars', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

