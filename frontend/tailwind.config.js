/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'void-black': '#050505',
        'neon-cyan': '#00f3ff',
        'matrix-green': '#00ff41',
        'acid-yellow': '#f0ff00',
        'glitch-red': '#ff003c',
        'titanium-grey': '#8a8a8a', // Brightened from #3d3d3d for better visibility
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
        heading: ['"Orbitron"', 'sans-serif'],
      },
      animation: {
        'glitch': 'glitch 1s linear infinite',
      },
      keyframes: {
        glitch: {
          '2%, 64%': { transform: 'translate(2px,0) skew(0deg)' },
          '4%, 60%': { transform: 'translate(-2px,0) skew(0deg)' },
          '62%': { transform: 'translate(0,0) skew(5deg)' },
        }
      }
    },
  },
  plugins: [],
}
