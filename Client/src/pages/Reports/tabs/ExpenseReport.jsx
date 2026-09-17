import React from 'react';
import { Grid, Chip } from '@mui/material';
import {
  MoneyOff as TotalExpenseIcon,
  Event as MonthIcon,
  CalendarToday as DailyIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import StatSummaryCard from '../../../components/common/StatSummaryCard';
import DataGridTable from '../../../components/tables/DataGridTable';
import { mockExpenses, mockMonthlyExpenseData } from '../../../utils/mockData';

const CATEGORY_COLORS = {
  'Utilities': '#3b82f6',
  'Maintenance': '#f59e0b',
  'Salaries': '#8b5cf6',
  'Supplies': '#10b981',
  'Food & Beverage': '#ef4444',
};

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3">
      <p className="font-semibold text-gray-800 text-sm mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-xs" style={{ color: entry.color || entry.payload?.fill }}>
          {entry.name}: ${entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function ExpenseReport() {
  const totalExpenses = mockMonthlyExpenseData.reduce((sum, m) => sum + m.total, 0);
  const thisMonth = mockMonthlyExpenseData[mockMonthlyExpenseData.length - 1]?.total || 0;
  const avgDaily = Math.round(thisMonth / 30);

  // Category breakdown for pie chart
  const categoryTotals = mockMonthlyExpenseData.reduce((acc, month) => {
    acc.utilities += month.utilities;
    acc.maintenance += month.maintenance;
    acc.salaries += month.salaries;
    acc.supplies += month.supplies;
    acc.foodBeverage += month.foodBeverage;
    return acc;
  }, { utilities: 0, maintenance: 0, salaries: 0, supplies: 0, foodBeverage: 0 });

  const pieData = [
    { name: 'Utilities', value: categoryTotals.utilities },
    { name: 'Maintenance', value: categoryTotals.maintenance },
    { name: 'Salaries', value: categoryTotals.salaries },
    { name: 'Supplies', value: categoryTotals.supplies },
    { name: 'Food & Beverage', value: categoryTotals.foodBeverage },
  ];

  const highestCategory = pieData.reduce((max, cat) => cat.value > max.value ? cat : max, pieData[0]);

  const columns = [
    { label: 'Expense ID', field: 'expenseId', render: (row) => <span className="font-medium text-gray-700">{row.expenseId}</span> },
    { label: 'Title', field: 'title', render: (row) => <span className="font-medium text-gray-800">{row.title}</span> },
    { label: 'Category', field: 'category', render: (row) => (
      <Chip label={row.category} size="small" variant="outlined"
        sx={{
          borderColor: CATEGORY_COLORS[row.category] || '#9ca3af',
          color: CATEGORY_COLORS[row.category] || '#9ca3af',
          fontWeight: 600, fontSize: '0.7rem'
        }}
      />
    )},
    { label: 'Amount', field: 'amount', render: (row) => <span className="font-bold text-gray-800">${row.amount.toLocaleString()}</span> },
    { label: 'Date', field: 'date' },
    { label: 'Payment Method', field: 'paymentMethod' },
    { label: 'Added By', field: 'addedBy' },
    { label: 'Status', field: 'status', render: (row) => (
      <Chip
        label={row.status}
        size="small"
        sx={{
          fontWeight: 600, fontSize: '0.7rem',
          backgroundColor: row.status === 'Paid' ? '#dcfce7' : '#fef3c7',
          color: row.status === 'Paid' ? '#166534' : '#92400e',
        }}
      />
    )},
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Total Expenses" value={`$${totalExpenses.toLocaleString()}`} icon={<TotalExpenseIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="This Month" value={`$${thisMonth.toLocaleString()}`} icon={<MonthIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Average Daily" value={`$${avgDaily.toLocaleString()}`} icon={<DailyIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Highest Category" value={highestCategory.name} icon={<CategoryIcon />} />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3}>
        {/* Donut Chart */}
        <Grid item xs={12} md={5}>
          <div className="bg-white rounded-xl shadow-sm p-6 h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Expense by Category</h3>
            <p className="text-sm text-gray-500 mb-2">Distribution of expenses across categories</p>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value) => `$${value.toLocaleString()}`}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Grid>

        {/* Monthly Expense Bar Chart */}
        <Grid item xs={12} md={7}>
          <div className="bg-white rounded-xl shadow-sm p-6 h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Monthly Expense Breakdown</h3>
            <p className="text-sm text-gray-500 mb-2">Total expenses per month</p>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockMonthlyExpenseData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                  <Bar dataKey="utilities" name="Utilities" fill="#3b82f6" stackId="a" />
                  <Bar dataKey="maintenance" name="Maintenance" fill="#f59e0b" stackId="a" />
                  <Bar dataKey="salaries" name="Salaries" fill="#8b5cf6" stackId="a" />
                  <Bar dataKey="supplies" name="Supplies" fill="#10b981" stackId="a" />
                  <Bar dataKey="foodBeverage" name="Food & Beverage" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Grid>
      </Grid>

      {/* Expense Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">All Expenses</h3>
        <p className="text-sm text-gray-500 mb-4">Complete list of recorded expenses</p>
        <DataGridTable columns={columns} data={mockExpenses} />
      </div>
    </div>
  );
}
