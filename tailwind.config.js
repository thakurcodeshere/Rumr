/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: '#0e0e0e',
        surface: {
          DEFAULT: '#131313',
          container: '#20201f',
          low: '#1c1b1b',
          high: '#2a2a2a',
          highest: '#353535',
        },
        toxic: {
          DEFAULT: '#ccff00',
          lime: '#ccff00',
          dim: '#abd600',
        },
        electric: {
          purple: '#a855f7',
          dim: '#ddb7ff',
        },
        pure: '#ffffff',
        muted: '#888888',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'brutalist-purple': '4px 4px 0px #a855f7',
        'brutalist-lime': '4px 4px 0px #ccff00',
        'brutalist-white': '4px 4px 0px #ffffff',
      }
    },
  },
  plugins: [],
}
