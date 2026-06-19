/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      /* ── Colors ─────────────────────────────────────────────────── */
      colors: {
        /* Brand greens — ration lime-spark, never use as bg fill */
        'lime-spark':   '#96ff1a',
        'spring-wash':  '#d6ffa6',
        'forest-ink':   '#083300',
        'mint-mist':    '#e6ffc8',

        /* Warm near-black neutrals */
        'carbon':    '#0c0a09',
        'charcoal':  '#323232',
        'graphite':  '#292a2e',
        'onyx':      '#121212',
        'slate-mid': '#4d4d51',
        'smoke':     '#71737a',
        'ash':       '#444446',

        /* Light surfaces */
        'mist':   '#f2f1f0',
        'fog':    '#e6e6e7',
        'paper':  '#ffffff',
      },

      /* ── Typography ──────────────────────────────────────────────── */
      fontFamily: {
        display: [
          'Playfair Display',
          'Georgia',
          '"Times New Roman"',
          'serif',
        ],
        ui: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },

      fontSize: {
        'caption':    ['11px', { lineHeight: '1.5',  letterSpacing: '0.01em'  }],
        'body-veed':  ['16px', { lineHeight: '1.5',  letterSpacing: '-0.016px' }],
        'sub':        ['40px', { lineHeight: '1',    letterSpacing: '-0.025em' }],
        'heading':    ['44px', { lineHeight: '0.9',  letterSpacing: '-0.04em'  }],
        'display':    ['54px', { lineHeight: '0.88', letterSpacing: '-0.05em'  }],
      },

      /* ── Border Radius ───────────────────────────────────────────── */
      borderRadius: {
        'card':  '16px',
        'btn':   '10px',
        'input': '10px',
        'chip':  '4px',
        'pill':  '9999px',
      },

      /* ── Shadows — borders only, no elevation ────────────────────── */
      boxShadow: {
        'card':    '0 0 0 1px #e6e6e7',
        'card-hover': '0 0 0 1px #323232',
        'none':    'none',
      },

      /* ── Spacing ─────────────────────────────────────────────────── */
      spacing: {
        '18': '72px',
        '22': '88px',
        '26': '104px',
        '30': '120px',
        '34': '136px',
      },

      /* ── Max Width ───────────────────────────────────────────────── */
      maxWidth: {
        'page': '1200px',
        'prose-veed': '560px',
      },

      /* ── Animation ───────────────────────────────────────────────── */
      keyframes: {
        'lime-pulse': {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0' },
          '40%':            { transform: 'scale(1)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)'   },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
      },
      animation: {
        'lime-pulse': 'lime-pulse 1.4s ease-in-out infinite both',
        'fade-in':    'fade-in 0.3s ease forwards',
        'slide-up':   'slide-up 0.4s ease forwards',
      },

      /* ── Transition timing ───────────────────────────────────────── */
      transitionTimingFunction: {
        'veed': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },

    },
  },

  plugins: [],
}