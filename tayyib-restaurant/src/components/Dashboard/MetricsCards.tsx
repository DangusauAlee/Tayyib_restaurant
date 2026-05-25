import { formatCurrency } from '../../utils/formatting';
import type { DashboardMetrics } from '../../types';

const icons = [
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, // Revenue
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>, // Profit
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, // Margin
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, // Avg Daily
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>, // Tickets
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, // Cash
];

export default function MetricsCards({ metrics, previousMetrics }: { metrics: DashboardMetrics; previousMetrics?: DashboardMetrics | null }) {
  const items = [
    { label: 'Total Revenue', value: formatCurrency(metrics.totalRevenue), change: metrics.revenueChange, icon: icons[0] },
    { label: 'Net Profit', value: formatCurrency(metrics.netProfit), change: metrics.profitChange, icon: icons[1] },
    { label: 'Profit Margin', value: `${metrics.profitMargin.toFixed(1)}%`, change: null, icon: icons[2] },
    { label: 'Avg Daily Rev', value: formatCurrency(metrics.averageDailyRevenue), change: null, icon: icons[3] },
    { label: 'Meal Tickets', value: metrics.totalMealTickets.toLocaleString(), change: null, icon: icons[4] },
    { label: 'Cash Balance', value: formatCurrency(metrics.currentCashBalance), change: null, icon: icons[5] },
  ];

  const getChangeColor = (change: number) => change >= 0 ? 'text-success' : 'text-error';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {items.map((item, idx) => (
        <div key={item.label} className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">{item.label}</span>
            <span className="text-primary opacity-70 group-hover:opacity-100 transition">{item.icon}</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{item.value}</div>
          {item.change != null && (
            <div className={`text-xs mt-1 flex items-center gap-1 ${getChangeColor(item.change)}`}>
              {item.change > 0 ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              ) : (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              )}
              {item.change > 0 ? '+' : ''}{item.change}% vs prev
            </div>
          )}
        </div>
      ))}
    </div>
  );
}