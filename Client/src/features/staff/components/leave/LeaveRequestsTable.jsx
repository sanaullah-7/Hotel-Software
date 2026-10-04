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
import AddCircleIcon from "@mui/icons-material/AddCircle";
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
    <div className="bg-white rounded-[6px] border border-gray-100 shadow-sm p-2 sm:p-2.5 mt-1.5">
      {/* Toolbar Header (Title + Search + Actions) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-gray-100">
        {/* Left: Table Title & Search input */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full md:w-auto">
          <h2 className="text-sm font-bold text-gray-800 shrink-0">Leave Requests</h2>
          <div className="relative w-full sm:w-56">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              className="w-full h-[28px] pl-3 pr-8 text-xs text-gray-700 bg-white border border-gray-200 rounded focus:outline-none focus:border-[#5d5fef] transition-all"
            />
            <SearchIcon
              sx={{ fontSize: 16, color: '#94a3b8' }}
              className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>
        </div>

        {/* Right Toolbar Action Icons */}
        <div className="assigned-table-toolbar flex items-center gap-1 sm:gap-1.5 self-end md:self-auto">
          {selectedIds.length > 0 && (
            <Tooltip title={`Delete ${selectedIds.length} Selected`}>
              <IconButton
                size="small"
                onClick={handleBulkDelete}
                className="!bg-red-50 !text-red-600 hover:!bg-red-100"
                sx={{ width: 28, height: 28, borderRadius: '6px' }}
              >
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Filter Columns">
            <IconButton
              size="small"
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              sx={{
                color: "#1b7f43",
                padding: "4px",
                "&:hover": { backgroundColor: "#f0fdf4" }
              }}
            >
              <FilterListIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Apply Leave">
            <IconButton
              size="small"
              onClick={handleOpenAddModal}
              sx={{
                color: "#1b7f43",
                padding: "4px",
                "&:hover": { backgroundColor: "#f0fdf4" }
              }}
            >
              <AddCircleIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Refresh">
            <IconButton
              size="small"
              onClick={handleRefresh}
              sx={{
                color: "#1b7f43",
                padding: "4px",
                "&:hover": { backgroundColor: "#f0fdf4" }
              }}
            >
              <RefreshIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export to Excel">
            <IconButton
              size="small"
              onClick={handleExportExcel}
              sx={{
                color: "#0284c7",
                padding: "4px",
                "&:hover": { backgroundColor: "#f0f9ff" }
              }}
            >
              <TableChartIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export to PDF">
            <IconButton
              size="small"
              onClick={handleExportPdf}
              sx={{
                color: "#ef4444",
                padding: "4px",
                "&:hover": { backgroundColor: "#fef2f2" }
              }}
            >
              <PictureAsPdfIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Table Content */}
      <div className="w-full mt-2 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[860px]">
          <thead>
            <tr className="border-b border-gray-100 bg-slate-50/80 text-[10.5px] font-bold text-gray-700 tracking-wide uppercase">
              {visibleColumns.select && (
                <th className="py-2 px-2.5 w-10">
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
                      '&.MuiCheckbox-indeterminate': { color: '#5d5fef' },
                      padding: 0
                    }}
                  />
                </th>
              )}
              {visibleColumns.id && <th className="py-2 px-2.5">ID</th>}
              {visibleColumns.empId && <th className="py-2 px-2.5">Emp ID</th>}
              {visibleColumns.name && <th className="py-2 px-2.5">Name</th>}
              {visibleColumns.department && <th className="py-2 px-2.5">Department</th>}
              {visibleColumns.designation && <th className="py-2 px-2.5">Designation</th>}
              {visibleColumns.leaveType && <th className="py-2 px-2.5">Leave Type</th>}
              {visibleColumns.status && <th className="py-2 px-2.5">Status</th>}
              {visibleColumns.from && <th className="py-2 px-2.5">From</th>}
              {visibleColumns.to && <th className="py-2 px-2.5">To</th>}
              {visibleColumns.days && <th className="py-2 px-2.5">No of Days</th>}
              {visibleColumns.approvedBy && <th className="py-2 px-2.5">Approved By</th>}
              {visibleColumns.reason && <th className="py-2 px-2.5">Reason</th>}
              {visibleColumns.actions && <th className="py-2 px-2.5 text-right pr-3">Actions</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 text-[11px] text-gray-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={14} className="py-8 text-center text-gray-400 font-medium text-xs">
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
                      <td className="py-1.5 px-2.5">
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          onChange={() => handleSelectRow(row.id)}
                          sx={{
                            color: '#cbd5e1',
                            '&.Mui-checked': { color: '#5d5fef' },
                            padding: 0
                          }}
                        />
                      </td>
                    )}
                    {visibleColumns.id && (
                      <td className="py-1.5 px-2.5 text-gray-500 font-medium text-xs">#{row.id}</td>
                    )}
                    {visibleColumns.empId && (
                      <td className="py-1.5 px-2.5 text-gray-600 font-medium text-xs">{row.empId}</td>
                    )}
                    {visibleColumns.name && (
                      <td className="py-1.5 px-2.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={row.avatar}
                            alt={row.name}
                            className="w-6 h-6 rounded-full object-cover border border-gray-100 shrink-0"
                          />
                          <span className="font-semibold text-gray-800 text-xs">
                            {row.name}
                          </span>
                        </div>
                      </td>
                    )}
                    {visibleColumns.department && (
                      <td className="py-1.5 px-2.5 text-gray-600">{row.department}</td>
                    )}
                    {visibleColumns.designation && (
                      <td className="py-1.5 px-2.5 text-gray-500 text-[10.5px]">{row.designation}</td>
                    )}
                    {visibleColumns.leaveType && (
                      <td className="py-1.5 px-2.5 text-gray-700 font-medium">
                        {row.leaveType}
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="py-1.5 px-2.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
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
                      <td className="py-1.5 px-2.5 text-gray-600">
                        <div className="flex items-center gap-1">
                          <CalendarTodayIcon sx={{ fontSize: 13, color: '#1e293b' }} />
                          <span>{row.from}</span>
                        </div>
                      </td>
                    )}
                    {visibleColumns.to && (
                      <td className="py-1.5 px-2.5 text-gray-600">
                        <div className="flex items-center gap-1">
                          <CalendarTodayIcon sx={{ fontSize: 13, color: '#1e293b' }} />
                          <span>{row.to}</span>
                        </div>
                      </td>
                    )}
                    {visibleColumns.days && (
                      <td className="py-1.5 px-2.5 text-gray-700 font-semibold">
                        {row.days}
                      </td>
                    )}
                    {visibleColumns.approvedBy && (
                      <td className="py-1.5 px-2.5 text-gray-600">{row.approvedBy || '-'}</td>
                    )}
                    {visibleColumns.reason && (
                      <td className="py-1.5 px-2.5 text-gray-500 text-[10.5px] max-w-xs truncate">
                        {row.reason || '-'}
                      </td>
                    )}
                    {visibleColumns.actions && (
                      <td className="py-1.5 px-2.5 text-right pr-3">
                        <div className="flex items-center justify-end gap-0.5">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditModal(row)}
                              sx={{ color: '#3b82f6', '&:hover': { backgroundColor: '#eff6ff' }, padding: '3px' }}
                            >
                              <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteRow(row.id)}
                              sx={{ color: '#ef4444', '&:hover': { backgroundColor: '#fef2f2' }, padding: '3px' }}
                            >
                              <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2.5 mt-2 border-t border-gray-100 text-[11px] text-gray-500">
        <div className="flex items-center gap-2">
          <span>Items per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
            className="h-7 px-1.5 bg-white border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:border-[#5d5fef]"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span>
            {filteredData.length === 0
              ? '0 – 0 of 0'
              : `${page * rowsPerPage + 1} – ${Math.min(
                  (page + 1) * rowsPerPage,
                  filteredData.length
                )} of ${filteredData.length}`}
          </span>

          <div className="flex items-center gap-0.5">
            <IconButton
              size="small"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              sx={{ borderRadius: '4px', p: '2px' }}
            >
              <ChevronLeftIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              size="small"
              disabled={(page + 1) * rowsPerPage >= filteredData.length}
              onClick={() => setPage((p) => p + 1)}
              sx={{ borderRadius: '4px', p: '2px' }}
            >
              <ChevronRightIcon sx={{ fontSize: 16 }} />
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
            p: 1.5,
            width: 200,
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        <h4 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider pb-1.5 mb-1.5 border-b border-gray-100">
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
                    p: 0.25,
                    color: '#cbd5e1',
                    '&.Mui-checked': { color: '#5d5fef' }
                  }}
                />
              }
              label={<span className="text-[11px] font-medium text-gray-700">{col.label}</span>}
              sx={{ m: 0 }}
            />
          ))}
        </div>
      </Popover>
    </div>
  );
};
