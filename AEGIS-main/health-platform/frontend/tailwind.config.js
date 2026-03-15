
export default {
  content: [
    "./index.html",
    "./src*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aegis: {
          bg: '#020818',
          panel: '#0a1628',
          border: '#1e3a5f',
          accent: '#00d4ff',
          textHover: '#bdebf4',
          alert: {
            green: '#00ff88',
            yellow: '#ffaa00',
            orange: '#ff6600',
            red: '#ff2200',
          }
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'hud-cyan': '0 0 10px rgba(0, 212, 255, 0.4), inset 0 0 10px rgba(0, 212, 255, 0.1)',
        'hud-cyan-strong': '0 0 15px rgba(0, 212, 255, 0.6), inset 0 0 15px rgba(0, 212, 255, 0.2)',
        'hud-red': '0 0 10px rgba(255, 34, 0, 0.4), inset 0 0 10px rgba(255, 34, 0, 0.1)',
      },
      animation: {
        'ticker': 'ticker 45s linear infinite',
        'radar-sweep': 'radar-sweep 4s linear infinite',
        'hud-pulse': 'hud-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'hud-pulse': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.8', filter: 'brightness(1.5)' },
        }
      }
    },
  },
  plugins: [],
}
