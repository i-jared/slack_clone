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
        'orbitron': ['Orbitron', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out',
        'fade-out': 'fadeOut 1s ease-in',
        'lightspeed': 'lightspeed 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '0.75' }
        },
        fadeOut: {
          '0%': { opacity: '0.75' },
          '100%': { opacity: '0' }
        },
        lightspeed: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        pulseGlow: {
          '0%, 100%': {
            textShadow: '0 0 10px rgba(255, 232, 31, 0.7), 0 0 20px rgba(255, 232, 31, 0.7)'
          },
          '50%': {
            textShadow: '0 0 20px rgba(255, 232, 31, 0.9), 0 0 30px rgba(255, 232, 31, 0.9)'
          }
        }
      }
    },
  },
  plugins: [],
}

