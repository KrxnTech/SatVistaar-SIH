/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#060a13', // deepest dark space background
          900: '#0b1120', // base app background
          850: '#111827', // card / layout panel background
          800: '#1f2937', // active/hover item background
          700: '#374151', // border default
          600: '#4b5563', // text secondary
        },
        navy: {
          950: '#050814', // deepest navy base
          900: '#0a0f1d', // default navy background
          850: '#10162a', // panel background
          800: '#1e294b', // border / secondary navy
          700: '#3b426f', // light navy
          600: '#64748b', // slate/navy gray text
        },
        brand: {
          blue: '#1d4ed8',   // solid professional blue
          sky: '#0284c7',    // sky blue accent
          cyan: '#0891b2',   // cyan tech accent
          teal: '#0d9488',   // teal radar accent
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['SFMono-Regular', 'Consolas', 'Liberation Mono', 'monospace'],
      },
      boxShadow: {
        'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'accent-glow': '0 0 15px -3px rgba(14, 165, 233, 0.25)',
      }
    },
  },
  plugins: [],
}
