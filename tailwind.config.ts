import type { Config } from 'tailwindcss'

/**
 * Brand tokens sampled directly from the official BrightLink logo:
 *   navy   – "BrightLink" wordmark
 *   green  – "Technologies" wordmark
 *   orange / yellow / teal / blue – the interlocking link mark
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#00327f',
          'navy-deep': '#001a45',
          blue: '#0057a3',
          teal: '#009b9c',
          green: '#047845',
          orange: '#ff8e00',
          yellow: '#ffc000',
        },
      },
      fontSize: {
        // Fluid hero heading: ~34px on phones up to 76px on large screens
        // Section headings: ~30px on phones up to 48px on desktop
        section: ['clamp(1.9rem, 2.4vw + 1.1rem, 3rem)', { lineHeight: '1.12', letterSpacing: '-0.015em' }],
        // Inner-page banner heading: ~36px on phones up to 60px on desktop
        page: ['clamp(2.2rem, 3.6vw + 1rem, 3.75rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        hero: ['clamp(2.15rem, 5vw + 0.6rem, 4.75rem)', { lineHeight: '1.06', letterSpacing: '-0.02em' }],
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'brand-warm': 'linear-gradient(135deg, #ff8e00 0%, #ffc000 100%)',
        'brand-cool': 'linear-gradient(135deg, #009b9c 0%, #0057a3 100%)',
        'brand-link': 'linear-gradient(90deg, #ff8e00 0%, #ffc000 30%, #009b9c 65%, #0057a3 100%)',
      },
      keyframes: {
        heroProgress: { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
        heroReveal: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        kenBurns: { from: { transform: 'scale(1)' }, to: { transform: 'scale(1.12)' } },
        float: {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-24px,0)' },
        },
      },
      animation: {
        'hero-progress': 'heroProgress linear forwards',
        float: 'float 9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
