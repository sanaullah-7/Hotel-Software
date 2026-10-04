import React from "react";
import { Snackbar, Alert } from "@mui/material";

import { useTodaysAttendance } from "./useTodaysAttendance";
import { AttendanceTable } from "./AttendanceTable";
import { AttendanceModals } from "./AttendanceModals";

export default function TodaysAttendance() {
    const {
        attendanceList,
        searchQuery,
        setSearchQuery,
        selectedIds,
        isRefreshing,
        sortField,
        sortOrder,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        visibleColumns,
        setVisibleColumns,
        filterAnchorEl,
        setFilterAnchorEl,
        columnAnchorEl,
        setColumnAnchorEl,
        statusFilter,
        setStatusFilter,
        shiftFilter,
        setShiftFilter,
        isAddModalOpen,
        setIsAddModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        selectedRecord,
        formData,
        setFormData,
        toast,
        setToast,
        calculateTotalHours,
        handleSort,
        paginatedRecords,
        sortedRecords,
        filteredRecords,
        handleSelectAll,
        handleSelectRow,
        isAllSelected,
        isSomeSelected,
        handleRefresh,
        handleExportPDF,
        handleOpenAddModal,
        handleSaveNewAttendance,
        handleOpenEditModal,
        handleSaveEditAttendance,
        handleOpenDeleteDialog,
        handleConfirmDelete,
        attendanceStats,
    } = useTodaysAttendance();

    return (
        <div className="animate-fade-in">
            {/* 1. Attendance Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full mt-1">
                {attendanceStats.map((card) => {
                    const IconComp = card.icon;
                    const bg = card.iconBg || 'bg-blue-50';
                    const color = card.iconColor || 'text-blue-600';
                    const colorClass = `${bg} ${color}`;
                    return (
                        <div
                            key={card.id}
                            className="bg-white p-3 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between"
                        >
                            <div>
                                <div className="text-xl font-bold text-gray-900 leading-none mb-1">{card.value}</div>
                                <div className="text-[11px] text-gray-500 font-medium">{card.title}</div>
                            </div>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                                <IconComp sx={{ fontSize: 16 }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 2. Attendance Table */}
            <AttendanceTable
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                setPage={setPage}
                setFilterAnchorEl={setFilterAnchorEl}
                handleOpenAddModal={handleOpenAddModal}
                handleRefresh={handleRefresh}
                isRefreshing={isRefreshing}
                setColumnAnchorEl={setColumnAnchorEl}
                handleExportPDF={handleExportPDF}
                isAllSelected={isAllSelected}
                isSomeSelected={isSomeSelected}
                handleSelectAll={handleSelectAll}
                visibleColumns={visibleColumns}
                handleSort={handleSort}
                sortField={sortField}
                sortOrder={sortOrder}
                paginatedRecords={paginatedRecords}
                selectedIds={selectedIds}
                handleSelectRow={handleSelectRow}
                handleOpenEditModal={handleOpenEditModal}
                handleOpenDeleteDialog={handleOpenDeleteDialog}
                rowsPerPage={rowsPerPage}
                setRowsPerPage={setRowsPerPage}
                filteredRecords={filteredRecords}
                page={page}
                filterAnchorEl={filterAnchorEl}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                shiftFilter={shiftFilter}
                setShiftFilter={setShiftFilter}
                columnAnchorEl={columnAnchorEl}
                setVisibleColumns={setVisibleColumns}
            />

            {/* 3. Attendance Modals */}
            <AttendanceModals
                isAddModalOpen={isAddModalOpen}
                setIsAddModalOpen={setIsAddModalOpen}
                handleSaveNewAttendance={handleSaveNewAttendance}
                formData={formData}
                setFormData={setFormData}
                isEditModalOpen={isEditModalOpen}
                setIsEditModalOpen={setIsEditModalOpen}
                handleSaveEditAttendance={handleSaveEditAttendance}
                isDeleteDialogOpen={isDeleteDialogOpen}
                setIsDeleteDialogOpen={setIsDeleteDialogOpen}
                selectedRecord={selectedRecord}
                handleConfirmDelete={handleConfirmDelete}
            />

            {/* 4. Global Snackbar Toast */}
            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={() => setToast({ ...toast, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setToast({ ...toast, open: false })}
                    severity={toast.severity}
                    variant="filled"
                    sx={{ width: "100%", borderRadius: "8px" }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </div>
    );
}
