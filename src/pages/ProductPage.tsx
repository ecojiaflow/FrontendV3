// 📁 src/pages/ProductPage.tsx – version PREMIUM IA ENHANCED
// ➕ Améliorations :
// 1. Confirmation + cache + relance limitée (déjà)
// 2. 🔗 Couplage au quota backend (useQuota)
// 3. 🕒 Timestamp dernière analyse
// 4. 📊 Comparatif Avant/Après (score)
// 5. 🤖 AIChat Enhanced avec données contextuelles

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductBySlug } from '../api/realApi';
import { useAnalysis } from '../hooks/useAnalysis';
import { useQuota } from '../hooks/useQuota';
import { ScientificScore } from '../components/analysis/ScientificScore';
import { NovaAlert } from '../components/analysis/NovaAlert';
import { AlternativesSuggestions } from '../components/analysis/AlternativesSuggestions';
import { AIChat } from '../components/analysis/AIChat'; // Nouveau chemin pour AIChat Enhanced

const MAX_LOCAL_REANALYSES = 3; // limite UX locale

const ProductPage: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  /* ---- Data produit ---- */
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---- Onglets UI ---- */
  const [activeTab, setActiveTab] = useState<'overview' | 'score' | 'analysis'>('overview');

  /* ---- Hooks IA & Quota ---- */
  const { analyze, isAnalyzing, error: analysisError } = useAnalysis();
  const { quotaData, refreshQuota } = useQuota();

  /* ---- Résultats IA & états UX ---- */
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [prevAnalysisResult, setPrevAnalysisResult] = useState<any | null>(null);
  const [analysisCount, setAnalysisCount] = useState<number>(0);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [lastAnalysisAt, setLastAnalysisAt] = useState<Date | null>(null);

  /* ---- Fonction d'analyse IA ---- */
  const performAnalysis = async (productData: any) => {
    // Limites : quota backend + limite locale
    if (analysisCount >= MAX_LOCAL_REANALYSES) return;
    if (quotaData && quotaData.remaining_analyses <= 0) {
      setConfirmMessage('⚠️ Quota d\'analyses quotidien épuisé');
      setTimeout(() => setConfirmMessage(''), 3000);
      return;
    }

    // Reset cache (on re-analyse volontairement)
    const cacheKey = `ecolojia_analysis_${productData.id}`;
    localStorage.removeItem(cacheKey);

    // Sauvegarde version précédente
    setPrevAnalysisResult(analysisResult);

    const result = await analyze({
      product_name: productData.nameKey,
      ingredients: productData.descriptionKey,
      description: productData.resumeFr,
      images: []
    });

    if (result) {
      setAnalysisResult(result);
      setLastAnalysisAt(new Date());
      localStorage.setItem(cacheKey, JSON.stringify({ result, ts: Date.now() }));
      setAnalysisCount((c) => c + 1);
      setConfirmMessage('✅ Analyse relancée avec succès');
      setTimeout(() => setConfirmMessage(''), 2500);
      // Mise à jour quota backend
      refreshQuota();
    }
  };

  /* ---- Handler pour requests d'analyse depuis AIChat ---- */
  const handleAnalysisRequest = async (type: string) => {
    if (!product) return;
    
    switch (type) {
      case 'reanalyze':
        await performAnalysis(product);
        break;
      case 'detailed_nutrition':
        // Trigger analyse nutritionnelle détaillée
        setActiveTab('score');
        break;
      case 'alternatives':
        // Focus sur les alternatives
        if (analysisResult?.alternatives) {
          const alternativesElement = document.querySelector('[data-alternatives]');
          alternativesElement?.scrollIntoView({ behavior: 'smooth' });
        }
        break;
      default:
        console.log('Type d\'analyse non géré:', type);
    }
  };

  /* ---- Chargement initial ---- */
  useEffect(() => {
    if (!slug) return;

    const fetchAndAnalyze = async () => {
      try {
        setLoading(true);
        const data = await fetchProductBySlug(slug);
        if (!data) throw new Error('Produit introuvable');
        setProduct(data);

        // Vérifie cache
        const cacheKey = `ecolojia_analysis_${data.id}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          setAnalysisResult(parsed.result);
          setLastAnalysisAt(new Date(parsed.ts));
        } else {
          await performAnalysis(data);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAndAnalyze();
  }, [slug]);

  /* ---- Préparation des données pour AIChat ---- */
  const getProductDataForChat = () => {
    if (!product || !analysisResult) return undefined;

    return {
      name: product.nameKey || 'Produit',
      category: product.category || 'Non spécifiée',
      scientificScore: analysisResult.analysis?.score,
      novaGroup: analysisResult.analysis?.nova_group,
      nutriScore: analysisResult.analysis?.breakdown?.nutrition?.details?.nutriScore?.grade,
      additives: analysisResult.analysis?.breakdown?.transformation?.details?.additives?.detected_additives || [],
      glycemicIndex: analysisResult.analysis?.breakdown?.glycemic?.details?.glycemic?.index,
      environmentalScore: analysisResult.analysis?.breakdown?.environmental?.score,
      // Données additionnelles pour l'IA
      ingredients: product.descriptionKey,
      description: product.resumeFr,
      ethicalScore: product.ethicalScore,
      analysisTimestamp: lastAnalysisAt,
      alternatives: analysisResult.alternatives
    };
  };

  /* ---- Rendu ---- */
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Erreur de chargement</h2>
          <p className="text-red-600">{error || 'Produit introuvable'}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retourner à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const quotaRemaining = quotaData?.remaining_analyses ?? 0;
  const disableReanalyse = isAnalyzing || analysisCount >= MAX_LOCAL_REANALYSES || quotaRemaining <= 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* --- Header produit --- */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.nameKey}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>📦 {product.category || 'Catégorie non spécifiée'}</span>
          <span>⭐ Score éthique: {product.ethicalScore?.toFixed(1) || 'N/A'}/5</span>
          {lastAnalysisAt && (
            <span>🔬 Analysé le {lastAnalysisAt.toLocaleDateString()}</span>
          )}
        </div>
      </div>

      {/* --- Messages de confirmation/erreur --- */}
      {confirmMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {confirmMessage}
        </div>
      )}
      {analysisError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          ❌ {analysisError}
        </div>
      )}

      {/* --- Tabs navigation --- */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { key: 'overview', label: '📝 Description', icon: '📝' },
            { key: 'score', label: '📊 Score Éthique', icon: '📊' },
            { key: 'analysis', label: '🔬 Analyse IA', icon: '🔬' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key 
                  ? 'border-emerald-500 text-emerald-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* --- Tab content --- */}
      {activeTab === 'overview' && (
        <section className="space-y-6">
          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">📝 Description du produit</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg">
                {product.descriptionKey || 'Aucune description disponible.'}
              </p>
              {product.resumeFr && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Résumé :</h3>
                  <p className="text-gray-600">{product.resumeFr}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'score' && (
        <section className="space-y-6">
          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">📊 Score Éthique</h2>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-600 mb-2">
                  {product.ethicalScore?.toFixed(1) || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">/ 5.0</div>
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${((product.ethicalScore || 0) / 5) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Score basé sur l'impact environnemental, social et éthique
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'analysis' && (
        <section className="space-y-6">
          {/* Header analyse avec bouton re-analyse */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">🔬 Analyse Scientifique IA</h2>
              <p className="text-sm text-gray-600">
                Analyse basée sur INSERM • ANSES • EFSA 2024
              </p>
            </div>
            <button
              onClick={() => performAnalysis(product)}
              disabled={disableReanalyse}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                disableReanalyse 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              🔄 Re-analyser
              <span className="text-xs">({quotaRemaining} restant{quotaRemaining > 1 ? 's' : ''})</span>
            </button>
          </div>

          {/* Indicateur de chargement */}
          {isAnalyzing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-blue-700">🤖 Analyse IA en cours... Veuillez patienter</span>
              </div>
            </div>
          )}

          {/* Comparaison avant/après */}
          {prevAnalysisResult && analysisResult && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-2">📈 Comparaison des analyses</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600">Score précédent :</span>
                <span className="font-bold text-gray-800">{prevAnalysisResult.analysis?.score || 'N/A'}/100</span>
                <span className="text-gray-500">→</span>
                <span className="text-gray-600">Nouveau score :</span>
                <span className="font-bold text-emerald-600">{analysisResult.analysis?.score || 'N/A'}/100</span>
                {analysisResult.analysis?.score && prevAnalysisResult.analysis?.score && (
                  <span className={`font-medium ${
                    analysisResult.analysis.score > prevAnalysisResult.analysis.score 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ({analysisResult.analysis.score > prevAnalysisResult.analysis.score ? '+' : ''}{
                      (analysisResult.analysis.score - prevAnalysisResult.analysis.score).toFixed(1)
                    })
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Résultats d'analyse */}
          {analysisResult ? (
            <div className="space-y-6">
              {/* Score scientifique */}
              <ScientificScore 
                score={analysisResult.analysis?.score || 0} 
                breakdown={analysisResult.analysis?.breakdown || {}}
                confidence={analysisResult.analysis?.confidence || 0.8}
              />

              {/* Alerte NOVA */}
              <NovaAlert 
                novaGroup={analysisResult.analysis?.nova_group}
                novaData={analysisResult.analysis?.nova_data}
                productName={product.nameKey}
              />

              {/* Suggestions d'alternatives */}
              <div data-alternatives>
                <AlternativesSuggestions alternatives={analysisResult.alternatives || []} />
              </div>

              {/* Chat IA Enhanced */}
              <AIChat 
                productData={getProductDataForChat()}
                onAnalysisRequest={handleAnalysisRequest}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">Aucune analyse disponible</h3>
              <p className="text-gray-500 mb-4">Lancez une analyse pour obtenir des insights détaillés</p>
              <button
                onClick={() => performAnalysis(product)}
                disabled={disableReanalyse}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                🚀 Lancer l'analyse IA
              </button>
            </div>
          )}

          {/* Informations limites */}
          {analysisCount >= MAX_LOCAL_REANALYSES && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-700 text-sm">
                ⚠️ Limite locale de {MAX_LOCAL_REANALYSES} re-analyses atteinte pour cette session.
              </p>
            </div>
          )}

          {quotaRemaining <= 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">
                🚫 Quota d'analyses quotidien épuisé. Revenez demain ou contactez le support.
              </p>
            </div>
          )}

          {/* Timestamp dernière analyse */}
          {lastAnalysisAt && (
            <div className="text-center text-xs text-gray-500 pt-4 border-t">
              Dernière analyse : {lastAnalysisAt.toLocaleString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default ProductPage;