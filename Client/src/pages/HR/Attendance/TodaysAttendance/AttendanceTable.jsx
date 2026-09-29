import React from "react";
import CustomPagination from '../../../../components/CustomPagination';
import {
    IconButton,
    Tooltip,
    Checkbox,
    Popover,
    FormControlLabel
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

export const AttendanceTable = ({
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
    paginatedRecords,
    selectedIds,
    handleSelectRow,
    handleOpenEditModal,
    handleOpenDeleteDialog,
    rowsPerPage,
    setRowsPerPage,
    filteredRecords,
    page,
    filterAnchorEl,
    statusFilter,
    setStatusFilter,
    shiftFilter,
    setShiftFilter,
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
                        Today's Attendance
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
                                position: "absolute",
                                right: 10,
                                top: "50%",
                                transform: "translateY(-50%)",
                                fontSize: 18,
                                color: "#64748b",
                            }}
                        />
                    </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-1.5 sm:gap-2 self-end md:self-auto">
                    
                    <Tooltip title="Add Attendance">
                        <IconButton
                            onClick={handleOpenAddModal}
                            size="small"
                            sx={{
                                color: "#1b7f43",
                                backgroundColor: "transparent",
                                "&:hover": { backgroundColor: "#f0fdf4" },
                                padding: "6px",
                            }}
                        >
                            <AddCircleIcon sx={{ fontSize: 24 }} />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Refresh Data">
                        <IconButton
                            onClick={handleRefresh}
                            size="small"
                            sx={{
                                color: "#1b7f43",
                                backgroundColor: "transparent",
                                "&:hover": { backgroundColor: "#f0fdf4" },
                                padding: "6px",
                            }}
                        >
                            <RefreshIcon
                                sx={{
                                    fontSize: 26,
                                    transition: "transform 0.4s ease",
                                    transform: isRefreshing ? "rotate(360deg)" : "none",
                                }}
                            />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Export to CSV">
                        <IconButton
                            onClick={handleExportCSV}
                            size="small"
                            sx={{
                                color: "#0ea5e9",
                                backgroundColor: "transparent",
                                "&:hover": { backgroundColor: "#f0f9ff" },
                                padding: "6px",
                            }}
                        >
                            <ViewColumnIcon sx={{ fontSize: 26 }} />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Export to PDF">
                        <IconButton
                            onClick={handleExportPDF}
                            size="small"
                            sx={{
                                color: "#ef4444",
                                backgroundColor: "transparent",
                                "&:hover": { backgroundColor: "#fef2f2" },
                                padding: "6px",
                            }}
                        >
                            <PictureAsPdfIcon sx={{ fontSize: 26 }} />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>

            {/* Table Content */}
            <div className="mt-3 rounded-lg border border-slate-100 overflow-x-auto">
                <table className="w-full border-collapse text-left min-w-[950px]">
                    <thead>
                        <tr className="bg-slate-50/80 text-slate-600 text-xs font-bold select-none border-b border-slate-200/80">
                            <th scope="col" className="py-3.5 px-3 w-12 text-center">
                                <Checkbox
                                    size="small"
                                    checked={isAllSelected}
                                    indeterminate={isSomeSelected}
                                    onChange={handleSelectAll}
                                    sx={{
                                        color: "#94a3b8",
                                        "&.Mui-checked": { color: "#5d5fef" },
                                        "&.MuiCheckbox-indeterminate": { color: "#5d5fef" },
                                        padding: 0,
                                    }}
                                />
                            </th>

                            {visibleColumns.name && (
                                <th
                                    scope="col"
                                    className="py-3.5 px-3"
                                >
                                    <span>Employee Name</span>
                                </th>
                            )}

                            {visibleColumns.firstIn && (
                                <th
                                    scope="col"
                                    className="py-3.5 px-3"
                                >
                                    <span>First In</span>
                                </th>
                            )}

                                                        {visibleColumns.breakFrom && (
                                  <th
                                      scope="col"
                                      className="py-3.5 px-3"
                                  >
                                      <span>Break From</span>
                                  </th>
                              )}
                              {visibleColumns.breakTo && (
                                  <th
                                      scope="col"
                                      className="py-3.5 px-3"
                                  >
                                      <span>Break To</span>
                                  </th>
                              )}

                            {visibleColumns.lastOut && (
                                <th
                                    scope="col"
                                    className="py-3.5 px-3"
                                >
                                    <span>Last Out</span>
                                </th>
                            )}

                            {visibleColumns.totalHours && (
                                <th
                                    scope="col"
                                    className="py-3.5 px-3"
                                >
                                    <span>Total Hours</span>
                                </th>
                            )}

                            {visibleColumns.status && (
                                <th
                                    scope="col"
                                    className="py-3.5 px-3"
                                >
                                    <span>Status</span>
                                </th>
                            )}

                            {visibleColumns.shift && (
                                <th
                                    scope="col"
                                    className="py-3.5 px-3"
                                >
                                    <span>Shift</span>
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
                        {paginatedRecords.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={9}
                                    className="py-12 text-center text-slate-400 font-medium text-sm"
                                >
                                    No attendance records found matching your filters.
                                </td>
                            </tr>
                        ) : (
                            paginatedRecords.map((row) => {
                                const isSelected = selectedIds.includes(row.id);
                                return (
                                    <tr
                                        key={row.id}
                                        className={`hover:bg-slate-50/80 transition-colors ${
                                            isSelected ? "bg-indigo-50/40" : ""
                                        }`}
                                    >
                                        <td className="py-2.5 px-3 text-center">
                                            <Checkbox
                                                size="small"
                                                checked={isSelected}
                                                onChange={() => handleSelectRow(row.id)}
                                                sx={{
                                                    color: "#cbd5e1",
                                                    "&.Mui-checked": { color: "#5d5fef" },
                                                    padding: 0,
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
                                                                row.name,
                                                            )}&background=5d5fef&color=fff`;
                                                        }}
                                                    />
                                                    <span className="truncate hover:text-[#5d5fef] transition-colors">
                                                        {row.name}
                                                    </span>
                                                </div>
                                            </td>
                                        )}

                                        {visibleColumns.firstIn && (
                                            <td className="py-2.5 px-3 text-slate-700">
                                                <div className="flex items-center gap-1.5 font-medium">
                                                    <ScheduleIcon
                                                        sx={{ fontSize: 16, color: "#5d5fef" }}
                                                    />
                                                    <span>{row.firstIn}</span>
                                                </div>
                                            </td>
                                        )}

                                        {visibleColumns.breakFrom && (
                                              <td className="py-2.5 px-3 text-slate-600">
                                                  <div className="flex items-center gap-1.5 font-medium">
                                                      <ScheduleIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                                                      <span>{row.breakFrom || '-'}</span>
                                                  </div>
                                              </td>
                                          )}
                                          {visibleColumns.breakTo && (
                                              <td className="py-2.5 px-3 text-slate-600">
                                                  <div className="flex items-center gap-1.5 font-medium">
                                                      <ScheduleIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                                                      <span>{row.breakTo || '-'}</span>
                                                  </div>
                                              </td>
                                          )}

                                        {visibleColumns.lastOut && (
                                            <td className="py-2.5 px-3 text-slate-700">
                                                <div className="flex items-center gap-1.5 font-medium">
                                                    <ScheduleIcon
                                                        sx={{ fontSize: 16, color: "#5d5fef" }}
                                                    />
                                                    <span>{row.lastOut}</span>
                                                </div>
                                            </td>
                                        )}

                                        {visibleColumns.totalHours && (
                                            <td className="py-2.5 px-3 text-slate-700 font-medium">
                                                {row.totalHours}
                                            </td>
                                        )}

                                        {visibleColumns.status && (
                                            <td className="py-2.5 px-3">
                                                {row.status.toLowerCase() === "present" ? (
                                                    <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700">
                                                        present
                                                    </span>
                                                ) : (
                                                    <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-700">
                                                        absent
                                                    </span>
                                                )}
                                            </td>
                                        )}

                                        {visibleColumns.shift && (
                                            <td className="py-2.5 px-3 text-slate-600">
                                                {row.shift}
                                            </td>
                                        )}

                                        {visibleColumns.actions && (
                                            <td className="py-2.5 px-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Tooltip title="Edit Record">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenEditModal(row)}
                                                            sx={{
                                                                color: "#3b82f6",
                                                                "&:hover": { backgroundColor: "#eff6ff" },
                                                                padding: "5px",
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
                                                                color: "#f97316",
                                                                "&:hover": { backgroundColor: "#fff7ed" },
                                                                padding: "5px",
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
            <CustomPagination
                count={Math.ceil(filteredRecords.length / 10) || 1}
                page={page + 1}
                onChange={(e, p) => setPage(p - 1)}
            />

            {/* Popover: Show / Hide Columns */}
            <Popover
                open={Boolean(columnAnchorEl)}
                anchorEl={columnAnchorEl}
                onClose={() => setColumnAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{
                    sx: {
                        p: 2,
                        width: 210,
                        borderRadius: "12px",
                        boxShadow:
                            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    },
                }}
            >
                <h4 className="text-sm font-bold text-slate-800 mb-2">
                    Toggle Columns
                </h4>
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
                                            [colKey]: e.target.checked,
                                        })
                                    }
                                    sx={{
                                        color: "#cbd5e1",
                                        "&.Mui-checked": { color: "#5d5fef" },
                                        padding: "3px",
                                    }}
                                />
                            }
                            label={
                                <span className="text-xs text-slate-700 font-medium capitalize">
                                    {colKey === "breakFrom" ? "Break From" : colKey === "breakTo" ? "Break To" : colKey.replace(/([A-Z])/g, " $1").trim()}
                                </span>
                            }
                        />
                    ))}
                </div>
            </Popover>
        </div>
    );
};



