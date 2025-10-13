import React, { memo, useMemo, useState, useEffect } from 'react';
import { usePerformanceMonitor } from '../../../hooks/usePerformanceMonitor';

interface PerformanceWrapperProps {
  children: React.ReactNode;
  componentName: string;
  enableMemoization?: boolean;
  enableVirtualization?: boolean;
}

const PerformanceWrapper: React.FC<PerformanceWrapperProps> = ({
  children,
  componentName,
  enableMemoization = true,
  enableVirtualization = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { measureLoadTime, measureRenderTime } = usePerformanceMonitor();

  // Measure component load time
  useEffect(() => {
    const endLoadMeasurement = measureLoadTime(componentName);
    return endLoadMeasurement;
  }, [componentName, measureLoadTime]);

  // Measure render time
  useEffect(() => {
    const endRenderMeasurement = measureRenderTime(componentName);
    return endRenderMeasurement;
  }, [componentName, measureRenderTime]);

  // Intersection Observer for lazy rendering
  useEffect(() => {
    if (enableVirtualization) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      const element = document.getElementById(`performance-wrapper-${componentName}`);
      if (element) {
        observer.observe(element);
      }

      return () => observer.disconnect();
    } else {
      setIsVisible(true);
    }
  }, [componentName, enableVirtualization]);

  // Memoized children for performance
  const memoizedChildren = useMemo(() => {
    if (!isVisible) return null;
    return children;
  }, [children, isVisible]);

  // Memoized component
  const MemoizedComponent = useMemo(() => {
    if (enableMemoization) {
      return memo(() => <>{memoizedChildren}</>);
    }
    return () => <>{memoizedChildren}</>;
  }, [memoizedChildren, enableMemoization]);

  if (enableVirtualization && !isVisible) {
    return (
      <div
        id={`performance-wrapper-${componentName}`}
        className="h-64 flex items-center justify-center"
      >
        <div className="animate-pulse bg-gray-200 rounded w-full h-full" />
      </div>
    );
  }

  return (
    <div id={`performance-wrapper-${componentName}`}>
      <MemoizedComponent />
    </div>
  );
};

export default PerformanceWrapper;
