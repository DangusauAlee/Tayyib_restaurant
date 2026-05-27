import { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useAuthStore } from '../../store/authStore';
import { useDashboardData } from '../../hooks/useDashboard';
import DashboardFilters from './DashboardFilters';
import MetricsCards from './MetricsCards';
import RevenueChart from './Charts/RevenueChart';
import CategoryChart from './Charts/CategoryChart';
import type { DashboardFilters as FilterType, GroupBy } from '../../types';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { restaurantId } = useRestaurant();
  const today = new Date().toISOString().slice(0, 10);

  // NO createdBy filter – all roles see all data
  const [filters, setFilters] = useState<FilterType>({
    startDate: today,
    endDate: today,
    groupBy: 'day' as GroupBy,
    restaurantId: restaurantId!,
    compareWith: undefined,
    excludeWeekends: false,
    categoryFilter: [],
    createdBy: undefined,      // ← this was the culprit, now removed
  });

  const { metrics, prevMetrics, dailyData, categories, loading } = useDashboardData(filters);

  if (!restaurantId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      </div>

      <DashboardFilters filters={filters} onFiltersChange={setFilters} />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="text-gray-500 text-sm">Loading metrics...</p>
          </div>
        </div>
      ) : (
        <>
          {metrics && <MetricsCards metrics={metrics} previousMetrics={prevMetrics} />}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Revenue & Profit Trend
              </h3>
              <RevenueChart data={dailyData} groupBy={filters.groupBy} />
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                Expense Categories
              </h3>
              <CategoryChart data={categories} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}