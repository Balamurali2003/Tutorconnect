/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charithra: {
          black: '#0A0C10',
          dark: '#12151E',
          card: '#181C28',
          charcoal: '#222634',
          gold: '#F5A623',
          'gold-light': '#FFC83B',
          'gold-glow': '#FFE082',
          'gold-dark': '#C97D0E',
          cream: '#FCFAF6',
          sand: '#F5F1E9'
        },
        charitha: {
          black: '#0A0C10',
          dark: '#12151E',
          card: '#181C28',
          charcoal: '#222634',
          gold: '#F5A623',
          'gold-light': '#FFC83B',
          'gold-glow': '#FFE082',
          'gold-dark': '#C97D0E',
          cream: '#FCFAF6',
          sand: '#F5F1E9'
        },
        kid: {
          blue: '#0EA5E9',
          'blue-dark': '#0284C7',
          purple: '#8B5CF6',
          'purple-dark': '#7C3AED',
          green: '#10B981',
          'green-light': '#34D399',
          yellow: '#FBBF24',
          orange: '#F97316',
          pink: '#EC4899',
          cyan: '#06B6D4'
        }
      },
      fontFamily: {
        heading: ['Fredoka', 'Poppins', 'sans-serif'],
        sans: ['Poppins', 'Quicksand', 'sans-serif'],
        playful: ['Fredoka', 'cursive', 'sans-serif'],
        sub: ['Quicksand', 'sans-serif']
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(245, 166, 35, 0.45)',
        'blue-glow': '0 0 25px rgba(14, 165, 233, 0.45)',
        'card-soft': '0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.15), 0 8px 12px -4px rgba(0, 0, 0, 0.08)',
        'dark-card': '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(255, 255, 255, 0.1)',
        'dark-hover': '0 20px 45px -10px rgba(245, 166, 35, 0.25), 0 0 1px 1px rgba(245, 166, 35, 0.4)'
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-reverse': 'floatReverse 7s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sparkle': 'sparkle 2.5s ease-in-out infinite',
        'spin-slow': 'spin 18s linear infinite',
        'wiggle': 'wiggle 2s ease-in-out infinite',
        'car-drive': 'carDrive 10s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(14px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: 1, transform: 'scale(1) rotate(0deg)' },
          '50%': { opacity: 0.4, transform: 'scale(0.85) rotate(180deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        carDrive: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(250%)' },
        }
      }
    },
  },
  plugins: [],
}
