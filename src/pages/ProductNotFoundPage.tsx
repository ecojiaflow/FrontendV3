import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PhotoCapture from "../components/PhotoCapture";
import { Sparkles, CheckCircle, AlertTriangle } from "lucide-react";

const ProductNotFoundPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const barcode = searchParams.get("barcode");

  const [photos, setPhotos] = useState({
    front: null as string | null,
    ingredients: null as string | null,
    nutrition: null as string | null,
  });

  const [step, setStep] = useState<"photos" | "analyzing" | "done">("photos");
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const requiredPhotos = ["front", "ingredients"];
  const hasAllRequired = requiredPhotos.every((key) => photos[key as keyof typeof photos]);

  const handleAnalyze = async () => {
    if (!barcode || !hasAllRequired) return;
    setStep("analyzing");
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/analyze-photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barcode,
          photos,
          source: "user_photo_analysis",
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Erreur analyse");

      setAnalysis(data);
      setStep("done");

      setTimeout(() => {
        if (data.productSlug) {
          navigate(`/product/${data.productSlug}`);
        } else {
          navigate("/");
        }
      }, 3000);
    } catch (err: any) {
      console.error("❌ Erreur OCR:", err);
      setError(err.message || "Erreur inconnue");
      setStep("photos");
    }
  };

  if (!barcode) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-10 w-10 text-orange-500 mb-4 mx-auto" />
        <h1 className="text-xl font-bold text-eco-text mb-2">Code-barres manquant</h1>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-eco-leaf text-white rounded-lg"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold text-eco-text text-center">
        Produit non trouvé
      </h1>
      <p className="text-center text-eco-text/70">
        Merci de nous aider à enrichir notre base. Prenez les photos suivantes :
      </p>

      {step === "photos" && (
        <div className="space-y-6">
          <PhotoCapture
            label="📦 Face avant"
            onCapture={(img) => setPhotos((p) => ({ ...p, front: img }))}
            defaultImage={photos.front || undefined}
          />
          <PhotoCapture
            label="🧾 Liste des ingrédients"
            onCapture={(img) => setPhotos((p) => ({ ...p, ingredients: img }))}
            defaultImage={photos.ingredients || undefined}
          />
          <PhotoCapture
            label="📊 Tableau nutritionnel (optionnel)"
            onCapture={(img) => setPhotos((p) => ({ ...p, nutrition: img }))}
            defaultImage={photos.nutrition || undefined}
          />

          <button
            disabled={!hasAllRequired}
            onClick={handleAnalyze}
            className="w-full py-3 bg-eco-leaf text-white font-semibold rounded-xl disabled:opacity-40"
          >
            🌿 Analyser avec l’IA
          </button>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              ❌ {error}
            </p>
          )}
        </div>
      )}

      {step === "analyzing" && (
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 text-eco-leaf animate-pulse mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-eco-text mb-2">
            Analyse en cours...
          </h2>
          <p className="text-eco-text/60">Veuillez patienter pendant que nous extrayons les informations.</p>
        </div>
      )}

      {step === "done" && analysis && (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-eco-text mb-2">
            Produit créé avec succès !
          </h2>
          <p className="text-eco-text/60 mb-4">
            Redirection en cours...
          </p>
          <div className="bg-eco-leaf/10 rounded-xl p-4 text-left max-w-md mx-auto">
            <p className="text-sm"><strong>Nom :</strong> {analysis.productName}</p>
            <p className="text-sm"><strong>Marque :</strong> {analysis.brand}</p>
            <p className="text-sm"><strong>Catégorie :</strong> {analysis.category}</p>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProductNotFoundPage;
