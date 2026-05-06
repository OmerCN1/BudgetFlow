import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/utils/**'],
      exclude: ['src/utils/categorySuggestions.js', 'src/utils/__tests__/**'],
      thresholds: { lines: 50, functions: 45 },
    },
  },
})
