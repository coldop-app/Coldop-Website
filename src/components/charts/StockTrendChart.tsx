import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, BarChart3 } from 'lucide-react';

interface StockTrendItem {
  date: string;
  currentStockAtThatTime: number;
  type: 'incoming' | 'outgoing';
  voucherNumber: number;
}

interface MonthData {
  month: string;
  transactions: StockTrendItem[];
  totalIncoming: number;
  totalOutgoing: number;
  netChange: number;
  startStock: number;
  endStock: number;
  peakStock: number;
  lowestStock: number;
}

interface ChartDataItem {
  date: string;
  currentStockAtThatTime: number;
  type: 'incoming' | 'outgoing';
  voucherNumber: number;
  formattedDate: string;
  displayDate: string;
  month?: string;
  isMonthChange?: boolean;
}

interface MonthlyChartDataItem extends MonthData {
  displayDate: string;
  formattedDate: string;
  currentStockAtThatTime: number;
  type: 'monthly';
  voucherNumber: number;
  isMonthChange: boolean;
}

interface StockTrendChartProps {
  data: StockTrendItem[];
  currentStock: number;
}

const StockTrendChart = ({ data, currentStock }: StockTrendChartProps) => {
  const [showTransactionSummary, setShowTransactionSummary] = useState(false);
  const [brushRange, setBrushRange] = useState<{ startIndex: number; endIndex: number } | null>(null);
  const [groupByMonth, setGroupByMonth] = useState(false);

  // Sort data by date to show chronological progression
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.date.split('.').reverse().join('-'));
    const dateB = new Date(b.date.split('.').reverse().join('-'));
    return dateA.getTime() - dateB.getTime();
  });

  const maxStock = Math.max(...sortedData.map(item => item.currentStockAtThatTime));
  const minStock = Math.min(...sortedData.map(item => item.currentStockAtThatTime));

  // Calculate growth statistics
  const totalGrowth = sortedData.length > 1
    ? sortedData[sortedData.length - 1].currentStockAtThatTime - sortedData[0].currentStockAtThatTime
    : 0;

  const incomingTransactions = sortedData.filter(item => item.type === 'incoming').length;
  const outgoingTransactions = sortedData.filter(item => item.type === 'outgoing').length;

  // Helper function to format date as "8th Feb 25"
  const formatDateDisplay = (dateString: string) => {
    const [day, month, year] = dateString.split('.');

    const dayWithSuffix = (day: number) => {
      if (day >= 11 && day <= 13) return day + 'th';
      switch (day % 10) {
        case 1: return day + 'st';
        case 2: return day + 'nd';
        case 3: return day + 'rd';
        default: return day + 'th';
      }
    };

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return `${dayWithSuffix(parseInt(day))} ${monthNames[parseInt(month) - 1]} ${year.slice(-2)}`;
  };

  // Helper function to get month for highlighting
  const getMonth = (dateString: string) => {
    const [, month, year] = dateString.split('.');
    return `${year}-${month.padStart(2, '0')}`;
  };

  // Helper function to group data by month
  const groupDataByMonth = (data: StockTrendItem[]): MonthData[] => {
    const groupedData = data.reduce((acc, item) => {
      const monthKey = getMonth(item.date);
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          transactions: [],
          totalIncoming: 0,
          totalOutgoing: 0,
          netChange: 0,
          startStock: 0,
          endStock: 0,
          peakStock: 0,
          lowestStock: 0
        };
      }
      acc[monthKey].transactions.push(item);
      return acc;
    }, {} as Record<string, MonthData>);

    // Process each month's data
    Object.values(groupedData).forEach((monthData) => {
      const sortedTransactions = monthData.transactions.sort((a: StockTrendItem, b: StockTrendItem) => {
        const dateA = new Date(a.date.split('.').reverse().join('-'));
        const dateB = new Date(b.date.split('.').reverse().join('-'));
        return dateA.getTime() - dateB.getTime();
      });

      monthData.startStock = sortedTransactions[0]?.currentStockAtThatTime || 0;
      monthData.endStock = sortedTransactions[sortedTransactions.length - 1]?.currentStockAtThatTime || 0;
      monthData.peakStock = Math.max(...sortedTransactions.map((t: StockTrendItem) => t.currentStockAtThatTime));
      monthData.lowestStock = Math.min(...sortedTransactions.map((t: StockTrendItem) => t.currentStockAtThatTime));
      monthData.netChange = monthData.endStock - monthData.startStock;
      monthData.totalIncoming = sortedTransactions.filter((t: StockTrendItem) => t.type === 'incoming').length;
      monthData.totalOutgoing = sortedTransactions.filter((t: StockTrendItem) => t.type === 'outgoing').length;
    });

    return Object.values(groupedData).sort((a, b) => a.month.localeCompare(b.month));
  };

  // Helper function to format month display
  const formatMonthDisplay = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // Prepare data for the chart based on grouping preference
  const chartData: (ChartDataItem | MonthlyChartDataItem)[] = groupByMonth
    ? groupDataByMonth(sortedData).map((monthData): MonthlyChartDataItem => ({
        ...monthData,
        displayDate: formatMonthDisplay(monthData.month),
        formattedDate: monthData.month,
        currentStockAtThatTime: monthData.endStock,
        type: 'monthly' as const,
        voucherNumber: 0,
        isMonthChange: false
      }))
    : sortedData.map((item, index): ChartDataItem => {
        const currentMonth = getMonth(item.date);
        const prevMonth = index > 0 ? getMonth(sortedData[index - 1].date) : null;
        const isMonthChange = prevMonth !== null && currentMonth !== prevMonth;

        return {
          ...item,
          formattedDate: item.date,
          displayDate: formatDateDisplay(item.date),
          month: currentMonth,
          isMonthChange
        };
      });

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Stock Trend Analysis</CardTitle>
            <p className="text-xs sm:text-sm text-gray-600">
              {groupByMonth
                ? 'Monthly aggregated view of stock trends and transaction patterns'
                : 'Track how your stock levels changed over time with incoming and outgoing transactions'
              }
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setGroupByMonth(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                !groupByMonth
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Daily
            </button>
            <button
              onClick={() => setGroupByMonth(true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                groupByMonth
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Monthly
            </button>
          </div>
        </div>
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
              {/* Month change reference lines */}
              {chartData.map((item, index) => {
                if (item.isMonthChange) {
                  return (
                    <ReferenceLine
                      key={`month-change-${index}`}
                      x={item.displayDate}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      opacity={0.7}
                    />
                  );
                }
                return null;
              })}
              <XAxis
                dataKey="displayDate"
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
                tickFormatter={(value, index) => {
                  const data = chartData[index];
                  if (data?.isMonthChange) {
                    return { value, isMonthChange: true };
                  }
                  return value;
                }}
                tick={(props) => {
                  const { x, y, payload } = props;
                  const isMonthChange = payload?.isMonthChange;
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={16}
                        textAnchor="end"
                        fill={isMonthChange ? "#1f2937" : "#6b7280"}
                        fontSize={isMonthChange ? 11 : 10}
                        fontWeight={isMonthChange ? "bold" : "normal"}
                        transform="rotate(-45)"
                      >
                        {payload?.value}
                      </text>
                      {isMonthChange && (
                        <line
                          x1={-5}
                          y1={-5}
                          x2={5}
                          y2={5}
                          stroke="#3b82f6"
                          strokeWidth={2}
                        />
                      )}
                    </g>
                  );
                }}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                domain={[0, 'dataMax']}
                tickFormatter={(value) => formatNumber(value)}
                width={50}
              />
              <Tooltip
                formatter={(value) => [
                  `${formatNumber(Array.isArray(value) ? value[0] : value)} bags`,
                  groupByMonth ? 'End of Month Stock' : 'Stock Level'
                ]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload;
                    if (groupByMonth) {
                      return `Month: ${data.displayDate} | Net Change: ${data.netChange >= 0 ? '+' : ''}${formatNumber(data.netChange)} bags | Transactions: ${data.totalIncoming + data.totalOutgoing}`;
                    } else {
                      return `Date: ${data.displayDate} | Voucher: ${data.voucherNumber} | Type: ${data.type}`;
                    }
                  }
                  return `Date: ${label}`;
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
                dataKey="currentStockAtThatTime"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (groupByMonth) {
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill="#3b82f6"
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    );
                  }
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={payload?.type === 'incoming' ? '#10b981' : '#ef4444'}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                connectNulls={false}
              />
              <Brush
                dataKey="displayDate"
                height={30}
                stroke="#3b82f6"
                fill="#e0f2fe"
                startIndex={brushRange?.startIndex ?? 0}
                endIndex={brushRange?.endIndex ?? Math.min(5, chartData.length - 1)}
                onChange={(range) => {
                  if (range && range.startIndex !== undefined && range.endIndex !== undefined) {
                    setBrushRange({
                      startIndex: range.startIndex,
                      endIndex: range.endIndex
                    });
                  }
                }}
                tickFormatter={(value, index) => {
                  if (index % Math.ceil(chartData.length / 6) === 0) {
                    return value;
                  }
                  return '';
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Brush Controls */}
        <div className="mt-3 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {brushRange ? (
              <span>
                Zoomed: {chartData[brushRange.startIndex]?.displayDate} - {chartData[brushRange.endIndex]?.displayDate}
              </span>
            ) : (
              <span>Drag to zoom in on a specific time period</span>
            )}
          </div>
          <button
            onClick={() => setBrushRange(null)}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors duration-200"
          >
            Reset View
          </button>
        </div>

        <div className="mt-4 sm:mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {groupByMonth ? (
              <>
                <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg sm:text-xl font-bold text-blue-600">{formatNumber(currentStock)}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Current Stock</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                  <div className="text-lg sm:text-xl font-bold text-green-600">{chartData.length}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Months Tracked</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
                  <div className="text-lg sm:text-xl font-bold text-orange-600">
                    {chartData.length > 0 ? formatNumber(Math.max(...chartData.map((d) => 'peakStock' in d ? d.peakStock : 0))) : 0}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Peak Monthly Stock</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
                  <div className={`text-lg sm:text-xl font-bold ${totalGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalGrowth >= 0 ? '+' : ''}{formatNumber(totalGrowth)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Total Growth</div>
                </div>
              </>
            ) : (
              <>
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
                <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
                  <div className={`text-lg sm:text-xl font-bold ${totalGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalGrowth >= 0 ? '+' : ''}{formatNumber(totalGrowth)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Net Growth</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Transaction Counts */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          {groupByMonth ? (
            <>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {chartData.reduce((sum: number, d) => sum + ('totalIncoming' in d ? d.totalIncoming : 0), 0)}
                </div>
                <div className="text-xs text-gray-600">Total Incoming Transactions</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">
                  {chartData.reduce((sum: number, d) => sum + ('totalOutgoing' in d ? d.totalOutgoing : 0), 0)}
                </div>
                <div className="text-xs text-gray-600">Total Outgoing Transactions</div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{incomingTransactions}</div>
                <div className="text-xs text-gray-600">Incoming Transactions</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">{outgoingTransactions}</div>
                <div className="text-xs text-gray-600">Outgoing Transactions</div>
              </div>
            </>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex justify-center gap-6">
          {groupByMonth ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-600">End of Month Stock Levels</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-600">Incoming Stock</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-600">Outgoing Stock</span>
              </div>
            </>
          )}
        </div>

        {/* Transaction Summary Toggle */}
        <div className="mt-4">
          <button
            onClick={() => setShowTransactionSummary(!showTransactionSummary)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <h4 className="text-sm font-semibold text-gray-700">Transaction Summary</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {chartData.length} transaction{chartData.length !== 1 ? 's' : ''}
              </span>
              {showTransactionSummary ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </div>
          </button>

          {showTransactionSummary && (
            <div className="mt-2 p-4 bg-gray-50 rounded-lg border-t border-gray-200">
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {chartData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-xs py-2 px-3 bg-white rounded border">
                    <span className="text-gray-600">
                      {item.displayDate} - Voucher #{item.voucherNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.type === 'incoming'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {item.type}
                      </span>
                      <span className="font-medium">{formatNumber(item.currentStockAtThatTime)} bags</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StockTrendChart;