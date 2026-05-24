import { useForm, useFieldArray } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../Common/Button';
import type { PurchaseItem, Expense, UnitType } from '../../types';

interface FormData {
  transaction_date: string;
  pos_total: number;
  meal_tickets: number;
  cash_received: number;
  previous_balance: number;
  notes: string;
  purchase_items: PurchaseItem[];
  expenses: Expense[];
}

const UNITS: UnitType[] = ['pieces', 'kg', 'carton', 'dozen', 'pack'];

export default function TransactionForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { register, control, handleSubmit, watch } = useForm<FormData>({
    defaultValues: {
      transaction_date: new Date().toISOString().slice(0, 10),
      pos_total: 0,
      meal_tickets: 0,
      cash_received: 0,
      previous_balance: 0,
      notes: '',
      purchase_items: [{ item_name: '', quantity: 0, unit: 'pieces', unit_price: 0 }],
      expenses: [{ description: '', amount: 0, category: 'supplies' }],
    },
  });

  const { fields: itemFields, append: addItem, remove: removeItem } = useFieldArray({ control, name: 'purchase_items' });
  const { fields: expenseFields, append: addExpense, remove: removeExpense } = useFieldArray({ control, name: 'expenses' });

  const purchaseTotal = watch('purchase_items').reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_price || 0)), 0);
  const expenseTotal = watch('expenses').reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const totalSpent = purchaseTotal + expenseTotal;

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    try {
      const { data: txn, error } = await supabase
        .from('transactions')
        .insert({
          restaurant_id: user.restaurant_id,
          transaction_date: data.transaction_date,
          pos_total: data.pos_total,
          meal_tickets: data.meal_tickets,
          cash_received: data.cash_received,
          previous_balance: data.previous_balance,
          total_spent: totalSpent,
          notes: data.notes,
          created_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;

      const items = data.purchase_items
        .filter(i => i.item_name)
        .map(i => ({
          transaction_id: txn.id,
          item_name: i.item_name,
          quantity: i.quantity,
          unit: i.unit,
          unit_price: i.unit_price,
          total_price: i.quantity * i.unit_price,
        }));
      if (items.length > 0) await supabase.from('purchase_items').insert(items);

      const expenses = data.expenses
        .filter(e => e.description)
        .map(e => ({
          transaction_id: txn.id,
          description: e.description,
          amount: e.amount,
          category: e.category,
        }));
      if (expenses.length > 0) await supabase.from('expenses').insert(expenses);

      toast.success('Transaction saved!');
      navigate('/transactions');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">New Transaction</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm">Date</label>
            <input type="date" {...register('transaction_date', { required: true })} className="border rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="block text-sm">POS Total</label>
            <input type="number" step="0.01" {...register('pos_total', { valueAsNumber: true, required: true })} className="border rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="block text-sm">Meal Tickets</label>
            <input type="number" {...register('meal_tickets', { valueAsNumber: true })} className="border rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="block text-sm">Cash Received</label>
            <input type="number" step="0.01" {...register('cash_received', { valueAsNumber: true })} className="border rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="block text-sm">Previous Balance</label>
            <input type="number" step="0.01" {...register('previous_balance', { valueAsNumber: true })} className="border rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="block text-sm">Notes</label>
            <input {...register('notes')} className="border rounded px-2 py-1 w-full" />
          </div>
        </div>

        <div>
          <h3 className="font-semibold">Purchase Items</h3>
          {itemFields.map((field, index) => (
            <div key={field.id} className="flex flex-wrap gap-2 mb-2 items-end">
              <input {...register(`purchase_items.${index}.item_name`, { required: true })} placeholder="Item name" className="border rounded px-2 py-1 flex-1 min-w-[120px]" />
              <input type="number" step="0.001" {...register(`purchase_items.${index}.quantity`, { valueAsNumber: true, required: true })} placeholder="Qty" className="border rounded px-2 py-1 w-20" />
              <select {...register(`purchase_items.${index}.unit`)} className="border rounded px-2 py-1">
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <input type="number" step="0.01" {...register(`purchase_items.${index}.unit_price`, { valueAsNumber: true, required: true })} placeholder="Price" className="border rounded px-2 py-1 w-24" />
              <span className="text-sm text-gray-600">Total: ₦{((field.quantity || 0) * (field.unit_price || 0)).toFixed(2)}</span>
              <button type="button" onClick={() => removeItem(index)} className="text-red-500">&times;</button>
            </div>
          ))}
          <button type="button" onClick={() => addItem({ item_name: '', quantity: 0, unit: 'pieces', unit_price: 0 })} className="text-primary text-sm hover:underline">+ Add Item</button>
        </div>

        <div>
          <h3 className="font-semibold">Expenses</h3>
          {expenseFields.map((field, index) => (
            <div key={field.id} className="flex flex-wrap gap-2 mb-2 items-end">
              <input {...register(`expenses.${index}.description`, { required: true })} placeholder="Description" className="border rounded px-2 py-1 flex-1" />
              <input type="number" step="0.01" {...register(`expenses.${index}.amount`, { valueAsNumber: true, required: true })} placeholder="Amount" className="border rounded px-2 py-1 w-24" />
              <select {...register(`expenses.${index}.category`)} className="border rounded px-2 py-1">
                <option value="supplies">Supplies</option>
                <option value="utilities">Utilities</option>
                <option value="maintenance">Maintenance</option>
                <option value="staff">Staff</option>
                <option value="other">Other</option>
              </select>
              <button type="button" onClick={() => removeExpense(index)} className="text-red-500">&times;</button>
            </div>
          ))}
          <button type="button" onClick={() => addExpense({ description: '', amount: 0, category: 'supplies' })} className="text-primary text-sm hover:underline">+ Add Expense</button>
        </div>

        <div className="text-right font-bold">Total Spent: ₦{totalSpent.toFixed(2)}</div>
        <Button type="submit" className="w-full">Save Transaction</Button>
      </form>
    </div>
  );
}
