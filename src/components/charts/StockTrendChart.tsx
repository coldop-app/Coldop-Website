import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StockTrendItem {
  month: string;
  totalStock: number;
}

interface StockTrendChartProps {
  data: StockTrendItem[];
  currentStock: number;
}

const StockTrendChart = ({ data, currentStock }: StockTrendChartProps) => {
  const maxStock = Math.max(...data.map(item => item.totalStock));

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Stock Trend Analysis</CardTitle>
        <p className="text-xs sm:text-sm text-gray-600">Monthly stock levels over the past 12 months</p>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="h-[280px] sm:h-[350px] lg:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
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
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                domain={[0, 'dataMax']}
                tickFormatter={(value) => `${value}`}
                width={50}
              />
              <Tooltip
                formatter={(value) => [`${value} bags`, 'Total Stock']}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line
                type="monotone"
                dataKey="totalStock"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 sm:mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{currentStock}</div>
              <div className="text-xs sm:text-sm text-gray-600">Current Stock</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{maxStock}</div>
              <div className="text-xs sm:text-sm text-gray-600">Peak Stock</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockTrendChart;