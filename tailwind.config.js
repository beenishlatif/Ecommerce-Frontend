/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        blush: {
          50: '#fdf3f5',
          100: '#fbe6ea',
          200: '#f6c9d3',
          300: '#eea3b3',
          400: '#e2748f',
          500: '#d1546f',
          600: '#b73f59',
          700: '#983148',
          800: '#7c2a3d',
          900: '#692638',
        },
        lilac: {
          50: '#f7f5fc',
          100: '#eee8f9',
          200: '#dcd0f2',
          300: '#c3aee6',
          400: '#a884d5',
          500: '#8f63c1',
          600: '#7a4ba7',
          700: '#653d89',
          800: '#54346f',
          900: '#472d5c',
        },
        peach: {
          50: '#fef8f2',
          100: '#fdefdf',
          200: '#fadcbc',
          300: '#f6c08c',
          400: '#f19d5b',
          500: '#eb7f37',
          600: '#dc6527',
          700: '#b64f22',
          800: '#914023',
          900: '#75371f',
        },
        cream: {
          50: '#fffdf9',
          100: '#fdf9ef',
          200: '#faf1db',
          300: '#f5e5bd',
        },
        charcoal: {
          50: '#f4f4f5',
          100: '#e5e4e6',
          400: '#6d6a70',
          500: '#514e56',
          600: '#3d3a41',
          700: '#2c2a30',
          800: '#201e23',
          900: '#151317',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(105, 38, 56, 0.18)',
        glow: '0 0 0 1px rgba(255,255,255,0.4) inset, 0 8px 30px -8px rgba(143,99,193,0.35)',
      },
      backgroundImage: {
        'luxe-gradient': 'linear-gradient(135deg, #fdf3f5 0%, #f7f5fc 45%, #fef8f2 100%)',
        'hero-gradient': 'linear-gradient(135deg, #eee8f9 0%, #fbe6ea 50%, #fdefdf 100%)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
