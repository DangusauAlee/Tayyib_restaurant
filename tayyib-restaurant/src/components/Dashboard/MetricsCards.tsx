import { formatCurrency } from '../../utils/formatting';
import type { DashboardMetrics } from '../../types';

function pctChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export default function MetricsCards({
  metrics,
  previousMetrics,
}: {
  metrics: DashboardMetrics;
  previousMetrics: DashboardMetrics | null;
}) {
  const items = [
    {
      label: 'Total Revenue',
      total: metrics.totalRevenue,
      dailyAvg: metrics.averageDailyRevenue,
      prevTotal: previousMetrics?.totalRevenue,
    },
    {
      label: 'Total Expenses',
      total: metrics.totalExpenses,
      dailyAvg: metrics.averageDailyExpenses,
      prevTotal: previousMetrics?.totalExpenses,
    },
    {
      label: 'Net Profit',
      total: metrics.netProfit,
      dailyAvg: metrics.averageDailyProfit,
      prevTotal: previousMetrics?.netProfit,
    },
    {
      label: 'Cash Balance',
      total: metrics.currentCashBalance,
      dailyAvg: metrics.averageDailyProfit, // no separate daily cash avg, use profit? We'll just show total
      prevTotal: previousMetrics?.currentCashBalance,
    },
    {
      label: 'Meal Tickets',
      total: metrics.totalMealTickets,
      dailyAvg: metrics.daysCount > 0 ? Math.round(metrics.totalMealTickets / metrics.daysCount) : 0,
      prevTotal: previousMetrics?.totalMealTickets,
    },
    {
      label: 'Avg Ticket Price',
      total: metrics.averageMealTicketPrice,
      dailyAvg: metrics.averageMealTicketPrice, // ticket price is already average
      prevTotal: previousMetrics?.averageMealTicketPrice,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
      {items.map((item) => {
        const change = previousMetrics ? pctChange(item.total, item.prevTotal ?? 0) : 0;
        return (
          <div key={item.label} className="bg-white p-2 md:p-4 rounded-xl shadow-sm">
            <div className="text-xs text-gray-500 truncate">{item.label}</div>
            <div className="text-base md:text-lg font-bold text-gray-800">
              {typeof item.total === 'number' && item.label.includes('Price')
                ? formatCurrency(item.total)
                : item.total.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Avg/day: {typeof item.dailyAvg === 'number' ? item.dailyAvg.toLocaleString() : '—'}
            </div>
            {previousMetrics && (
              <div className={`text-xs mt-0.5 flex items-center gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change > 0 ? '▲' : change < 0 ? '▼' : '•'} {Math.abs(change).toFixed(1)}%
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}