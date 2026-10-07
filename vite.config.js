import { defineConfig } from 'vite'

export default defineConfig({
  server: { port: 5199, host: '127.0.0.1' },
  optimizeDeps: { include: ['gsap', 'gsap/ScrollTrigger', 'gsap/SplitText', 'lenis'] },
  build: { target: 'es2020', assetsInlineLimit: 0 },
})
