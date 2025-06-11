import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Users, BarChart2, Settings } from 'lucide-react';

const ErpFooter= () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/daybook', labelKey: 'erpFooter.daybook', icon: BookOpen },
    { path: '/people', labelKey: 'erpFooter.people', icon: Users },
    { path: '/analytics', labelKey: 'erpFooter.analytics', icon: BarChart2 },
    { path: '/settings', labelKey: 'erpFooter.settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full
                  ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default ErpFooter;
