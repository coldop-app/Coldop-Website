import { useCallback } from 'react';

interface PreloadOptions {
  priority?: 'high' | 'low';
  crossOrigin?: 'anonymous' | 'use-credentials';
}

export const usePreload = () => {
  const preloadRoute = useCallback(async (routePath: string) => {
    try {
      // Preload the route component
      const module = await import(/* @vitePreload */ routePath);
      return module;
    } catch (error) {
      console.warn(`Failed to preload route: ${routePath}`, error);
      return null;
    }
  }, []);

  const preloadImage = useCallback((
    src: string,
    options: PreloadOptions = {}
  ) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;

    if (options.priority) {
      link.setAttribute('fetchpriority', options.priority);
    }

    if (options.crossOrigin) {
      link.crossOrigin = options.crossOrigin;
    }

    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const preloadScript = useCallback((
    src: string,
    options: PreloadOptions = {}
  ) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = src;

    if (options.priority) {
      link.setAttribute('fetchpriority', options.priority);
    }

    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return {
    preloadRoute,
    preloadImage,
    preloadScript,
  };
};
