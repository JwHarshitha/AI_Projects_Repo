/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        surface: {
          DEFAULT: '#0f172a',
          card: '#131c31',
          subtle: '#18233d',
          hover: '#1e2d4d',
          border: '#1e293b'
        },
        primary: {
          DEFAULT: '#6366f1', // Indigo
          hover: '#4f46e5',
          light: '#818cf8',
          subtle: 'rgba(99, 102, 241, 0.12)',
        },
        accent: {
          cyan: '#06b6d4',
          violet: '#8b5cf6',
          emerald: '#10b981',
          rose: '#f43f5e',
          amber: '#f59e0b',
        },
        sentiment: {
          positive: '#10b981',
          'positive-bg': 'rgba(16, 185, 129, 0.12)',
          'positive-border': 'rgba(16, 185, 129, 0.25)',
          neutral: '#94a3b8',
          'neutral-bg': 'rgba(148, 163, 184, 0.12)',
          'neutral-border': 'rgba(148, 163, 184, 0.25)',
          negative: '#f43f5e',
          'negative-bg': 'rgba(244, 63, 94, 0.12)',
          'negative-border': 'rgba(244, 63, 94, 0.25)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
