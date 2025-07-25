import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Globe, X } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' }
];

interface LanguageSelectorProps {
  isMobile?: boolean;
  isInSettings?: boolean;
}

const LanguageSelector = ({ isMobile = false, isInSettings = false }: LanguageSelectorProps) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  // If isInSettings is true, render as a popup modal
  if (isInSettings) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition-colors duration-200
            ${isMobile
              ? 'text-lg hover:bg-gray-100'
              : 'text-base hover:bg-gray-100 hover:text-primary'
            }
            ${isOpen ? 'bg-gray-100' : ''}
          `}
        >
          <Globe size={isMobile ? 20 : 18} />
          <span className="min-w-0">
            {currentLanguage.nativeName}
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <>
            {/* Modal Backdrop */}
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className={`
                bg-white rounded-lg shadow-xl w-full transition-all duration-300 transform
                ${isMobile 
                  ? 'max-w-sm mx-6 max-h-[70vh] overflow-y-auto' 
                  : 'max-w-md'
                }
              `}>
                {/* Modal Header */}
                <div className={`
                  flex items-center justify-between border-b
                  ${isMobile ? 'p-4' : 'p-6'}
                `}>
                  <h2 className={`
                    font-semibold text-gray-800
                    ${isMobile ? 'text-lg' : 'text-xl'}
                  `}>
                    Select Language
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`
                      text-gray-500 hover:text-gray-700 transition-colors
                      ${isMobile ? 'p-2' : ''}
                    `}
                  >
                    <X size={isMobile ? 28 : 24} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className={isMobile ? 'p-4' : 'p-6'}>
                  <div className={isMobile ? 'space-y-4' : 'space-y-3'}>
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className={`
                          w-full text-left rounded-lg border transition-all duration-200 hover:bg-gray-50
                          ${isMobile ? 'p-5' : 'p-4'}
                          ${i18n.language === language.code
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className={`
                              font-medium
                              ${isMobile ? 'text-xl' : 'text-lg'}
                            `}>
                              {language.nativeName}
                            </div>
                            <div className={`
                              text-gray-500
                              ${isMobile ? 'text-base' : 'text-sm'}
                            `}>
                              {language.name}
                            </div>
                          </div>
                          {i18n.language === language.code && (
                            <div className={`
                              bg-primary rounded-full
                              ${isMobile ? 'w-3 h-3' : 'w-2 h-2'}
                            `}></div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className={`
                  border-t bg-gray-50 rounded-b-lg
                  ${isMobile ? 'p-4' : 'p-6'}
                `}>
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`
                      w-full bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors
                      ${isMobile ? 'px-4 py-2 text-lg' : 'px-4 py-2'}
                    `}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition-colors duration-200
          ${isMobile
            ? 'text-lg hover:bg-gray-100'
            : 'text-base hover:bg-gray-100 hover:text-primary'
          }
          ${isOpen ? 'bg-gray-100' : ''}
        `}
      >
        <Globe size={isMobile ? 20 : 18} />
        <span className="min-w-0">
          {currentLanguage.nativeName}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className={`
            absolute z-20 mt-2 min-w-[160px] rounded-lg border bg-white shadow-lg
            ${isMobile ? 'right-0' : 'left-0'}
          `}>
            <div className="py-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`
                    w-full px-4 py-2 text-left transition-colors duration-200 hover:bg-gray-50
                    ${i18n.language === language.code
                      ? 'bg-primary/5 text-primary font-medium'
                      : 'text-gray-700'
                    }
                  `}
                >
                  <div>
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-sm text-gray-500">{language.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;