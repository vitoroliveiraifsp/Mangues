import { useState, useEffect } from 'react';
import { offlineStorage } from '../utils/offlineStorage';
import { syncManager } from '../utils/syncManager';

interface UseOfflineApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isOffline: boolean;
}

interface UseOfflineApiOptions {
  cacheTTL?: number; // Time to live em ms
  fallbackData?: any;
  enableOfflineFirst?: boolean;
}

export function useOfflineApi<T>(
  url: string, 
  options: UseOfflineApiOptions = {}
): UseOfflineApiState<T> & {
  refetch: () => Promise<void>;
  clearCache: () => Promise<void>;
} {
  const [state, setState] = useState<UseOfflineApiState<T>>({
    data: null,
    loading: true,
    error: null,
    isOffline: !navigator.onLine
  });

  const { 
    cacheTTL = 3600000, // 1 hora por padrão
    fallbackData,
    enableOfflineFirst = false 
  } = options;

  // Atualizar status offline
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOffline: false }));
    const handleOffline = () => setState(prev => ({ ...prev, isOffline: true }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchData = async (forceNetwork = false) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Estratégia Offline First
      if (enableOfflineFirst && !forceNetwork) {
        const cachedData = await offlineStorage.getCachedApiData(url);
        if (cachedData) {
          setState(prev => ({ 
            ...prev, 
            data: cachedData, 
            loading: false 
          }));
          
          // Buscar dados atualizados em background se online
          if (navigator.onLine) {
            fetchFromNetwork(false);
          }
          return;
        }
      }

      // Tentar buscar da rede
      if (navigator.onLine) {
        await fetchFromNetwork(true);
      } else {
        // Buscar do cache se offline
        const cachedData = await offlineStorage.getCachedApiData(url);
        if (cachedData) {
          setState(prev => ({ 
            ...prev, 
            data: cachedData, 
            loading: false 
          }));
        } else if (fallbackData) {
          setState(prev => ({ 
            ...prev, 
            data: fallbackData, 
            loading: false 
          }));
        } else {
          throw new Error('Dados não disponíveis offline');
        }
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        loading: false 
      }));
    }
  };

  const fetchFromNetwork = async (updateState = true) => {
    try {
      // Construir URL completa
      const backendUrl = getBackendUrl();
      const fullUrl = `${backendUrl}${url}`;
      
      const response = await fetch(fullUrl);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cachear dados
      await offlineStorage.cacheApiData(url, data, cacheTTL);
      
      if (updateState) {
        setState(prev => ({ 
          ...prev, 
          data, 
          loading: false,
          error: null 
        }));
      }
      
      return data;
    } catch (error) {
      if (updateState) {
        throw error;
      }
      console.warn('Falha ao atualizar dados em background:', error);
    }
  };

  const getBackendUrl = () => {
    // Detectar ambiente e configurar URL do backend
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    if (hostname.includes('replit') || hostname.includes('.app')) {
      return '/api-proxy';
    } else if (port === '8080') {
      return ''; // Nginx proxy
    } else {
      return 'http://localhost:3001';
    }
  };

  const refetch = async () => {
    await fetchData(true);
  };

  const clearCache = async () => {
    await offlineStorage.deleteCachedApiData(url);
    await fetchData();
  };

  // Buscar dados na inicialização
  useEffect(() => {
    fetchData();
  }, [url]);

  return {
    ...state,
    refetch,
    clearCache
  };
}

// Hook especializado para POST requests com suporte offline
export function useOfflinePost<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const post = async (
    url: string, 
    data: any, 
    options: { 
      syncType?: 'pontuacao' | 'quiz_resultado' | 'ranking';
      showOfflineMessage?: boolean;
    } = {}
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);

      const backendUrl = getBackendUrl();
      const fullUrl = `${backendUrl}${url}`;

      if (navigator.onLine) {
        // Tentar enviar online
        const response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } else {
        // Armazenar para sincronização offline
        if (options.syncType) {
          await syncManager.storeForSync(url, data, options.syncType);
          
          if (options.showOfflineMessage) {
            console.log('Dados salvos offline. Serão sincronizados quando a conexão for restaurada.');
          }
          
          return {
            success: true,
            offline: true,
            message: 'Dados salvos offline'
          } as T;
        } else {
          throw new Error('Não é possível enviar dados offline');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getBackendUrl = () => {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    if (hostname.includes('replit') || hostname.includes('.app')) {
      return '/api-proxy';
    } else if (port === '8080') {
      return '';
    } else {
      return 'http://localhost:3001';
    }
  };

  return { post, loading, error };
}