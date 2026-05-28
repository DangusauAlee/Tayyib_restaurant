import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import type { Transaction, PurchaseItem, Expense } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatting';
import Button from '../Common/Button';

type TransactionWithRelations = Transaction & {
  purchase_items: PurchaseItem[];
  expenses: Expense[];
};

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const [txn, setTxn] = useState<TransactionWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, purchase_items(*), expenses(*)')
        .eq('id', id)
        .single();

      if (!error && data) {
        setTxn(data as TransactionWithRelations);
      }
      setLoading(false);
    }
    fetch();
  }, [id]);

  if (loading) return <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!txn) return <div className="p-8 text-center">Transaction not found.</div>;

  const items = txn.purchase_items || [];
  const expenses = txn.expenses || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Transaction Details</h2>
        <Link to="/transactions"><Button variant="secondary">Back to List</Button></Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow grid grid-cols-2 md:grid-cols-4 gap-4">
        <div><span className="text-gray-500">Date:</span> {formatDate(txn.transaction_date)}</div>
        <div><span className="text-gray-500">POS Total:</span> {formatCurrency(txn.pos_total)}</div>
        <div><span className="text-gray-500">Meal Tickets:</span> {txn.meal_tickets}</div>
        <div><span className="text-gray-500">Cash Received:</span> {formatCurrency(txn.cash_received)}</div>
        <div><span className="text-gray-500">Previous Balance:</span> {formatCurrency(txn.previous_balance)}</div>
        <div><span className="text-gray-500">Total Spent:</span> {formatCurrency(txn.total_spent)}</div>
        <div><span className="text-gray-500">Cash Balance:</span> {formatCurrency(txn.cash_balance)}</div>
        {txn.notes && <div className="col-span-2"><span className="text-gray-500">Notes:</span> {txn.notes}</div>}
      </div>

      {items.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Purchase Items</h3>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-1">Item</th>
                <th className="px-2 py-1">Qty</th>
                <th className="px-2 py-1">Unit</th>
                <th className="px-2 py-1">Price</th>
                <th className="px-2 py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-2 py-1">{item.item_name}</td>
                  <td className="px-2 py-1">{item.quantity}</td>
                  <td className="px-2 py-1">{item.unit}</td>
                  <td className="px-2 py-1">{formatCurrency(item.unit_price)}</td>
                  <td className="px-2 py-1">{formatCurrency(item.total_price!)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {expenses.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Expenses</h3>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-1">Description</th>
                <th className="px-2 py-1">Category</th>
                <th className="px-2 py-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((ex, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-2 py-1">{ex.description}</td>
                  <td className="px-2 py-1">{ex.category}</td>
                  <td className="px-2 py-1">{formatCurrency(ex.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}