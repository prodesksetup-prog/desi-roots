/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf8f0',
          100: '#faefd8',
          200: '#f4daac',
          300: '#ecc076',
          400: '#e3a046',
          500: '#d4822a',
          600: '#b8621f',
          700: '#98471c',
          800: '#7c3a1d',
          900: '#67311a',
        },
        earth: {
          50:  '#faf7f4',
          100: '#f2ebe3',
          200: '#e3d4c4',
          300: '#cfb59e',
          400: '#b89077',
          500: '#a67458',
          600: '#8f5e48',
          700: '#764d3c',
          800: '#614035',
          900: '#51362e',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
