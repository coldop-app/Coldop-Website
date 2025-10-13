import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ERPLoadingFallbackProps {
  section?: string;
}

const ERPLoadingFallback: React.FC<ERPLoadingFallbackProps> = ({
  section = 'ERP Module'
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">
            Loading {section}
          </h3>
          <p className="text-sm text-gray-600">
            Please wait while we prepare your workspace...
          </p>
        </div>
      </div>
    </div>
  );
};

export default ERPLoadingFallback;
