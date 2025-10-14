import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, BarChart3, Plus, Minus, Maximize2 } from 'lucide-react';

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
  // Additional properties for grouped data
  totalIncoming?: number;
  totalOutgoing?: number;
  netChange?: number;
  transactionCount?: number;
}

interface MonthlyChartDataItem extends MonthData {
  displayDate: string;
  formattedDate: string;
  currentStockAtThatTime: number;
  type: 'monthly';
  voucherNumber: number;
  isMonthChange: boolean;
  transactionCount?: number;
}

interface StockTrendChartProps {
  data: StockTrendItem[];
  currentStock: number;
}

const StockTrendChart = ({ data, currentStock }: StockTrendChartProps) => {
  const [showTransactionSummary, setShowTransactionSummary] = useState(false);
  const [brushRange, setBrushRange] = useState<{ startIndex: number; endIndex: number } | null>(null);
  const [groupByMonth, setGroupByMonth] = useState(false);
  const [groupByDate, setGroupByDate] = useState(false);
  const [isFullView, setIsFullView] = useState(true);

  // Zoom control functions
  const zoomIn = () => {
    setIsFullView(false);
    if (!brushRange) {
      // If no brush range, set initial zoom to show 50% of data
      const midPoint = Math.floor(chartData.length / 2);
      const range = Math.floor(chartData.length * 0.25);
      setBrushRange({
        startIndex: Math.max(0, midPoint - range),
        endIndex: Math.min(chartData.length - 1, midPoint + range)
      });
    } else {
      // Zoom in by reducing the range by 20%
      const currentRange = brushRange.endIndex - brushRange.startIndex;
      const newRange = Math.max(2, Math.floor(currentRange * 0.8));
      const center = Math.floor((brushRange.startIndex + brushRange.endIndex) / 2);
      const newStart = Math.max(0, center - Math.floor(newRange / 2));
      const newEnd = Math.min(chartData.length - 1, newStart + newRange);
      setBrushRange({ startIndex: newStart, endIndex: newEnd });
    }
  };

  const zoomOut = () => {
    setIsFullView(false);
    if (!brushRange) {
      // If no brush range, set initial zoom to show 80% of data
      const range = Math.floor(chartData.length * 0.4);
      setBrushRange({
        startIndex: 0,
        endIndex: Math.min(chartData.length - 1, range)
      });
    } else {
      // Zoom out by increasing the range by 25%
      const currentRange = brushRange.endIndex - brushRange.startIndex;
      const newRange = Math.min(chartData.length - 1, Math.floor(currentRange * 1.25));
      const center = Math.floor((brushRange.startIndex + brushRange.endIndex) / 2);
      const newStart = Math.max(0, center - Math.floor(newRange / 2));
      const newEnd = Math.min(chartData.length - 1, newStart + newRange);
      setBrushRange({ startIndex: newStart, endIndex: newEnd });
    }
  };

  const toggleFullView = () => {
    if (isFullView) {
      // Currently in full view, zoom to a focused view
      const midPoint = Math.floor(chartData.length / 2);
      const range = Math.floor(chartData.length * 0.3);
      setBrushRange({
        startIndex: Math.max(0, midPoint - range),
        endIndex: Math.min(chartData.length - 1, midPoint + range)
      });
      setIsFullView(false);
    } else {
      // Currently zoomed, return to full view
      setBrushRange(null);
      setIsFullView(true);
    }
  };

  // Filter out invalid data and sort by date to show chronological progression
  const sortedData = [...data]
    .filter(item => item && item.date && typeof item.date === 'string' && item.date.includes('.'))
    .sort((a, b) => {
      const dateA = new Date(a.date.split('.').reverse().join('-'));
      const dateB = new Date(b.date.split('.').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });

  const maxStock = sortedData.length > 0 ? Math.max(...sortedData.map(item => item.currentStockAtThatTime)) : 0;
  const minStock = sortedData.length > 0 ? Math.min(...sortedData.map(item => item.currentStockAtThatTime)) : 0;

  // Calculate growth statistics
  const totalGrowth = sortedData.length > 1
    ? sortedData[sortedData.length - 1].currentStockAtThatTime - sortedData[0].currentStockAtThatTime
    : 0;

  const incomingTransactions = sortedData.filter(item => item.type === 'incoming').length;
  const outgoingTransactions = sortedData.filter(item => item.type === 'outgoing').length;

  // Helper function to format date as "8th Feb 25"
  const formatDateDisplay = (dateString: string) => {
    if (!dateString || typeof dateString !== 'string' || !dateString.includes('.')) {
      return 'Invalid Date';
    }

    const [day, month, year] = dateString.split('.');

    if (!day || !month || !year) {
      return 'Invalid Date';
    }

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
    if (!dateString || typeof dateString !== 'string' || !dateString.includes('.')) {
      return '0000-00';
    }

    const [, month, year] = dateString.split('.');

    if (!month || !year) {
      return '0000-00';
    }

    return `${year}-${month.padStart(2, '0')}`;
  };

  // Helper function to group data by month
  const groupDataByMonth = (data: StockTrendItem[]): MonthData[] => {
    const groupedData = data
      .filter(item => item && item.date && typeof item.date === 'string' && item.date.includes('.'))
      .reduce((acc, item) => {
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

    // Get all months sorted to calculate net change properly
    const allMonths = Object.keys(groupedData).sort((a, b) => a.localeCompare(b));

    // Process each month's data
    allMonths.forEach((monthKey, index) => {
      const monthData = groupedData[monthKey];
      const sortedTransactions = monthData.transactions
        .filter(item => item && item.date && typeof item.date === 'string' && item.date.includes('.'))
        .sort((a: StockTrendItem, b: StockTrendItem) => {
          const dateA = new Date(a.date.split('.').reverse().join('-'));
          const dateB = new Date(b.date.split('.').reverse().join('-'));
          return dateA.getTime() - dateB.getTime();
        });

      monthData.startStock = sortedTransactions[0]?.currentStockAtThatTime || 0;
      monthData.endStock = sortedTransactions[sortedTransactions.length - 1]?.currentStockAtThatTime || 0;
      monthData.peakStock = sortedTransactions.length > 0 ? Math.max(...sortedTransactions.map((t: StockTrendItem) => t.currentStockAtThatTime)) : 0;
      monthData.lowestStock = sortedTransactions.length > 0 ? Math.min(...sortedTransactions.map((t: StockTrendItem) => t.currentStockAtThatTime)) : 0;

      // Calculate net change for this month compared to previous month
      let previousMonthEndStock = 0;
      if (index > 0) {
        const previousMonth = allMonths[index - 1];
        const previousMonthData = groupedData[previousMonth];
        previousMonthEndStock = previousMonthData.endStock;
      } else {
        // For the first month, use the start stock of the first transaction
        previousMonthEndStock = monthData.startStock;
      }

      // Net change is the difference between this month's end stock and previous month's end stock
      monthData.netChange = monthData.endStock - previousMonthEndStock;

      monthData.totalIncoming = sortedTransactions.filter((t: StockTrendItem) => t.type === 'incoming').length;
      monthData.totalOutgoing = sortedTransactions.filter((t: StockTrendItem) => t.type === 'outgoing').length;
    });

    return allMonths.map(monthKey => groupedData[monthKey]);
  };

  // Helper function to format month display
  const formatMonthDisplay = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // Helper function to group data by date
  const groupDataByDate = (data: StockTrendItem[]): ChartDataItem[] => {
    interface DateGroupData {
      date: string;
      transactions: StockTrendItem[];
      totalIncoming: number;
      totalOutgoing: number;
      netChange: number;
      startStock: number;
      endStock: number;
      peakStock: number;
      lowestStock: number;
    }

    const groupedData = data
      .filter(item => item && item.date && typeof item.date === 'string' && item.date.includes('.'))
      .reduce((acc, item) => {
        const dateKey = item.date;
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
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
        acc[dateKey].transactions.push(item);
        return acc;
      }, {} as Record<string, DateGroupData>);

    // Get all dates sorted to calculate net change properly
    const allDates = Object.keys(groupedData).sort((a, b) => {
      const dateA = new Date(a.split('.').reverse().join('-'));
      const dateB = new Date(b.split('.').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });

    // Process each date's data
    allDates.forEach((dateKey, index) => {
      const dateData = groupedData[dateKey];
      const sortedTransactions = dateData.transactions
        .filter((item: StockTrendItem) => item && item.date && typeof item.date === 'string' && item.date.includes('.'))
        .sort((a: StockTrendItem, b: StockTrendItem) => {
          const dateA = new Date(a.date.split('.').reverse().join('-'));
          const dateB = new Date(b.date.split('.').reverse().join('-'));
          return dateA.getTime() - dateB.getTime();
        });

      dateData.startStock = sortedTransactions[0]?.currentStockAtThatTime || 0;
      dateData.endStock = sortedTransactions[sortedTransactions.length - 1]?.currentStockAtThatTime || 0;
      dateData.peakStock = sortedTransactions.length > 0 ? Math.max(...sortedTransactions.map((t: StockTrendItem) => t.currentStockAtThatTime)) : 0;
      dateData.lowestStock = sortedTransactions.length > 0 ? Math.min(...sortedTransactions.map((t: StockTrendItem) => t.currentStockAtThatTime)) : 0;

      // Calculate net change for this day
      // For the first day, we need to find the previous day's end stock
      let previousDayEndStock = 0;
      if (index > 0) {
        const previousDate = allDates[index - 1];
        const previousDateData = groupedData[previousDate];
        previousDayEndStock = previousDateData.endStock;
      } else {
        // For the first day, use the start stock of the first transaction
        previousDayEndStock = dateData.startStock;
      }

      // Net change is the difference between this day's end stock and previous day's end stock
      dateData.netChange = dateData.endStock - previousDayEndStock;

      const incomingTransactions = sortedTransactions.filter((t: StockTrendItem) => t.type === 'incoming');
      const outgoingTransactions = sortedTransactions.filter((t: StockTrendItem) => t.type === 'outgoing');

      dateData.totalIncoming = incomingTransactions.length;
      dateData.totalOutgoing = outgoingTransactions.length;
    });

    return allDates.map((dateKey): ChartDataItem => {
      const dateData = groupedData[dateKey];
      return {
        date: dateData.date,
        currentStockAtThatTime: dateData.endStock,
        type: 'incoming', // This will be overridden in the display
        voucherNumber: 0, // This will be overridden in the display
        formattedDate: dateData.date,
        displayDate: formatDateDisplay(dateData.date),
        month: getMonth(dateData.date),
        isMonthChange: false,
        // Additional properties for grouped data
        totalIncoming: dateData.totalIncoming,
        totalOutgoing: dateData.totalOutgoing,
        netChange: dateData.netChange,
        transactionCount: dateData.transactions.length
      };
    });
  };

  // Helper function to create month background areas
  const createMonthBackgrounds = () => {
    if (groupByMonth) return [];

    const backgrounds = [];
    let currentMonth = '';
    let monthStartIndex = 0;

    chartData.forEach((item, index) => {
      if (item.month && item.month !== currentMonth) {
        if (currentMonth !== '') {
          // Close previous month
          backgrounds.push({
            startIndex: monthStartIndex,
            endIndex: index - 1,
            month: currentMonth
          });
        }
        currentMonth = item.month;
        monthStartIndex = index;
      }
    });

    // Close last month
    if (currentMonth !== '') {
      backgrounds.push({
        startIndex: monthStartIndex,
        endIndex: chartData.length - 1,
        month: currentMonth
      });
    }

    return backgrounds;
  };

  // Helper function to create month reference lines for individual view
  const createMonthReferenceLines = () => {
    if (groupByMonth || groupByDate) return [];

    interface MonthReferenceLine {
      index: number;
      month: string;
      displayDate: string;
    }

    const referenceLines: MonthReferenceLine[] = [];
    let currentMonth = '';

    chartData.forEach((item, index) => {
      if (item.month && item.month !== currentMonth && index > 0) {
        referenceLines.push({
          index: index,
          month: item.month,
          displayDate: item.displayDate
        });
        currentMonth = item.month;
      }
    });

    return referenceLines;
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
    : groupByDate
    ? (() => {
        const groupedData = groupDataByDate(sortedData);
        return groupedData.map((item, index): ChartDataItem => {
          const currentMonth = getMonth(item.date);
          const prevMonth = index > 0 ? getMonth(groupedData[index - 1]?.date || '') : null;
          const isMonthChange = prevMonth !== null && currentMonth !== prevMonth;

          return {
            ...item,
            month: currentMonth,
            isMonthChange
          };
        });
      })()
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
                : groupByDate
                ? 'Daily aggregated view - multiple vouchers on the same date are grouped together'
                : 'Track how your stock levels changed over time with individual voucher transactions'
              }
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setGroupByMonth(false);
                setGroupByDate(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                !groupByMonth && !groupByDate
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Individual
            </button>
            <button
              onClick={() => {
                setGroupByMonth(false);
                setGroupByDate(true);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                groupByDate && !groupByMonth
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              By Date
            </button>
            <button
              onClick={() => {
                setGroupByMonth(true);
                setGroupByDate(false);
              }}
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

              {/* Month background areas for daily and date-grouped views */}
              {!groupByMonth && createMonthBackgrounds().map((bg, bgIndex) => (
                <ReferenceLine
                  key={`month-bg-${bgIndex}`}
                  x={chartData[bg.startIndex]?.displayDate}
                  stroke="none"
                  fill="#f8fafc"
                  fillOpacity={0.3}
                  width="100%"
                />
              ))}

              {/* Month change reference lines for all views */}
              {chartData.map((item, index) => {
                if (item.isMonthChange) {
                  return (
                    <ReferenceLine
                      key={`month-change-${index}`}
                      x={item.displayDate}
                      stroke="#1e40af"
                      strokeWidth={4}
                      strokeDasharray="10 6"
                      opacity={0.9}
                    />
                  );
                }
                return null;
              })}

              {/* Additional month reference lines for individual view */}
              {!groupByMonth && !groupByDate && createMonthReferenceLines().map((ref, refIndex) => (
                <ReferenceLine
                  key={`month-ref-${refIndex}`}
                  x={ref.displayDate}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  opacity={0.7}
                />
              ))}
              <XAxis
                dataKey="displayDate"
                angle={-45}
                textAnchor="end"
                height={60}
                interval="preserveStartEnd"
                tickCount={8}
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
                        fill={isMonthChange ? "#1e40af" : "#6b7280"}
                        fontSize={isMonthChange ? 12 : 10}
                        fontWeight={isMonthChange ? "bold" : "normal"}
                        transform="rotate(-45)"
                      >
                        {payload?.value}
                      </text>
                      {isMonthChange && (
                        <g>
                          <rect
                            x={-8}
                            y={-8}
                            width={16}
                            height={16}
                            fill="#1e40af"
                            fillOpacity={0.1}
                            rx={2}
                          />
                          <line
                            x1={-6}
                            y1={-6}
                            x2={6}
                            y2={6}
                            stroke="#1e40af"
                            strokeWidth={2}
                          />
                        </g>
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
                  groupByMonth ? 'End of Month Stock' : groupByDate ? 'End of Day Stock' : 'Stock Level'
                ]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload;
                    if (groupByMonth) {
                      return `Month: ${data.displayDate} | Net Change: ${data.netChange >= 0 ? '+' : ''}${formatNumber(data.netChange)} bags | Gate Passes: ${data.totalIncoming + data.totalOutgoing}`;
                    } else if (groupByDate) {
                      return `Date: ${data.displayDate} | Net Change: ${data.netChange >= 0 ? '+' : ''}${formatNumber(data.netChange)} bags | Transactions: ${data.transactionCount || 0} (${data.totalIncoming || 0} incoming, ${data.totalOutgoing || 0} outgoing)`;
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
                  } else if (groupByDate) {
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill="#8b5cf6"
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
                    setIsFullView(false);
                  }
                }}
                tickFormatter={(value, index) => {
                  if (index % Math.ceil(chartData.length / 4) === 0) {
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
          <div className="flex items-center gap-2">
            <button
              onClick={zoomIn}
              className="flex items-center justify-center w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition-all duration-200 hover:shadow-sm"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={zoomOut}
              className="flex items-center justify-center w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition-all duration-200 hover:shadow-sm"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullView}
              className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                isFullView
                  ? 'bg-green-100 hover:bg-green-200 text-green-700 border-green-300'
                  : 'bg-green-50 hover:bg-green-100 text-green-600 border-green-200'
              }`}
              title={isFullView ? "Zoom to Focused View" : "Full View"}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
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
            ) : groupByDate ? (
              <>
                <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg sm:text-xl font-bold text-blue-600">{formatNumber(currentStock)}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Current Stock</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                  <div className="text-lg sm:text-xl font-bold text-green-600">{chartData.length}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Days Tracked</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
                  <div className="text-lg sm:text-xl font-bold text-orange-600">{formatNumber(maxStock)}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Peak Daily Stock</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
                  <div className={`text-lg sm:text-xl font-bold ${totalGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalGrowth >= 0 ? '+' : ''}{formatNumber(totalGrowth)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Net Growth</div>
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
                  {chartData.reduce((sum: number, d) => sum + ('totalIncoming' in d ? d.totalIncoming! : 0), 0)}
                </div>
                <div className="text-xs text-gray-600">Total Incoming Gate Passes</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">
                  {chartData.reduce((sum: number, d) => sum + ('totalOutgoing' in d ? d.totalOutgoing! : 0), 0)}
                </div>
                <div className="text-xs text-gray-600">Total Outgoing Gate Passes</div>
              </div>
            </>
          ) : groupByDate ? (
            <>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {chartData.reduce((sum: number, d) => sum + (('totalIncoming' in d && d.totalIncoming) ? d.totalIncoming! : 0), 0)}
                </div>
                <div className="text-xs text-gray-600">Total Incoming Gate Passes</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">
                  {chartData.reduce((sum: number, d) => sum + (('totalOutgoing' in d && d.totalOutgoing) ? d.totalOutgoing! : 0), 0)}
                </div>
                <div className="text-xs text-gray-600">Total Outgoing Gate Passes</div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{incomingTransactions}</div>
                <div className="text-xs text-gray-600">Incoming Gate Passes</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">{outgoingTransactions}</div>
                <div className="text-xs text-gray-600">Outgoing Gate Passes</div>
              </div>
            </>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap justify-center gap-4 sm:gap-6">
          {groupByMonth ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-600">End of Month Stock Levels</span>
            </div>
          ) : groupByDate ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-xs text-gray-600">End of Day Stock Levels</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-blue-600 rounded" style={{ background: 'repeating-linear-gradient(90deg, #1e40af 0px, #1e40af 8px, transparent 8px, transparent 14px)' }}></div>
                <span className="text-xs text-gray-600">Month Boundaries</span>
              </div>
            </>
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
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-blue-600 rounded" style={{ background: 'repeating-linear-gradient(90deg, #1e40af 0px, #1e40af 8px, transparent 8px, transparent 14px)' }}></div>
                <span className="text-xs text-gray-600">Month Boundaries</span>
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
            <h4 className="text-sm font-semibold text-gray-700">Gate Pass Summary</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {groupByMonth
                  ? `${chartData.length} month${chartData.length !== 1 ? 's' : ''}`
                  : groupByDate
                    ? `${chartData.length} date${chartData.length !== 1 ? 's' : ''}`
                    : `${chartData.length} gate pass${chartData.length !== 1 ? 'es' : ''}`
                }
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
                      {item.displayDate} - {groupByDate ? `${('transactionCount' in item ? item.transactionCount : 0) || 0} gate pass${(('transactionCount' in item ? item.transactionCount : 0) || 0) !== 1 ? 'es' : ''}` : groupByMonth ? `${(('totalIncoming' in item && item.totalIncoming) ? item.totalIncoming : 0) + (('totalOutgoing' in item && item.totalOutgoing) ? item.totalOutgoing : 0)} gate pass${((('totalIncoming' in item && item.totalIncoming) ? item.totalIncoming : 0) + (('totalOutgoing' in item && item.totalOutgoing) ? item.totalOutgoing : 0)) !== 1 ? 'es' : ''}` : `Voucher #${item.voucherNumber}`}
                    </span>
                    <div className="flex items-center gap-2">
                      {groupByDate ? (
                        <>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            Net: {item.netChange && item.netChange >= 0 ? '+' : ''}{formatNumber(item.netChange || 0)}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            {item.totalIncoming || 0} in / {item.totalOutgoing || 0} out
                          </span>
                        </>
                      ) : groupByMonth ? (
                        <>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            Net: {item.netChange && item.netChange >= 0 ? '+' : ''}{formatNumber(item.netChange || 0)}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            {('totalIncoming' in item && item.totalIncoming) ? item.totalIncoming : 0} in / {('totalOutgoing' in item && item.totalOutgoing) ? item.totalOutgoing : 0} out
                          </span>
                        </>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.type === 'incoming'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {item.type}
                        </span>
                      )}
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