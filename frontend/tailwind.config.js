/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0d',
        surface: '#0f0f13',
        surface2: '#141419',
        surface3: '#191920',
        line: '#23232b',
        'line-strong': '#30303a',
        ink: '#f2f2f5',
        muted: '#9a9aa8',
        subtle: '#6c6c7a',
        accent: {
          DEFAULT: '#7b78ff',
          soft: '#9a97ff',
          deep: '#5f5bff',
          dim: 'rgba(123, 120, 255, 0.12)',
        },
        cyan: {
          DEFAULT: '#7dd3fc',
          dim: 'rgba(125, 211, 252, 0.1)',
        },
        success: '#4ade80',
        warning: '#fbbf24',
        danger: '#f87171',
      },
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        '4xl': '1.75rem',
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 12px 40px -16px rgba(0,0,0,0.75)',
        pop: '0 18px 50px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
        glow: '0 0 0 1px rgba(123,120,255,0.28), 0 12px 40px -12px rgba(95,91,255,0.45)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 320ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 220ms ease-out both',
        shimmer: 'shimmer 1.8s infinite',
        'pulse-soft': 'pulse-soft 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
