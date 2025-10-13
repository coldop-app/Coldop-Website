import React, { Suspense, lazy } from 'react';
import LoadingSpinner from '../Loading/LoadingSpinner';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';

interface LazyRouteProps {
  importPath: string;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  preload?: boolean;
}

const LazyRoute: React.FC<LazyRouteProps> = ({
  importPath,
  fallback,
  errorFallback,
  preload = false
}) => {
  const LazyComponent = lazy(() => {
    // Add preload hint for Vite
    const importStatement = preload
      ? `import(/* @vitePreload */ "${importPath}")`
      : `import("${importPath}")`;

    return eval(importStatement);
  });

  const defaultFallback = (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback || defaultFallback}>
        <LazyComponent />
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyRoute;
