import { useTranslation } from 'react-i18next';
import TopBar from '@/components/common/Topbar/Topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CustomAnalyticsScreen = () => {
  const { t } = useTranslation();

  return (
    <>
      <TopBar title="Custom Analytics" isSidebarOpen={false} setIsSidebarOpen={() => {}} />
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-20">
        <Card className="bg-white shadow-sm">
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
              Custom Analytics
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600">
              Advanced analytics and reporting features coming soon.
            </p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Custom Analytics Dashboard
              </h3>
              <p className="text-sm text-gray-500">
                This section will contain advanced analytics features and custom reporting tools.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CustomAnalyticsScreen;
