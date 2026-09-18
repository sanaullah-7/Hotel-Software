import React from 'react';
import { Grid, Chip } from '@mui/material';
import { 
  Hotel as HotelIcon, 
  CheckCircle as OccupiedIcon, 
  EventAvailable as AvailableIcon, 
  Build as MaintenanceIcon 
} from '@mui/icons-material';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import StatSummaryCard from '../../components/common/StatSummaryCard';
import DataGridTable from '../../components/tables/DataGridTable';
import { mockOccupancy } from '../../utils/mockData';

export default function OccupancyReport() {
  const totalRooms = 150;
  const occupiedRooms = 85;
  const availableRooms = 55;
  const maintenanceRooms = 10;
  
  const occupancyData = [
    { name: 'Occupied', value: occupiedRooms, color: '#3b82f6' },
    { name: 'Available', value: availableRooms, color: '#10b981' },
    { name: 'Maintenance', value: maintenanceRooms, color: '#f59e0b' }
  ];

  const columns = [
    { label: 'Room No.', field: 'roomNumber' },
    { label: 'Room Type', field: 'roomType' },
    { label: 'Status', field: 'status', render: (row) => (
      <Chip 
        label={row.status} 
        size="small"
        color={
          row.status === 'Available' ? 'success' : 
          row.status === 'Occupied' ? 'primary' : 
          row.status === 'Reserved' ? 'info' : 'warning'
        }
        className="font-medium"
      />
    )},
    { label: 'Guest', field: 'guest' },
    { label: 'Check-in', field: 'checkIn' },
    { label: 'Check-out', field: 'checkOut' },
  ];

  return (
    <div className="p-6">
      <PageHeader title="Occupancy Report" breadcrumb="Reports / Occupancy Report" />

      {/* Summary Cards */}
      <Grid container spacing={4} className="mt-2 mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Total Rooms" value={totalRooms} icon={<HotelIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Occupied" value={occupiedRooms} icon={<OccupiedIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Available" value={availableRooms} icon={<AvailableIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Maintenance" value={maintenanceRooms} icon={<MaintenanceIcon />} />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Occupancy Chart */}
        <Grid item xs={12} md={4}>
          <div className="bg-white rounded-xl shadow-sm p-6 h-full flex flex-col items-center justify-center min-h-[400px]">
            <h3 className="text-lg font-bold text-gray-800 w-full mb-4 text-left border-b pb-2">Occupancy Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <span className="text-3xl font-bold text-gray-800">{Math.round((occupiedRooms / totalRooms) * 100)}%</span>
              <p className="text-gray-500">Occupancy Rate</p>
            </div>
          </div>
        </Grid>

        {/* Occupancy Table */}
        <Grid item xs={12} md={8}>
          <div className="bg-white rounded-xl shadow-sm p-6 h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Recent Room Status</h3>
            <DataGridTable columns={columns} data={mockOccupancy} />
          </div>
        </Grid>
      </Grid>
    </div>
  );
}
