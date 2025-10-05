import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from '@/lib/utils';

interface DistributionData {
  name: string;
  value: number;
  percentage: number;
  color: string;
  [key: string]: string | number;
}

interface AnalyticsDistributionChartProps {
  data: DistributionData[];
  title: string;
  description: string;
  type: 'pie' | 'bar';
  icon: React.ReactNode;
  totalValue: number;
}


const AnalyticsDistributionChart = ({
  data,
  title,
  description,
  type,
  icon,
  totalValue
}: AnalyticsDistributionChartProps) => {
  const topItems = data.slice(0, 3);
  const othersData = data.slice(3);
  const othersTotal = othersData.reduce((sum, item) => sum + item.value, 0);
  const othersPercentage = othersData.length > 0 ? (othersTotal / totalValue) * 100 : 0;

  const renderChart = () => {
    if (type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius="70%"
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percentage }) => {
                if (typeof window !== "undefined" && window.innerWidth < 640) {
                  return "";
                }
                return name && typeof percentage === "number"
                  ? `${name}: ${percentage.toFixed(1)}%`
                  : "";
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [
                `${formatNumber(value)} bags`,
                "Quantity",
              ]}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 15,
              left: 15,
              bottom: 60
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10 }}
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
              formatter={(value) => [`${formatNumber(value)} bags`, "Quantity"]}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Bar
              dataKey="value"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            {icon}
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
              {title}
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600">
              {description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="h-[280px] sm:h-[350px] lg:h-[400px]">
          {renderChart()}
        </div>

        {/* Insights Section */}
        <div className="mt-4 space-y-3">
          <h4 className="font-medium text-gray-900 text-sm sm:text-base">
            Distribution Insights
          </h4>

          {/* Top Items */}
          <div className="space-y-2">
            {topItems.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs sm:text-sm font-medium truncate">
                    {item.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs sm:text-sm text-gray-900 font-medium">
                    {formatNumber(item.value)} bags
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Others Section */}
          {othersData.length > 0 && (
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-3 h-3 rounded-full bg-blue-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">
                  Others ({othersData.length} items)
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs sm:text-sm text-gray-900 font-medium">
                  {formatNumber(othersTotal)} bags
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  ({othersPercentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2 text-sm">
              Key Statistics
            </h5>
            <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-blue-700 font-medium">Total Items:</span>
                <span className="text-blue-900 ml-1">{data.length}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Total Bags:</span>
                <span className="text-blue-900 ml-1">{formatNumber(totalValue)}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Top Item:</span>
                <span className="text-blue-900 ml-1">{data[0]?.name}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Top Share:</span>
                <span className="text-blue-900 ml-1">{data[0]?.percentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsDistributionChart;
