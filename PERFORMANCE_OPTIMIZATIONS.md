# Performance Optimizations

This document outlines the performance optimizations implemented in the application to improve loading times, reduce bundle sizes, and enhance user experience.

## 🚀 Code Splitting Optimizations

### 1. Route-Based Code Splitting
- **Lazy Loading**: All routes are lazy-loaded using React's `lazy()` function
- **Preloading**: Critical routes are preloaded using `/* @vitePreload */` comments
- **Error Boundaries**: Each route is wrapped with error boundaries for better error handling

### 2. Bundle Splitting Strategy
The Vite configuration includes optimized manual chunk splitting:

```typescript
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
  'ui-vendor': [/* All Radix UI components */],
  'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
  'chart-vendor': ['recharts'],
  'pdf-vendor': ['@react-pdf/renderer'],
  // ... more vendor chunks
}
```

### 3. Component-Level Optimizations

#### Loading Components
- `LoadingSpinner`: Reusable spinner with size variants
- `RouteLoadingFallback`: Optimized loading UI for public routes
- `ERPLoadingFallback`: Specialized loading UI for ERP modules

#### Error Handling
- `ErrorBoundary`: Comprehensive error boundary with retry functionality
- Graceful error handling for code splitting failures

#### Performance Monitoring
- `usePerformanceMonitor`: Hook for measuring component load and render times
- `PerformanceWrapper`: HOC for optimizing heavy components with memoization and virtualization

## 📊 Performance Features

### 1. Intelligent Preloading
- Critical routes are preloaded on app initialization
- Hover-based preloading for better UX
- Focus-based preloading for accessibility

### 2. Query Client Optimization
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### 3. Build Optimizations
- **Terser Minification**: Enabled with console removal in production
- **Source Maps**: Enabled for better debugging
- **Chunk Size Warnings**: Set to 1000KB threshold
- **Asset Optimization**: Organized CSS and JS assets in separate directories

## 🎯 Usage Examples

### Using Performance Wrapper
```tsx
import { PerformanceWrapper } from '@/components/common/PerformanceWrapper';

<PerformanceWrapper
  componentName="HeavyChart"
  enableMemoization={true}
  enableVirtualization={true}
  threshold={16}
>
  <HeavyChartComponent />
</PerformanceWrapper>
```

### Using Performance Monitor
```tsx
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

const MyComponent = () => {
  const { measureLoadTime, logMemoryUsage } = usePerformanceMonitor();

  useEffect(() => {
    const endMeasurement = measureLoadTime('MyComponent');
    return endMeasurement;
  }, [measureLoadTime]);

  // Component logic...
};
```

### Using Route Preloader
```tsx
import { useRoutePreloader } from '@/hooks/useRoutePreloader';

const Navigation = () => {
  const { handleMouseEnter, handleMouseLeave } = useRoutePreloader();

  return (
    <Link
      to="/heavy-route"
      onMouseEnter={() => handleMouseEnter('./screens/HeavyRoute.tsx')}
      onMouseLeave={() => handleMouseLeave('./screens/HeavyRoute.tsx')}
    >
      Heavy Route
    </Link>
  );
};
```

## 📈 Expected Performance Improvements

1. **Initial Bundle Size**: Reduced by ~40-60% through code splitting
2. **Time to Interactive**: Improved by ~30-50% through preloading
3. **Memory Usage**: Optimized through memoization and virtualization
4. **Error Recovery**: Better user experience with error boundaries
5. **Loading States**: More informative and user-friendly loading indicators

## 🔧 Configuration

### Vite Configuration
The `vite.config.ts` includes:
- Manual chunk splitting for vendor libraries
- Optimized dependency pre-bundling
- Terser minification with console removal
- Organized asset output structure

### Route Configuration
Each route includes:
- Error boundary wrapping
- Optimized Suspense fallbacks
- Preloading hints for critical routes
- Performance monitoring integration

## 🚨 Best Practices

1. **Always wrap routes with ErrorBoundary**
2. **Use PerformanceWrapper for heavy components**
3. **Implement proper loading states**
4. **Monitor performance metrics in development**
5. **Test code splitting behavior in production builds**

## 📝 Monitoring

The application includes built-in performance monitoring:
- Component load time tracking
- Render time measurement
- Memory usage logging
- Long task detection
- Web Vitals integration (when available)

Check the browser console for performance logs in development mode.
