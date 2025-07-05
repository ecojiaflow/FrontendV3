import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Configuration PWA
  publicDir: 'public',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    
    // S'assurer que les fichiers PWA sont copiés
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  
  // Configuration serveur dev
  server: {
    port: 5173,
    
    // Middleware pour servir les fichiers PWA correctement
    middlewareMode: false,
    
    // Headers pour PWA
    headers: {
      'Service-Worker-Allowed': '/'
    }
  },
  
  // Optimisation des dépendances
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})