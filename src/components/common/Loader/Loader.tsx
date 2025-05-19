import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-2 border-primary/20 border-t-primary rounded-full animate-spin`}
        role="status"
        aria-label="loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Loader;