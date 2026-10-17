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
    setVisibleColumns,
    isDashboard = false,
    hideScrollbar = false
}) => {
    return (
        <div className="bg-white rounded-[6px] border border-gray-100 shadow-sm p-2 sm:p-2.5 mb-2 mt-1.5">
            {/* Card Toolbar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                {/* Left: Card Title & Search Input */}
                <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap sm:flex-nowrap">
                    <h2 className="text-sm font-bold text-slate-800 shrink-0">
                        Today's Attendance
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
                                position: "absolute",
                                right: 8,
                                top: "50%",
                                transform: "translateY(-50%)",
                                fontSize: 16,
                                color: "#64748b",
                            }}
                        />
                    </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-1 sm:gap-1.5 self-end md:self-auto">
                    <Tooltip title="Add Attendance">
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

                    {!isDashboard && (
                        <>
                            <Tooltip title="Filter Records">
                                <IconButton
                                    onClick={(e) => setFilterAnchorEl(e.currentTarget)}
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

                            <Tooltip title="Toggle Columns">
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
                                    <ViewColumnIcon sx={{ fontSize: 22 }} />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}

                    <Tooltip title="Export PDF">
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
            <div className={`mt-2 rounded border border-slate-100 ${
                isDashboard || hideScrollbar
                    ? 'overflow-hidden'
                    : 'overflow-x-auto'
            }`}>
                <table className={`w-full border-collapse text-left ${
                    isDashboard || hideScrollbar ? 'w-full table-fixed' : 'min-w-[950px]'
                }`}>
                    <thead>
                        <tr className="bg-slate-50/80 text-slate-600 text-[10.5px] font-bold select-none border-b border-slate-200/80 uppercase tracking-wide">
                            {!isDashboard && (
                                <th scope="col" className="py-2 px-2.5 w-10 text-center">
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
                            )}

                            {visibleColumns.name && (
                                <th
                                    scope="col"
                                    className="py-2 px-2.5"
                                >
                                    <span>Employee Name</span>
                                </th>
                            )}

                            {visibleColumns.firstIn && (
                                <th
                                    scope="col"
                                    className="py-2 px-2.5"
                                >
                                    <span>First In</span>
                                </th>
                            )}

                            {visibleColumns.breakFrom && (
                                <th
                                    scope="col"
                                    className="py-2 px-2.5"
                                >
                                    <span>Break From</span>
                                </th>
                            )}
                            {visibleColumns.breakTo && (
                                <th
                                    scope="col"
                                    className="py-2 px-2.5"
                                >
                                    <span>Break To</span>
                                </th>
                            )}

                            {visibleColumns.lastOut && (
                                <th
                                    scope="col"
                                    className="py-2 px-2.5"
                                >
                                    <span>Last Out</span>
                                </th>
                            )}

                            {visibleColumns.totalHours && (
                                <th
                                    scope="col"
                                    className="py-2 px-2.5"
                                >
                                    <span>Total Hours</span>
                                </th>
                            )}

                            {visibleColumns.status && (
                                <th
                                    scope="col"
                                    className="py-2 px-2.5"
                                >
                                    <span>Status</span>
                                </th>
                            )}

                            {visibleColumns.shift && (
                                <th
                                    scope="col"
                                    className="py-2 px-2.5"
                                >
                                    <span>Shift</span>
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
                        {paginatedRecords.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={isDashboard ? 8 : 9}
                                    className="py-8 text-center text-slate-400 font-medium text-xs"
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
                                        {!isDashboard && (
                                            <td className="py-1.5 px-2.5 text-center">
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
                                        )}

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
                                            <td className="py-1.5 px-2.5 text-slate-700">
                                                <div className="flex items-center gap-1 font-medium">
                                                    <ScheduleIcon
                                                        sx={{ fontSize: 14, color: "#5d5fef" }}
                                                    />
                                                    <span>{row.firstIn}</span>
                                                </div>
                                            </td>
                                        )}

                                        {visibleColumns.breakFrom && (
                                            <td className="py-1.5 px-2.5 text-slate-600">
                                                <div className="flex items-center gap-1 font-medium">
                                                    <ScheduleIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                                                    <span>{row.breakFrom || '-'}</span>
                                                </div>
                                            </td>
                                        )}
                                        {visibleColumns.breakTo && (
                                            <td className="py-1.5 px-2.5 text-slate-600">
                                                <div className="flex items-center gap-1 font-medium">
                                                    <ScheduleIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                                                    <span>{row.breakTo || '-'}</span>
                                                </div>
                                            </td>
                                        )}

                                        {visibleColumns.lastOut && (
                                            <td className="py-1.5 px-2.5 text-slate-700">
                                                <div className="flex items-center gap-1 font-medium">
                                                    <ScheduleIcon
                                                        sx={{ fontSize: 14, color: "#5d5fef" }}
                                                    />
                                                    <span>{row.lastOut}</span>
                                                </div>
                                            </td>
                                        )}

                                        {visibleColumns.totalHours && (
                                            <td className="py-1.5 px-2.5 text-slate-700 font-medium">
                                                {row.totalHours}
                                            </td>
                                        )}

                                        {visibleColumns.status && (
                                            <td className="py-1.5 px-2.5">
                                                {(() => {
                                                    const s = (row.status || '').toLowerCase();
                                                    if (s === 'present') {
                                                        return (
                                                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 capitalize">
                                                                present
                                                            </span>
                                                        );
                                                    }
                                                    if (s === 'on_leave' || s === 'leave') {
                                                        return (
                                                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 capitalize">
                                                                leave
                                                            </span>
                                                        );
                                                    }
                                                    if (s === 'late') {
                                                        return (
                                                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 capitalize">
                                                                late
                                                            </span>
                                                        );
                                                    }
                                                    return (
                                                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700 capitalize">
                                                            absent
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                        )}

                                        {visibleColumns.shift && (
                                            <td className="py-1.5 px-2.5 text-slate-600">
                                                {row.shift}
                                            </td>
                                        )}

                                        {visibleColumns.actions && (
                                            <td className="py-1.5 px-2.5 text-right">
                                                <div className="flex items-center justify-end gap-0.5">
                                                    <Tooltip title="Edit Record">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenEditModal(row)}
                                                            sx={{
                                                                color: "#3b82f6",
                                                                "&:hover": { backgroundColor: "#eff6ff" },
                                                                padding: "3px",
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
                                                                color: "#f97316",
                                                                "&:hover": { backgroundColor: "#fff7ed" },
                                                                padding: "3px",
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
                        p: 1.5,
                        width: 200,
                        borderRadius: "8px",
                        boxShadow:
                            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    },
                }}
            >
                <h4 className="text-xs font-bold text-slate-800 mb-1.5">
                    Toggle Columns
                </h4>
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
                                        color: "#cbd5e1",
                                        "&.Mui-checked": { color: "#5d5fef" },
                                        padding: "2px",
                                    }}
                                />
                            }
                            label={
                                <span className="text-[11px] text-slate-700 font-medium capitalize">
                                    {colKey === "breakFrom" ? "Break From" : colKey === "breakTo" ? "Break To" : colKey.replace(/([A-Z])/g, " $1").trim()}
                                </span>
                            }
                        />
                    ))}
                </div>
            </Popover>

            {/* Popover: Filter Records */}
            <Popover
                open={Boolean(filterAnchorEl)}
                anchorEl={filterAnchorEl}
                onClose={() => setFilterAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{
                    sx: {
                        p: 2,
                        width: 220,
                        borderRadius: "8px",
                        boxShadow:
                            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    },
                }}
            >
                <h4 className="text-xs font-bold text-slate-800 mb-2">
                    Filter Records
                </h4>
                <div className="space-y-3">
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(0);
                            }}
                            className="w-full text-xs p-1.5 border border-slate-200 rounded focus:outline-none focus:border-[#1b7f43]"
                        >
                            <option value="All">All Statuses</option>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="on_leave">Leave</option>
                            <option value="late">Late</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Shift</label>
                        <select
                            value={shiftFilter}
                            onChange={(e) => {
                                setShiftFilter(e.target.value);
                                setPage(0);
                            }}
                            className="w-full text-xs p-1.5 border border-slate-200 rounded focus:outline-none focus:border-[#1b7f43]"
                        >
                            <option value="All">All Shifts</option>
                            <option value="Day Shift">Day Shift</option>
                            <option value="Night Shift">Night Shift</option>
                        </select>
                    </div>
                </div>
            </Popover>
        </div>
    );
};
