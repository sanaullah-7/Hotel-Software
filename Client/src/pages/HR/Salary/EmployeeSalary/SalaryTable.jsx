import React from 'react';
import {
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import RefreshIcon from '@mui/icons-material/Refresh';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassBottomOutlinedIcon from '@mui/icons-material/HourglassBottomOutlined';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DateRangeIcon from '@mui/icons-material/DateRange';

import CustomPagination from '../../../../components/CustomPagination';
import { monthsList, yearsList } from './constants';

export const SalaryTable = ({
  searchQuery,
  setSearchQuery,
  setPage,
  handleOpenAddModal,
  handleRefresh,
  setColumnAnchorEl,
  handleExportPDF,
  visibleColumns,
  paginatedSalaries,
  handleDownloadPayslip,
  handleOpenPaymentModal,
  handleOpenHistoryModal,
  handleOpenEditModal,
  handleOpenDeleteDialog,
  filteredSalaries,
  page,
  columnAnchorEl,
  setVisibleColumns,
  isRefreshing,
  isLoading,
  // Month / Year filter props in middle of table
  selectedYear,
  selectedMonth,
  handleYearChange,
  handleMonthChange,
}) => {
  return (
    <div className="bg-white rounded-[6px] border border-gray-100 shadow-sm p-2 sm:p-2.5 mb-2 mt-1.5">
      {/* Card Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
        {/* Left: Search Input (heading removed as requested) */}
        <div className="flex items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-56">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              className="w-full pl-3 pr-8 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-[#5d5fef] text-slate-700 placeholder-slate-400 transition-all bg-white h-[30px]"
            />
            <SearchIcon
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 15,
                color: '#64748b',
              }}
            />
          </div>
        </div>

        {/* Center: Clean Year & Month Filter Controls */}
        <div className="flex items-center gap-2 justify-center">
          {/* Year Select */}
          <div className="w-24">
            <FormControl fullWidth size="small">
              <InputLabel id="table-year-label" sx={{ fontSize: '0.75rem' }}>
                Year
              </InputLabel>
              <Select
                labelId="table-year-label"
                value={selectedYear}
                label="Year"
                onChange={(e) => handleYearChange(e.target.value)}
                startAdornment={
                  <CalendarTodayIcon
                    sx={{ fontSize: 13, color: '#94a3b8', marginRight: '3px' }}
                  />
                }
                sx={{
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  height: '30px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e2e8f0',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#cbd5e1',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#5d5fef',
                  },
                }}
              >
                {yearsList.map((yr) => (
                  <MenuItem key={yr} value={yr} sx={{ fontSize: '0.75rem' }}>
                    {yr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Month Select */}
          <div className="w-32">
            <FormControl fullWidth size="small">
              <InputLabel id="table-month-label" sx={{ fontSize: '0.75rem' }}>
                Month
              </InputLabel>
              <Select
                labelId="table-month-label"
                value={selectedMonth}
                label="Month"
                onChange={(e) => handleMonthChange(e.target.value)}
                startAdornment={
                  <DateRangeIcon
                    sx={{ fontSize: 13, color: '#94a3b8', marginRight: '3px' }}
                  />
                }
                sx={{
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  height: '30px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e2e8f0',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#cbd5e1',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#5d5fef',
                  },
                }}
              >
                {monthsList.map((m) => (
                  <MenuItem key={m} value={m} sx={{ fontSize: '0.75rem' }}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1 self-end sm:self-auto">
          <Tooltip title="Add Staff Salary">
            <IconButton
              onClick={handleOpenAddModal}
              size="small"
              sx={{
                color: '#1b7f43',
                backgroundColor: 'transparent',
                '&:hover': { backgroundColor: '#f0fdf4' },
                padding: '3px',
              }}
            >
              <AddCircleIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Refresh Current Cycle">
            <IconButton
              onClick={handleRefresh}
              size="small"
              sx={{
                color: '#1b7f43',
                backgroundColor: 'transparent',
                '&:hover': { backgroundColor: '#f0fdf4' },
                padding: '3px',
              }}
            >
              <RefreshIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Toggle Columns">
            <IconButton
              onClick={(e) => setColumnAnchorEl(e.currentTarget)}
              size="small"
              sx={{
                color: '#1b7f43',
                backgroundColor: 'transparent',
                '&:hover': { backgroundColor: '#f0fdf4' },
                padding: '3px',
              }}
            >
              <FilterListIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export Monthly Report (PDF)">
            <IconButton
              onClick={handleExportPDF}
              size="small"
              sx={{
                color: '#ef4444',
                backgroundColor: 'transparent',
                '&:hover': { backgroundColor: '#fef2f2' },
                padding: '3px',
              }}
            >
              <PictureAsPdfIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Loading feedback banner */}
      {(isLoading || isRefreshing) && (
        <div className="py-1 px-3 bg-blue-50/70 border-b border-blue-100 flex items-center justify-center gap-2 text-[11px] text-blue-700 font-medium">
          <CircularProgress size={11} sx={{ color: '#5d5fef' }} />
          <span>Updating records for {selectedMonth} {selectedYear}...</span>
        </div>
      )}

      {/* Table Content - Fitted without overflow */}
      <div className="mt-1.5 rounded border border-slate-100 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/80 text-slate-600 text-[10px] font-bold select-none border-b border-slate-200/80 uppercase tracking-wide">
              {visibleColumns.name && (
                <th scope="col" className="py-1.5 px-2 whitespace-nowrap">
                  <span>Employee Name</span>
                </th>
              )}

              {visibleColumns.email && (
                <th scope="col" className="py-1.5 px-2 whitespace-nowrap">
                  <span>Email</span>
                </th>
              )}

              {visibleColumns.department && (
                <th scope="col" className="py-1.5 px-2 whitespace-nowrap">
                  <span>Department</span>
                </th>
              )}

              {visibleColumns.salary && (
                <th scope="col" className="py-1.5 px-2 whitespace-nowrap">
                  <span>Basic Salary</span>
                </th>
              )}

              {visibleColumns.bonus && (
                <th scope="col" className="py-1.5 px-2 whitespace-nowrap">
                  <span>Bonus</span>
                </th>
              )}

              {visibleColumns.deductions && (
                <th scope="col" className="py-1.5 px-2 whitespace-nowrap">
                  <span>Deductions</span>
                </th>
              )}

              {visibleColumns.netSalary && (
                <th scope="col" className="py-1.5 px-2 whitespace-nowrap">
                  <span>Net Salary</span>
                </th>
              )}

              {visibleColumns.paidAmount && (
                <th scope="col" className="py-1.5 px-2 whitespace-nowrap">
                  <span>Paid Amount</span>
                </th>
              )}

              {visibleColumns.paymentStatus && (
                <th scope="col" className="py-1.5 px-2 text-center whitespace-nowrap">
                  <span>Payment Status</span>
                </th>
              )}

              {visibleColumns.payslip && (
                <th scope="col" className="py-1.5 px-1.5 text-center whitespace-nowrap">
                  <span>Payslip</span>
                </th>
              )}

              {visibleColumns.actions && (
                <th scope="col" className="py-1.5 px-2 text-right whitespace-nowrap">
                  <span>Actions</span>
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700 text-[10.5px]">
            {paginatedSalaries.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-400 font-medium text-xs">
                  No employee salary records found matching your filters.
                </td>
              </tr>
            ) : (
              paginatedSalaries.map((row) => {
                const netSalary = (row.salary || 0) + (row.bonus || 0) - (row.deductions || 0);
                const paidAmount = Number(row.paidAmount || 0);
                const remaining = Math.max(0, netSalary - paidAmount);

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {visibleColumns.name && (
                      <td className="py-1.5 px-2 font-medium text-slate-800 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <img
                            src={row.avatar}
                            alt={row.name}
                            className="w-5 h-5 rounded-full object-cover border border-slate-100 shadow-2xs shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                row.name
                              )}&background=5d5fef&color=fff`;
                            }}
                          />
                          <span className="font-semibold text-slate-800 hover:text-[#5d5fef] transition-colors">
                            {row.name}
                          </span>
                          <span className="text-[9.5px] text-slate-400 font-normal">
                            ({row.empId})
                          </span>
                        </div>
                      </td>
                    )}

                    {visibleColumns.email && (
                      <td className="py-1.5 px-2 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[10px]">
                          <MailOutlineOutlinedIcon sx={{ fontSize: 12, color: '#ef4444' }} />
                          <span>{row.email || 'N/A'}</span>
                        </div>
                      </td>
                    )}

                    {visibleColumns.department && (
                      <td className="py-1.5 px-2 text-slate-600 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[9.5px] font-medium">
                          {row.department}
                        </span>
                      </td>
                    )}

                    {visibleColumns.salary && (
                      <td className="py-1.5 px-2 text-slate-700 font-medium whitespace-nowrap">
                        ${Number(row.salary).toLocaleString()}
                      </td>
                    )}

                    {visibleColumns.bonus && (
                      <td className="py-1.5 px-2 text-emerald-600 whitespace-nowrap">
                        +${Number(row.bonus || 0).toLocaleString()}
                      </td>
                    )}

                    {visibleColumns.deductions && (
                      <td className="py-1.5 px-2 text-rose-500 whitespace-nowrap">
                        -${Number(row.deductions || 0).toLocaleString()}
                      </td>
                    )}

                    {visibleColumns.netSalary && (
                      <td className="py-1.5 px-2 text-slate-900 font-bold whitespace-nowrap">
                        ${netSalary.toLocaleString()}
                      </td>
                    )}

                    {visibleColumns.paidAmount && (
                      <td className="py-1.5 px-2 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[10.5px]">
                          <span className="font-semibold text-emerald-600">
                            ${paidAmount.toLocaleString()}
                          </span>
                          {remaining > 0 && (
                            <span className="text-[9.5px] text-amber-600 font-medium">
                              (Due: ${remaining.toLocaleString()})
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {visibleColumns.paymentStatus && (
                      <td className="py-1.5 px-2 text-center whitespace-nowrap">
                        {row.paymentStatus === 'Paid' ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircleOutlinedIcon sx={{ fontSize: 11 }} /> Paid
                          </span>
                        ) : row.paymentStatus === 'Partial' ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <HourglassBottomOutlinedIcon sx={{ fontSize: 11 }} /> Partial
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <PendingOutlinedIcon sx={{ fontSize: 11 }} /> Pending
                          </span>
                        )}
                      </td>
                    )}

                    {visibleColumns.payslip && (
                      <td className="py-1.5 px-1.5 text-center whitespace-nowrap">
                        <Tooltip title="Download Payslip (PDF)">
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadPayslip(row)}
                            sx={{
                              color: '#1e293b',
                              '&:hover': { color: '#5d5fef', backgroundColor: '#f1f5f9' },
                              padding: '2px',
                            }}
                          >
                            <FileDownloadOutlinedIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                      </td>
                    )}

                    {visibleColumns.actions && (
                      <td className="py-1.5 px-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-0.5">
                          {/* 1. Record Payment */}
                          <Tooltip
                            title={
                              remaining <= 0
                                ? 'Salary fully paid (Click to adjust)'
                                : 'Record Salary Payment'
                            }
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleOpenPaymentModal(row)}
                              sx={{
                                color: remaining <= 0 ? '#10b981' : '#5d5fef',
                                backgroundColor: remaining <= 0 ? '#f0fdf4' : '#f5f3ff',
                                '&:hover': { backgroundColor: '#e0e7ff' },
                                padding: '2px',
                              }}
                            >
                              <PaymentsOutlinedIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>

                          {/* 2. Salary History Ledger */}
                          <Tooltip title="View Past Salary Ledger">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenHistoryModal(row)}
                              sx={{
                                color: '#0284c7',
                                backgroundColor: '#f0f9ff',
                                '&:hover': { backgroundColor: '#e0f2fe' },
                                padding: '2px',
                              }}
                            >
                              <HistoryOutlinedIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>

                          {/* 3. Edit Base Salary */}
                          <Tooltip title="Edit Base Salary">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditModal(row)}
                              sx={{
                                color: '#64748b',
                                '&:hover': { backgroundColor: '#f1f5f9' },
                                padding: '2px',
                              }}
                            >
                              <EditOutlinedIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>

                          {/* 4. Reset / Delete Record */}
                          <Tooltip title="Reset Salary Record">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDeleteDialog(row)}
                              sx={{
                                color: '#f43f5e',
                                '&:hover': { backgroundColor: '#fff1f2' },
                                padding: '2px',
                              }}
                            >
                              <DeleteOutlinedIcon sx={{ fontSize: 15 }} />
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
      <CustomPagination
        count={Math.ceil(filteredSalaries.length / 10) || 1}
        page={page + 1}
        onChange={(e, p) => setPage(p - 1)}
      />

      {/* Popover: Show / Hide Columns */}
      <Popover
        open={Boolean(columnAnchorEl)}
        anchorEl={columnAnchorEl}
        onClose={() => setColumnAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1.5,
            width: 220,
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <h4 className="text-xs font-bold text-slate-800 mb-1.5">Toggle Columns</h4>
        <div className="flex flex-col space-y-0.5">
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
                      [colKey]: e.target.checked,
                    })
                  }
                  sx={{
                    color: '#cbd5e1',
                    '&.Mui-checked': { color: '#5d5fef' },
                    padding: '2px',
                  }}
                />
              }
              label={
                <span className="text-[11px] text-slate-700 font-medium capitalize">
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

export default SalaryTable;
