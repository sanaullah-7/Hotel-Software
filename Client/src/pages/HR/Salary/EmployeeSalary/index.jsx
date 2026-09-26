import React from 'react';
import { Alert, Snackbar } from '@mui/material';

import { useEmployeeSalary } from './useEmployeeSalary';
import { SalaryTable } from './SalaryTable';
import { SalaryModals } from './SalaryModals';

export default function EmployeeSalary() {
  const {
    salaries,
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
    filterAnchorEl,
    setFilterAnchorEl,
    columnAnchorEl,
    setColumnAnchorEl,
    departmentFilter,
    setDepartmentFilter,
    visibleColumns,
    setVisibleColumns,
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
    handleSort,
    paginatedSalaries,
    sortedSalaries,
    filteredSalaries,
    handleSelectAll,
    handleSelectRow,
    isAllSelected,
    isSomeSelected,
    handleRefresh,
    handleExportPDF,
    handleDownloadPayslip,
    handleOpenAddModal,
    handleSaveNewSalary,
    handleOpenEditModal,
    handleSaveEditSalary,
    handleOpenDeleteDialog,
    handleConfirmDelete,
    payrollStats
  } = useEmployeeSalary();

  return (
    <div className="p-0 -mx-1 sm:-mx-1.5 md:-mx-2 w-[calc(100%+8px)] sm:w-[calc(100%+12px)] md:w-[calc(100%+16px)] overflow-hidden flex flex-col gap-2">
      {/* 1. Payroll Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full">
        {payrollStats.map((card) => {
          const IconComp = card.icon;
          return (
            <div
              key={card.id}
              className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] px-3 py-2 flex flex-col justify-between hover:border-[var(--primary-main)]/30 transition-colors"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <div className={`p-1 rounded-md ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0`}>
                  <IconComp sx={{ fontSize: 15 }} />
                </div>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider truncate">
                  {card.title}
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-[var(--text-primary)] leading-none">
                  {card.value}
                </span>
              </div>
              {card.subtext && (
                <span className="text-[10px] text-[var(--text-secondary)] font-normal truncate mt-0.5 block" title={card.subtext}>
                  {card.subtext}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 2. Salary Table */}
      <SalaryTable
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
        paginatedSalaries={paginatedSalaries}
        selectedIds={selectedIds}
        handleSelectRow={handleSelectRow}
        handleDownloadPayslip={handleDownloadPayslip}
        handleOpenEditModal={handleOpenEditModal}
        handleOpenDeleteDialog={handleOpenDeleteDialog}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        filteredSalaries={filteredSalaries}
        page={page}
        filterAnchorEl={filterAnchorEl}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        columnAnchorEl={columnAnchorEl}
        setVisibleColumns={setVisibleColumns}
      />

      {/* 3. Salary Modals & Dialogs */}
      <SalaryModals
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        handleSaveNewSalary={handleSaveNewSalary}
        formData={formData}
        setFormData={setFormData}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        handleSaveEditSalary={handleSaveEditSalary}
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: '8px' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      {/* 5. Footer Copyright Note */}
      <div className="text-center text-xs text-slate-400 py-3">
        Copyright © 2026 Design By <span className="text-[#5d5fef] font-medium">Luxuria</span>
      </div>
    </div>
  );
}
