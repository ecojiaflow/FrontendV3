import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // ❗️ Pas .tsx ici

import './i18n'; // ✅ Assure-toi que ce fichier existe
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
