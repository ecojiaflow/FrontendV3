// 🔵 FRONTEND - frontend/src/auth/components/LoginForm.tsx

import React, { useState, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginFormData } from '../types/AuthTypes';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  className = ''
}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error, clearError } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors when user types
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    try {
      await login({
        email: formData.email,
        password: formData.password
      });
      
      onSuccess?.();
    } catch (error) {
      // Erreur déjà gérée par le contexte
      console.error('Login failed:', error);
    }
  };

  return (
    <div className={`login-form ${className}`}>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🌱</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Connexion ECOLOJIA
          </h2>
          <p className="text-gray-600">
            Accédez à votre assistant IA santé
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <span className="text-red-500 mr-2">⚠️</span>
              <div>
                <p className="text-red-800 font-medium">Erreur de connexion</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              placeholder="votre@email.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
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
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                placeholder="Votre mot de passe"
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
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isLoading}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-600">
                Se souvenir de moi
              </span>
            </label>

            <button
              type="button"
              className="text-sm text-green-600 hover:text-green-700 font-medium"
              onClick={() => {/* TODO: Implement forgot password */}}
            >
              Mot de passe oublié ?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !formData.email || !formData.password}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion...
              </span>
            ) : (
              '🚀 Se connecter'
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Pas encore de compte ?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-green-600 hover:text-green-700 font-medium hover:underline"
            >
              Créer un compte gratuit
            </button>
          </p>
        </div>

        {/* Benefits Preview */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">
            🎯 Avec votre compte ECOLOJIA :
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>30 analyses gratuites par mois</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>5 questions IA Expert par jour</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>Historique de vos analyses</span>
            </div>
            <div className="flex items-center">
              <span className="text-purple-500 mr-2">⭐</span>
              <span>Premium : analyses illimitées + coaching IA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};