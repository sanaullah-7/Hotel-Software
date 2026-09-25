import React from 'react';
import { IconButton, Tooltip, TextField, InputAdornment, Popover, MenuItem, Checkbox, FormControlLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import TableChartIcon from '@mui/icons-material/TableChart';
import FilterListIcon from '@mui/icons-material/FilterList';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

export default function LeaveHeader({
  searchQuery,
  setSearchQuery,
  onOpenAddModal,
  onRefresh,
  onExportPDF,
  onExportExcel,
  filterAnchorEl,
  setFilterAnchorEl,
  columnAnchorEl,
  setColumnAnchorEl,
  leaveTypeFilter,
  setLeaveTypeFilter,
  statusFilter,
  setStatusFilter,
  visibleColumns,
  setVisibleColumns,
  leaveTypes = [],
  statuses = []
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-bold text-gray-800">Leave Requests</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TextField
          size="small"
          placeholder="Search leave requests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" className="text-gray-400" />
              </InputAdornment>
            ),
          }}
          className="w-full sm:w-64"
        />

        <Tooltip title="Filter">
          <IconButton onClick={(e) => setFilterAnchorEl(e.currentTarget)} size="small" className="border border-gray-200">
            <FilterListIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Columns">
          <IconButton onClick={(e) => setColumnAnchorEl(e.currentTarget)} size="small" className="border border-gray-200">
            <TableChartIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Export PDF">
          <IconButton onClick={onExportPDF} size="small" className="border border-gray-200 text-red-600">
            <PictureAsPdfIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Refresh">
          <IconButton onClick={onRefresh} size="small" className="border border-gray-200">
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1b7f43] text-white text-xs font-semibold rounded-lg hover:bg-[#156334] transition-colors cursor-pointer"
        >
          <AddIcon fontSize="small" />
          <span>Apply Leave</span>
        </button>
      </div>

      {/* Filter Popover */}
      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ className: 'p-4 w-64 shadow-lg rounded-xl' }}
      >
        <h3 className="font-semibold text-sm mb-3 text-gray-700">Filter Requests</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Leave Type</label>
            <TextField
              select
              size="small"
              fullWidth
              value={leaveTypeFilter}
              onChange={(e) => setLeaveTypeFilter(e.target.value)}
            >
              <MenuItem value="All">All Types</MenuItem>
              {leaveTypes.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Status</label>
            <TextField
              select
              size="small"
              fullWidth
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              {statuses.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </div>
        </div>
      </Popover>

      {/* Column Visibility Popover */}
      <Popover
        open={Boolean(columnAnchorEl)}
        anchorEl={columnAnchorEl}
        onClose={() => setColumnAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ className: 'p-3 w-52 shadow-lg rounded-xl' }}
      >
        <h3 className="font-semibold text-xs mb-2 text-gray-700">Visible Columns</h3>
        <div className="flex flex-col space-y-1">
          {Object.keys(visibleColumns).map((col) => (
            <FormControlLabel
              key={col}
              control={
                <Checkbox
                  size="small"
                  checked={visibleColumns[col]}
                  onChange={(e) => setVisibleColumns({ ...visibleColumns, [col]: e.target.checked })}
                />
              }
              label={<span className="text-xs capitalize">{col}</span>}
            />
          ))}
        </div>
      </Popover>
    </div>
  );
}
