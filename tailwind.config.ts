import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: {
          primary: '#FAF8F5',
          secondary: '#F5F3F0',
          tertiary: '#EDEAE6',
          elevated: '#FFFFFF',
        },
        text: {
          primary: '#2C2C2C',
          secondary: '#666666',
          muted: '#999999',
        },
        border: {
          subtle: '#E5E3DF',
          default: '#D1CEC9',
        },
        accent: {
          blue: '#3b82f6',
          green: '#22c55e',
          amber: '#F97316',
          red: '#EF4444',
          purple: '#A855F7',
        },
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      spacing: {
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.06)',
        md: '0 4px 6px rgba(0,0,0,0.08)',
        lg: '0 10px 15px rgba(0,0,0,0.1)',
        glow: '0 0 20px rgba(249,115,22,0.15)',
      },
      backgroundImage: {
        'gradient-blue': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        'gradient-glow': 'radial-gradient(circle at center, rgba(59,130,246,0.15) 0%, transparent 70%)',
      },
      lineHeight: {
        'none': '1',
        'tight': '1.25',
        'snug': '1.375',
        'normal': '1.5',
        'relaxed': '1.625',
        'loose': '2',
      },
    },
  },
  plugins: [],
}
export default config