import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TopFarmerItem {
  name: string;
  totalBags: number;
}

interface TopFarmersData {
  status: string;
  message: string;
  data: Array<{
    farmerName: string;
    totalBags: number;
  }>;
}

interface TopFarmersChartProps {
  data: TopFarmerItem[];
  topFarmersData: TopFarmersData | undefined;
  totalBags: number;
}

const TopFarmersChart = ({ data, topFarmersData, totalBags }: TopFarmersChartProps) => {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Top Farmers</CardTitle>
        <p className="text-xs sm:text-sm text-gray-600">Farmers with the highest storage inventory</p>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="h-[280px] sm:h-[350px] lg:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 15,
                left: 15,
                bottom: 80
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                domain={[0, 'dataMax']}
                tickFormatter={(value) => `${value}`}
                width={50}
              />
              <Tooltip
                formatter={(value) => [`${value} bags`, 'Total Bags']}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar
                dataKey="totalBags"
                fill="#3b82f6"
                name="Total Bags"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {topFarmersData?.data?.[0] && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Top Farmer Insights</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Top Contributor</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate" title={topFarmersData.data[0].farmerName}>
                    {topFarmersData.data[0].farmerName}
                  </p>
                </div>
                <p className="text-sm sm:text-lg font-bold text-blue-600 ml-2 whitespace-nowrap">
                  {topFarmersData.data[0].totalBags} bags
                </p>
              </div>
              {topFarmersData.data[1] && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">Comparison</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Stores {(topFarmersData.data[0].totalBags / topFarmersData.data[1].totalBags).toFixed(1)}x more than second-ranked farmer
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2 text-sm">Storage Share</h5>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {((topFarmersData.data[0].totalBags / totalBags) * 100).toFixed(1)}%
                </div>
                <div className="text-xs sm:text-sm text-gray-600">of total inventory</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopFarmersChart;