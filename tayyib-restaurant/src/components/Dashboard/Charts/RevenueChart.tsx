import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { DailyDataPoint, GroupBy } from '../../../types';
import { formatPeriod } from '../../../utils/formatting';

interface Props {
  data: DailyDataPoint[];
  groupBy: GroupBy;
}

export default function RevenueChart({ data, groupBy }: Props) {
  const formatted = data.map(d => ({ ...d, label: formatPeriod(d.period, groupBy) }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis />
        <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#800020" strokeWidth={2} name="Revenue" />
        <Line type="monotone" dataKey="expenses" stroke="#d32f2f" strokeWidth={2} name="Expenses" />
        <Line type="monotone" dataKey="profit" stroke="#388e3c" strokeWidth={2} name="Profit" />
      </LineChart>
    </ResponsiveContainer>
  );
}
