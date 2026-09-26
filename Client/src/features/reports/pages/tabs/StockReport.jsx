import React, { useState, useMemo, useRef, useEffect } from 'react';
import '../../../assigned-ui/toolbarStyles.css';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  GridOn as GridIcon,
  PictureAsPdf as PdfIcon,
  DeleteOutlined as DeleteIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

import { DEFAULT_STOCKS } from '../../data/stockDemoData';
import StockReportTable from '../../components/StockReportTable';
import StockReportModals from '../../components/StockReportModals';

export default function StockReport() {
  const [stocks, setStocks] = useState(DEFAULT_STOCKS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Column visibility state
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    checkbox: true,
    productCode: true,
    productName: true,
    status: true,
    price: true,
    category: true,
    quantity: true,
    actions: true,
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState('');

  const filterMenuRef = useRef(null);

  // Close filter menu when clicking outside
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

  // Filtered stocks based on search
  const filteredStocks = useMemo(() => {
    if (!searchTerm.trim()) return stocks;
    const term = searchTerm.toLowerCase();
    return stocks.filter(
      (s) =>
        s.productCode.toLowerCase().includes(term) ||
        s.productName.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term) ||
        s.status.toLowerCase().includes(term)
    );
  }, [stocks, searchTerm]);

  // Pagination calculation
  const totalItems = filteredStocks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStocks = filteredStocks.slice(startIndex, startIndex + itemsPerPage);

  const startRecord = totalItems === 0 ? 0 : startIndex + 1;
  const endRecord = Math.min(startIndex + itemsPerPage, totalItems);

  // Checkbox handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allCurrentIds = new Set(currentStocks.map((s) => s.id));
      setSelectedIds(allCurrentIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAllSelected = currentStocks.length > 0 && currentStocks.every((s) => selectedIds.has(s.id));
  const isIndeterminate = currentStocks.some((s) => selectedIds.has(s.id)) && !isAllSelected;

  // Toggle column visibility
  const toggleColumn = (colKey) => {
    setVisibleColumns((prev) => ({ ...prev, [colKey]: !prev[colKey] }));
  };

  // Refresh data handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setStocks(DEFAULT_STOCKS);
      setSearchTerm('');
      setSelectedIds(new Set());
      setCurrentPage(1);
      setIsRefreshing(false);
      showToast('Stocks refreshed to default state');
    }, 400);
  };

  // Add & Edit modal handlers
  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingItem({
      productCode: `P${Math.floor(100000 + Math.random() * 900000)}`,
      productName: '',
      status: 'In Stock',
      category: 'Room Service',
      price: '',
      quantity: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setModalMode('edit');
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleSaveModal = (formData) => {
    if (modalMode === 'add') {
      const newItem = {
        ...formData,
        id: Date.now(),
        price: Number(formData.price) || 0,
        quantity: Number(formData.quantity) || 0,
      };
      setStocks((prev) => [newItem, ...prev]);
      showToast(`Added product "${formData.productName}"`);
    } else {
      setStocks((prev) =>
        prev.map((s) =>
          s.id === editingItem.id
            ? {
                ...s,
                ...formData,
                price: Number(formData.price) || 0,
                quantity: Number(formData.quantity) || 0,
              }
            : s
        )
      );
      showToast(`Updated product "${formData.productName}"`);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // Delete handlers
  const handleDeleteClick = (item) => {
    setDeleteConfirmItem(item);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmItem) return;
    setStocks((prev) => prev.filter((s) => s.id !== deleteConfirmItem.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(deleteConfirmItem.id);
      return next;
    });
    showToast(`Deleted "${deleteConfirmItem.productName}"`);
    setDeleteConfirmItem(null);
  };

  // Bulk Delete
  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Delete ${selectedIds.size} selected item(s)?`)) {
      setStocks((prev) => prev.filter((s) => !selectedIds.has(s.id)));
      showToast(`Deleted ${selectedIds.size} items`);
      setSelectedIds(new Set());
    }
  };

  // Excel Export (.xlsx)
  const handleExportExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const exportRows = filteredStocks.map((item) => ({
        'Product Code': item.productCode,
        'Product Name': item.productName,
        'Status': item.status,
        'Price ($)': item.price,
        'Category': item.category,
        'Quantity': item.quantity,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Stocks');
      XLSX.writeFile(workbook, 'Stocks_Report.xlsx');
      showToast('Exported Stocks_Report.xlsx');
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

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text('Luxuria - Stocks Inventory Report', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} | Total Items: ${filteredStocks.length}`, 14, 28);

      const tableRows = filteredStocks.map((item) => [
        item.productCode,
        item.productName,
        item.status,
        `$${item.price}`,
        item.category,
        item.quantity,
      ]);

      autoTable(doc, {
        startY: 34,
        head: [['Product Code', 'Product Name', 'Status', 'Price', 'Category', 'Quantity']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3.5 },
      });

      doc.save('Stocks_Report.pdf');
      showToast('Exported Stocks_Report.pdf');
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('Failed to export PDF file');
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

      {/* Main Card Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Card Header Toolbar */}
        <div className="p-2 sm:p-2.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">All Stocks</h2>
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="text-xs bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-1 rounded-md font-medium flex items-center gap-1 transition"
              >
                <DeleteIcon sx={{ fontSize: 15 }} />
                Delete Selected ({selectedIds.size})
              </button>
            )}
          </div>

          {/* Right Toolbar Actions */}
          <div className="assigned-table-toolbar flex items-center flex-wrap gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-44 sm:w-56 pl-3 pr-9 py-1.5 text-sm rounded-md border border-gray-200 focus:outline-none focus:border-indigo-500 transition text-gray-700 placeholder-gray-400"
              />
              <SearchIcon
                sx={{ fontSize: 18, color: '#9ca3af' }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              />
            </div>

            {/* Filter / Column Toggle Button */}
            <div className="relative" ref={filterMenuRef}>
              <button
                onClick={() => setShowColumnMenu((prev) => !prev)}
                title="Show/Hide Columns"
                className={`p-1.5 rounded-full border transition flex items-center justify-center ${
                  showColumnMenu
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                    : 'border-gray-200 text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <FilterIcon sx={{ fontSize: 19 }} />
              </button>

              {/* Show/Hide Column Dropdown */}
              {showColumnMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-100 py-3 px-4 z-40 animate-fadeIn">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 mb-2 border-b border-gray-100">
                    Show/Hide Column
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto text-sm">
                    {[
                      { key: 'checkbox', label: 'Checkbox' },
                      { key: 'productCode', label: 'Product Code' },
                      { key: 'productName', label: 'Product Name' },
                      { key: 'status', label: 'Status' },
                      { key: 'price', label: 'Price' },
                      { key: 'category', label: 'Category' },
                      { key: 'quantity', label: 'Quantity' },
                      { key: 'actions', label: 'Actions' },
                    ].map((col) => (
                      <label
                        key={col.key}
                        className="flex items-center gap-2.5 cursor-pointer text-gray-700 hover:text-indigo-600 select-none text-xs font-medium"
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumns[col.key]}
                          onChange={() => toggleColumn(col.key)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span>{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Add Record Button */}
            <button
              onClick={handleOpenAddModal}
              title="Add Record"
              className="p-1.5 rounded-full border border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition flex items-center justify-center"
            >
              <AddIcon sx={{ fontSize: 19 }} />
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              title="Refresh Data"
              className={`p-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition flex items-center justify-center ${
                isRefreshing ? 'animate-spin text-indigo-600' : ''
              }`}
            >
              <RefreshIcon sx={{ fontSize: 19 }} />
            </button>

            {/* Excel Download Button */}
            <button
              onClick={handleExportExcel}
              title="Export to Excel (.xlsx)"
              className="p-1.5 rounded-full border border-sky-400 text-sky-600 hover:bg-sky-50 transition flex items-center justify-center"
            >
              <GridIcon sx={{ fontSize: 19 }} />
            </button>

            {/* PDF Download Button */}
            <button
              onClick={handleExportPdf}
              title="Export to PDF (.pdf)"
              className="p-1.5 rounded-full border border-rose-400 text-rose-600 hover:bg-rose-50 transition flex items-center justify-center"
            >
              <PdfIcon sx={{ fontSize: 19 }} />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <StockReportTable
          currentStocks={currentStocks}
          visibleColumns={visibleColumns}
          selectedIds={selectedIds}
          isAllSelected={isAllSelected}
          isIndeterminate={isIndeterminate}
          handleSelectAll={handleSelectAll}
          handleSelectRow={handleSelectRow}
          handleOpenEditModal={handleOpenEditModal}
          handleDeleteClick={handleDeleteClick}
        />

        {/* Card Footer / Pagination Controls */}
        <div className="p-2 border-t border-gray-100 flex flex-wrap items-center justify-end gap-4 text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-2">
            <span>Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:border-indigo-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div>
            {startRecord} – {endRecord} of {totalItems}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition text-gray-700"
            >
              <PrevIcon sx={{ fontSize: 18 }} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition text-gray-700"
            >
              <NextIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <StockReportModals
        isModalOpen={isModalOpen}
        modalMode={modalMode}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        setIsModalOpen={setIsModalOpen}
        handleSaveModal={handleSaveModal}
        deleteConfirmItem={deleteConfirmItem}
        setDeleteConfirmItem={setDeleteConfirmItem}
        handleConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
