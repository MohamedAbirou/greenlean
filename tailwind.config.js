/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
      }
    }
  },
  safelist: [
    {
      pattern: /(bg|text|border|hover:bg)-(green|blue|purple|red|orange|pink|indigo|teal|yellow|gray)-(400|500|600)/,
    },
    {
      pattern: /bg-(green|blue|purple|red|orange|pink|indigo|teal|yellow|gray)-(500)\/20/,
    }
  ],
  plugins: [],
};