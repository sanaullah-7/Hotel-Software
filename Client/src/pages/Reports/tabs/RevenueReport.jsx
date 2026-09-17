import React from 'react';
import { Grid } from '@mui/material';
import {
  TrendingUp as RevenueIcon,
  CalendarMonth as MonthIcon,
  BookOnline as BookingIcon,
  ShowChart as GrowthIcon
} from '@mui/icons-material';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import StatSummaryCard from '../../../components/common/StatSummaryCard';
import DataGridTable from '../../../components/tables/DataGridTable';
import { mockRevenueData } from '../../../utils/mockData';

const COLORS = {
  rooms: '#1b7f43',
  foodBeverage: '#3b82f6',
  spa: '#8b5cf6',
  events: '#f59e0b',
  other: '#64748b',
};

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

export default function RevenueReport() {
  const totalRevenue = mockRevenueData.reduce((sum, m) => sum + m.total, 0);
  const thisMonth = mockRevenueData[mockRevenueData.length - 1]?.total || 0;
  const totalBookings = mockRevenueData.length * 145; // simulated
  const avgPerBooking = Math.round(totalRevenue / totalBookings);

  // Calculate growth
  const lastMonth = mockRevenueData[mockRevenueData.length - 2]?.total || 0;
  const growth = lastMonth > 0 ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1) : 0;

  const columns = [
    { label: 'Month', field: 'name', render: (row) => <span className="font-semibold text-gray-800">{row.name}</span> },
    { label: 'Room Revenue', field: 'rooms', render: (row) => <span className="text-gray-700">${row.rooms.toLocaleString()}</span> },
    { label: 'F&B Revenue', field: 'foodBeverage', render: (row) => <span className="text-gray-700">${row.foodBeverage.toLocaleString()}</span> },
    { label: 'Spa Revenue', field: 'spa', render: (row) => <span className="text-gray-700">${row.spa.toLocaleString()}</span> },
    { label: 'Events', field: 'events', render: (row) => <span className="text-gray-700">${row.events.toLocaleString()}</span> },
    { label: 'Other', field: 'other', render: (row) => <span className="text-gray-700">${row.other.toLocaleString()}</span> },
    { label: 'Total', field: 'total', render: (row) => <span className="font-bold text-[#1b7f43]">${row.total.toLocaleString()}</span> },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={<RevenueIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="This Month" value={`$${thisMonth.toLocaleString()}`} icon={<MonthIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Avg Per Booking" value={`$${avgPerBooking}`} icon={<BookingIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Revenue Growth" value={`${growth > 0 ? '+' : ''}${growth}%`} icon={<GrowthIcon />} />
        </Grid>
      </Grid>

      {/* Area Chart - Monthly Revenue Trend */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Monthly Revenue Trend</h3>
        <p className="text-sm text-gray-500 mb-4">Total revenue performance across months</p>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockRevenueData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1b7f43" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#1b7f43" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" name="Total Revenue" stroke="#1b7f43" strokeWidth={3} fillOpacity={1} fill="url(#colorRevTotal)" dot={{ r: 4, fill: '#1b7f43' }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stacked Bar Chart - Revenue by Source */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Revenue by Source</h3>
        <p className="text-sm text-gray-500 mb-4">Breakdown of revenue streams per month</p>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockRevenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
              <Bar dataKey="rooms" name="Rooms" fill={COLORS.rooms} stackId="a" />
              <Bar dataKey="foodBeverage" name="Food & Beverage" fill={COLORS.foodBeverage} stackId="a" />
              <Bar dataKey="spa" name="Spa/Wellness" fill={COLORS.spa} stackId="a" />
              <Bar dataKey="events" name="Events" fill={COLORS.events} stackId="a" />
              <Bar dataKey="other" name="Other" fill={COLORS.other} stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Revenue Details</h3>
        <p className="text-sm text-gray-500 mb-4">Monthly revenue breakdown by source</p>
        <DataGridTable columns={columns} data={mockRevenueData} />
      </div>
    </div>
  );
}
