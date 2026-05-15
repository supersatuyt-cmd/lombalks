/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a5fa8',
        secondary: '#378add',
        accent: '#85b7eb',
        dark: '#042c53',
        background: '#f0f7ff',
      }
    },
  },
  plugins: [],
}
