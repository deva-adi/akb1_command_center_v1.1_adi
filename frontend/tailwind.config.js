export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bloomberg-bg': 'var(--bg-primary)',
        'bloomberg-card': 'var(--bg-secondary)',
        'bloomberg-border': 'var(--border-color)',
        'akb-green': 'var(--accent-green)',
        'akb-amber': 'var(--accent-amber)',
        'akb-red': 'var(--accent-red)',
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", 'monospace'],
      },
    },
  },
  plugins: [],
}
