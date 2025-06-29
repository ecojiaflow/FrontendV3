/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'eco': {
          leaf: '#6BDF44',
          text: '#1E3D2B',
          glow: '#A3C75A',
          olive: '#555B1B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'eco-gradient': 'linear-gradient(135deg, #A3C75A 0%, #F5F7F0 100%)',
      }
    },
  },
  plugins: [],
};