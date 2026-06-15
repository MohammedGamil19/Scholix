/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1B2A6B',
          blue: '#5BB8E8',
          orange: '#F5A623',
          'orange-dark': '#F07C1A',
          cream: '#FAF6F0',
        },
      },
      fontFamily: {
        cairo: ['var(--font-cairo)', 'sans-serif'],
      },
      keyframes: {
        'pulse-orange': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(245, 166, 35, 0.7)',
          },
          '50%': {
            boxShadow: '0 0 0 14px rgba(245, 166, 35, 0)',
          },
        },
      },
      animation: {
        'pulse-orange': 'pulse-orange 2s infinite',
      },
    },
  },
  plugins: [],
}
