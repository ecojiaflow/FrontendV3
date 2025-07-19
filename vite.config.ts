// PATH: frontend/ecolojiaFrontV3/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // ✅ Optimisation des chunks pour réduire la taille
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
          'search-vendor': ['algoliasearch'],
          
          // App modules
          'pages': [
            './src/pages/HomePage',
            './src/pages/SearchPage', 
            './src/pages/DashboardPage',
            './src/pages/ProductPage'
          ],
          'components': [
            './src/components/analysis/QuickStatsWidget',
            './src/components/scanner/BarcodeScanner'
          ]
        }
      }
    },
    // Augmenter la limite pour éviter le warning
    chunkSizeWarningLimit: 1000,
    
    // Optimisations supplémentaires
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer les console.log en prod
        drop_debugger: true
      }
    }
  },
  
  // ✅ Optimisations développement
  server: {
    port: 3000,
    open: true
  },
  
  // ✅ Optimisations dépendances
  optimizeDeps: {
    include: [
      'react',
      'react-dom', 
      'react-router-dom',
      'algoliasearch',
      'lucide-react'
    ]
  }
})