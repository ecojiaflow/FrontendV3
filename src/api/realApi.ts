import { Product } from '../types';

// ✅ URL API avec fallback vers données locales en cas d'erreur CORS
const API_BASE = import.meta.env.VITE_API_URL || 'https://ecolojiabackendv3.onrender.com';

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
}

function adaptBackendToFrontend(backendProduct: BackendProduct): Product {
  if (!backendProduct.id) {
    console.error('❌ Produit sans ID:', backendProduct);
    return null;
  }

  const ecoScore = parseFloat(backendProduct.eco_score) || 0;
  const aiConfidence = parseFloat(backendProduct.ai_confidence) || 0;

  return {
    id: backendProduct.id,
    nameKey: backendProduct.title || 'Produit sans nom',
    brandKey: backendProduct.brand || 'Marque écoresponsable',
    descriptionKey: backendProduct.description || backendProduct.resume_fr || 'Description non disponible',
    ethicalScore: Math.min(5, Math.max(0, ecoScore * 5)),
    category: backendProduct.category || 'alimentaire',
    price: 15.99,
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

// ✅ Données mock en cas d'échec API
const getMockProducts = async (): Promise<Product[]> => {
  const mockProducts = [
    {
      id: "mock-1",
      nameKey: "Savon Bio Artisanal",
      brandKey: "EcoBio",
      descriptionKey: "Savon artisanal au karité bio, fabriqué en France",
      ethicalScore: 4.2,
      category: "cosmétique",
      price: 12.99,
      currency: "EUR",
      image: "https://via.assets.so/img.jpg?w=300&h=200&tc=gray&bg=%23f3f4f6&t=Savon%20Bio",
      tagsKeys: ["bio", "artisanal", "france"],
      verified: true,
      affiliateLink: "",
      certificationsKeys: ["AB", "Cosmos"],
      aiConfidence: 0.85,
      zonesDisponibles: ["FR", "EU"],
      slug: "savon-bio-artisanal",
      resumeFr: "Savon naturel et respectueux de l'environnement",
      confidencePct: 85,
      confidenceColor: "green",
      verifiedStatus: "verified"
    },
    {
      id: "mock-2", 
      nameKey: "Flocons d'Avoine Bio",
      brandKey: "Nature's Best",
      descriptionKey: "Flocons d'avoine certifiés biologiques, source de fibres",
      ethicalScore: 3.8,
      category: "alimentaire",
      price: 4.50,
      currency: "EUR", 
      image: "https://via.assets.so/img.jpg?w=300&h=200&tc=gray&bg=%23f3f4f6&t=Avoine%20Bio",
      tagsKeys: ["bio", "céréales", "petit-déjeuner"],
      verified: true,
      affiliateLink: "",
      certificationsKeys: ["AB"],
      aiConfidence: 0.92,
      zonesDisponibles: ["FR", "EU"],
      slug: "flocons-avoine-bio",
      resumeFr: "Céréales complètes pour un petit-déjeuner équilibré",
      confidencePct: 92,
      confidenceColor: "green", 
      verifiedStatus: "verified"
    },
    {
      id: "mock-3",
      nameKey: "Dentifrice Naturel",
      brandKey: "Green Smile",
      descriptionKey: "Dentifrice aux extraits de menthe et d'aloe vera",
      ethicalScore: 4.5,
      category: "hygiène",
      price: 8.90,
      currency: "EUR",
      image: "https://via.assets.so/img.jpg?w=300&h=200&tc=gray&bg=%23f3f4f6&t=Dentifrice%20Bio",
      tagsKeys: ["bio", "naturel", "sans-fluor"],
      verified: true,
      affiliateLink: "",
      certificationsKeys: ["Ecocert"],
      aiConfidence: 0.88,
      zonesDisponibles: ["FR", "EU"],
      slug: "dentifrice-naturel",
      resumeFr: "Hygiène dentaire respectueuse et efficace",
      confidencePct: 88,
      confidenceColor: "green",
      verifiedStatus: "verified"
    }
  ];
  
  console.log('✅ Données mock chargées:', mockProducts.length);
  return mockProducts;
};

export async function fetchRealProducts(searchQuery: string = ''): Promise<Product[]> {
  try {
    const url = searchQuery 
      ? `${API_BASE}/api/products/search?q=${encodeURIComponent(searchQuery)}`
      : `${API_BASE}/api/products`;
    
    console.log('🔍 Requête API:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors'
    });
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📊 Données reçues:', data);
    
    const backendProducts: BackendProduct[] = Array.isArray(data) ? data : [];
    console.log('📦 Produits trouvés:', backendProducts.length);
    
    const adaptedProducts = backendProducts
      .map(product => adaptBackendToFrontend(product))
      .filter(Boolean) as Product[];
    
    console.log('✅ Produits adaptés:', adaptedProducts.length);
    return adaptedProducts;
    
  } catch (error) {
    console.error('❌ Erreur API (utilisation données mock):', error);
    return await getMockProducts();
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (!slug || slug === 'undefined') {
    console.error('❌ Slug invalide:', slug);
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}/api/products/${slug}`, {
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    const data = await response.json();
    return adaptBackendToFrontend(data);
    
  } catch (error) {
    console.error('❌ Erreur récupération produit (utilisation mock):', error);
    
    // Retourner un produit mock basé sur le slug
    const mockProducts = await getMockProducts();
    return mockProducts.find(p => p.slug === slug) || mockProducts[0] || null;
  }
}

export async function fetchSuggestions(query: string): Promise<string[]> {
  const fallbackSuggestions = [
    'shampoing bio',
    'vêtements éthiques', 
    'cosmétiques naturels',
    'alimentation bio',
    'produits zéro déchet'
  ];
  
  return fallbackSuggestions.filter(suggestion => 
    suggestion.toLowerCase().includes(query.toLowerCase())
  );
}

export async function testApiConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`, { mode: 'cors' });
    return response.ok;
  } catch (error) {
    return false;
  }
}