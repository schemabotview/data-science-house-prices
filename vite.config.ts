import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The render engine and the app shell are the @graphlearning/graphl-flow and @graphlearning/shell
// packages. `dedupe` keeps one copy of react / react-dom across this app and both packages (two
// copies meeting is the invalid-hook-call gotcha).
//
// `base` is `/<repo-slug>/` for the production BUILD only: the app deploys under
// graphl.in/data-science-house-prices/. Dev stays at `/` for `npm run dev` and the recorders.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/data-science-house-prices/' : '/',
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: { port: 5173 },
}))
