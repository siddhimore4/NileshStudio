/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          950: '#07080B',
          900: '#0D0E15',
          850: '#13151F',
          800: '#191B28',
          750: '#202334',
          700: '#2A2E44',
          600: '#3D4260',
          500: '#5D648E',
          400: '#8A92BF',
          300: '#B6BDE0',
          200: '#DDE2F5',
          100: '#EEF1FB',
          50: '#F7F8FD',
        },
        gold: {
          50: '#FDFBF4',
          100: '#FAF4E3',
          200: '#F4E6BC',
          300: '#EDD48E',
          400: '#E4BF59',
          500: '#D4AF37', // Master gold
          600: '#B89223',
          700: '#947217',
          800: '#755716',
          900: '#5C4416',
        },
        bronze: {
          DEFAULT: '#9A6B3A',
          dark: '#68451F',
          light: '#C89D6D'
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
        display: ['Cinzel', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 25px -5px rgba(212, 175, 55, 0.35)',
        'glow-gold-lg': '0 0 40px -5px rgba(212, 175, 55, 0.45)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        }
      }
    },
  },
  plugins: [],
}
