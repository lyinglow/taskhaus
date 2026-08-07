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
          50: '#F0FAF4',
          100: '#DAF2E3',
          200: '#B3E5C7',
          300: '#82D3A4',
          400: '#4FB87D',
          500: '#2E9960',
          600: '#1F7A4D',
          700: '#185F3D',
          800: '#14492F',
          900: '#103A26'
        },
        accent: {
          50: '#FDF4EC',
          100: '#FAE3CC',
          300: '#EBA35A',
          500: '#D9761F',
          600: '#B85F16',
          700: '#8F4912'
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
