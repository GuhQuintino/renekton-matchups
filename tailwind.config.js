/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lol: {
          base: '#090A0C',
          surface1: '#0F1015',
          surface2: '#151821',
          surfaceHover: '#1B1F2C',
          borderSubtle: '#262B3D',
          borderActive: '#3A4259',
          goldPrimary: '#D4A017',
          goldBright: '#F3B72C',
          goldAmber: '#EAB308',
          textPrimary: '#F8FAFC',
          textSecondary: '#94A3B8',
          textMuted: '#64748B',
        },
        difficulty: {
          easy: {
            text: '#10B981',
            bg: '#062E22',
            border: '#059669',
          },
          medium: {
            text: '#F59E0B',
            bg: '#2E1E05',
            border: '#D97706',
          },
          hard: {
            text: '#FB923C',
            bg: '#381308',
            border: '#EA580C',
          },
          extreme: {
            text: '#EF4444',
            bg: '#2F0909',
            border: '#DC2626',
          },
        },
        game: {
          disconnected: '#64748B',
          lobby: '#38BDF8',
          champSelect: '#F59E0B',
          inGame: '#10B981',
          postGame: '#A78BFA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(212, 160, 23, 0.25)',
        'card-glow': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}
