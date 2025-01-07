/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'sw-yellow': '#FFE81F',
        'sw-black': '#000000',
        'sw-gray': {
          dark: '#1A1D24',
          light: '#2A2E35',
        },
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': {
            textShadow: '0 0 10px rgba(255, 232, 31, 0.3)',
          },
          '50%': {
            textShadow: '0 0 20px rgba(255, 232, 31, 0.5)',
          },
        },
      },
    },
  },
  plugins: [],
}

