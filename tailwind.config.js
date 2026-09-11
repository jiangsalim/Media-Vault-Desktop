/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      borderColor: { DEFAULT: '#252D48', accent: '#00C2BA' },
      colors: {
        // ── Brand palette (from website) ──
        navy: {
          DEFAULT: '#0F1526',
          light: '#141A2E',
          dark: '#070B18',
        },
        teal: {
          DEFAULT: '#00C2BA',
          dark: '#00A39C',
        },
        charcoal: '#293A46',
        'gray-light': '#F0F2F5',
        'gray-medium': '#8B9DB5',

        // ── UI tokens (remapped to navy palette) ──
        bg: '#0F1526',
        surface: '#141A2E',
        'surface-2': '#1A2138',
        border: '#252D48',
        'text-primary': '#F0F2F5',
        'text-secondary': '#8B9DB5',
        muted: '#5A6480',
        hover: '#1E2740',
        selection: '#00C2BA',

        // ── Accent (teal) ──
        accent: '#00C2BA',
        'accent-hover': '#00A39C',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '4px',
        card: '6px',
        modal: '8px',
      },
      boxShadow: {
        card: '0 4px 12px rgba(15, 21, 38, 0.4)',
        'card-hover': '0 8px 24px rgba(15, 21, 38, 0.5)',
        glow: '0 0 20px rgba(0, 194, 186, 0.15)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(8px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        press: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(1px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.2s ease-out',
        'slide-up': 'slide-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};