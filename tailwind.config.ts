import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* V3 brand */
        'brand-pink':    '#E8005A',
        'brand-blue':    '#2D3282',
        'brand-purple':  '#7B2070',
        /* Dark backgrounds */
        'dark-deep':     '#060A14',
        'dark-surface':  '#0C1220',
        'dark-elevated': '#14213A',
        /* Light backgrounds */
        'light-base':    '#FAFBFC',
        'light-surface': '#F0F4F8',
        'light-elevated':'#E8EDF5',
        /* CTAs */
        'cta':           '#E8005A',
        'cta-hover':     '#C8004E',
        /* Data */
        'data-cyan':     '#00D4F0',
        'data-violet':   '#7C3AED',
        'data-green':    '#10B981',
        /* Text on dark */
        'dark-primary':  '#F0F4FF',
        'dark-secondary':'#8A9BB8',
        'dark-muted':    '#4A5A78',
        /* Text on light */
        'light-primary': '#0C1220',
        'light-secondary':'#4A5A78',
        'light-muted':   '#8A9BB8',
      },
      fontFamily: {
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-jakarta)', 'var(--font-inter)', 'sans-serif'],
        mono:    ['var(--font-ibm-mono)', 'SF Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #E8005A 0%, #7B2070 55%, #2D3282 100%)',
        'gradient-stat': 'linear-gradient(135deg, rgba(0,212,240,0.08) 0%, rgba(124,58,237,0.08) 100%)',
      },
      letterSpacing: {
        tight:  '-0.03em',
        wide:   '0.04em',
        wider:  '0.08em',
      },
      maxWidth: {
        '8xl': '1440px',
      },
    },
  },
  plugins: [],
};

export default config;
