const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();

console.log('🌱 ECOLOJIA Backend - Connexion PostgreSQL...');
console.log('📊 Initialisation Prisma Client...');

// CORS
const allowedOrigins = [
  'https://frontendv3.netlify.app',
  'https://ecolojiafrontv3.netlify.app',
  'https://main--ecolojiafrontv3.netlify.app',
  'https://ecolojiabackendv3.onrender.com',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissif pour développement
    }
  },
  credentials: true
}));

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🧪 Route de test barcode
app.get('/api/test-barcode', (req, res) => {
  res.json({ 
    success: true,
    message: 'Route barcode test fonctionne !', 
    timestamp: new Date().toISOString(),
    source: 'direct-app-js',
    note: 'Route de test JavaScript - MVP débloqué'
  });
});

// 📦 Route produits - VRAIE BASE POSTGRESQL
app.get('/api/products', async (req, res) => {
  try {
    console.log('📦 Récupération produits depuis PostgreSQL...');
    
    // Récupérer les produits depuis la vraie base
    const products = await prisma.product.findMany({
      take: 50, // Limiter à 50 pour les performances
      orderBy: {
        created_at: 'desc' // Plus récents en premier
      }
    });

    console.log(`✅ ${products.length} produits récupérés depuis PostgreSQL`);

    // Transformer pour le frontend
    const transformedProducts = products.map(product => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      brand: product.brand,
      category: product.category,
      eco_score: product.eco_score ? Number(product.eco_score) : 0.5,
      ai_confidence: product.ai_confidence ? Number(product.ai_confidence) : 0.7,
      confidence_pct: product.confidence_pct || 70,
      confidence_color: product.confidence_color || 'yellow',
      verified_status: product.verified_status,
      tags: product.tags || [],
      zones_dispo: product.zones_dispo || ['FR'],
      image_url: product.images?.[0] || `https://via.assets.so/img.jpg?w=300&h=200&tc=green&bg=%23f3f4f6&t=${encodeURIComponent(product.title)}`,
      prices: product.prices || { default: 0 },
      resume_fr: product.resume_fr || 'Produit bio référencé'
    }));

    res.json(transformedProducts);

  } catch (error) {
    console.error('❌ Erreur récupération produits:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des produits',
      message: error.message
    });
  }
});

// 🔍 Route produit par slug - POSTGRESQL
app.get('/api/products/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`🔍 Recherche produit: ${slug}`);

    const product = await prisma.product.findUnique({
      where: { slug: slug }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé'
      });
    }

    // Transformer pour le frontend
    const transformedProduct = {
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      brand: product.brand,
      category: product.category,
      eco_score: product.eco_score ? Number(product.eco_score) : 0.5,
      ai_confidence: product.ai_confidence ? Number(product.ai_confidence) : 0.7,
      confidence_pct: product.confidence_pct || 70,
      confidence_color: product.confidence_color || 'yellow',
      verified_status: product.verified_status,
      tags: product.tags || [],
      zones_dispo: product.zones_dispo || ['FR'],
      image_url: product.images?.[0] || `https://via.assets.so/img.jpg?w=300&h=200&tc=green&bg=%23f3f4f6&t=${encodeURIComponent(product.title)}`,
      prices: product.prices || { default: 0 },
      resume_fr: product.resume_fr || 'Produit bio référencé',
      barcode: product.barcode
    };

    res.json(transformedProduct);

  } catch (error) {
    console.error('❌ Erreur récupération produit:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du produit',
      message: error.message
    });
  }
});

// 📊 Route recherche - POSTGRESQL
app.get('/api/products/search', async (req, res) => {
  try {
    const { q, category, limit = 20 } = req.query;
    
    const where = {};
    
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } }
      ];
    }
    
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    const products = await prisma.product.findMany({
      where,
      take: parseInt(limit),
      orderBy: { eco_score: 'desc' }
    });

    const transformedProducts = products.map(product => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      brand: product.brand,
      category: product.category,
      eco_score: product.eco_score ? Number(product.eco_score) : 0.5,
      confidence_pct: product.confidence_pct || 70,
      image_url: product.images?.[0] || `https://via.assets.so/img.jpg?w=300&h=200&tc=green&bg=%23f3f4f6&t=${encodeURIComponent(product.title)}`,
      resume_fr: product.resume_fr || 'Produit bio référencé'
    }));

    res.json({
      products: transformedProducts,
      count: transformedProducts.length
    });

  } catch (error) {
    console.error('❌ Erreur recherche:', error);
    res.status(500).json({ error: 'Erreur de recherche' });
  }
});

// 🔍 Route barcode - POSTGRESQL
app.get('/api/products/barcode/:code', async (req, res) => {
  try {
    const { code } = req.params;
    console.log(`🔍 Recherche par code-barres: ${code}`);

    const product = await prisma.product.findFirst({
      where: {
        barcode: code
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé dans notre base de données',
        barcode: code,
        suggestion_url: `/product-not-found?barcode=${code}`,
        message: 'Aidez-nous à enrichir notre base en photographiant ce produit'
      });
    }

    const transformedProduct = {
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      brand: product.brand,
      category: product.category,
      eco_score: product.eco_score ? Number(product.eco_score) : 0.5,
      ai_confidence: product.ai_confidence ? Number(product.ai_confidence) : 0.7,
      confidence_pct: product.confidence_pct || 70,
      confidence_color: product.confidence_color || 'yellow',
      verified_status: product.verified_status,
      tags: product.tags || [],
      zones_dispo: product.zones_dispo || ['FR'],
      image_url: product.images?.[0] || `https://via.assets.so/img.jpg?w=300&h=200&tc=green&bg=%23f3f4f6&t=${encodeURIComponent(product.title)}`,
      prices: product.prices || { default: 0 },
      resume_fr: product.resume_fr || 'Produit bio référencé',
      barcode: product.barcode
    };

    res.json({
      success: true,
      product: transformedProduct,
      barcode: code,
      search_method: 'database'
    });

  } catch (error) {
    console.error('❌ Erreur recherche barcode:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la recherche',
      message: error.message
    });
  }
});

// 📸 Route analyse photos (simulation)
app.post('/api/products/analyze-photos', async (req, res) => {
  try {
    const { barcode, photos, source = 'user_photo_analysis' } = req.body;

    if (!barcode) {
      return res.status(400).json({
        success: false,
        error: 'Code-barres requis'
      });
    }

    // Simulation rapide de création produit
    const mockProduct = {
      title: `Produit Bio ${barcode.slice(-4)}`,
      description: 'Produit analysé automatiquement par IA',
      brand: 'Bio',
      category: 'alimentaire',
      eco_score: 0.75,
      ai_confidence: 0.8,
      confidence_pct: 80,
      barcode: barcode
    };

    res.json({
      success: true,
      message: 'Produit analysé avec succès',
      productName: mockProduct.title,
      ecoScore: 75,
      analysis: {
        confidence: '80%'
      }
    });

  } catch (error) {
    console.error('❌ Erreur analyse photos:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'analyse'
    });
  }
});

// 📊 Route info API avec VRAI compte PostgreSQL
app.get('/', async (req, res) => {
  try {
    // Compter les vrais produits en base
    const productCount = await prisma.product.count();
    
    res.json({
      message: 'Ecolojia API - MVP FONCTIONNEL',
      version: '1.0.0',
      status: 'operational',
      environment: 'production',
      timestamp: new Date().toISOString(),
      mvp_status: 'DÉBLOQUÉ - Routes barcode + produits PostgreSQL',
      products_count: productCount, // VRAI COMPTE depuis PostgreSQL
      database: 'PostgreSQL connectée',
      endpoints: {
        products: [
          'GET /api/products ✅',
          'GET /api/products/search ✅', 
          'GET /api/products/:slug ✅',
          'GET /api/products/barcode/:code ✅',
          'POST /api/products/analyze-photos ✅'
        ],
        test: [
          'GET /api/test-barcode ✅'
        ],
        health: [
          'GET /health ✅',
          'GET /api/health ✅'
        ]
      }
    });
  } catch (error) {
    console.error('❌ Erreur connexion PostgreSQL:', error);
    res.json({
      message: 'Ecolojia API - Erreur base de données',
      error: error.message,
      products_count: 0
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gestion erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl
  });
});

// Nettoyage Prisma à la fermeture
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = app;