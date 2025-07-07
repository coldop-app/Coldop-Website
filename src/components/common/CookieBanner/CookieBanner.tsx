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
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-4xl w-full pointer-events-auto">

        {!showSettings ? (
          // Main Banner
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Cookie className="h-8 w-8 text-amber-500" />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  We value your privacy
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  We use cookies to enhance your browsing experience, provide personalized content, and analyze our traffic.
                  By clicking "Accept All", you consent to our use of cookies. You can manage your preferences or learn more in our{' '}
                  <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                    Privacy Policy
                  </a>.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={acceptAll}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={acceptNecessary}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Necessary Only
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-4 py-2 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Customize
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsVisible(false)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          // Settings Panel
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Cookie Preferences
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Necessary Cookies */}
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h4 className="font-medium text-gray-900 mb-1">Necessary Cookies</h4>
                  <p className="text-sm text-gray-600">
                    These cookies are essential for the website to function properly. They enable core functionality
                    such as security, network management, and accessibility.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center justify-end px-1">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">Always On</span>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h4 className="font-medium text-gray-900 mb-1">Analytics Cookies</h4>
                  <p className="text-sm text-gray-600">
                    These cookies help us understand how visitors interact with our website by collecting
                    and reporting information anonymously.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => handlePreferenceChange('analytics')}
                    className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                      preferences.analytics ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
                    } px-1`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h4 className="font-medium text-gray-900 mb-1">Marketing Cookies</h4>
                  <p className="text-sm text-gray-600">
                    These cookies are used to track visitors across websites to display relevant
                    and engaging advertisements.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => handlePreferenceChange('marketing')}
                    className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                      preferences.marketing ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
                    } px-1`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h4 className="font-medium text-gray-900 mb-1">Functional Cookies</h4>
                  <p className="text-sm text-gray-600">
                    These cookies enable enhanced functionality and personalization, such as
                    remembering your preferences and settings.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => handlePreferenceChange('functional')}
                    className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                      preferences.functional ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
                    } px-1`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={savePreferences}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Preferences
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
              >
                Accept All
              </button>
              <a
                href="/privacy"
                className="px-4 py-2 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors text-center"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieBanner;