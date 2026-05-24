import { supabase } from './supabase';
import type { DashboardMetrics, DailyDataPoint, CategoryBreakdown, DashboardFilters } from '../types';
import { subDays, format } from 'date-fns';

export const dashboardService = {
  async getMetrics(filters: DashboardFilters): Promise<DashboardMetrics> {
    const { data, error } = await supabase.rpc('calculate_dashboard_metrics', {
      p_restaurant_id: filters.restaurantId,
      p_start_date: filters.startDate,
      p_end_date: filters.endDate,
    });
    if (error) throw error;
    // The function returns snake_case; map to camelCase
    const d: any = data;
    return {
      totalRevenue: Number(d.totalrevenue),
      totalExpenses: Number(d.totalexpenses),
      netProfit: Number(d.netprofit),
      profitMargin: Number(d.profitmargin),
      totalTransactions: Number(d.totaltransactions),
      averageDailyRevenue: Number(d.averagedailyrevenue),
      averageDailyExpenses: Number(d.averagedailyexpenses),
      totalMealTickets: Number(d.totalmealtickets),
      averageMealTicketPrice: Number(d.averagemealticketprice),
      currentCashBalance: Number(d.currentcashbalance),
      revenueChange: Number(d.revenuechange),
      expenseChange: Number(d.expensechange),
      profitChange: Number(d.profitchange),
    };
  },

  async getDailyData(filters: DashboardFilters): Promise<DailyDataPoint[]> {
    const { data, error } = await supabase.rpc('get_daily_data', {
      p_restaurant_id: filters.restaurantId,
      p_start_date: filters.startDate,
      p_end_date: filters.endDate,
      p_group_by: filters.groupBy,
    });
    if (error) throw error;
    return (data || []).map(d => ({
      period: d.period,
      revenue: Number(d.revenue),
      expenses: Number(d.expenses),
      profit: Number(d.profit),
      tickets: Number(d.tickets),
    }));
  },

  async getCategoryBreakdown(filters: DashboardFilters): Promise<CategoryBreakdown[]> {
    const { data: txns } = await supabase
      .from('transactions')
      .select('id')
      .eq('restaurant_id', filters.restaurantId)
      .gte('transaction_date', filters.startDate)
      .lte('transaction_date', filters.endDate);
    const txnIds = (txns || []).map(t => t.id);
    if (txnIds.length === 0) return [];
    const { data: expenses } = await supabase
      .from('expenses')
      .select('category, amount')
      .in('transaction_id', txnIds);
    const totals: Record<string, number> = {};
    let grandTotal = 0;
    expenses?.forEach(e => {
      const cat = e.category || 'other';
      totals[cat] = (totals[cat] || 0) + Number(e.amount);
      grandTotal += Number(e.amount);
    });
    return Object.entries(totals).map(([category, amount]) => ({
      category,
      amount,
      percentage: grandTotal ? (amount / grandTotal) * 100 : 0,
      count: expenses?.filter(e => (e.category || 'other') === category).length || 0,
    }));
  },

  getPreviousPeriodDates(filters: DashboardFilters): { start: string; end: string } {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const prevStart = subDays(start, days);
    const prevEnd = subDays(start, 1);
    return {
      start: format(prevStart, 'yyyy-MM-dd'),
      end: format(prevEnd, 'yyyy-MM-dd'),
    };
  }
};
