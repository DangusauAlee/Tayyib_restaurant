import { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../hooks/useDashboard';
import DashboardFilters from './DashboardFilters';
import MetricsCards from './MetricsCards';
import RevenueChart from './Charts/RevenueChart';
import CategoryChart from './Charts/CategoryChart';
import type { DashboardFilters as FilterType, GroupBy } from '../../types';

export default function Dashboard() {
  const { user } = useAuth();
  const { restaurantId } = useRestaurant();
  const today = new Date().toISOString().slice(0, 10);
  const [filters, setFilters] = useState<FilterType>({
    startDate: today,
    endDate: today,
    groupBy: 'day' as GroupBy,
    restaurantId: restaurantId!,
    compareWith: undefined,
    excludeWeekends: false,
    categoryFilter: [],
    createdBy: user?.role === 'MD' ? undefined : user?.id,
  });

  const { metrics, prevMetrics, dailyData, categories, loading } = useDashboardData(filters);

  if (!restaurantId) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <DashboardFilters filters={filters} onFiltersChange={setFilters} />
      {loading ? (
        <div className="text-center py-10">Loading metrics...</div>
      ) : (
        <>
          {metrics && <MetricsCards metrics={metrics} previousMetrics={prevMetrics} />}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Revenue & Profit Trend</h3>
              <RevenueChart data={dailyData} groupBy={filters.groupBy} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Expense Categories</h3>
              <CategoryChart data={categories} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
