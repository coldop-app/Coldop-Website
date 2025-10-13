import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/lib/utils';

interface StockTrendItem {
  date: string;
  currentStockAtThatTime: number;
  type: 'incoming' | 'outgoing';
  voucherNumber: number;
}

interface StockTrendChartProps {
  data: StockTrendItem[];
  currentStock: number;
}

const StockTrendChart = ({ data, currentStock }: StockTrendChartProps) => {
  const { t } = useTranslation();

  // Sort data by date to show chronological progression
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.date.split('.').reverse().join('-'));
    const dateB = new Date(b.date.split('.').reverse().join('-'));
    return dateA.getTime() - dateB.getTime();
  });

  // Group data by month
  const monthlyData = sortedData.reduce((acc, item) => {
    const date = new Date(item.date.split('.').reverse().join('-'));
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthName,
        monthKey,
        transactions: [],
        maxStock: 0,
        minStock: Infinity,
        incomingCount: 0,
        outgoingCount: 0
      };
    }

    acc[monthKey].transactions.push(item);
    acc[monthKey].maxStock = Math.max(acc[monthKey].maxStock, item.currentStockAtThatTime);
    acc[monthKey].minStock = Math.min(acc[monthKey].minStock, item.currentStockAtThatTime);

    if (item.type === 'incoming') {
      acc[monthKey].incomingCount++;
    } else {
      acc[monthKey].outgoingCount++;
    }

    return acc;
  }, {} as Record<string, any>);

  // Convert to array and sort by month
  const chartData = Object.values(monthlyData).sort((a, b) => a.monthKey.localeCompare(b.monthKey));

  const maxStock = Math.max(...chartData.map(item => item.maxStock));
  const minStock = Math.min(...chartData.map(item => item.minStock));

  // Calculate growth statistics - removed as not relevant for potato storage

  const incomingTransactions = sortedData.filter(item => item.type === 'incoming').length;
  const outgoingTransactions = sortedData.filter(item => item.type === 'outgoing').length;

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Monthly Stock Trend Analysis</CardTitle>
        <p className="text-xs sm:text-sm text-gray-600">
          Track peak stock levels by month, showing the highest stock level reached in each month
          {chartData.length > 0 && (
            <span className="ml-2 text-blue-600 font-medium">
              ({chartData[0].month} - {chartData[chartData.length - 1].month})
            </span>
          )}
        </p>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="h-[280px] sm:h-[350px] lg:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 15,
                left: 15,
                bottom: 60
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                domain={[0, 'dataMax']}
                tickFormatter={(value) => formatNumber(value)}
                width={50}
              />
              <Tooltip
                formatter={(value, name, props) => [
                  `${formatNumber(Array.isArray(value) ? value[0] : value)} bags`,
                  'Peak Stock'
                ]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload;
                    return `${label} | Incoming: ${data.incomingCount} | Outgoing: ${data.outgoingCount}`;
                  }
                  return label;
                }}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line
                type="monotone"
                dataKey="maxStock"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 sm:mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-blue-600">{formatNumber(currentStock)}</div>
              <div className="text-xs sm:text-sm text-gray-600">Current Stock</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-green-600">{formatNumber(maxStock)}</div>
              <div className="text-xs sm:text-sm text-gray-600">Peak Stock</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-orange-600">{formatNumber(minStock)}</div>
              <div className="text-xs sm:text-sm text-gray-600">Lowest Stock</div>
            </div>
          </div>
        </div>

        {/* Transaction Counts */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{incomingTransactions}</div>
            <div className="text-xs text-gray-600">Incoming Transactions</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">{outgoingTransactions}</div>
            <div className="text-xs text-gray-600">Outgoing Transactions</div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-600">Peak Stock Level</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">Incoming Transactions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600">Outgoing Transactions</span>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Monthly Summary</h4>
          <div className="space-y-2">
            {chartData.map((month, index) => (
              <div key={index} className="flex justify-between items-center text-xs bg-white p-2 rounded">
                <span className="text-gray-700 font-medium">{month.month}</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-medium">{month.incomingCount}</span>
                    <span className="text-gray-500">incoming</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-medium">{month.outgoingCount}</span>
                    <span className="text-gray-500">outgoing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-medium">{formatNumber(month.maxStock)}</span>
                    <span className="text-gray-500">peak stock</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockTrendChart;