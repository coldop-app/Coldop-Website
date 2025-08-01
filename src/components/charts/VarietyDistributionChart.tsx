import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface VarietyDistributionItem {
  variety: string;
  quantity: number;
  percentage: number;
}

interface VarietyDistributionChartProps {
  data: VarietyDistributionItem[];
}

const COLORS = [
  "#0088FE", // blue
  "#00C49F", // teal green
  "#28A745", // your brand green (matches buttons)
  "#FFBB28", // warm yellow
  "#FF8042", // soft orange
  "#6A4C93", // plum purple
  "#4B5563", // slate gray
];

const VarietyDistributionChart = ({ data }: VarietyDistributionChartProps) => {
  const { t } = useTranslation();
  const othersQuantity = data.find(item => item.variety === 'Others')?.quantity || 0;
  const othersPercentage = data.find(item => item.variety === 'Others')?.percentage || 0;

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">{t('coldStorageSummary.varietyDistribution')}</CardTitle>
        <p className="text-xs sm:text-sm text-gray-600">{t('coldStorageSummary.percentageBreakdown')}</p>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="h-[280px] sm:h-[350px] lg:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius="70%"
                fill="#8884d8"
                dataKey="quantity"
                nameKey="variety"
                label={({ variety, percent }) => {
                  // Hide labels on smaller screens for better readability
                  if (typeof window !== 'undefined' && window.innerWidth < 640) {
                    return '';
                  }
                  return variety && percent ? `${variety}: ${(percent * 100).toFixed(1)}%` : '';
                }}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} ${t('coldStorageSummary.bags')}`, t('coldStorageSummary.quantity')]}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-gray-900 text-sm sm:text-base">{t('coldStorageSummary.varietyInsights')}</h4>
          <div className="space-y-2">
            {data.slice(0, 3).map((item, index) => (
              <div key={item.variety} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs sm:text-sm font-medium truncate">{item.variety}</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap ml-2">
                  {item.quantity} {t('coldStorageSummary.bags')} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2 text-sm">{t('coldStorageSummary.distributionInsights')}</h5>
            <ul className="space-y-1 text-xs sm:text-sm text-blue-800">
              <li>• {data[0]?.variety} {t('coldStorageSummary.mostStoredVariety')} {data[0]?.percentage.toFixed(1)}% {t('coldStorageSummary.ofAllInventory')}</li>
              <li>• {t('coldStorageSummary.topVarietiesAccount')} {(data[0]?.percentage + (data[1]?.percentage || 0)).toFixed(1)}% {t('coldStorageSummary.ofInventory')}</li>
              {data.length > 5 && othersQuantity > 0 && (
                <li>• {data.length - 5} {t('coldStorageSummary.varietiesGroupedAs')} "{t('coldStorageSummary.others')}" {t('coldStorageSummary.accountFor')} {othersPercentage.toFixed(1)}% {t('coldStorageSummary.ofInventory')}</li>
              )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VarietyDistributionChart;