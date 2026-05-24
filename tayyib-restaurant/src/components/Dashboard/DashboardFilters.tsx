import { useState } from 'react';
import type { DashboardFilters, GroupBy } from '../../types';
import Button from '../Common/Button';

interface Props {
  filters: DashboardFilters;
  onFiltersChange: (f: DashboardFilters) => void;
}

export default function DashboardFilters({ filters, onFiltersChange }: Props) {
  const [startDate, setStartDate] = useState(filters.startDate);
  const [endDate, setEndDate] = useState(filters.endDate);

  const apply = () => {
    onFiltersChange({ ...filters, startDate, endDate });
  };

  const presets = [
    { label: 'Today', start: new Date().toISOString().slice(0,10), end: new Date().toISOString().slice(0,10) },
    { label: 'This Week', start: getWeekStart(), end: new Date().toISOString().slice(0,10) },
    { label: 'This Month', start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10), end: new Date().toISOString().slice(0,10) },
    { label: 'This Quarter', start: getQuarterStart(), end: new Date().toISOString().slice(0,10) },
    { label: 'This Year', start: `${new Date().getFullYear()}-01-01`, end: new Date().toISOString().slice(0,10) },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="flex flex-wrap gap-2">
        {presets.map(p => (
          <button
            key={p.label}
            onClick={() => { setStartDate(p.start); setEndDate(p.end); }}
            className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm text-gray-600">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm text-gray-600">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Group By</label>
          <select
            value={filters.groupBy}
            onChange={e => onFiltersChange({ ...filters, groupBy: e.target.value as GroupBy })}
            className="border rounded px-2 py-1"
          >
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="quarter">Quarter</option>
            <option value="year">Year</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600">Compare</label>
          <select
            value={filters.compareWith || ''}
            onChange={e => onFiltersChange({ ...filters, compareWith: e.target.value === 'previous' ? 'previous' : undefined })}
            className="border rounded px-2 py-1"
          >
            <option value="">None</option>
            <option value="previous">Previous Period</option>
          </select>
        </div>
        <Button onClick={apply} size="sm">Apply</Button>
      </div>
    </div>
  );
}

function getWeekStart(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1);
  return d.toISOString().slice(0,10);
}
function getQuarterStart(): string {
  const d = new Date();
  const q = Math.floor(d.getMonth()/3);
  d.setMonth(q*3, 1);
  return d.toISOString().slice(0,10);
}
