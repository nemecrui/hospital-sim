/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        hospital: {
          pink: '#FF6B9D',
          cyan: '#00D9FF',
          yellow: '#FFD93D',
          danger: '#FF6B6B',
          bg: '#FFF9E6'
        }
      },
      keyframes: {
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        'pulse-success': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' }
        }
      },
      animation: {
        'bounce-in': 'bounce-in 0.3s ease-out',
        'pulse-success': 'pulse-success 0.6s ease-in-out'
      }
    }
  },
  plugins: []
};
