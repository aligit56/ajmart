import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', // Enable dark mode toggle
  theme: {
    extend: {
      colors: {
        // Dark mode colors
        darkBg: '#0f0f0f',
        darkCard: '#1a1a1a',
        darkText: '#e0e0e0',
        darkTextSecondary: '#888888',
        darkBorder: '#333333',
        
        // Light mode colors
        lightBg: '#f8fafc',
        lightCard: '#ffffff',
        lightText: '#0f172a',
        lightTextSecondary: '#64748b',
        lightBorder: '#e2e8f0',
        
        // Accents (both modes)
        cyan: {
          DEFAULT: '#00d9ff',
          ...colors.cyan,
        },
        aqua: '#64ffda',
        darkBlue: '#0066cc',
        lightBlue: '#0099ff',
        success: { dark: '#00d962', light: '#00b300' },
        error: { dark: '#ff6b6b', light: '#cc0000' }
      }
    },
  },
  plugins: [],
}
