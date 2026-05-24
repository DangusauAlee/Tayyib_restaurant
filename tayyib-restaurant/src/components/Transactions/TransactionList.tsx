import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useRestaurant } from '../../context/RestaurantContext';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import type { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatting';
import Button from '../Common/Button';

export default function TransactionList() {
  const { user } = useAuth();
  const { restaurantId } = useRestaurant();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('transaction_date', { ascending: false });
      if (user?.role !== 'MD') {
        query = query.eq('created_by', user?.id);
      }
      const { data } = await query;
      setTransactions(data as Transaction[]);
      setLoading(false);
    };
    fetch();
  }, [restaurantId, user]);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this transaction?')) {
      await supabase.from('transactions').delete().eq('id', id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Transactions</h2>
        {(user?.role === 'MD' || user?.role === 'Manager') && (
          <Link to="/transactions/new">
            <Button>+ New Transaction</Button>
          </Link>
        )}
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">POS Total</th>
              <th className="px-4 py-2">Meal Tickets</th>
              <th className="px-4 py-2">Cash Received</th>
              <th className="px-4 py-2">Total Spent</th>
              <th className="px-4 py-2">Balance</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-2">{formatDate(t.transaction_date)}</td>
                <td className="px-4 py-2">{formatCurrency(t.pos_total)}</td>
                <td className="px-4 py-2">{t.meal_tickets}</td>
                <td className="px-4 py-2">{formatCurrency(t.cash_received)}</td>
                <td className="px-4 py-2">{formatCurrency(t.total_spent)}</td>
                <td className="px-4 py-2">{formatCurrency(t.cash_balance)}</td>
                <td className="px-4 py-2 space-x-2">
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/transactions/${t.id}`)}>View</Button>
                  {(user?.role === 'MD' || user?.role === 'Manager') && (
                    <Button size="sm" variant="danger" onClick={() => handleDelete(t.id)}>Del</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
