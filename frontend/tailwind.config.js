/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        tealCustom: '#408B8F', // Adding the custom teal color
      },
      keyframes: {
        bounce: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'loader-bounce': 'bounce 0.6s infinite ease-in-out',
      },
      
    },
  },
  plugins: [],
}
