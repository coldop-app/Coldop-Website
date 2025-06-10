import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Globe } from 'lucide-react';

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
}

const LanguageSelector = ({ isMobile = false }: LanguageSelectorProps) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

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