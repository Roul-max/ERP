import React, { useEffect } from 'react';
import { useUI } from '../context/UIContext';
import { X, AlertTriangle } from 'lucide-react';

const GlobalError: React.FC = () => {
  const { error, setError } = useUI();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000); // Auto hide after 5s
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  if (!error) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] w-full max-w-md px-4">
      <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg shadow-lg flex items-start gap-3">
        <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
        <div className="flex-1 text-sm font-medium">{error}</div>
        <button onClick={() => setError(null)} className="text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-white">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default GlobalError;