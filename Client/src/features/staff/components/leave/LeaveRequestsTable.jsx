import React from 'react';
import {
  IconButton,
  Tooltip,
  Checkbox,
  Popover,
  FormControlLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import TableChartIcon from '@mui/icons-material/TableChart';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export const LeaveRequestsTable = ({
  searchTerm,
  setSearchTerm,
  setPage,
  selectedIds,
  handleBulkDelete,
  filterAnchorEl,
  setFilterAnchorEl,
  handleOpenAddModal,
  handleRefresh,
  handleExportExcel,
  handleExportPdf,
  visibleColumns,
  paginatedData,
  handleSelectAll,
  handleSelectRow,
  handleOpenEditModal,
  handleDeleteRow,
  rowsPerPage,
  setRowsPerPage,
  page,
  filteredData,
  toggleColumn
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.03)] p-2 sm:p-2.5">
      {/* Toolbar Header (Title + Search + Actions) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-gray-100">
        {/* Left: Table Title & Search input */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
          <h2 className="text-[17px] font-bold text-gray-800 shrink-0">Leave Requests</h2>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              className="w-full h-9 pl-3.5 pr-9 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#5d5fef] focus:ring-2 focus:ring-[#5d5fef]/15 transition-all"
            />
            <SearchIcon
              sx={{ fontSize: 18, color: '#94a3b8' }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>
        </div>

        {/* Right Toolbar Action Icons */}
        <div className="assigned-table-toolbar flex items-center gap-1.5 sm:gap-2 self-end md:self-auto">
          {selectedIds.length > 0 && (
            <Tooltip title={`Delete ${selectedIds.length} Selected`}>
              <IconButton
                size="small"
                onClick={handleBulkDelete}
                className="!bg-red-50 !text-red-600 hover:!bg-red-100"
                sx={{ width: 34, height: 34, borderRadius: '8px' }}
              >
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Show/Hide Column">
            <IconButton
              size="small"
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              sx={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                backgroundColor: '#22c55e',
                color: '#22c55e',
                '&:hover': { backgroundColor: '#e2e8f0' }
              }}
            >
              <FilterListIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Add Leave Request">
            <IconButton
              size="small"
              onClick={handleOpenAddModal}
              sx={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                backgroundColor: '#22c55e',
                color: '#10b981',
                '&:hover': { backgroundColor: '#16a34a' }
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Refresh">
            <IconButton
              size="small"
              onClick={handleRefresh}
              sx={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                backgroundColor: '#475569',
                color: '#475569',
                '&:hover': { backgroundColor: '#e2e8f0' }
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export to Excel">
            <IconButton
              className="toolbar-export-icon"
              size="small"
              onClick={handleExportExcel}
              sx={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                backgroundColor: '#0284c7',
                color: '#3b82f6',
                '&:hover': { backgroundColor: '#0369a1' }
              }}
            >
              <TableChartIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export to PDF">
            <IconButton
              className="toolbar-export-icon"
              size="small"
              onClick={handleExportPdf}
              sx={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                backgroundColor: '#ef4444',
                color: '#ef4444',
                '&:hover': { backgroundColor: '#dc2626' }
              }}
            >
              <PictureAsPdfIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Table Content */}
      <div className="w-full mt-2 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[860px]">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-bold text-gray-700 tracking-wider">
              {visibleColumns.select && (
                <th className="py-3 px-2.5 w-10">
                  <Checkbox
                    size="small"
                    checked={
                      paginatedData.length > 0 &&
                      paginatedData.every((row) => selectedIds.includes(row.id))
                    }
                    indeterminate={
                      selectedIds.length > 0 &&
                      !paginatedData.every((row) => selectedIds.includes(row.id))
                    }
                    onChange={handleSelectAll}
                    sx={{
                      color: '#cbd5e1',
                      '&.Mui-checked': { color: '#5d5fef' },
                      '&.MuiCheckbox-indeterminate': { color: '#5d5fef' }
                    }}
                  />
                </th>
              )}
              {visibleColumns.id && <th className="py-3 px-3">ID</th>}
              {visibleColumns.empId && <th className="py-3 px-3">Emp ID</th>}
              {visibleColumns.name && <th className="py-3 px-3">Name</th>}
              {visibleColumns.department && <th className="py-3 px-3">Department</th>}
              {visibleColumns.designation && <th className="py-3 px-3">Designation</th>}
              {visibleColumns.leaveType && <th className="py-3 px-3">Leave Type</th>}
              {visibleColumns.status && <th className="py-3 px-3">Status</th>}
              {visibleColumns.from && <th className="py-3 px-3">From</th>}
              {visibleColumns.to && <th className="py-3 px-3">To</th>}
              {visibleColumns.days && <th className="py-3 px-3">No of Days</th>}
              {visibleColumns.approvedBy && <th className="py-3 px-3">Approved By</th>}
              {visibleColumns.reason && <th className="py-3 px-3">Reason</th>}
              {visibleColumns.actions && <th className="py-3 px-3 text-right pr-4">Actions</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 text-sm">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={14} className="py-10 text-center text-gray-400 font-medium">
                  No leave requests found matching your search.
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const isSelected = selectedIds.includes(row.id);
                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isSelected ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    {visibleColumns.select && (
                      <td className="py-2.5 px-2.5">
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          onChange={() => handleSelectRow(row.id)}
                          sx={{
                            color: '#cbd5e1',
                            '&.Mui-checked': { color: '#5d5fef' }
                          }}
                        />
                      </td>
                    )}
                    {visibleColumns.id && (
                      <td className="py-2.5 px-3 text-gray-500 font-medium text-xs">#{row.id}</td>
                    )}
                    {visibleColumns.empId && (
                      <td className="py-2.5 px-3 text-gray-600 font-medium text-xs">{row.empId}</td>
                    )}
                    {visibleColumns.name && (
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={row.avatar}
                            alt={row.name}
                            className="w-8 h-8 rounded-full object-cover border border-gray-100 shrink-0"
                          />
                          <span className="font-semibold text-gray-800 text-[13.5px]">
                            {row.name}
                          </span>
                        </div>
                      </td>
                    )}
                    {visibleColumns.department && (
                      <td className="py-2.5 px-3 text-gray-600 text-[13.5px]">{row.department}</td>
                    )}
                    {visibleColumns.designation && (
                      <td className="py-2.5 px-3 text-gray-500 text-xs">{row.designation}</td>
                    )}
                    {visibleColumns.leaveType && (
                      <td className="py-2.5 px-3 text-gray-700 font-medium text-[13.5px]">
                        {row.leaveType}
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold tracking-wide ${
                            row.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : row.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    )}
                    {visibleColumns.from && (
                      <td className="py-2.5 px-3 text-gray-600 text-[13px]">
                        <div className="flex items-center gap-1.5">
                          <CalendarTodayIcon sx={{ fontSize: 14, color: '#1e293b' }} />
                          <span>{row.from}</span>
                        </div>
                      </td>
                    )}
                    {visibleColumns.to && (
                      <td className="py-2.5 px-3 text-gray-600 text-[13px]">
                        <div className="flex items-center gap-1.5">
                          <CalendarTodayIcon sx={{ fontSize: 14, color: '#1e293b' }} />
                          <span>{row.to}</span>
                        </div>
                      </td>
                    )}
                    {visibleColumns.days && (
                      <td className="py-2.5 px-3 text-gray-700 font-semibold text-[13.5px]">
                        {row.days}
                      </td>
                    )}
                    {visibleColumns.approvedBy && (
                      <td className="py-2.5 px-3 text-gray-600 text-[13px]">{row.approvedBy || '-'}</td>
                    )}
                    {visibleColumns.reason && (
                      <td className="py-2.5 px-3 text-gray-500 text-xs max-w-xs truncate">
                        {row.reason || '-'}
                      </td>
                    )}
                    {visibleColumns.actions && (
                      <td className="py-2.5 px-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditModal(row)}
                              sx={{ color: '#3b82f6', '&:hover': { backgroundColor: '#eff6ff' } }}
                            >
                              <EditIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteRow(row.id)}
                              sx={{ color: '#ef4444', '&:hover': { backgroundColor: '#fef2f2' } }}
                            >
                              <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-2 border-t border-gray-100 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span>Items per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
            className="h-8 px-2 bg-white border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:border-[#5d5fef]"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span>
            {filteredData.length === 0
              ? '0 – 0 of 0'
              : `${page * rowsPerPage + 1} – ${Math.min(
                  (page + 1) * rowsPerPage,
                  filteredData.length
                )} of ${filteredData.length}`}
          </span>

          <div className="flex items-center gap-1">
            <IconButton
              size="small"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              sx={{ borderRadius: '6px' }}
            >
              <ChevronLeftIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              disabled={(page + 1) * rowsPerPage >= filteredData.length}
              onClick={() => setPage((p) => p + 1)}
              sx={{ borderRadius: '6px' }}
            >
              <ChevronRightIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Show/Hide Column Popover */}
      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 2,
            width: 210,
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider pb-2 mb-2 border-b border-gray-100">
          Show/Hide Column
        </h4>
        <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto pr-1">
          {[
            { key: 'select', label: 'Select' },
            { key: 'id', label: 'ID' },
            { key: 'empId', label: 'Emp ID' },
            { key: 'name', label: 'Name' },
            { key: 'department', label: 'Department' },
            { key: 'designation', label: 'Designation' },
            { key: 'leaveType', label: 'Leave Type' },
            { key: 'status', label: 'Status' },
            { key: 'from', label: 'From' },
            { key: 'to', label: 'To' },
            { key: 'days', label: 'No of Days' },
            { key: 'approvedBy', label: 'Approved By' },
            { key: 'reason', label: 'Reason' }
          ].map((col) => (
            <FormControlLabel
              key={col.key}
              control={
                <Checkbox
                  size="small"
                  checked={visibleColumns[col.key]}
                  onChange={() => toggleColumn(col.key)}
                  sx={{
                    p: 0.5,
                    color: '#cbd5e1',
                    '&.Mui-checked': { color: '#5d5fef' }
                  }}
                />
              }
              label={<span className="text-xs font-medium text-gray-700">{col.label}</span>}
              sx={{ m: 0 }}
            />
          ))}
        </div>
      </Popover>
    </div>
  );
};
