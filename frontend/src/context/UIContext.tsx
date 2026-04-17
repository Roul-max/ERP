import React, { createContext, useContext, useState, useEffect } from 'react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';
export type ToastPayload = { type: ToastType; message: string };

interface UIContextType {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  toast: ToastPayload | null;
  setToast: (toast: ToastPayload | null) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastPayload | null>(null);

  // Listen for custom events dispatched from non-React code (client.ts)
  useEffect(() => {
    const handleLoading = (e: CustomEvent) => setLoading(e.detail);
    const handleError = (e: CustomEvent) => setError(e.detail);
    const handleToast = (e: CustomEvent) => setToast(e.detail);

    window.addEventListener('ui-loading', handleLoading as EventListener);
    window.addEventListener('ui-error', handleError as EventListener);
    window.addEventListener('ui-toast', handleToast as EventListener);

    return () => {
      window.removeEventListener('ui-loading', handleLoading as EventListener);
      window.removeEventListener('ui-error', handleError as EventListener);
      window.removeEventListener('ui-toast', handleToast as EventListener);
    };
  }, []);

  return (
    <UIContext.Provider value={{ loading, setLoading, error, setError, toast, setToast }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};
