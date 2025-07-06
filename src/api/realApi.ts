import { Product } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'https://ecolojia-backend-working.onrender.com';

interface BackendProduct {
  id: string;
  title: string;
  slug: string;
  category: string;
  eco_score: string;
  ai_confidence: string;
  confidence_pct: number;
  confidence_color: string;
  verified_status: string;
  tags: string[];
  zones_dispo: string[];
  description?: string;
  brand?: string;
  image_url?: string;
  affiliate_links?: any[];
  resume_fr?: string;
  prices?: any;
}

function adaptBackendToFrontend(backendProduct: BackendProduct): Product {
  if (!backendProduct.id) {
    console.error('❌ Produit sans ID:', backendProduct);
    return null;
  }

  const ecoScore = parseFloat(backendProduct.eco_score) || 0;
  const aiConfidence = parseFloat(backendProduct.ai_confidence) || 0;

  // Extraction du prix depuis l'objet prices
  let price = 15.99; // Prix par défaut
  if (backendProduct.prices && typeof backendProduct.prices === 'object') {
    price = backendProduct.prices.default || backendProduct.prices.EUR || backendProduct.prices.price || 15.99;
  }

  return {
    id: backendProduct.id,
    nameKey: backendProduct.title || 'Produit sans nom',
    brandKey: backendProduct.brand || 'Marque écoresponsable',
    descriptionKey: backendProduct.description || backendProduct.resume_fr || 'Description non disponible',
    ethicalScore: Math.min(5, Math.max(0, ecoScore)),
    category: backendProduct.category || 'alimentaire',
    price: price,
    currency: 'EUR',
    image: backendProduct.image_url || 'https://via.assets.so/img.jpg?w=300&h=200&tc=gray&bg=%23f3f4f6&t=Image%20non%20disponible',
    tagsKeys: backendProduct.tags || [],
    verified: backendProduct.verified_status === 'verified' || backendProduct.verified_status === 'ai_verified',
    affiliateLink: backendProduct.affiliate_links?.[0]?.url || '',
    certificationsKeys: [],
    aiConfidence: Math.min(1, Math.max(0, aiConfidence)),
    zonesDisponibles: backendProduct.zones_dispo || ['FR', 'EU'],
    slug: backendProduct.slug || backendProduct.id,
    resumeFr: backendProduct.resume_fr,
    confidencePct: backendProduct.confidence_pct,
    confidenceColor: backendProduct.confidence_color,
    verifiedStatus: backendProduct.verified_status
  };
}

// 🌟 FONCTION PRINCIPALE : Récupérer les vrais produits
export async function fetchRealProducts(searchQuery: string = ''): Promise<Product[]> {
  try {
    console.log('🔍 Appel API réelle vers:', API_BASE);
    
    // Construire l'URL selon le type de requête
    const url = searchQuery && searchQuery.trim() 
      ? `${API_BASE}/api/products/search?q=${encodeURIComponent(searchQuery.trim())}`
      : `${API_BASE}/api/products`;
    
    console.log('📡 URL appelée:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`❌ Erreur HTTP ${response.status}:`, response.statusText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📊 Données reçues:', data);

    // Adapter le format selon la réponse
    let products: BackendProduct[] = [];
    
    if (Array.isArray(data)) {
      products = data;
    } else if (data.products && Array.isArray(data.products)) {
      products = data.products;
    } else if (data.data && Array.isArray(data.data)) {
      products = data.data;
    }

    console.log(`✅ ${products.length} produits trouvés`);

    // Convertir et filtrer les produits valides
    const convertedProducts = products
      .map(adaptBackendToFrontend)
      .filter((product): product is Product => product !== null);

    console.log(`🎯 ${convertedProducts.length} produits convertis avec succès`);
    return convertedProducts;

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des produits:', error);
    
    // En cas d'erreur, retourner un tableau vide
    // PLUS DE MOCKS - le frontend affichera "Aucun produit trouvé"
    return [];
  }
}

// 🔍 Récupérer un produit par slug
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    console.log('🔍 Recherche produit par slug:', slug);
    
    const url = `${API_BASE}/api/products/${slug}`;
    console.log('📡 URL appelée:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 404) {
      console.warn('⚠️ Produit non trouvé pour le slug:', slug);
      return null;
    }

    if (!response.ok) {
      console.error(`❌ Erreur HTTP ${response.status}:`, response.statusText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📊 Produit reçu:', data);

    const convertedProduct = adaptBackendToFrontend(data);
    console.log('🎯 Produit converti:', convertedProduct);
    
    return convertedProduct;

  } catch (error) {
    console.error('❌ Erreur lors de la récupération du produit:', error);
    return null;
  }
}

// 💡 Récupérer les suggestions de recherche
export async function fetchSuggestions(query: string): Promise<string[]> {
  try {
    if (!query || query.length < 2) return [];
    
    // Utiliser l'API de recherche pour extraire des suggestions
    const url = `${API_BASE}/api/products/search?q=${encodeURIComponent(query)}&limit=5`;
    
    const response = await fetch(url);
    if (!response.ok) return [];
    
    const data = await response.json();
    const products = Array.isArray(data) ? data : (data.products || []);
    
    // Extraire des suggestions à partir des titres et tags
    const suggestions = new Set<string>();
    
    products.forEach((product: BackendProduct) => {
      if (product.title) {
        // Extraire des mots-clés du titre
        const words = product.title.toLowerCase().split(/\s+/).filter(word => 
          word.length > 3 && word.includes(query.toLowerCase())
        );
        words.forEach(word => suggestions.add(word));
      }
      
      // Ajouter des tags pertinents
      if (product.tags) {
        product.tags.forEach(tag => {
          if (tag.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(tag);
          }
        });
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
    
  } catch (error) {
    console.error('❌ Erreur suggestions:', error);
    return [];
  }
}

// 🧪 Tester la connexion API
export async function testApiConnection(): Promise<boolean> {
  try {
    console.log('🧪 Test de connexion API...');
    
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    const isConnected = response.ok;
    console.log(`${isConnected ? '✅' : '❌'} Connexion API:`, isConnected ? 'OK' : 'ÉCHEC');
    
    return isConnected;
    
  } catch (error) {
    console.error('❌ Erreur test connexion:', error);
    return false;
  }
}