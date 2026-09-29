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
    <div className="animate-fade-in">
      {/* 1. Payroll Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full mt-1">
        {payrollStats.map((card) => {
          const IconComp = card.icon;
          const bg = card.iconBg || 'bg-blue-50';
          const color = card.iconColor || 'text-blue-600';
          const colorClass = `${bg} ${color}`;
          return (
            <div
              key={card.id}
              className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between"
            >
              <div>
                <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{card.value}</div>
                <div className="text-[13px] text-gray-500 font-medium">{card.title}</div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                <IconComp sx={{ fontSize: 18 }} />
              </div>
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

      
    </div>
  );
}
