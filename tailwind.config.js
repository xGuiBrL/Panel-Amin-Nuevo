/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f24928',
        secondary: '#160d4e',
        base: '#ffffff'
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        'soft': '0 6px 18px rgba(22,13,78,0.08)',
      }
    },
  },
  plugins: [],
}
