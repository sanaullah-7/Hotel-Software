import React from 'react';
import { Grid, Chip } from '@mui/material';
import {
  Inventory as InventoryIcon,
  WarningAmber as LowStockIcon,
  AttachMoney as ValueIcon,
  AddCircle as AddedIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatSummaryCard from '../../../components/common/StatSummaryCard';
import DataGridTable from '../../../components/tables/DataGridTable';
import { mockStockItems, mockMonthlyStockLevels } from '../../../utils/mockData';

const COLORS = {
  linens: '#3b82f6',
  toiletries: '#8b5cf6',
  foodBeverage: '#f59e0b',
  maintenance: '#10b981',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3">
      <p className="font-semibold text-gray-800 text-sm mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: ${entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function StockReport() {
  const totalItems = mockStockItems.length;
  const lowStockItems = mockStockItems.filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock').length;
  const totalValue = mockStockItems.reduce((sum, item) => sum + item.totalValue, 0);
  const inStockItems = mockStockItems.filter(item => item.status === 'In Stock').length;

  const columns = [
    { label: 'Item Name', field: 'itemName', render: (row) => <span className="font-medium text-gray-800">{row.itemName}</span> },
    { label: 'Category', field: 'category', render: (row) => (
      <Chip label={row.category} size="small" variant="outlined"
        sx={{
          borderColor: row.category === 'Linens' ? '#3b82f6' : row.category === 'Toiletries' ? '#8b5cf6' : row.category === 'Food & Beverage' ? '#f59e0b' : '#10b981',
          color: row.category === 'Linens' ? '#3b82f6' : row.category === 'Toiletries' ? '#8b5cf6' : row.category === 'Food & Beverage' ? '#f59e0b' : '#10b981',
          fontWeight: 600, fontSize: '0.75rem'
        }}
      />
    )},
    { label: 'Quantity', field: 'quantity', render: (row) => <span className="font-semibold">{row.quantity}</span> },
    { label: 'Unit', field: 'unit' },
    { label: 'Unit Price', field: 'unitPrice', render: (row) => <span>${row.unitPrice.toFixed(2)}</span> },
    { label: 'Total Value', field: 'totalValue', render: (row) => <span className="font-bold text-gray-800">${row.totalValue.toLocaleString()}</span> },
    { label: 'Status', field: 'status', render: (row) => (
      <Chip
        label={row.status}
        size="small"
        sx={{
          fontWeight: 600, fontSize: '0.7rem',
          backgroundColor: row.status === 'In Stock' ? '#dcfce7' : row.status === 'Low Stock' ? '#fef3c7' : '#fee2e2',
          color: row.status === 'In Stock' ? '#166534' : row.status === 'Low Stock' ? '#92400e' : '#991b1b',
        }}
      />
    )},
    { label: 'Last Restocked', field: 'lastRestocked' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Total Items" value={totalItems} icon={<InventoryIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Low Stock Alert" value={lowStockItems} icon={<LowStockIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Total Value" value={`$${totalValue.toLocaleString()}`} icon={<ValueIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="In Stock Items" value={inStockItems} icon={<AddedIcon />} />
        </Grid>
      </Grid>

      {/* Bar Chart - Monthly Stock Levels */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Monthly Stock Levels by Category</h3>
        <p className="text-sm text-gray-500 mb-4">Stock value breakdown across categories over the past months</p>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockMonthlyStockLevels} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
              <Bar dataKey="linens" name="Linens" fill={COLORS.linens} radius={[4, 4, 0, 0]} />
              <Bar dataKey="toiletries" name="Toiletries" fill={COLORS.toiletries} radius={[4, 4, 0, 0]} />
              <Bar dataKey="foodBeverage" name="Food & Beverage" fill={COLORS.foodBeverage} radius={[4, 4, 0, 0]} />
              <Bar dataKey="maintenance" name="Maintenance" fill={COLORS.maintenance} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stock Items Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Stock Inventory</h3>
        <p className="text-sm text-gray-500 mb-4">Current inventory status of all stock items</p>
        <DataGridTable columns={columns} data={mockStockItems} />
      </div>
    </div>
  );
}
