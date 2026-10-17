import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Check as CheckIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { CircularProgress, Alert, Button } from '@mui/material';

import { ExpenseTable } from '../../components/ExpenseTable';
import { ExpenseModals } from '../../components/ExpenseModals';
import reportService from '../../../../services/reportService.js';
import {
  toFrontendExpense,
  toFrontendExpenseList,
  toBackendExpensePayload,
} from '../../adapters/reportAdapter';
import '../../../assigned-ui/toolbarStyles.css';

export default function ExpenseReport() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Column visibility state
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    checkbox: true,
    invoiceNo: true,
    date: true,
    expense: true,
    expenseBy: true,
    amount: true,
    paymentMode: true,
    status: true,
    paidTo: true,
    actions: true,
  });

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingItem, setEditingItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState('');

  const filterMenuRef = useRef(null);

  // Close filter dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowColumnMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Fetch Authoritative Expenses from Backend
  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getExpenses({ limit: 100 });
      const rawList = Array.isArray(res?.data?.expenses)
        ? res.data.expenses
        : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.expenses) ? res.expenses : []));
      setExpenses(toFrontendExpenseList(rawList));
    } catch (err) {
      console.error('Failed to load expenses from server:', err);
      setError(err?.message || 'Failed to connect to backend server. Please verify your connection and retry.');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time synchronization on mount, custom event, and window focus
  useEffect(() => {
    loadExpenses();

    const handleSync = () => {
      loadExpenses();
    };

    window.addEventListener('hotel:data-updated', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      window.removeEventListener('hotel:data-updated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [loadExpenses]);

  // Filtered expenses based on search
  const filteredExpenses = useMemo(() => {
    if (!searchTerm.trim()) return expenses;
    const term = searchTerm.toLowerCase();
    return expenses.filter(
      (e) =>
        e.invoiceNo?.toLowerCase().includes(term) ||
        e.date?.toLowerCase().includes(term) ||
        e.expense?.toLowerCase().includes(term) ||
        e.expenseBy?.toLowerCase().includes(term) ||
        e.paymentMode?.toLowerCase().includes(term) ||
        e.status?.toLowerCase().includes(term) ||
        e.paidTo?.toLowerCase().includes(term) ||
        String(e.amount).includes(term)
    );
  }, [expenses, searchTerm]);

  // Pagination calculation
  const totalItems = filteredExpenses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentExpenses = filteredExpenses.slice(startIndex, startIndex + itemsPerPage);

  const startRecord = totalItems === 0 ? 0 : startIndex + 1;
  const endRecord = Math.min(startIndex + itemsPerPage, totalItems);

  // Checkbox handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allCurrentIds = new Set(currentExpenses.map((ex) => ex.id));
      setSelectedIds(allCurrentIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAllSelected = currentExpenses.length > 0 && currentExpenses.every((ex) => selectedIds.has(ex.id));
  const isIndeterminate = currentExpenses.some((ex) => selectedIds.has(ex.id)) && !isAllSelected;

  // Toggle column visibility
  const toggleColumn = (colKey) => {
    setVisibleColumns((prev) => ({ ...prev, [colKey]: !prev[colKey] }));
  };

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadExpenses();
    setIsRefreshing(false);
    showToast('Expenses refreshed from server');
  };

  // Add & Edit modal handlers
  const handleOpenAddModal = () => {
    setModalMode('add');
    const today = new Date().toISOString().slice(0, 10);
    setEditingItem({
      invoiceNo: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      date: today,
      expense: '',
      expenseBy: 'Admin',
      amount: '',
      paymentMode: 'Cash',
      status: 'Paid',
      paidTo: '',
      category: 'General',
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (item, e) => {
    if (e) e.stopPropagation();
    setModalMode('edit');
    setEditingItem({ ...item });
    setIsAddEditModalOpen(true);
    setDetailItem(null);
  };

  const handleSaveModal = async (formData) => {
    try {
      const payload = toBackendExpensePayload(formData);
      if (modalMode === 'add') {
        const res = await reportService.createExpense(payload);
        const created = toFrontendExpense(res?.data || res);
        if (created) {
          setExpenses((prev) => [created, ...prev]);
        }
        showToast(`Added expense "${formData.expense}"`);
      } else {
        const targetId = editingItem._id || editingItem.id || editingItem.invoiceNo;
        const res = await reportService.updateExpense(targetId, payload);
        const updated = toFrontendExpense(res?.data || res);
        if (updated) {
          setExpenses((prev) =>
            prev.map((ex) => (ex.id === editingItem.id ? updated : ex))
          );
        }
        showToast(`Updated expense "${formData.expense}"`);
      }
      setIsAddEditModalOpen(false);
      setEditingItem(null);
      // Trigger real-time update in all tabs
      window.dispatchEvent(new CustomEvent('hotel:data-updated', { detail: { domain: 'expense' } }));
      loadExpenses();
    } catch (err) {
      console.error('Failed to save expense:', err);
      showToast(err?.message || 'Failed to save expense to server');
    }
  };

  // Delete handlers
  const handleDeleteClick = (item, e) => {
    if (e) e.stopPropagation();
    setDeleteConfirmItem(item);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      const targetId = deleteConfirmItem._id || deleteConfirmItem.id || deleteConfirmItem.invoiceNo;
      await reportService.deleteExpense(targetId);
      setExpenses((prev) => prev.filter((ex) => ex.id !== deleteConfirmItem.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteConfirmItem.id);
        return next;
      });
      showToast(`Deleted invoice #${deleteConfirmItem.invoiceNo}`);
      setDeleteConfirmItem(null);
      if (detailItem?.id === deleteConfirmItem.id) {
        setDetailItem(null);
      }
      window.dispatchEvent(new CustomEvent('hotel:data-updated', { detail: { domain: 'expense' } }));
    } catch (err) {
      console.error('Failed to delete expense:', err);
      showToast(err?.message || 'Failed to delete expense from server');
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Delete ${selectedIds.size} selected expense(s)?`)) {
      try {
        const idsArray = Array.from(selectedIds);
        await reportService.bulkDeleteExpenses(idsArray);
        setExpenses((prev) => prev.filter((ex) => !selectedIds.has(ex.id)));
        showToast(`Deleted ${selectedIds.size} expense item(s)`);
        setSelectedIds(new Set());
        window.dispatchEvent(new CustomEvent('hotel:data-updated', { detail: { domain: 'expense' } }));
        loadExpenses();
      } catch (err) {
        console.error('Failed to bulk delete expenses:', err);
        showToast(err?.message || 'Failed to delete selected expenses');
      }
    }
  };

  // Excel Export (.xlsx)
  const handleExportExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const exportRows = filteredExpenses.map((item) => ({
        'Invoice No': item.invoiceNo,
        Date: item.date,
        Expense: item.expense,
        'Expense By': item.expenseBy,
        'Amount ($)': item.amount,
        'Payment Mode': item.paymentMode,
        Status: item.status,
        'Paid To': item.paidTo,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
      XLSX.writeFile(workbook, 'Expenses_Report.xlsx');
      showToast('Exported Expenses_Report.xlsx');
    } catch (err) {
      console.error('Excel export error:', err);
      showToast('Failed to export Excel file');
    }
  };

  // PDF Export (.pdf)
  const handleExportPdf = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF('landscape');
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text('Luxuria - Expense Report', 14, 18);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} | Total Expenses: ${filteredExpenses.length}`, 14, 25);

      const tableRows = filteredExpenses.map((item) => [
        item.invoiceNo,
        item.date,
        item.expense,
        item.expenseBy,
        `$${item.amount}`,
        item.paymentMode,
        item.status,
        item.paidTo,
      ]);

      autoTable(doc, {
        startY: 30,
        head: [['Invoice No', 'Date', 'Expense', 'Expense By', 'Amount', 'Payment Mode', 'Status', 'Paid To']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
      });

      doc.save('Expenses_Report.pdf');
      showToast('Exported Expenses_Report.pdf');
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('Failed to export PDF file');
    }
  };

  // Status Badge Renderer
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-[#e6f7ec] text-[#16a34a]">
            Paid
          </span>
        );
      case 'Unpaid':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-[#ffedd5] text-[#ea580c]">
            Unpaid
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-[#e0f2fe] text-[#2563eb]">
            Pending
          </span>
        );
      default:
        return <span className="text-xs text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="font-sans text-gray-800 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
          <CheckIcon sx={{ fontSize: 18, color: '#10b981' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Banner with Retry */}
      {error && (
        <div className="mb-4">
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={loadExpenses}>
                Retry Connection
              </Button>
            }
          >
            {error}
          </Alert>
        </div>
      )}

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-gray-100 shadow-sm my-4">
          <CircularProgress size={36} sx={{ color: 'var(--primary-main, #3b82f6)' }} />
          <p className="mt-3 text-sm text-gray-500 font-medium">Loading authoritative expenses from database...</p>
        </div>
      ) : (
        /* Main Expense Table */
        <ExpenseTable
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setCurrentPage={setCurrentPage}
          selectedIds={selectedIds}
          handleBulkDelete={handleBulkDelete}
          filterMenuRef={filterMenuRef}
          showColumnMenu={showColumnMenu}
          setShowColumnMenu={setShowColumnMenu}
          visibleColumns={visibleColumns}
          toggleColumn={toggleColumn}
          handleOpenAddModal={handleOpenAddModal}
          handleRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          handleExportExcel={handleExportExcel}
          handleExportPdf={handleExportPdf}
          isAllSelected={isAllSelected}
          isIndeterminate={isIndeterminate}
          handleSelectAll={handleSelectAll}
          currentExpenses={currentExpenses}
          setDetailItem={setDetailItem}
          handleSelectRow={handleSelectRow}
          renderStatusBadge={renderStatusBadge}
          handleOpenEditModal={handleOpenEditModal}
          handleDeleteClick={handleDeleteClick}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          startRecord={startRecord}
          endRecord={endRecord}
          totalItems={totalItems}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      )}

      {/* Expense Modals (Detail, Add/Edit, Delete) */}
      <ExpenseModals
        detailItem={detailItem}
        setDetailItem={setDetailItem}
        handleOpenEditModal={handleOpenEditModal}
        renderStatusBadge={renderStatusBadge}
        isAddEditModalOpen={isAddEditModalOpen}
        setIsAddEditModalOpen={setIsAddEditModalOpen}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        modalMode={modalMode}
        handleSaveModal={handleSaveModal}
        deleteConfirmItem={deleteConfirmItem}
        setDeleteConfirmItem={setDeleteConfirmItem}
        handleConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
