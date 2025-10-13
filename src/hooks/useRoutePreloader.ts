import { useEffect, useCallback, useRef } from 'react';

interface RoutePreloaderConfig {
  preloadDelay?: number;
  preloadOnHover?: boolean;
  preloadOnFocus?: boolean;
}

export const useRoutePreloader = (config: RoutePreloaderConfig = {}) => {
  const preloadedRoutes = useRef<Set<string>>(new Set());
  const preloadTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const {
    preloadDelay = 2000,
    preloadOnHover = true,
    preloadOnFocus = true
  } = config;

  const preloadRoute = useCallback(async (routePath: string) => {
    if (preloadedRoutes.current.has(routePath)) {
      return;
    }

    try {
      // Clear any existing timeout for this route
      const existingTimeout = preloadTimeouts.current.get(routePath);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        preloadTimeouts.current.delete(routePath);
      }

      // Add preload hint for Vite
      await import(/* @vitePreload */ routePath);
      preloadedRoutes.current.add(routePath);
    } catch (error) {
      console.warn(`Failed to preload route: ${routePath}`, error);
    }
  }, []);

  const schedulePreload = useCallback((routePath: string) => {
    if (preloadedRoutes.current.has(routePath)) {
      return;
    }

    const timeout = setTimeout(() => {
      preloadRoute(routePath);
      preloadTimeouts.current.delete(routePath);
    }, preloadDelay);

    preloadTimeouts.current.set(routePath, timeout);
  }, [preloadRoute, preloadDelay]);

  const cancelPreload = useCallback((routePath: string) => {
    const timeout = preloadTimeouts.current.get(routePath);
    if (timeout) {
      clearTimeout(timeout);
      preloadTimeouts.current.delete(routePath);
    }
  }, []);

  // Preload critical routes on app start
  useEffect(() => {
    const criticalRoutes = [
      './screens/Erp/DaybookScreen.tsx',
      './screens/Erp/PeopleScreen.tsx',
      './screens/Erp/ColdStorageSummaryScreen.tsx'
    ];

    criticalRoutes.forEach(route => {
      schedulePreload(route);
    });
  }, [schedulePreload]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      preloadTimeouts.current.forEach(timeout => clearTimeout(timeout));
      preloadTimeouts.current.clear();
    };
  }, []);

  const handleMouseEnter = useCallback((routePath: string) => {
    if (preloadOnHover) {
      schedulePreload(routePath);
    }
  }, [preloadOnHover, schedulePreload]);

  const handleMouseLeave = useCallback((routePath: string) => {
    if (preloadOnHover) {
      cancelPreload(routePath);
    }
  }, [preloadOnHover, cancelPreload]);

  const handleFocus = useCallback((routePath: string) => {
    if (preloadOnFocus) {
      schedulePreload(routePath);
    }
  }, [preloadOnFocus, schedulePreload]);

  return {
    preloadRoute,
    schedulePreload,
    cancelPreload,
    handleMouseEnter,
    handleMouseLeave,
    handleFocus,
    isPreloaded: (routePath: string) => preloadedRoutes.current.has(routePath)
  };
};
