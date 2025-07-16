// PATH: frontend/src/pages/Scan.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Scan: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-6">📱</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Scanner mobile
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Fonctionnalité en cours de développement
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/demo" 
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Essayer la démo
            </Link>
            <Link 
              to="/results" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Analyse manuelle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scan;

// PATH: frontend/src/components/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-green-500 ${sizeClasses[size]} ${className}`}></div>
  );
};

export default LoadingSpinner;

// PATH: frontend/src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Oups ! Une erreur est survenue
            </h2>
            <p className="text-gray-600 mb-6">
              Une erreur inattendue s'est produite. Veuillez recharger la page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;