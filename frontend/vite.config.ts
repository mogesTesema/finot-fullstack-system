// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import path from 'path'

// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, './src'),
//     },
//   },
//   server: {
//     port: 5173,
//     open: true,
//     proxy: {
//       '/auth': {
//         target: 'http://localhost:8000',
//         changeOrigin: true,
//         secure: false,
//       },
//       '/api': {
//         target: 'http://localhost:8000',
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },
// })
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5176,
    open: true,
    proxy: {
      '/auth': {
        target: 'https://finot.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/api': {
        target: 'https://finot.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})