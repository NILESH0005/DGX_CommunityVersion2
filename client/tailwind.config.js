/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      screens: {
        'custom-lg': { 'max': '1400px' },
        'xs': { 'max': '450px' },
      },

      colors: {
        'DGXgreen': '#76B900',
        'DGXblue': '#013D54',
        'DGXwhite': '#FFFFFF',
        'DGXblack': '#000000',
        'DGXgray': '#6b7280',
        'Approved': '#76B900',
        'Rejected': '#FF8989',
        'Pending': '#F8ED8C'
      },
      keyframes: {
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'spin-reverse': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        pulse: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        },
        scroll: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        spin: 'spin 1s linear infinite',
        'spin-reverse': 'spin-reverse 1s linear infinite',
        pulse: 'pulse 1s infinite',
        scroll: 'scroll 15s linear infinite',
      },
      backgroundImage: theme => ({
        'dgx-gradient': `linear-gradient(135deg, ${theme('colors.DGXblue')}, ${theme('colors.DGXgreen')})`,
      }),
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}
