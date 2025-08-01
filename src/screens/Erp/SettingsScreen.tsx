import { useNavigate } from "react-router-dom";
import { UserCircle, CreditCard, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import TopBar from "@/components/common/Topbar/Topbar";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/common/LanguageSelector/LanguageSelector";

const SettingsScreen = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const settingsOptions = [
    {
      title: t('settings.options.profile.title'),
      description: t('settings.options.profile.description'),
      icon: UserCircle,
      path: "/erp/settings/profile",
      iconBg: "bg-blue-50 text-blue-500",
      borderColor: "border-blue-100"
    },
    {
      title: t('settings.options.billing.title'),
      description: t('settings.options.billing.description'),
      icon: CreditCard,
      path: "/erp/settings/billing",
      iconBg: "bg-green-50 text-green-500",
      borderColor: "border-green-100"
    },
    {
      title: t('settings.options.support.title'),
      description: t('settings.options.support.description'),
      icon: HelpCircle,
      path: "/erp/settings/support",
      iconBg: "bg-purple-50 text-purple-500",
      borderColor: "border-purple-100"
    },

  ];

  return (
    <>
      <TopBar title={t('settings.title')} isSidebarOpen={false} setIsSidebarOpen={() => {}} />
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Settings Options Grid */}
        <div className="grid gap-4 sm:gap-6">

          {settingsOptions.map((option) => (
            <Card
              key={option.title}
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group"
              onClick={() => navigate(option.path)}
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-start gap-4 sm:gap-6">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 ${option.iconBg} rounded-lg flex items-center justify-center border-2 border-white shadow-sm ${option.borderColor}`}>
                    <option.icon size={24} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 group-hover:text-primary transition-colors">
                      {option.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {option.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="hidden sm:flex items-center self-center">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary/5 group-hover:text-primary transition-all duration-200">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '10px' }}>
            <div>{t('settings.language')}</div>
            <LanguageSelector isMobile={true} isInSettings={true} />
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsScreen;
