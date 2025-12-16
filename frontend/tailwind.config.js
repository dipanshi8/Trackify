module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        dark: {
          bg: '#0a0e27', // Near-black / deep navy
          card: '#111827', // Slightly lighter for cards
          border: '#1f2937', // Subtle borders
          hover: '#1e293b', // Hover states
        },
        accent: {
          primary: '#6366f1', // Indigo
          secondary: '#8b5cf6', // Purple
          cyan: '#06b6d4', // Cyan
          gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
        },
        text: {
          primary: '#ffffff',
          secondary: '#e5e7eb', // Soft gray
          muted: '#9ca3af', // Muted gray
        },
        // Keep old colors for backward compatibility if needed
        brandRed: '#ef3b3b',
        brandDark: '#06283D',
        brandAqua: '#28E1A1'
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
        'gradient-soft': 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.3)',
      }
    }
  },
  plugins: []
};
