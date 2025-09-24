import { useCallback, useMemo } from 'react';

// Hook para otimizações de performance específicas para app infantil
export function usePerformance() {
  // Debounce para cliques rápidos (evita spam de cliques de crianças)
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ) => {
    let timeoutId: number;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => func(...args), delay);
    };
  }, []);

  // Throttle para eventos de hover/touch frequentes
  const throttle = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ) => {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  }, []);

  // Lazy loading de imagens com placeholder infantil
  const createImageLoader = useMemo(() => {
    return (src: string, placeholder = '🖼️') => {
      return new Promise<string>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => resolve(placeholder);
        img.src = src;
      });
    };
  }, []);

  // Função pura para otimizar renderização de listas (sem hooks)
  const optimizeList = useCallback(<T>(
    items: T[],
    keyExtractor: (item: T, index: number) => string | number
  ) => {
    return items.map((item, index) => ({
      key: keyExtractor(item, index),
      item,
      index
    }));
  }, []);

  return {
    debounce,
    throttle,
    createImageLoader,
    optimizeList,
  };
}