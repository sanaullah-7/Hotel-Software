import React from 'react';
import {
  Checkbox,
  FormControlLabel,
  IconButton,
  Popover,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleIcon from "@mui/icons-material/AddCircle";
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
import ViewColumnIcon from "@mui/icons-material/ViewColumn";

import CustomPagination from '../../../../components/CustomPagination';
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
  handleExportCSV,
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
    <div className="bg-white rounded-[6px] border border-gray-100 shadow-sm p-2 sm:p-2.5 mb-2 mt-1.5">
      {/* Card Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pb-2 border-b border-gray-100">
        {/* Left: Card Title & Search Input */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap sm:flex-nowrap">
          <h2 className="text-sm font-bold text-slate-800 shrink-0">
            Employee Salary
          </h2>

          <div className="relative w-full sm:w-56">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              className="w-full pl-3 pr-8 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-[#5d5fef] text-slate-700 placeholder-slate-400 transition-all bg-white h-[28px]"
            />
            <SearchIcon
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 16,
                color: '#64748b'
              }}
            />
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 self-end md:self-auto">
          <Tooltip title="Add Salary">
            <IconButton
              onClick={handleOpenAddModal}
              size="small"
              sx={{
                color: "#1b7f43",
                backgroundColor: "transparent",
                "&:hover": { backgroundColor: "#f0fdf4" },
                padding: "4px",
              }}
            >
              <AddCircleIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Refresh">
            <IconButton
              onClick={handleRefresh}
              size="small"
              sx={{
                color: "#1b7f43",
                backgroundColor: "transparent",
                "&:hover": { backgroundColor: "#f0fdf4" },
                padding: "4px",
              }}
            >
              <RefreshIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Filter Columns">
            <IconButton
              onClick={(e) => setColumnAnchorEl(e.currentTarget)}
              size="small"
              sx={{
                color: "#1b7f43",
                backgroundColor: "transparent",
                "&:hover": { backgroundColor: "#f0fdf4" },
                padding: "4px",
              }}
            >
              <FilterListIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export Full Report (PDF)">
            <IconButton
              onClick={handleExportPDF}
              size="small"
              sx={{
                color: "#ef4444",
                backgroundColor: "transparent",
                "&:hover": { backgroundColor: "#fef2f2" },
                padding: "4px",
              }}
            >
              <PictureAsPdfIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Table Content */}
      <div className="mt-2 rounded border border-slate-100 overflow-x-auto">
        <table className="w-full border-collapse text-left min-w-[1050px]">
          <thead>
            <tr className="bg-slate-50/80 text-slate-600 text-[10.5px] font-bold select-none border-b border-slate-200/80 uppercase tracking-wide">
              <th scope="col" className="py-2 px-2.5 w-10 text-center">
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
                  className="py-2 px-2.5"
                >
                  <span>Employee Name</span>
                </th>
              )}

              {visibleColumns.email && (
                <th
                  scope="col"
                  className="py-2 px-2.5"
                >
                  <span>Email</span>
                </th>
              )}

              {visibleColumns.department && (
                <th
                  scope="col"
                  className="py-2 px-2.5"
                >
                  <span>Department</span>
                </th>
              )}

              {visibleColumns.salary && (
                <th
                  scope="col"
                  className="py-2 px-2.5"
                >
                  <span>Salary</span>
                </th>
              )}

              {visibleColumns.bonus && (
                <th
                  scope="col"
                  className="py-2 px-2.5"
                >
                  <span>Bonus</span>
                </th>
              )}

              {visibleColumns.deductions && (
                <th
                  scope="col"
                  className="py-2 px-2.5"
                >
                  <span>Deductions</span>
                </th>
              )}

              {visibleColumns.netSalary && (
                <th
                  scope="col"
                  className="py-2 px-2.5"
                >
                  <span>Net Salary</span>
                </th>
              )}

              {visibleColumns.payslip && (
                <th scope="col" className="py-2 px-2.5 text-center">
                  Payslip
                </th>
              )}

              {visibleColumns.actions && (
                <th scope="col" className="py-2 px-2.5 text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
            {paginatedSalaries.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400 font-medium text-xs">
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
                    <td className="py-1.5 px-2.5 text-center">
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
                      <td className="py-1.5 px-2.5 font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          <img
                            src={row.avatar}
                            alt={row.name}
                            className="w-6 h-6 rounded-full object-cover border border-slate-100 shadow-2xs shrink-0"
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
                      <td className="py-1.5 px-2.5 text-slate-600">
                        <div className="flex items-center gap-1">
                          <MailOutlineOutlinedIcon sx={{ fontSize: 14, color: '#ef4444' }} />
                          <span>{row.email}</span>
                        </div>
                      </td>
                    )}

                    {visibleColumns.department && (
                      <td className="py-1.5 px-2.5 text-slate-600">{row.department}</td>
                    )}

                    {visibleColumns.salary && (
                      <td className="py-1.5 px-2.5 text-slate-700 font-medium">
                        ${Number(row.salary).toLocaleString()}
                      </td>
                    )}

                    {visibleColumns.bonus && (
                      <td className="py-1.5 px-2.5 text-slate-600">
                        ${Number(row.bonus || 0).toLocaleString()}
                      </td>
                    )}

                    {visibleColumns.deductions && (
                      <td className="py-1.5 px-2.5 text-slate-600">
                        ${Number(row.deductions || 0).toLocaleString()}
                      </td>
                    )}

                    {visibleColumns.netSalary && (
                      <td className="py-1.5 px-2.5 text-slate-800 font-semibold">
                        ${netSalary.toLocaleString()}
                      </td>
                    )}

                    {visibleColumns.payslip && (
                      <td className="py-1.5 px-2.5 text-center">
                        <Tooltip title="Download Payslip (PDF)">
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadPayslip(row)}
                            sx={{
                              color: '#1e293b',
                              '&:hover': { color: '#5d5fef', backgroundColor: '#f1f5f9' },
                              padding: '3px'
                            }}
                          >
                            <FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </td>
                    )}

                    {visibleColumns.actions && (
                      <td className="py-1.5 px-2.5 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <Tooltip title="Edit Salary">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditModal(row)}
                              sx={{
                                color: '#3b82f6',
                                '&:hover': { backgroundColor: '#eff6ff' },
                                padding: '3px'
                              }}
                            >
                              <EditOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete Record">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDeleteDialog(row)}
                              sx={{
                                color: '#f97316',
                                '&:hover': { backgroundColor: '#fff7ed' },
                                padding: '3px'
                              }}
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
            width: 200,
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }
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
                      [colKey]: e.target.checked
                    })
                  }
                  sx={{
                    color: '#cbd5e1',
                    '&.Mui-checked': { color: '#5d5fef' },
                    padding: '2px'
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
