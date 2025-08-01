import { useLocation } from 'react-router-dom';
import DaybookShimmer from './DaybookShimmer';
import PeopleShimmer from './PeopleShimmer';
import AnalyticsShimmer from './AnalyticsShimmer';
import SettingsShimmer from './SettingsShimmer';

// Default loading fallback for unknown routes
const DefaultLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-secondary/30">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const EnhancedLoadingFallback = () => {
  const location = useLocation();
  const pathname = location.pathname;

  // Determine which shimmer to show based on the route
  if (pathname.includes('/daybook')) {
    return <DaybookShimmer />;
  }
  
  if (pathname.includes('/people')) {
    return <PeopleShimmer />;
  }
  
  if (pathname.includes('/analytics') || pathname.includes('/variety-breakdown')) {
    return <AnalyticsShimmer />;
  }
  
  if (pathname.includes('/settings')) {
    return <SettingsShimmer />;
  }

  // For other ERP routes or unknown routes, show default loading
  return <DefaultLoadingFallback />;
};

export default EnhancedLoadingFallback;