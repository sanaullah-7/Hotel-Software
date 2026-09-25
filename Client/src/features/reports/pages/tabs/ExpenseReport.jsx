import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Check as CheckIcon } from '@mui/icons-material';

import { DEFAULT_EXPENSES } from '../../data/expenseDemoData';
import { ExpenseTable } from '../../components/ExpenseTable';
import { ExpenseModals } from '../../components/ExpenseModals';
import '../../../assigned-ui/toolbarStyles.css';

export default function ExpenseReport() {
  const [expenses, setExpenses] = useState(DEFAULT_EXPENSES);
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

  // Filtered expenses based on search
  const filteredExpenses = useMemo(() => {
    if (!searchTerm.trim()) return expenses;
    const term = searchTerm.toLowerCase();
    return expenses.filter(
      (e) =>
        e.invoiceNo.toLowerCase().includes(term) ||
        e.date.toLowerCase().includes(term) ||
        e.expense.toLowerCase().includes(term) ||
        e.expenseBy.toLowerCase().includes(term) ||
        e.paymentMode.toLowerCase().includes(term) ||
        e.status.toLowerCase().includes(term) ||
        e.paidTo.toLowerCase().includes(term) ||
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
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setExpenses(DEFAULT_EXPENSES);
      setSearchTerm('');
      setSelectedIds(new Set());
      setCurrentPage(1);
      setIsRefreshing(false);
      showToast('Expenses refreshed to default state');
    }, 400);
  };

  // Add & Edit modal handlers
  const handleOpenAddModal = () => {
    setModalMode('add');
    const today = new Date().toISOString().slice(0, 10);
    setEditingItem({
      invoiceNo: `${Math.floor(1000 + Math.random() * 9000)}`,
      date: today,
      expense: '',
      expenseBy: '',
      amount: '',
      paymentMode: 'Cash',
      status: 'Paid',
      paidTo: '',
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

  const handleSaveModal = (formData) => {
    if (modalMode === 'add') {
      const newItem = {
        ...formData,
        id: Date.now(),
        amount: Number(formData.amount) || 0,
      };
      setExpenses((prev) => [newItem, ...prev]);
      showToast(`Added expense "${formData.expense}"`);
    } else {
      setExpenses((prev) =>
        prev.map((ex) =>
          ex.id === editingItem.id
            ? {
                ...ex,
                ...formData,
                amount: Number(formData.amount) || 0,
              }
            : ex
        )
      );
      showToast(`Updated expense "${formData.expense}"`);
    }
    setIsAddEditModalOpen(false);
    setEditingItem(null);
  };

  // Delete handlers
  const handleDeleteClick = (item, e) => {
    if (e) e.stopPropagation();
    setDeleteConfirmItem(item);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmItem) return;
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
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Delete ${selectedIds.size} selected expense(s)?`)) {
      setExpenses((prev) => prev.filter((ex) => !selectedIds.has(ex.id)));
      showToast(`Deleted ${selectedIds.size} expense item(s)`);
      setSelectedIds(new Set());
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

      {/* Main Expense Table */}
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
