import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Official AJMart Brand Palette
        brandGreen: {
          DEFAULT: '#278A67',
          50: '#f0fdf7',
          100: '#dbf9eb',
          200: '#b8f2d8',
          300: '#7be3b4',
          400: '#40cb8f',
          500: '#278A67',
          600: '#1f7053',
          700: '#1a5943',
          800: '#174737',
          900: '#143c2f',
          dark: '#1e7053',
          light: '#32a87d'
        },
        brandGold: {
          DEFAULT: '#E8A12D',
          50: '#fffaf0',
          100: '#fef3dc',
          200: '#fce3b3',
          300: '#f9cb7d',
          400: '#f3b447',
          500: '#E8A12D',
          600: '#cf891b',
          700: '#a66914',
          800: '#855214',
          900: '#6d4314',
          dark: '#c4821a',
          light: '#f0b54f'
        },
        warmWhite: '#F7F5EF',

        // Theme Background & Surface Colors
        lightBg: '#F7F5EF',          // Warm White page background
        lightCard: '#FFFFFF',        // Pure White elevated cards
        lightText: '#263238',        // High-contrast Dark Text
        lightTextSecondary: '#546E7A', // Slate Blue-Grey for secondary/metadata
        lightBorder: '#E0DED6',      // Subtle warm border

        // Dark Mode Surface Colors (Rich organic dark forest slate)
        darkBg: '#121614',
        darkCard: '#1a201c',
        darkText: '#F7F5EF',         // Warm white text in dark mode
        darkTextSecondary: '#94A3B8',
        darkBorder: '#28332C',

        // Legacy/Semantic Theme Aliases (ensures 100% of existing components adapt immediately)
        darkBlue: {
          DEFAULT: '#278A67',
          50: '#f0fdf7',
          100: '#dbf9eb',
          500: '#278A67',
          600: '#1e7053',
          700: '#1a5943',
        },
        lightBlue: {
          DEFAULT: '#E8A12D',
          50: '#fffaf0',
          100: '#fef3dc',
          500: '#E8A12D',
          600: '#cf891b'
        },
        cyan: {
          DEFAULT: '#32a87d',
          50: '#f0fdf7',
          100: '#dbf9eb',
          200: '#b8f2d8',
          300: '#7be3b4',
          400: '#40cb8f',
          500: '#32a87d',
          600: '#278A67',
          700: '#1e7053',
        },
        aqua: {
          DEFAULT: '#E8A12D',
          500: '#E8A12D',
          600: '#cf891b'
        },

        // Semantic Colors (Preserved with strict accessibility standards)
        success: { 
          DEFAULT: '#16a34a',
          dark: '#22c55e', 
          light: '#16a34a' 
        },
        error: { 
          DEFAULT: '#dc2626',
          dark: '#ef4444', 
          light: '#dc2626' 
        },
        warning: { 
          DEFAULT: '#d97706',
          dark: '#f59e0b', 
          light: '#d97706' 
        }
      }
    },
  },
  plugins: [],
}
