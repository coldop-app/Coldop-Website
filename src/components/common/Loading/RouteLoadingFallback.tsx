import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface RouteLoadingFallbackProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

const RouteLoadingFallback: React.FC<RouteLoadingFallbackProps> = ({
  message = 'Loading...',
  showProgress = false,
  progress = 0
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-700">{message}</p>
          {showProgress && (
            <div className="w-64 bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteLoadingFallback;
