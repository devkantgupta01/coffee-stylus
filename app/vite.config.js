import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env
  },
  server: {
    port: 3000,
    open: true // Automatically opens the app in browser
  },
  optimizeDeps: {
    include: ['@project-serum/anchor', '@solana/web3.js']
  }
})
