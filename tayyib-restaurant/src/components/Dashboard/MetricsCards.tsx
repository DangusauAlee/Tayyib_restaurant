import { formatCurrency } from '../../utils/formatting';
import type { DashboardMetrics } from '../../types';

export default function MetricsCards({ metrics, previousMetrics }: { metrics: DashboardMetrics; previousMetrics?: DashboardMetrics | null }) {
  const items = [
    { label: 'Total Revenue', value: formatCurrency(metrics.totalRevenue), change: metrics.revenueChange },
    { label: 'Net Profit', value: formatCurrency(metrics.netProfit), change: metrics.profitChange },
    { label: 'Profit Margin', value: `${metrics.profitMargin.toFixed(1)}%`, change: null },
    { label: 'Avg Daily Rev', value: formatCurrency(metrics.averageDailyRevenue), change: null },
    { label: 'Meal Tickets', value: metrics.totalMealTickets.toLocaleString(), change: null },
    { label: 'Cash Balance', value: formatCurrency(metrics.currentCashBalance), change: null },
  ];

  const getChangeColor = (change: number) => change >= 0 ? 'text-success' : 'text-error';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {items.map(item => (
        <div key={item.label} className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">{item.label}</div>
          <div className="text-xl font-bold text-primary">{item.value}</div>
          {item.change != null && (
            <div className={`text-xs mt-1 ${getChangeColor(item.change)}`}>
              {item.change > 0 ? '+' : ''}{item.change}% vs prev
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
