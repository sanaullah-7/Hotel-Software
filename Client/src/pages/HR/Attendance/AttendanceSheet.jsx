import React, { useState } from 'react';
import { Chip, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import DataGridTable from '../../../components/tables/DataGridTable';
import { mockAttendance } from '../../../utils/mockData';

export default function AttendanceSheet() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredAttendance = mockAttendance.filter(att => {
    const matchesSearch = att.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          att.empId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter ? att.department === departmentFilter : true;
    const matchesStatus = statusFilter ? att.status === statusFilter : true;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const columns = [
    { label: 'Date', field: 'date' },
    { label: 'Employee ID', field: 'empId' },
    { label: 'Name', field: 'name' },
    { label: 'Department', field: 'department' },
    { label: 'Shift', field: 'shift', render: (row) => (
      <div>
        <div className="font-medium">{row.shift}</div>
        <div className="text-xs text-gray-500">{row.shiftTime}</div>
      </div>
    )},
    { label: 'Check In', field: 'checkIn' },
    { label: 'Check Out', field: 'checkOut' },
    { label: 'Working Hrs', field: 'workingHours' },
    { label: 'Status', field: 'status', render: (row) => (
      <Chip 
        label={row.status} 
        size="small"
        color={
          row.status === 'Present' ? 'success' : 
          row.status === 'On Leave' ? 'primary' : 
          row.status === 'Late' ? 'warning' : 'error'
        }
        className="font-medium"
      />
    )},
  ];

  return (
    <div className="p-px">
      <PageHeader title="Attendance Sheet" breadcrumb="Human Resources / Attendance Sheet" />

      <div className="bg-white rounded-xl shadow-sm p-px mt-6">
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
            <InputLabel>Department</InputLabel>
            <Select
              value={departmentFilter}
              label="Department"
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <MenuItem value="">All Departments</MenuItem>
              <MenuItem value="Management">Management</MenuItem>
              <MenuItem value="Front Office">Front Office</MenuItem>
              <MenuItem value="Housekeeping">Housekeeping</MenuItem>
              <MenuItem value="Kitchen">Kitchen</MenuItem>
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
              <MenuItem value="Present">Present</MenuItem>
              <MenuItem value="Absent">Absent</MenuItem>
              <MenuItem value="Late">Late</MenuItem>
              <MenuItem value="On Leave">On Leave</MenuItem>
            </Select>
          </FormControl>
        </div>

        {/* Table */}
        <DataGridTable columns={columns} data={filteredAttendance} />
      </div>
    </div>
  );
}
