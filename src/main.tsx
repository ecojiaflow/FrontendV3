// src/main.tsx - FIX IMMÉDIAT
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import './index.css';

// Import explicite pour éviter la dépendance circulaire
import * as AppModule from './App';
const App = AppModule.default || AppModule;

// Fallback si l'import échoue encore
if (!App) {
  throw new Error('App component not found - check for circular dependencies');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);