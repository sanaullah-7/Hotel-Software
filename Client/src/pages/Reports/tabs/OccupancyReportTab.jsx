import React from 'react';
import { Grid, Chip } from '@mui/material';
import {
  Hotel as HotelIcon,
  CheckCircle as OccupiedIcon,
  EventAvailable as AvailableIcon,
  Build as MaintenanceIcon
} from '@mui/icons-material';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import StatSummaryCard from '../../../components/common/StatSummaryCard';
import DataGridTable from '../../../components/tables/DataGridTable';
import { mockOccupancy, mockMonthlyOccupancyData } from '../../../utils/mockData';

const OCCUPANCY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3">
      <p className="font-semibold text-gray-800 text-sm mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-xs" style={{ color: entry.color || entry.stroke }}>
          {entry.name}: {entry.name === 'Occupancy Rate' ? `${entry.value}%` : entry.value}
        </p>
      ))}
    </div>
  );
};

export default function OccupancyReportTab() {
  const totalRooms = 150;
  const occupiedRooms = mockOccupancy.filter(r => r.status === 'Occupied').length;
  const availableRooms = mockOccupancy.filter(r => r.status === 'Available').length;
  const maintenanceRooms = mockOccupancy.filter(r => r.status === 'Maintenance').length;
  const reservedRooms = mockOccupancy.filter(r => r.status === 'Reserved').length;

  // For summary card use larger realistic numbers
  const summaryOccupied = 85;
  const summaryAvailable = 55;
  const summaryMaintenance = 10;

  const occupancyPieData = [
    { name: 'Occupied', value: summaryOccupied },
    { name: 'Available', value: summaryAvailable },
    { name: 'Reserved', value: totalRooms - summaryOccupied - summaryAvailable - summaryMaintenance },
    { name: 'Maintenance', value: summaryMaintenance },
  ].filter(d => d.value > 0);

  const occupancyRate = Math.round((summaryOccupied / totalRooms) * 100);

  const columns = [
    { label: 'Room No.', field: 'roomNumber', render: (row) => <span className="font-semibold text-gray-800">{row.roomNumber}</span> },
    { label: 'Room Type', field: 'roomType', render: (row) => (
      <Chip label={row.roomType} size="small" variant="outlined"
        sx={{
          borderColor: row.roomType === 'Suite' ? '#8b5cf6' : row.roomType === 'Deluxe' ? '#f59e0b' : '#64748b',
          color: row.roomType === 'Suite' ? '#8b5cf6' : row.roomType === 'Deluxe' ? '#f59e0b' : '#64748b',
          fontWeight: 600, fontSize: '0.7rem'
        }}
      />
    )},
    { label: 'Status', field: 'status', render: (row) => (
      <Chip
        label={row.status}
        size="small"
        sx={{
          fontWeight: 600, fontSize: '0.7rem',
          backgroundColor:
            row.status === 'Available' ? '#dcfce7' :
            row.status === 'Occupied' ? '#dbeafe' :
            row.status === 'Reserved' ? '#e0e7ff' : '#fef3c7',
          color:
            row.status === 'Available' ? '#166534' :
            row.status === 'Occupied' ? '#1e40af' :
            row.status === 'Reserved' ? '#3730a3' : '#92400e',
        }}
      />
    )},
    { label: 'Guest', field: 'guest' },
    { label: 'Check-in', field: 'checkIn' },
    { label: 'Check-out', field: 'checkOut' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Total Rooms" value={totalRooms} icon={<HotelIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Occupied" value={summaryOccupied} icon={<OccupiedIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Available" value={summaryAvailable} icon={<AvailableIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Maintenance" value={summaryMaintenance} icon={<MaintenanceIcon />} />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3}>
        {/* Donut Chart */}
        <Grid item xs={12} md={5}>
          <div className="bg-white rounded-xl shadow-sm p-6 h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Occupancy Breakdown</h3>
            <p className="text-sm text-gray-500 mb-2">Current room status distribution</p>
            <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] relative">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={occupancyPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {occupancyPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={OCCUPANCY_COLORS[index % OCCUPANCY_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value, name) => [`${value} rooms`, name]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Percentage */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+20px)] text-center">
                <span className="text-3xl font-bold text-gray-800">{occupancyRate}%</span>
                <p className="text-xs text-gray-500 mt-0.5">Occupancy</p>
              </div>
            </div>
          </div>
        </Grid>

        {/* Line Chart - Monthly Trend */}
        <Grid item xs={12} md={7}>
          <div className="bg-white rounded-xl shadow-sm p-6 h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Monthly Occupancy Rate Trend</h3>
            <p className="text-sm text-gray-500 mb-2">Occupancy rate percentage over months</p>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockMonthlyOccupancyData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                  <Line type="monotone" dataKey="occupancyRate" name="Occupancy Rate" stroke="#1b7f43" strokeWidth={3} dot={{ r: 5, fill: '#1b7f43', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 7, stroke: '#1b7f43', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Grid>
      </Grid>

      {/* Room Status Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Room Status Details</h3>
        <p className="text-sm text-gray-500 mb-4">Current status of all rooms</p>
        <DataGridTable columns={columns} data={mockOccupancy} />
      </div>
    </div>
  );
}
