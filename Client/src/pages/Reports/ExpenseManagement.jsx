import React, { useState } from 'react';
import { Button, Chip, IconButton, Menu, MenuItem, Grid, TextField, FormControl, InputLabel, Select } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import TotalExpenseIcon from '@mui/icons-material/MoneyOff';
import MonthIcon from '@mui/icons-material/Event';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import PaidIcon from '@mui/icons-material/CheckCircle';
import PageHeader from '../../components/common/PageHeader';
import StatSummaryCard from '../../components/common/StatSummaryCard';
import DataGridTable from '../../components/tables/DataGridTable';
import { mockExpenses } from '../../utils/mockData';

export default function ExpenseManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const handleMenuClick = (event, expense) => {
    setAnchorEl(event.currentTarget);
    setSelectedExpense(expense);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedExpense(null);
  };

  const filteredExpenses = mockExpenses.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          exp.expenseId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter ? exp.category === categoryFilter : true;
    const matchesStatus = statusFilter ? exp.status === statusFilter : true;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const columns = [
    { label: 'Expense ID', field: 'expenseId' },
    { label: 'Title', field: 'title' },
    { label: 'Category', field: 'category' },
    { label: 'Amount', field: 'amount', render: (row) => <span className="font-bold text-gray-800">${row.amount}</span> },
    { label: 'Date', field: 'date' },
    { label: 'Payment Method', field: 'paymentMethod' },
    { label: 'Added By', field: 'addedBy' },
    { label: 'Status', field: 'status', render: (row) => (
      <Chip 
        label={row.status} 
        size="small"
        color={row.status === 'Paid' ? 'success' : 'warning'}
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Expense Management" breadcrumb="Reports / Expense Management" />
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          sx={{ backgroundColor: '#1b7f43', '&:hover': { backgroundColor: '#146635' } }}
          className="shadow-sm rounded-lg"
        >
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <Grid container spacing={4} className="mt-2 mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Total Expenses" value="$22,650" icon={<TotalExpenseIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="This Month" value="$4,200" icon={<MonthIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Pending" value="$800" icon={<PendingIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatSummaryCard title="Paid" value="$3,400" icon={<PaidIcon />} />
        </Grid>
      </Grid>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <TextField
            size="small"
            placeholder="Search expenses..."
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
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="Utilities">Utilities</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Supplies">Supplies</MenuItem>
              <MenuItem value="Salaries">Salaries</MenuItem>
            </Select>
          </FormControl>
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
        <DataGridTable columns={columns} data={filteredExpenses} />
      </div>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose}>View Receipt</MenuItem>
        <MenuItem onClick={handleMenuClose}>Edit Expense</MenuItem>
        <MenuItem onClick={handleMenuClose} className="!text-red-600">Delete</MenuItem>
      </Menu>
    </div>
  );
}
