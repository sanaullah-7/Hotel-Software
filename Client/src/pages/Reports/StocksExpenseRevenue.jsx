import React from 'react';
import { Grid } from '@mui/material';
import { 
  Inventory as InventoryIcon, 
  TrendingDown as ExpenseIcon, 
  TrendingUp as RevenueIcon, 
  AccountBalance as NetIcon 
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import StatSummaryCard from '../../components/common/StatSummaryCard';

export default function StocksExpenseRevenue() {
  const chartData = [
    { name: 'Jan', expense: 4000, revenue: 5400 },
    { name: 'Feb', expense: 3000, revenue: 4398 },
    { name: 'Mar', expense: 2000, revenue: 8800 },
    { name: 'Apr', expense: 2780, revenue: 3908 },
    { name: 'May', expense: 1890, revenue: 4800 },
    { name: 'Jun', expense: 2390, revenue: 6800 },
  ];

  return (
    <div className="p-6">
      <PageHeader title="Stocks, Expense & Revenue" breadcrumb="Reports / Stocks, Expense & Revenue" />

      {/* Summary Cards */}
      <Grid container spacing={4} className="mt-2 mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Total Stock Value" value="$125,000" icon={<InventoryIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Total Expenses" value="$16,060" icon={<ExpenseIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Total Revenue" value="$34,106" icon={<RevenueIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Net Revenue" value="$18,046" icon={<NetIcon />} />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Revenue vs Expense Bar Chart */}
        <Grid item xs={12} md={6}>
          <div className="bg-white rounded-xl shadow-sm p-6 h-[400px]">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue & Expenses Overview</h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Legend iconType="circle" />
                <Bar dataKey="revenue" fill="#1b7f43" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Grid>

        {/* Trend Line Chart */}
        <Grid item xs={12} md={6}>
          <div className="bg-white rounded-xl shadow-sm p-6 h-[400px]">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Net Profit Trend</h3>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="revenue" stroke="#1b7f43" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Grid>
      </Grid>
    </div>
  );
}
