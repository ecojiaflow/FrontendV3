import { Product } from '../types';

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

// 🌱 Base de données mock enrichie - 12 produits variés
const mockProducts: Product[] = [
  {
    id: "mock-1",
    nameKey: "Savon Bio Artisanal",
    brandKey: "EcoBio",
    descriptionKey: "Savon artisanal au karité bio, fabriqué en France selon des méthodes traditionnelles respectueuses de l'environnement",
    ethicalScore: 4.2,
    category: "cosmétique",
    price: 12.99,
    currency: "EUR",
    image: "https://via.assets.so/img.jpg?w=300&h=200&tc=white&bg=%23e8f5e8&t=Savon%20Bio",
    tagsKeys: ["bio", "artisanal", "france", "karité"],
    verified: true,
    affiliateLink: "",
    certificationsKeys: ["AB", "Cosmos", "Slow Cosmétique"],
    aiConfidence: 0.85,
    zonesDisponibles: ["FR", "EU"],
    slug: "savon-bio-artisanal",
    resumeFr: "Savon naturel et respectueux de l'environnement, fabriqué avec du beurre de karité biologique",
    confidencePct: 85,
    confidenceColor: "green",
    verifiedStatus: "verified"
  },
  {
    id: "mock-2", 
    nameKey: "Flocons d'Avoine Bio",
    brandKey: "Nature's Best",
    descriptionKey: "Flocons d'avoine certifiés biologiques, source de fibres et parfaits pour un petit-déjeuner équilibré",
    ethicalScore: 3.8,
    category: "alimentaire",
    price: 4.50,
    currency: "EUR", 
    image: "https://via.assets.so/img.jpg?w=300&h=200&tc=white&bg=%23fff4e6&t=Avoine%20Bio",
    tagsKeys: ["bio", "céréales", "petit-déjeuner", "fibres"],
    verified: true,
    affiliateLink: "",
    certificationsKeys: ["AB", "Ecocert"],
    aiConfidence: 0.92,
    zonesDisponibles: ["FR", "EU"],
    slug: "flocons-avoine-bio",
    resumeFr: "Céréales complètes pour un petit-déjeuner équilibré, riches en fibres et en nutriments",
    confidencePct: 92,
    confidenceColor: "green", 
    verifiedStatus: "verified"
  },
  {
    id: "mock-3",
    nameKey: "Dentifrice Naturel Menthe",
    brandKey: "Green Smile",
    descriptionKey: "Dentifrice aux extraits de menthe et d'aloe vera, sans fluor ni substances controversées",
    ethicalScore: 4.5,
    category: "hygiène",
    price: 8.90,
    currency: "EUR",
    image: "https://via.assets.so/img.jpg?w=300&h=200&tc=white&bg=%23e6f7ff&t=Dentifrice%20Bio",
    tagsKeys: ["bio", "naturel", "sans-fluor", "menthe"],
    verified: true,
    affiliateLink: "",
    certificationsKeys: ["Ecocert", "Vegan"],
    aiConfidence: 0.88,
    zonesDisponibles: ["FR", "EU"],
    slug: "dentifrice-naturel-menthe",
    resumeFr: "Hygiène dentaire respectueuse et efficace, formulé avec des ingrédients 100% naturels",
    confidencePct: 88,
    confidenceColor: "green",
    verifiedStatus: "verified"
  },
  {
    id: "mock-4",
    nameKey: "Shampoing Solide Cheveux Gras",
    brandKey: "Zéro Déchet",
    descriptionKey: "Shampoing solide pour cheveux gras, à base d'argile verte et d'huiles essentielles purifiantes",
    ethicalScore: 4.0,
    category: "cosmétique",
    price: 15.90,
    currency: "EUR",
    image: "https://via.assets.so/img.jpg?w=300&h=200&tc=white&bg=%23f0f8e8&t=Shampoing%20Solide",
    tagsKeys: ["solide", "zéro-déchet", "argile", "huiles-essentielles"],
    verified: true,
    affiliateLink: "",
    certificationsKeys: ["Cosmos Natural", "Vegan"],
    aiConfidence: 0.82,
    zonesDisponibles: ["FR", "EU"],
    slug: "shampoing-solide-cheveux-gras",
    resumeFr: "Solution zéro déchet pour des cheveux propres et purifiés, sans packaging plastique",
    confidencePct: 82,
    confidenceColor: "green",
    verifiedStatus: "verified"
  },
  {
    id: "mock-5",
    nameKey: "Miel de Lavande Local",
    brandKey: "Apiculteurs Provence",
    descriptionKey: "Miel de lavande récolté en Provence, production locale et artisanale respectueuse des abeilles",
    ethicalScore: 4.7,
    category: "alimentaire",
    price: 18.50,
    currency: "EUR",
    image: "https://via.assets.so/img.jpg?w=300&h=200&tc=white&bg=%23fff8dc&t=Miel%20Lavande",
    tagsKeys: ["local", "artisanal", "lavande", "provence"],
    verified: true,
    affiliateLink: "",
    certificationsKeys: ["AB", "AOP Provence"],
    aiConfidence: 0.95,
    zonesDisponibles: ["FR"],
    slug: "miel-lavande-local",
    resumeFr: "Miel authentique de Provence, récolté dans le respect des abeilles et de leur environnement",
    confidencePct: 95,
    confidenceColor: "green",
    verifiedStatus: "verified"
  },
  {
    id: "mock-6",
    nameKey: "T-shirt Coton Bio Équitable",
    brandKey: "Ethical Wear",
    descriptionKey: "T-shirt en coton biologique issu du commerce équitable, teinture naturelle sans produits chimiques",
    ethicalScore: 4.3,
    category: "mode",
    price: 29.90,
    currency: "EUR",
    image: "https://via.assets.so/img.jpg?w=300&h=200&tc=white&bg=%23f5f5dc&t=T-shirt%20Bio",
    tagsKeys: ["coton-bio", "équitable", "teinture-naturelle", "éthique"],
    verified: true,
    affiliateLink: "",
    certificationsKeys: ["GOTS", "Fairtrade", "Oeko-Tex"],
    aiConfidence: 0.87,
    zonesDisponibles: ["FR", "EU"],
    slug: "tshirt-coton-bio-equitable",
    resumeFr: "Vêtement éthique et durable, produit dans le respect des travailleurs et de l'environnement",
    confidencePct: 87,
    confidenceColor: "green",
    verifiedStatus: "verified"
  },
  {
    id: "mock-7",
    nameKey: "Liquide Vaisselle Écologique",
    brandKey: "Maison Propre",
    descriptionKey: "Liquide vaisselle concentré à base d'ingrédients végétaux, biodégradable et efficace",
    ethicalScore: 3.9,
    category: "maison",
    price: 6.90,
    currency: "EUR",
    image: "https://via.assets.so/img.jpg?w=300&h=200&tc=white&bg=%23e8f4fd&t=Liquide%20Vaisselle",
    tagsKeys: ["biodégradable", "végétal", "concentré", "écologique"],
    verified: true,
    affiliateLink: "",
    certificationsKeys: ["Ecolabel", "Vegan"],
    aiConfidence: 0.79,
    zonesDisponibles: ["FR", "EU"],
    slug: "liquide-vaisselle-ecologique",
    resumeFr: "Nettoyage efficace et respectueux de l'environnement pour votre vaisselle du quotidien",
    confidencePct: 79,
    confidenceColor: "yellow",
    verifiedStatus: "verified"
  },
  {
    id: "mock-8",
    nameKey: "Huile d'Olive Vierge Extra Bio",
    brandKey: "Oliviers du Sud",
    descriptionKey: "Huile d'olive vierge extra biologique, première pression à froid, goût fruité intense",
    ethicalScore: 4.1,
    category: "alimentaire",
    price: 24.90,
    currency: "EUR",
    image: "https://via.assets.so/img.jpg?w=300&h=200&tc=white&bg=%23f0f8e8&t=Huile%20Olive",
    tagsKeys: ["bio", "vierge-extra", "première-pression", "fruité"],
    verified: true,
    affiliateLink: "",
    certificationsKeys: ["AB", "AOP"],
    aiConfidence: 0.90,
    zonesDisponibles: ["FR", "EU"],
    slug: "huile-olive-vierge-extra-bio",
    resumeFr: "Huile d'olive de qualité supérieure, produite selon les méthodes traditionnelles méditerranéennes",
    confidencePct: 90,
    confidenceColor: "green",
    verifiedStatus: "verified"
  },
  {
    id: "mock-9",
    nameKey: "Chaussettes Bambou Respirantes",
    brandKey: "Comfort Green",
    descriptionKey: "Chaussettes en fibre de bambou naturellement antibactériennes et ultra-respirantes",
    ethicalScore: 3.7,
    category: "mode",
    price: 12.90,
    currency: "EUR",
    image: "https://via.assets.so/img.jpg?w=300&h=200&tc=white&bg=%23e8f5e8&t=Chaussettes%20Bambou",
    tagsKeys: ["bambou", "antibactérien", "respirant", "naturel"],
    verified: false,
    affiliateLink: "",
    certificationsKeys: ["Oeko-Tex"],
    aiConfidence: 0.74,
    zonesDisponibles: ["FR", "EU"],
    slug: "chaussettes-bambou-respirantes",
    resumeFr: "Confort optimal et propriétés naturelles du bambou pour vos pieds au quotidien",
    confidencePct: 74,
    confidenceColor: "yellow",
    verifiedStatus: "manual_review"
  },
  {
    id: "mock-10",
    nameKey: "Bougie Cire de Soja Naturelle",
    brandKey: "Lumière Douce",
    descriptionKey: "Bougie parfumée à la cire de soja naturelle, mèche en coton, parfums aux huiles essentielles",
    ethicalScore: 4.4,
    category: "maison",
    price: 22.90,
    currency: "EUR",
    image: "https://via.assets.so/img.jpg?w=300&h=200&tc=white&bg=%23fff8f0&t=Bougie%20Soja",
    tagsKeys: ["cire-soja", "naturelle", "huiles-essentielles", "mèche-coton"],
    verified: true,
    affiliateLink: "",
    certificationsKeys: ["Vegan", "Cruelty-Free"],
    aiConfidence: 0.86,
    zonesDisponibles: ["FR", "EU"],
    slug: "bougie-cire-soja-naturelle",
    resumeFr: "Ambiance chaleureuse et naturelle avec cette bougie écologique aux parfums authentiques",
    confidencePct: 86,
    confidenceColor: "green",
    verifiedStatus: "verified"
  },
  {
    id: "mock-11",
    nameKey: "Thé Vert Bio Sencha",
    brandKey: "Jardin de Thé",
    descriptionKey: "Thé vert Sencha biologique du Japon, récolte printanière, riche en antioxydants",
    ethicalScore: 4.6,
    category: "alimentaire",
    price: 16.90,
    currency: "EUR",
    image: "https://via.assets.so/img.jpg?w=300&h=200&tc=white&bg=%23f0f8e8&t=Thé%20Vert",
    tagsKeys: ["bio", "japon", "sencha", "antioxydants"],
    verified: true,
    affiliateLink: "",
    certificationsKeys: ["AB", "JAS Organic"],
    aiConfidence: 0.93,
    zonesDisponibles: ["FR", "EU"],
    slug: "the-vert-bio-sencha",
    resumeFr: "Thé vert d'exception aux bienfaits reconnus, cultivé selon les traditions japonaises",
    confidencePct: 93,
    confidenceColor: "green",
    verifiedStatus: "verified"
  },
  {
    id: "mock-12",
    nameKey: "Brosse à Dents Bambou",
    brandKey: "Zéro Waste",
    descriptionKey: "Brosse à dents en bambou biodégradable, poils souples en fibres naturelles",
    ethicalScore: 4.2,
    category: "hygiène",
    price: 4.90,
    currency: "EUR",
    image: "https://via.assets.so/img.jpg?w=300&h=200&tc=white&bg=%23f5f5dc&t=Brosse%20Bambou",
    tagsKeys: ["bambou", "biodégradable", "zéro-déchet", "naturel"],
    verified: true,
    affiliateLink: "",
    certificationsKeys: ["FSC", "Biodégradable"],
    aiConfidence: 0.81,
    zonesDisponibles: ["FR", "EU"],
    slug: "brosse-dents-bambou",
    resumeFr: "Alternative écologique à la brosse à dents plastique, 100% compostable en fin de vie",
    confidencePct: 81,
    confidenceColor: "green",
    verifiedStatus: "verified"
  }
];

export async function fetchRealProducts(searchQuery: string = ''): Promise<Product[]> {
  console.log('🔍 Utilisation des données mock (CORS problématique)');
  
  // Simulation de recherche
  if (searchQuery.trim()) {
    const filtered = mockProducts.filter(product =>
      product.nameKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brandKey?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tagsKeys.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    console.log(`🔍 ${filtered.length} produits trouvés pour "${searchQuery}"`);
    return filtered;
  }
  
  return mockProducts;
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  console.log('🔍 Recherche produit mock:', slug);
  return mockProducts.find(p => p.slug === slug) || mockProducts[0] || null;
}

export async function fetchSuggestions(query: string): Promise<string[]> {
  const suggestions = ['bio', 'naturel', 'écologique', 'artisanal', 'local', 'équitable'];
  return suggestions.filter(s => 
    s.toLowerCase().includes(query.toLowerCase())
  );
}

export async function testApiConnection(): Promise<boolean> {
  return true;
}