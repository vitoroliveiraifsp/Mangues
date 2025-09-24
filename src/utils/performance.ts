// Performance optimization utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Measure component render time
  measureRender(componentName: string, renderFn: () => void) {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    
    this.addMetric(`render_${componentName}`, end - start);
  }

  // Measure API call time
  async measureApiCall<T>(name: string, apiCall: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await apiCall();
      const end = performance.now();
      this.addMetric(`api_${name}`, end - start);
      return result;
    } catch (error) {
      const end = performance.now();
      this.addMetric(`api_${name}_error`, end - start);
      throw error;
    }
  }

  private addMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  // Get performance report
  getReport(): { [key: string]: { avg: number; min: number; max: number; count: number } } {
    const report: { [key: string]: { avg: number; min: number; max: number; count: number } } = {};
    
    this.metrics.forEach((values, name) => {
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        
        report[name] = {
          avg: Math.round(avg * 100) / 100,
          min: Math.round(min * 100) / 100,
          max: Math.round(max * 100) / 100,
          count: values.length
        };
      }
    });
    
    return report;
  }

  // Log performance report to console (dev only)
  logReport() {
    if (import.meta.env.DEV) {
      console.table(this.getReport());
    }
  }
}

// Image lazy loading utility
export function createImageLoader() {
  const imageCache = new Map<string, Promise<string>>();
  
  return {
    loadImage: (src: string): Promise<string> => {
      if (imageCache.has(src)) {
        return imageCache.get(src)!;
      }
      
      const promise = new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
      });
      
      imageCache.set(src, promise);
      return promise;
    },
    
    preloadImages: (urls: string[]) => {
      return Promise.allSettled(urls.map(url => this.loadImage(url)));
    }
  };
}

// Debounce utility for search and input
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), delay);
  };
}

// Throttle utility for scroll and resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

// Memory usage monitor
export function monitorMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
    };
  }
  return null;
}