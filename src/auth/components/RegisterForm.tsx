// 🔵 FRONTEND - frontend/src/auth/components/RegisterForm.tsx

import React, { useState, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { RegisterFormData } from '../types/AuthTypes';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  className?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
  className = ''
}) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { register, isLoading, error, clearError } = useAuth();

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Le nom est requis';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Le nom doit contenir au moins 2 caractères';
    }

    // Email validation
    if (!formData.email) {
      errors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Veuillez confirmer le mot de passe';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    // Terms validation
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
    
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name.trim()
      });
      
      onSuccess?.();
    } catch (error) {
      // Erreur déjà gérée par le contexte
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className={`register-form ${className}`}>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🌱</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Rejoindre ECOLOJIA
          </h2>
          <p className="text-gray-600">
            Créez votre compte gratuit en 2 minutes
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <span className="text-red-500 mr-2">⚠️</span>
              <div>
                <p className="text-red-800 font-medium">Erreur lors de l'inscription</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors ${
                validationErrors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Votre nom complet"
            />
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors ${
                validationErrors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="votre@email.com"
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors ${
                  validationErrors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Mot de passe sécurisé"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
            )}
            <div className="mt-2 text-xs text-gray-500">
              Au moins 8 caractères avec minuscule, majuscule et chiffre
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors ${
                  validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Confirmez votre mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div>
            <label className="flex items-start">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 mt-0.5 ${
                  validationErrors.acceptTerms ? 'border-red-300' : ''
                }`}
              />
              <span className="ml-2 text-sm text-gray-600">
                J'accepte les{' '}
                <a href="/terms" target="_blank" className="text-green-600 hover:text-green-700 underline">
                  conditions d'utilisation
                </a>{' '}
                et la{' '}
                <a href="/privacy" target="_blank" className="text-green-600 hover:text-green-700 underline">
                  politique de confidentialité
                </a>{' '}
                d'ECOLOJIA *
              </span>
            </label>
            {validationErrors.acceptTerms && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.acceptTerms}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !validateForm()}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création du compte...
              </span>
            ) : (
              '🎉 Créer mon compte gratuit'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Déjà un compte ?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-green-600 hover:text-green-700 font-medium hover:underline"
            >
              Se connecter
            </button>
          </p>
        </div>

        {/* What you get */}
        <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">
            🎁 Votre compte gratuit inclut :
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-700">
            <div className="flex items-center">
              <span className="text-green-500 mr-1">✓</span>
              <span>30 scans/mois</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-1">✓</span>
              <span>5 questions IA/jour</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-1">✓</span>
              <span>Analyses scientifiques</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-1">✓</span>
              <span>Historique 7 jours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};