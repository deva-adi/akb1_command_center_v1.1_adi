export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bloomberg-bg': '#0d0d0d',
        'bloomberg-card': '#1a1a1a',
        'bloomberg-border': '#2a2a2a',
        'akb-green': '#00c853',
        'akb-amber': '#ff9100',
        'akb-red': '#ff1744',
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", 'monospace'],
      },
    },
  },
  plugins: [],
}
