import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          
          // Heavy library chunks
          'map-vendor': ['leaflet', 'react-leaflet'],
          'chart-vendor': ['recharts'],
          
          // App chunks
          'dashboard-pages': [
            './src/dashboards/AshaDashboard.jsx',
            './src/dashboards/CommunityDashboard.jsx', 
            './src/dashboards/OfficialDashboard.jsx'
          ],
          'auth-components': [
            './src/pages/AuthPage.jsx',
            './src/components/RequireAuth.jsx',
            './src/contexts/AuthContext.jsx'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB
    target: 'esnext',
    minify: 'esbuild' // Use esbuild instead of terser
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})
