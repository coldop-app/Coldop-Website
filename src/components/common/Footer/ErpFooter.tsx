import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Users, BarChart2, Settings } from 'lucide-react';

const ErpFooter= () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/erp/daybook', labelKey: 'erpFooter.daybook', icon: BookOpen },
    { path: '/erp/people', labelKey: 'erpFooter.people', icon: Users },
    { path: '/erp/analytics', labelKey: 'erpFooter.analytics', icon: BarChart2 },
    { path: '/erp/settings', labelKey: 'erpFooter.settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-primary/5 hover:text-primary/80'}`}
              >
                <Icon className={`w-6 h-6 transition-transform duration-200 ${isActive ? 'scale-105' : ''}`} />
                <span className={`text-xs mt-1 transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default ErpFooter;
