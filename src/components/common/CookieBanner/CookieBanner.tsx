import React, { useState, useEffect } from 'react';
import { X, Cookie, Settings } from 'lucide-react';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('coldop-cookie-consent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    localStorage.setItem('coldop-cookie-consent', JSON.stringify(allAccepted));
    setIsVisible(false);
  };

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    localStorage.setItem('coldop-cookie-consent', JSON.stringify(necessaryOnly));
    setIsVisible(false);
  };

  const savePreferences = () => {
    localStorage.setItem('coldop-cookie-consent', JSON.stringify(preferences));
    setIsVisible(false);
  };

  const handlePreferenceChange = (type: keyof typeof preferences) => {
    if (type === 'necessary') return; // Cannot disable necessary cookies
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 pointer-events-none">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-primary/10 max-w-md w-full pointer-events-auto">
        {!showSettings ? (
          // Main Banner
          <div className="p-5">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Cookie className="h-6 w-6 text-primary" />
              </div>

              <div className="flex-1">
                <h3 className="text-base font-bold text-[#333] mb-2">
                  Cookie Settings
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  We use cookies to enhance your experience. Choose your preferences below.{' '}
                  <a href="/privacy" className="text-primary hover:text-primary/85 underline">
                    Learn more
                  </a>
                </p>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={acceptAll}
                    className="w-full px-6 py-2.5 bg-primary text-secondary text-sm font-medium rounded-md shadow-sm hover:bg-primary/90 transition-all duration-200 ease-in-out"
                  >
                    Accept All
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={acceptNecessary}
                      className="flex-1 px-4 py-2 bg-secondary/50 text-[#333] text-sm font-medium rounded-md hover:bg-secondary/70 transition-all duration-200 ease-in-out"
                    >
                      Necessary Only
                    </button>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="flex-1 px-4 py-2 text-primary text-sm font-medium rounded-md hover:bg-primary/5 transition-all duration-200 ease-in-out flex items-center justify-center"
                    >
                      <Settings className="h-4 w-4 mr-1.5" />
                      Customize
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsVisible(false)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          // Settings Panel
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-[#333]">
                  Cookie Preferences
                </h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Necessary Cookies */}
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h4 className="text-sm font-medium text-[#333] mb-0.5">Necessary</h4>
                  <p className="text-xs text-gray-500">
                    Required for core functionality
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-10 h-5 bg-primary rounded-full flex items-center justify-end px-0.5">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h4 className="text-sm font-medium text-[#333] mb-0.5">Analytics</h4>
                  <p className="text-xs text-gray-500">
                    Help us improve our website
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => handlePreferenceChange('analytics')}
                    className={`w-10 h-5 rounded-full flex items-center transition-colors ${
                      preferences.analytics ? 'bg-primary justify-end' : 'bg-gray-300 justify-start'
                    } px-0.5`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </button>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h4 className="text-sm font-medium text-[#333] mb-0.5">Marketing</h4>
                  <p className="text-xs text-gray-500">
                    Personalized advertisements
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => handlePreferenceChange('marketing')}
                    className={`w-10 h-5 rounded-full flex items-center transition-colors ${
                      preferences.marketing ? 'bg-primary justify-end' : 'bg-gray-300 justify-start'
                    } px-0.5`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </button>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h4 className="text-sm font-medium text-[#333] mb-0.5">Functional</h4>
                  <p className="text-xs text-gray-500">
                    Enhanced features and settings
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => handlePreferenceChange('functional')}
                    className={`w-10 h-5 rounded-full flex items-center transition-colors ${
                      preferences.functional ? 'bg-primary justify-end' : 'bg-gray-300 justify-start'
                    } px-0.5`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-5 pt-4 border-t border-gray-200">
              <button
                onClick={savePreferences}
                className="w-full px-6 py-2.5 bg-primary text-secondary text-sm font-medium rounded-md shadow-sm hover:bg-primary/90 transition-all duration-200 ease-in-out"
              >
                Save Preferences
              </button>
              <div className="flex gap-2">
                <button
                  onClick={acceptAll}
                  className="flex-1 px-4 py-2 bg-secondary/50 text-[#333] text-sm font-medium rounded-md hover:bg-secondary/70 transition-all duration-200 ease-in-out"
                >
                  Accept All
                </button>
                <a
                  href="/privacy"
                  className="flex-1 px-4 py-2 text-primary text-sm font-medium rounded-md hover:bg-primary/5 transition-all duration-200 ease-in-out text-center"
                >
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieBanner;