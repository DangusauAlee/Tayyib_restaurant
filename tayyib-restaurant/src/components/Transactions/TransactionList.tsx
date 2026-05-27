import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useRestaurant } from '../../context/RestaurantContext';
import { useAuthStore } from '../../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import type { Transaction, User } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatting';
import Button from '../Common/Button';

type UserSummary = Pick<User, 'id' | 'full_name' | 'role'>;

export default function TransactionList() {
  const user = useAuthStore((s) => s.user);
  const { restaurantId } = useRestaurant();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('');

  // Sorting
  const [sortField, setSortField] = useState<keyof Transaction>('transaction_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // ===== NO VIEW RESTRICTIONS – FETCH ALL TRANSACTIONS FOR THE RESTAURANT =====
  useEffect(() => {
    async function fetchData() {
      if (!restaurantId || !user) {
        setLoading(false);
        return;
      }
      setError(null);
      setLoading(true);

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('restaurant_id', restaurantId);

      // Only filter by a specific user if the MD (or any role) deliberately picks a user from the dropdown
      if (filterUser) {
        query = query.eq('created_by', filterUser);
      }

      if (startDate) query = query.gte('transaction_date', startDate);
      if (endDate) query = query.lte('transaction_date', endDate);

      if (searchTerm) {
        query = query.or(`notes.ilike.%${searchTerm}%,transaction_date.ilike.%${searchTerm}%`);
      }

      const { data, error: fetchError } = await query.order(sortField, {
        ascending: sortDir === 'asc',
      });

      if (fetchError) {
        setError('Failed to load transactions.');
        setTransactions([]);
      } else {
        setTransactions(data as Transaction[]);
      }
      setLoading(false);
    }
    fetchData();
  }, [restaurantId, user, startDate, endDate, searchTerm, filterUser, sortField, sortDir]);

  // Load all users for the filter dropdown
  useEffect(() => {
    supabase
      .from('users')
      .select('id, full_name, role')
      .then(({ data }) => {
        setAllUsers((data as UserSummary[]) || []);
      });
  }, []);

  // Delete handler – MD can delete any, Manager can delete only their own
  const handleDelete = async (id: string) => {
    if (confirm('Permanently delete this transaction?')) {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (!error) setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const toggleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const getUserName = (id: string) => {
    const u = allUsers.find((u) => u.id === id);
    return u ? u.full_name : id.slice(0, 8);
  };

  const getCreatorRole = (id: string) => {
    const u = allUsers.find((u) => u.id === id);
    return u ? u.role : undefined;
  };

  if (!restaurantId) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl shadow">
        <p className="text-gray-500">Your account is not linked to a restaurant.</p>
      </div>
    );
  }

  const columns = [
    { key: 'transaction_date', label: 'Date' },
    { key: 'type', label: 'Type' },
    { key: 'description', label: 'Description' },
    { key: 'total_spent', label: 'Total Spent' },
    { key: 'cash_balance', label: 'Balance' },
    { key: 'created_by', label: 'Entered By' },
    { key: 'actions', label: 'Actions' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-800">Transactions</h2>
        {(user?.role === 'MD' || user?.role === 'Manager') && (
          <Link to="/transactions/new">
            <Button>+ New {user?.role === 'MD' ? 'Expense' : 'Transaction'}</Button>
          </Link>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl shadow space-y-3">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search notes or date (YYYY-MM-DD)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">User</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
            >
              <option value="">All users</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl">{error}</div>}

      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-semibold text-gray-600 cursor-pointer select-none hover:bg-gray-100 transition-colors"
                  onClick={() =>
                    col.key !== 'actions' &&
                    col.key !== 'type' &&
                    col.key !== 'description' &&
                    toggleSort(col.key as keyof Transaction)
                  }
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortField === col.key && (
                      <span className="text-primary">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((t) => {
                const creatorRole = getCreatorRole(t.created_by);
                const isExpense = creatorRole === 'MD';

                return (
                  <tr key={t.id} className="border-t hover:bg-gray-50 transition-colors">
                    {columns.map((col) => {
                      if (col.key === 'actions') {
                        return (
                          <td key="actions" className="px-4 py-3 space-x-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => navigate(`/transactions/${t.id}`)}
                            >
                              View
                            </Button>
                            {(user?.role === 'MD' ||
                              (user?.role === 'Manager' && t.created_by === user.id)) && (
                              <Button size="sm" variant="danger" onClick={() => handleDelete(t.id)}>
                                Del
                              </Button>
                            )}
                          </td>
                        );
                      }
                      if (col.key === 'transaction_date')
                        return <td key={col.key} className="px-4 py-3">{formatDate(t.transaction_date)}</td>;
                      if (col.key === 'type')
                        return (
                          <td key={col.key} className="px-4 py-3">
                            {isExpense ? (
                              <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">Expense</span>
                            ) : (
                              <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">Transaction</span>
                            )}
                          </td>
                        );
                      if (col.key === 'description') {
                        if (isExpense) {
                          return <td key={col.key} className="px-4 py-3 max-w-[200px] truncate">{t.notes || '—'}</td>;
                        } else {
                          return (
                            <td key={col.key} className="px-4 py-3">
                              <div className="text-xs">
                                <span className="text-gray-500">POS:</span> {formatCurrency(t.pos_total)}{' '}
                                <span className="text-gray-500">Tickets:</span> {t.meal_tickets}
                              </div>
                            </td>
                          );
                        }
                      }
                      if (col.key === 'total_spent')
                        return <td key={col.key} className="px-4 py-3">{formatCurrency(t.total_spent)}</td>;
                      if (col.key === 'cash_balance')
                        return <td key={col.key} className="px-4 py-3">{formatCurrency(t.cash_balance)}</td>;
                      if (col.key === 'created_by')
                        return <td key={col.key} className="px-4 py-3 text-xs text-gray-500">{getUserName(t.created_by)}</td>;
                      return null;
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}