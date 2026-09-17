import React, { useState } from 'react';
import { Grid, TextField } from '@mui/material';
import {
  TrendingUp as RevenueIcon,
  TrendingDown as ExpenseIcon,
  AccountBalance as NetIcon
} from '@mui/icons-material';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import StatSummaryCard from '../../../components/common/StatSummaryCard';
import DataGridTable from '../../../components/tables/DataGridTable';
import { mockExpenseVsRevenueData } from '../../../utils/mockData';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3">
      <p className="font-semibold text-gray-800 text-sm mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-xs" style={{ color: entry.color || entry.stroke }}>
          {entry.name}: ${entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function ExpenseVsRevenueTab() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const totalRevenue = mockExpenseVsRevenueData.reduce((sum, m) => sum + m.revenue, 0);
  const totalExpense = mockExpenseVsRevenueData.reduce((sum, m) => sum + m.expense, 0);
  const netProfit = totalRevenue - totalExpense;

  const columns = [
    { label: 'Month', field: 'name', render: (row) => <span className="font-semibold text-gray-800">{row.name}</span> },
    { label: 'Revenue', field: 'revenue', render: (row) => <span className="font-medium text-emerald-600">${row.revenue.toLocaleString()}</span> },
    { label: 'Expense', field: 'expense', render: (row) => <span className="font-medium text-red-500">${row.expense.toLocaleString()}</span> },
    { label: 'Net Profit', field: 'netProfit', render: (row) => (
      <span className={`font-bold ${row.netProfit >= 0 ? 'text-[#1b7f43]' : 'text-red-600'}`}>
        ${row.netProfit.toLocaleString()}
      </span>
    )},
    { label: 'Profit Margin', field: 'profitMargin', render: (row) => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all" 
            style={{ 
              width: `${Math.min(row.profitMargin, 100)}%`, 
              backgroundColor: row.profitMargin >= 40 ? '#1b7f43' : row.profitMargin >= 30 ? '#f59e0b' : '#ef4444' 
            }} 
          />
        </div>
        <span className="font-semibold text-gray-700 text-sm">{row.profitMargin}%</span>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      {/* Header with Date Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Expense vs Revenue Comparison</h3>
          <p className="text-sm text-gray-500">Compare expense and revenue trends over time</p>
        </div>
        <div className="flex gap-3">
          <TextField
            size="small"
            type="date"
            label="From"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
          <TextField
            size="small"
            type="date"
            label="To"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatSummaryCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={<RevenueIcon />} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatSummaryCard title="Total Expenses" value={`$${totalExpense.toLocaleString()}`} icon={<ExpenseIcon />} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatSummaryCard title="Net Profit" value={`$${netProfit.toLocaleString()}`} icon={<NetIcon />} />
        </Grid>
      </Grid>

      {/* Dual Area Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Revenue vs Expense Trend</h3>
        <p className="text-sm text-gray-500 mb-4">Monthly overlay of revenue and expenses</p>
        <div className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockExpenseVsRevenueData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenueEVR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1b7f43" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#1b7f43" stopOpacity={0.02}/>
                </linearGradient>
                <linearGradient id="colorExpenseEVR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#1b7f43" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueEVR)" dot={{ r: 4, fill: '#1b7f43' }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenseEVR)" dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart - Side by Side Comparison */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Monthly Comparison</h3>
        <p className="text-sm text-gray-500 mb-4">Revenue vs Expense side by side per month</p>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockExpenseVsRevenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
              <Bar dataKey="revenue" name="Revenue" fill="#1b7f43" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Detailed Comparison</h3>
        <p className="text-sm text-gray-500 mb-4">Monthly breakdown with profit margins</p>
        <DataGridTable columns={columns} data={mockExpenseVsRevenueData} />
      </div>
    </div>
  );
}
