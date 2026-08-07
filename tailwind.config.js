/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F6F8F0',
          100: '#E9EFDC',
          200: '#D3E0BA',
          300: '#B7CE90',
          400: '#9BBA68',
          500: '#7E974A',
          600: '#647A3B',
          700: '#4F6130',
          800: '#3F4D27',
          900: '#333F20'
        },
        accent: {
          50: '#FBF2F6',
          100: '#F5DCE7',
          300: '#DC90B4',
          500: '#C26994',
          600: '#A04D7A',
          700: '#833D63'
        },
        stone: {
          50: '#FAF9F7',
          100: '#F2F0EC',
          200: '#E4E0D8',
          300: '#CFC9BC',
          500: '#7D7568',
          700: '#443F38',
          900: '#1C1916'
        }
      }
    }
  },
  plugins: []
};
