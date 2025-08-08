/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Chang Cookbook Brand Colors
        'chang-brown': {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec5',
          400: '#d2b8ac',
          500: '#c4a190',
          600: '#a18972',
          700: '#8b6f52', // light brown
          800: '#6b4f3a', // medium brown
          900: '#4a3429', // primary brown
          950: '#2d1f16', // darkest for text
        },
        'chang-orange': {
          50: '#fff5f0',
          100: '#ffe8db',
          200: '#ffceb3',
          300: '#ffab80', // light orange
          400: '#ff9966', // primary orange
          500: '#ff8247',
          600: '#e6824e', // dark orange
          700: '#cc6633',
          800: '#b8522a',
          900: '#8b3d1f',
        },
        'chang-neutral': {
          50: '#faf8f5', // cream background
          100: '#f5f1eb',
          200: '#ebe5d8',
          300: '#dfd7c7',
          400: '#d1c7b5',
          500: '#c1b5a0',
          600: '#a89d87',
          700: '#8d806b',
          800: '#726750',
          900: '#5a5138',
        },
        // Legacy colors for compatibility
        orange: {
          50: '#fff5f0',
          100: '#ffe8db',
          200: '#ffceb3',
          300: '#ffab80',
          400: '#ff9966',
          500: '#ff8247',
          600: '#e6824e',
          700: '#cc6633',
        },
        red: {
          50: '#FDF2F2',
          500: '#E74C3C',
          600: '#DC2626',
        },
        green: {
          600: '#7D8471',
        },
        stone: {
          100: '#F5F1EB',
        },
        slate: {
          200: '#ECF0F1',
          400: '#95A5A6',
          700: '#2C3E50',
        },
      },
      fontFamily: {
        'heading': ['Quicksand', 'Inter', 'system-ui', 'sans-serif'],
        'body': ['Source Sans Pro', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Source Sans Pro', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          md: '2rem',
          lg: '3rem',
          xl: '4rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      lineHeight: {
        'tight': '1.25',
        'relaxed': '1.625',
      },
      aspectRatio: {
        'video': '16 / 9',
        '4/3': '4 / 3',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}