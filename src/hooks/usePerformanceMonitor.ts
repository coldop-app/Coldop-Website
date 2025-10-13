import { useEffect, useCallback } from 'react';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (command: string, action: string, parameters: Record<string, any>) => void;
  }
}

export const usePerformanceMonitor = () => {
  const measureLoadTime = useCallback((componentName: string) => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;

      console.log(`[Performance] ${componentName} loaded in ${loadTime.toFixed(2)}ms`);

      // Send to analytics if needed
      if (window.gtag) {
        window.gtag('event', 'component_load', {
          component_name: componentName,
          load_time: Math.round(loadTime)
        });
      }
    };
  }, []);

  const measureRenderTime = useCallback((componentName: string) => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      console.log(`[Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
    };
  }, []);

  const logMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log('[Performance] Memory Usage:', {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`
      });
    }
  }, []);

  const logWebVitals = useCallback(() => {
    // Log Core Web Vitals
    if ('web-vitals' in window) {
      // This would require the web-vitals library
      console.log('[Performance] Web Vitals monitoring enabled');
    }
  }, []);

  useEffect(() => {
    // Log initial performance metrics
    logMemoryUsage();
    logWebVitals();

    // Set up performance observer for long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'longtask') {
            console.warn(`[Performance] Long task detected: ${entry.duration}ms`);
          }
        }
      });

      observer.observe({ entryTypes: ['longtask'] });

      return () => observer.disconnect();
    }
  }, [logMemoryUsage, logWebVitals]);

  return {
    measureLoadTime,
    measureRenderTime,
    logMemoryUsage,
    logWebVitals
  };
};
