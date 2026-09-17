import React, { useState } from 'react';
import { Button, Chip, IconButton, Menu, MenuItem, Grid, TextField, FormControl, InputLabel, Select } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TotalIcon from '@mui/icons-material/People';
import MoneyIcon from '@mui/icons-material/AttachMoney';
import PaidIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '../../../components/common/PageHeader';
import StatSummaryCard from '../../../components/common/StatSummaryCard';
import DataGridTable from '../../../components/tables/DataGridTable';
import { mockSalaries } from '../../../utils/mockData';

export default function EmployeeSalary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSalary, setSelectedSalary] = useState(null);

  const handleMenuClick = (event, salary) => {
    setAnchorEl(event.currentTarget);
    setSelectedSalary(salary);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSalary(null);
  };

  const filteredSalaries = mockSalaries.filter(sal => {
    const matchesSearch = sal.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sal.empId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? sal.paymentStatus === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalEmployees = mockSalaries.length;
  const totalMonthlySalary = mockSalaries.reduce((acc, curr) => acc + curr.netSalary, 0);
  const paidCount = mockSalaries.filter(s => s.paymentStatus === 'Paid').length;
  const pendingCount = mockSalaries.filter(s => s.paymentStatus === 'Pending').length;

  const columns = [
    { label: 'Emp ID', field: 'empId' },
    { label: 'Name', field: 'name' },
    { label: 'Department', field: 'department' },
    { label: 'Basic Salary', field: 'basicSalary', render: (row) => `$${row.basicSalary}` },
    { label: 'Net Salary', field: 'netSalary', render: (row) => <span className="font-bold text-gray-800">${row.netSalary}</span> },
    { label: 'Payment Date', field: 'paymentDate', render: (row) => row.paymentDate || '--' },
    { label: 'Status', field: 'paymentStatus', render: (row) => (
      <Chip 
        label={row.paymentStatus} 
        size="small"
        color={row.paymentStatus === 'Paid' ? 'success' : 'warning'}
        className="font-medium"
      />
    )},
    { label: 'Actions', field: 'actions', render: (row) => (
      <IconButton size="small" onClick={(e) => handleMenuClick(e, row)}>
        <MoreVertIcon fontSize="small" />
      </IconButton>
    )},
  ];

  return (
    <div className="p-px">
      <PageHeader title="Employee Salary" breadcrumb="Human Resources / Employee Salary" />

      {/* Summary Cards */}
      <Grid container spacing={4} className="mt-2 mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Total Employees" value={totalEmployees} icon={<TotalIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Total Salary" value={`$${totalMonthlySalary}`} icon={<MoneyIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Paid" value={paidCount} icon={<PaidIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Pending" value={pendingCount} icon={<PendingIcon />} />
        </Grid>
      </Grid>

      <div className="bg-white rounded-xl shadow-sm p-px">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <TextField
            size="small"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64"
            slotProps={{
              input: {
                startAdornment: <SearchIcon className="text-gray-400 mr-2" fontSize="small" />
              }
            }}
          />
          <FormControl size="small" className="w-full md:w-48">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
          </FormControl>
        </div>

        {/* Table */}
        <DataGridTable columns={columns} data={filteredSalaries} />
      </div>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Edit Salary</MenuItem>
        <MenuItem onClick={handleMenuClose} className="!text-green-600">Mark as Paid</MenuItem>
      </Menu>
    </div>
  );
}
