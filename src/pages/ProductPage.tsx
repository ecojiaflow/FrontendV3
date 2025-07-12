// 📁 src/pages/ProductPage.tsx – version PREMIUM IA
// ➕ Améliorations :
// 1. Confirmation + cache + relance limitée (déjà)
// 2. 🔗 Couplage au quota backend (useQuota)
// 3. 🕒 Timestamp dernière analyse
// 4. 📊 Comparatif Avant/Après (score)

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductBySlug } from '../api/realApi';
import { useAnalysis } from '../hooks/useAnalysis';
import { useQuota } from '../hooks/useQuota';
import { ScientificScore } from '../components/analysis/ScientificScore';
import { NovaAlert } from '../components/analysis/NovaAlert';
import { AlternativesSuggestions } from '../components/analysis/AlternativesSuggestions';
import { AIChat } from '../components/chat/AIChat';

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
      setConfirmMessage('⚠️ Quota d’analyses quotidien épuisé');
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

  /* ---- Rendu ---- */
  if (loading) return <div className="p-6 text-center">Chargement…</div>;
  if (error || !product) return <div className="text-center text-red-600">Erreur : {error}</div>;

  const quotaRemaining = quotaData?.remaining_analyses ?? 0;
  const disableReanalyse = isAnalyzing || analysisCount >= MAX_LOCAL_REANALYSES || quotaRemaining <= 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* --- Tabs navigation (simplifié) --- */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex space-x-6 text-sm font-medium">
          {['overview','score','analysis'].map(tab => (
            <button key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={activeTab === tab ? 'text-eco-leaf' : 'text-gray-600'}>
              {tab === 'overview' ? 'Description' : tab === 'score' ? 'Scoring' : 'Analyse IA'}
            </button>
          ))}
        </nav>
      </div>

      {/* --- Tab content --- */}
      {activeTab === 'overview' && (
        <section>
          <h2 className="text-xl font-bold mb-2">Description</h2>
          <p className="text-gray-700 leading-relaxed">{product.descriptionKey}</p>
        </section>
      )}

      {activeTab === 'score' && (
        <section>
          <h2 className="text-xl font-bold mb-2">Score Éthique</h2>
          <p className="text-lg text-eco-leaf font-bold">{product.ethicalScore.toFixed(1)} / 5</p>
        </section>
      )}

      {activeTab === 'analysis' && (
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Analyse IA</h3>
            <button
              onClick={() => performAnalysis(product)}
              disabled={disableReanalyse}
              className={`text-sm px-3 py-1 rounded transition-colors ${disableReanalyse ? 'bg-gray-300 text-gray-500' : 'bg-eco-leaf text-white hover:bg-eco-leaf/90'}`}
            >
              🔁 Re-analyser ({quotaRemaining})
            </button>
          </div>

          {confirmMessage && <p className="text-green-600 text-sm">{confirmMessage}</p>}
          {isAnalyzing && <p className="text-sm text-gray-500">Analyse en cours...</p>}
          {analysisError && <p className="text-sm text-red-500">{analysisError}</p>}

          {analysisResult && (
            <>
              {prevAnalysisResult && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-sm text-yellow-900">
                  Score précédent : {prevAnalysisResult.analysis.score} /100 → Nouveau : {analysisResult.analysis.score} /100
                </div>
              )}

              <ScientificScore score={analysisResult.analysis.score} breakdown={analysisResult.analysis.breakdown} />
              <NovaAlert novaGroup={analysisResult.analysis.nova_group} />
              <AlternativesSuggestions alternatives={analysisResult.alternatives} />
              <AIChat context={analysisResult} />

              {lastAnalysisAt && (
                <p className="text-xs text-gray-500 mt-2">Dernière analyse : {lastAnalysisAt.toLocaleString()}</p>
              )}
            </>
          )}

          {analysisCount >= MAX_LOCAL_REANALYSES && (
            <p className="text-xs text-orange-500">⚠️ Limite locale de {MAX_LOCAL_REANALYSES} re-analyses atteinte.</p>
          )}
        </section>
      )}
    </div>
  );
};

export default ProductPage;
