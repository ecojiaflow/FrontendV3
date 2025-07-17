// PATH: frontend/ecolojiaFrontV3/src/api/realApi.ts
import { Product } from '../types';

export async function fetchRealProducts(category: string): Promise<Product[]> {
  console.warn(`⚠️ fetchRealProducts: appel mock pour catégorie "${category}"`);
  return [
    {
      id: '1',
      title: `Produit démo - ${category}`,
      slug: 'demo-product-1',
      category,
      brand: 'Ecolojia Brand',
      created_at: new Date().toISOString(),
      eco_score: 80,
      ai_confidence: 95,
      confidence_color: 'green',
      verified_status: 'verified',
      image_url: 'https://via.placeholder.com/80'
    }
  ];
}
// EOF
