/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        onix: {
          bg: '#08080c',
          bgElevated: '#0c0c10',
          card: '#111116',
          cardHover: '#16161d',
          border: '#1e1e26',
          'border-light': '#2a2a34',
          muted: '#6b6b76',
          mutedLight: '#a1a1aa',
          accent: '#e045c5',
          accentHover: '#d62db8',
          accentDim: '#a82d92',
          accentDark: '#6b1a5c',
          accentDarker: '#4a1240',
          accentGlow: 'rgba(224, 69, 197, 0.25)',
          danger: '#ef4444',
          success: '#22c55e',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Outfit', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'title': ['1.5rem', { lineHeight: '1.35' }],
      },
      boxShadow: {
        'glow': '0 0 40px -10px rgba(224,69,197,0.35)',
        'glow-sm': '0 0 20px -5px rgba(224,69,197,0.25)',
        'card': '0 4px 24px -4px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
        'card-hover': '0 8px 32px -8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
        'inner-light': 'inset 0 1px 0 0 rgba(255,255,255,0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-accent': 'linear-gradient(135deg, #e045c5 0%, #c026d3 50%, #a82d92 100%)',
        'gradient-accent-subtle': 'linear-gradient(135deg, rgba(224,69,197,0.15) 0%, rgba(168,45,146,0.08) 100%)',
        'mesh': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(224,69,197,0.15), transparent), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(224,69,197,0.06), transparent)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      transitionDuration: { 400: '400ms' },
    },
  },
  plugins: [],
};
