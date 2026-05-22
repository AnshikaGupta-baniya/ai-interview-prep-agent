/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Option C — Terracotta + Warm Indigo
        terra: {
          DEFAULT: '#D97B66',
          light: '#F2C4B8',
          dim: '#3D2420',
        },
        indigo: {
          DEFAULT: '#6B5EA8',
          light: '#A89FCC',
          dim: '#1E1B38',
        },
        amber: {
          DEFAULT: '#F0A832',
          light: '#F9DFA0',
          dim: '#2C2010',
        },
        lavender: '#A89FCC',
        // Light mode
        light: {
          bg: '#FAF8FC',
          surf: '#FFFFFF',
          surf2: '#F2F0F7',
          text: '#1A1720',
          text2: '#6B6880',
          text3: '#A8A5B8',
          border: '#E8E4F0',
        },
        // Dark mode
        dark: {
          bg: '#16141E',
          surf: '#1E1C28',
          surf2: '#252334',
          text: '#F0EDF8',
          text2: '#8A87A0',
          text3: '#3E3C50',
          border: '#2A2838',
        },
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        bold: ['Inter_700Bold'],
        mono: ['SpaceMono_400Regular'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
        '3xl': '28px',
      },
    },
  },
  plugins: [],
}
