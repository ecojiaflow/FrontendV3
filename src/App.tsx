import express from 'express';
import cors from 'cors';

import adminRoutes from './routes/admin.routes'; // ✅ ajout ici
import scanRoutes from './routes/scan.routes';
import cosmeticRoutes from './routes/cosmetic.routes';
import detergentRoutes from './routes/detergent.routes';
// ...

const app = express();

app.use(cors());
app.use(express.json());

// 🔌 Brancher routes
app.use('/api/admin', adminRoutes);           // ✅ admin maintenant fonctionnel
app.use('/api/scan', scanRoutes);
app.use('/api/cosmetic', cosmeticRoutes);
app.use('/api/detergent', detergentRoutes);
// ...

// 🛑 Gestion des erreurs
app.use(errorHandler);

export default app;
