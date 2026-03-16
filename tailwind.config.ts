import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-page':      '#0C0524',
        'bg-card':      '#160A3D',
        'bg-card-hover':'#1E1050',
        'bg-elevated':  '#1A0D45',
        'bg-alt':       '#0A0520',
        'primary':      '#2A9D8F',
        'primary-hover':'#33B8A8',
        'accent-purple':'#9A81DF',
        'accent-violet':'#7456C8',
        'accent-pink':  '#D783D8',
        'accent-rose':  '#FF90A5',
        'accent-amber': '#FFB071',
        'text-primary': '#E0D6DE',
        'text-heading': '#F5F0FF',
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #9A81DF 10%, #7456C8 90%)',
        'gradient-heading': 'linear-gradient(90deg, #A680FF 5%, #FF85B8 45%, #FFB070 85%)',
      },
    },
  },
  plugins: [],
};

export default config;
