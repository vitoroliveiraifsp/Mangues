import { useState, useEffect } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(url: string): UseApiState<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        // Get backend URL - use relative path for API calls in production
        const backendUrl = window.location.hostname.includes('replit') || window.location.hostname.includes('.app')
          ? '/api-proxy'  // Use proxy for Replit environment  
          : 'http://localhost:3001';
        
        const response = await fetch(`${backendUrl}${url}`);
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setState({ data, loading: false, error: null });
      } catch (err) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: err instanceof Error ? err.message : 'Erro ao conectar com o servidor' 
        }));
      }
    };

    fetchData();
  }, [url]);

  return state;
}