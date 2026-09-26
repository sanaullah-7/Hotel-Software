import React from 'react';
import {
  Checkbox,
  FormControlLabel,
  IconButton,
  Popover,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import RefreshIcon from '@mui/icons-material/Refresh';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';

import { departmentsList } from './constants';

export const SalaryTable = ({
  searchQuery,
  setSearchQuery,
  setPage,
  setFilterAnchorEl,
  handleOpenAddModal,
  handleRefresh,
  isRefreshing,
  setColumnAnchorEl,
  handleExportPDF,
  isAllSelected,
  isSomeSelected,
  handleSelectAll,
  visibleColumns,
  handleSort,
  sortField,
  sortOrder,
  paginatedSalaries,
  selectedIds,
  handleSelectRow,
  handleDownloadPayslip,
  handleOpenEditModal,
  handleOpenDeleteDialog,
  rowsPerPage,
  setRowsPerPage,
  filteredSalaries,
  page,
  filterAnchorEl,
  departmentFilter,
  setDepartmentFilter,
  columnAnchorEl,
  setVisibleColumns
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-2 sm:p-2.5 mb-2">
      {/* Card Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        {/* Left: Card Title & Search Input */}
        <div className="flex items-center gap-3.5 w-full md:w-auto flex-wrap sm:flex-nowrap">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 shrink-0">
            Employee Salary
          </h2>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              className="w-full pl-3.5 pr-9 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#5d5fef] text-slate-700 placeholder-slate-400 transition-all bg-white"
            />
            <SearchIcon
              sx={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 18,
                color: '#64748b'
              }}
            />
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 self-end md:self-auto">
          <Tooltip title="Filter by Department">
            <IconButton
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              size="small"
              sx={{
                color: '#5d5fef',
                backgroundColor: '#f5f5ff',
                '&:hover': { backgroundColor: '#eceeff' },
                borderRadius: '8px',
                padding: '7px'
              }}
            >
              <FilterListIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Add Employee Salary">
            <IconButton
              onClick={handleOpenAddModal}
              size="small"
              sx={{
                color: '#10b981',
                backgroundColor: '#ecfdf5',
                '&:hover': { backgroundColor: '#d1fae5' },
                borderRadius: '8px',
                padding: '7px'
              }}
            >
              <AddCircleOutlineOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Refresh Data">
            <IconButton
              onClick={handleRefresh}
              size="small"
              sx={{
                color: '#475569',
                backgroundColor: '#f8fafc',
                '&:hover': { backgroundColor: '#f1f5f9' },
                borderRadius: '8px',
                padding: '7px'
              }}
            >
              <RefreshIcon
                sx={{
                  fontSize: 20,
                  transition: 'transform 0.4s ease',
                  transform: isRefreshing ? 'rotate(360deg)' : 'none'
                }}
              />
            </IconButton>
          </Tooltip>

          <Tooltip title="Show / Hide Columns">
            <IconButton
              onClick={(e) => setColumnAnchorEl(e.currentTarget)}
              size="small"
              sx={{
                color: '#3b82f6',
                backgroundColor: '#eff6ff',
                '&:hover': { backgroundColor: '#dbeafe' },
                borderRadius: '8px',
                padding: '7px'
              }}
            >
              <TableChartOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export Full Report (PDF)">
            <IconButton
              onClick={handleExportPDF}
              size="small"
              sx={{
                color: '#ef4444',
                backgroundColor: '#fef2f2',
                '&:hover': { backgroundColor: '#fee2e2' },
                borderRadius: '8px',
                padding: '7px'
              }}
            >
              <PictureAsPdfIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Table Content */}
      <div className="mt-3 rounded-lg border border-slate-100 overflow-x-auto">
        <table className="w-full border-collapse text-left min-w-[1050px]">
          <thead>
            <tr className="bg-slate-50/80 text-slate-600 text-xs font-bold select-none border-b border-slate-200/80">
              <th scope="col" className="py-3.5 px-3 w-12 text-center">
                <Checkbox
                  size="small"
                  checked={isAllSelected}
                  indeterminate={isSomeSelected}
                  onChange={handleSelectAll}
                  sx={{
                    color: '#94a3b8',
                    '&.Mui-checked': { color: '#5d5fef' },
                    '&.MuiCheckbox-indeterminate': { color: '#5d5fef' },
                    padding: 0
                  }}
                />
              </th>

              {visibleColumns.name && (
                <th
                  scope="col"
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Employee Name</span>
                    {sortField === 'name' ? (
                      sortOrder === 'asc' ? (
                        <ArrowUpwardIcon sx={{ fontSize: 15 }} />
                      ) : (
                        <ArrowDownwardIcon sx={{ fontSize: 15 }} />
                      )
                    ) : (
                      <span className="text-slate-300 text-xs">↕</span>
                    )}
                  </div>
                </th>
              )}

              {visibleColumns.email && (
                <th
                  scope="col"
                  onClick={() => handleSort('email')}
                  className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Email</span>
                    {sortField === 'email' ? (
                      sortOrder === 'asc' ? (
                        <ArrowUpwardIcon sx={{ fontSize: 15 }} />
                      ) : (
                        <ArrowDownwardIcon sx={{ fontSize: 15 }} />
                      )
                    ) : (
                      <span className="text-slate-300 text-xs">↕</span>
                    )}
                  </div>
                </th>
              )}

              {visibleColumns.department && (
                <th
                  scope="col"
                  onClick={() => handleSort('department')}
                  className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Department</span>
                    {sortField === 'department' ? (
                      sortOrder === 'asc' ? (
                        <ArrowUpwardIcon sx={{ fontSize: 15 }} />
                      ) : (
                        <ArrowDownwardIcon sx={{ fontSize: 15 }} />
                      )
                    ) : (
                      <span className="text-slate-300 text-xs">↕</span>
                    )}
                  </div>
                </th>
              )}

              {visibleColumns.salary && (
                <th
                  scope="col"
                  onClick={() => handleSort('salary')}
                  className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Salary</span>
                    {sortField === 'salary' ? (
                      sortOrder === 'asc' ? (
                        <ArrowUpwardIcon sx={{ fontSize: 15 }} />
                      ) : (
                        <ArrowDownwardIcon sx={{ fontSize: 15 }} />
                      )
                    ) : (
                      <span className="text-slate-300 text-xs">↕</span>
                    )}
                  </div>
                </th>
              )}

              {visibleColumns.bonus && (
                <th
                  scope="col"
                  onClick={() => handleSort('bonus')}
                  className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Bonus</span>
                    {sortField === 'bonus' ? (
                      sortOrder === 'asc' ? (
                        <ArrowUpwardIcon sx={{ fontSize: 15 }} />
                      ) : (
                        <ArrowDownwardIcon sx={{ fontSize: 15 }} />
                      )
                    ) : (
                      <span className="text-slate-300 text-xs">↕</span>
                    )}
                  </div>
                </th>
              )}

              {visibleColumns.deductions && (
                <th
                  scope="col"
                  onClick={() => handleSort('deductions')}
                  className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Deductions</span>
                    {sortField === 'deductions' ? (
                      sortOrder === 'asc' ? (
                        <ArrowUpwardIcon sx={{ fontSize: 15 }} />
                      ) : (
                        <ArrowDownwardIcon sx={{ fontSize: 15 }} />
                      )
                    ) : (
                      <span className="text-slate-300 text-xs">↕</span>
                    )}
                  </div>
                </th>
              )}

              {visibleColumns.netSalary && (
                <th
                  scope="col"
                  onClick={() => handleSort('netSalary')}
                  className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Net Salary</span>
                    {sortField === 'netSalary' ? (
                      sortOrder === 'asc' ? (
                        <ArrowUpwardIcon sx={{ fontSize: 15 }} />
                      ) : (
                        <ArrowDownwardIcon sx={{ fontSize: 15 }} />
                      )
                    ) : (
                      <span className="text-slate-300 text-xs">↕</span>
                    )}
                  </div>
                </th>
              )}

              {visibleColumns.payslip && (
                <th scope="col" className="py-3.5 px-3 text-center">
                  Payslip
                </th>
              )}

              {visibleColumns.actions && (
                <th scope="col" className="py-3.5 px-3 text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700 text-xs sm:text-sm">
            {paginatedSalaries.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400 font-medium text-sm">
                  No employee salary records found matching your filters.
                </td>
              </tr>
            ) : (
              paginatedSalaries.map((row) => {
                const isSelected = selectedIds.includes(row.id);
                const netSalary = (row.salary || 0) + (row.bonus || 0) - (row.deductions || 0);

                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center">
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

                    {visibleColumns.name && (
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        <div className="flex items-center gap-3">
                          <img
                            src={row.avatar}
                            alt={row.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-2xs shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                row.name
                              )}&background=5d5fef&color=fff`;
                            }}
                          />
                          <span className="truncate hover:text-[#5d5fef] transition-colors">
                            {row.name}
                          </span>
                        </div>
                      </td>
                    )}

                    {visibleColumns.email && (
                      <td className="py-2.5 px-3 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MailOutlineOutlinedIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                          <span>{row.email}</span>
                        </div>
                      </td>
                    )}

                    {visibleColumns.department && (
                      <td className="py-2.5 px-3 text-slate-600">{row.department}</td>
                    )}

                    {visibleColumns.salary && (
                      <td className="py-2.5 px-3 text-slate-700 font-medium">
                        ${Number(row.salary).toLocaleString()}
                      </td>
                    )}

                    {visibleColumns.bonus && (
                      <td className="py-2.5 px-3 text-slate-600">
                        ${Number(row.bonus || 0).toLocaleString()}
                      </td>
                    )}

                    {visibleColumns.deductions && (
                      <td className="py-2.5 px-3 text-slate-600">
                        ${Number(row.deductions || 0).toLocaleString()}
                      </td>
                    )}

                    {visibleColumns.netSalary && (
                      <td className="py-2.5 px-3 text-slate-800 font-semibold">
                        ${netSalary.toLocaleString()}
                      </td>
                    )}

                    {visibleColumns.payslip && (
                      <td className="py-2.5 px-3 text-center">
                        <Tooltip title="Download Payslip (PDF)">
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadPayslip(row)}
                            sx={{
                              color: '#1e293b',
                              '&:hover': { color: '#5d5fef', backgroundColor: '#f1f5f9' },
                              padding: '5px'
                            }}
                          >
                            <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </td>
                    )}

                    {visibleColumns.actions && (
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip title="Edit Salary">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditModal(row)}
                              sx={{
                                color: '#3b82f6',
                                '&:hover': { backgroundColor: '#eff6ff' },
                                padding: '5px'
                              }}
                            >
                              <EditOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete Record">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDeleteDialog(row)}
                              sx={{
                                color: '#f97316',
                                '&:hover': { backgroundColor: '#fff7ed' },
                                padding: '5px'
                              }}
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-600 mt-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Items per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
            className="px-2 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-[#5d5fef] bg-white text-slate-700 cursor-pointer font-medium"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-slate-600 font-medium">
            {filteredSalaries.length === 0
              ? '0 – 0 of 0'
              : `${page * rowsPerPage + 1} – ${Math.min(
                  (page + 1) * rowsPerPage,
                  filteredSalaries.length
                )} of ${filteredSalaries.length}`}
          </span>

          <div className="flex items-center gap-1">
            <IconButton
              size="small"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              sx={{
                color: '#64748b',
                '&.Mui-disabled': { color: '#cbd5e1' },
                padding: '4px'
              }}
            >
              <ChevronLeftIcon sx={{ fontSize: 20 }} />
            </IconButton>

            <IconButton
              size="small"
              disabled={(page + 1) * rowsPerPage >= filteredSalaries.length}
              onClick={() => setPage((p) => p + 1)}
              sx={{
                color: '#64748b',
                '&.Mui-disabled': { color: '#cbd5e1' },
                padding: '4px'
              }}
            >
              <ChevronRightIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Popover: Filter by Department */}
      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 2.5,
            width: 250,
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <h4 className="text-sm font-bold text-slate-800 mb-3">Filter Salary</h4>
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-500 font-medium mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(0);
              }}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-[#5d5fef] text-slate-700 bg-white"
            >
              {departmentsList.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                setDepartmentFilter('All');
                setFilterAnchorEl(null);
              }}
              className="text-xs text-[#5d5fef] hover:underline font-semibold"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </Popover>

      {/* Popover: Show / Hide Columns */}
      <Popover
        open={Boolean(columnAnchorEl)}
        anchorEl={columnAnchorEl}
        onClose={() => setColumnAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 2,
            width: 210,
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <h4 className="text-sm font-bold text-slate-800 mb-2">Toggle Columns</h4>
        <div className="flex flex-col space-y-1">
          {Object.keys(visibleColumns).map((colKey) => (
            <FormControlLabel
              key={colKey}
              control={
                <Checkbox
                  size="small"
                  checked={visibleColumns[colKey]}
                  onChange={(e) =>
                    setVisibleColumns({
                      ...visibleColumns,
                      [colKey]: e.target.checked
                    })
                  }
                  sx={{
                    color: '#cbd5e1',
                    '&.Mui-checked': { color: '#5d5fef' },
                    padding: '3px'
                  }}
                />
              }
              label={
                <span className="text-xs text-slate-700 font-medium capitalize">
                  {colKey.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              }
            />
          ))}
        </div>
      </Popover>
    </div>
  );
};
