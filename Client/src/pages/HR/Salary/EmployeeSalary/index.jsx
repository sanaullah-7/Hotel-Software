import React from 'react';
import { Alert, Snackbar } from '@mui/material';

import { useEmployeeSalary } from './useEmployeeSalary';
import { SalaryTable } from './SalaryTable';
import { SalaryModals } from './SalaryModals';

export default function EmployeeSalary() {
  const {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    appliedYear,
    appliedMonth,
    handleUpdateRoster,
    handleYearChange,
    handleMonthChange,
    salaries,
    isLoading,
    error,
    fetchSalaries,
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
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    paymentRecord,
    paymentForm,
    setPaymentForm,
    isSavingPayment,
    handleOpenPaymentModal,
    handleSavePayment,
    isHistoryModalOpen,
    setIsHistoryModalOpen,
    historyEmployee,
    historyList,
    isHistoryLoading,
    handleOpenHistoryModal,
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
    payrollStats,
  } = useEmployeeSalary();

  return (
    <div className="animate-fade-in w-full">
      {/* Error Banner with Retry */}
      {error && (
        <div className="mt-1 mb-2">
          <Alert
            severity="error"
            action={
              <button
                type="button"
                onClick={() => fetchSalaries(selectedYear, selectedMonth)}
                className="text-xs font-semibold underline hover:text-red-900 cursor-pointer"
              >
                Retry
              </button>
            }
          >
            {error}
          </Alert>
        </div>
      )}

      {/* 1. KPI Summary Cards at the Top */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full mt-1 mb-1">
        {payrollStats.map((card) => {
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
                <div className="text-xl font-bold text-gray-900 leading-none mb-1">
                  {card.value}
                </div>
                <div className="text-[11px] text-gray-500 font-medium">{card.title}</div>
                <div className="text-[9.5px] text-gray-400 mt-0.5">{card.subtext}</div>
              </div>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}
              >
                <IconComp sx={{ fontSize: 16 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Salary Table with Year & Month in Middle */}
      <SalaryTable
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setPage={setPage}
        setFilterAnchorEl={setFilterAnchorEl}
        handleOpenAddModal={handleOpenAddModal}
        handleRefresh={handleRefresh}
        isRefreshing={isRefreshing || isLoading}
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
        handleOpenPaymentModal={handleOpenPaymentModal}
        handleOpenHistoryModal={handleOpenHistoryModal}
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
        // Month / Year in Middle of Table
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        appliedYear={appliedYear}
        appliedMonth={appliedMonth}
        handleUpdateRoster={handleUpdateRoster}
        handleYearChange={handleYearChange}
        handleMonthChange={handleMonthChange}
        isLoading={isLoading}
      />

      {/* 3. Salary Modals & Dialogs (Add, Edit, Delete, Payment, History Ledger) */}
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
        // Payment Modal
        isPaymentModalOpen={isPaymentModalOpen}
        setIsPaymentModalOpen={setIsPaymentModalOpen}
        paymentRecord={paymentRecord}
        paymentForm={paymentForm}
        setPaymentForm={setPaymentForm}
        isSavingPayment={isSavingPayment}
        handleSavePayment={handleSavePayment}
        // History Ledger Modal
        isHistoryModalOpen={isHistoryModalOpen}
        setIsHistoryModalOpen={setIsHistoryModalOpen}
        historyEmployee={historyEmployee}
        historyList={historyList}
        isHistoryLoading={isHistoryLoading}
        handleDownloadPayslip={handleDownloadPayslip}
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
