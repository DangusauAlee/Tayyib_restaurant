import { useState, useEffect } from 'react';
import { dashboardService } from '../services/DashboardService';
import type { DashboardMetrics, DailyDataPoint, CategoryBreakdown, DashboardFilters } from '../types';

export function useDashboardData(filters: DashboardFilters) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [prevMetrics, setPrevMetrics] = useState<DashboardMetrics | null>(null);
  const [dailyData, setDailyData] = useState<DailyDataPoint[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [m, d, c] = await Promise.all([
          dashboardService.getMetrics(filters),
          dashboardService.getDailyData(filters),
          dashboardService.getCategoryBreakdown(filters),
        ]);
        setMetrics(m);
        setDailyData(d);
        setCategories(c);

        if (filters.compareWith === 'previous') {
          const { start, end } = dashboardService.getPreviousPeriodDates(filters);
          const prev = await dashboardService.getMetrics({ ...filters, startDate: start, endDate: end, compareWith: undefined });
          setPrevMetrics(prev);
        } else {
          setPrevMetrics(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [filters.restaurantId, filters.startDate, filters.endDate, filters.groupBy, filters.compareWith]);

  return { metrics, prevMetrics, dailyData, categories, loading };
}