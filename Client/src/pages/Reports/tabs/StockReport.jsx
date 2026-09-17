import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  GridOn as GridIcon,
  PictureAsPdf as PdfIcon,
  EditOutlined as EditIcon,
  DeleteOutlined as DeleteIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Check as CheckIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';

// 17 default records matching the Luxuria demo template
const DEFAULT_STOCKS = [
  { id: 1, productCode: 'B123451', productName: 'Bed Sheet', status: 'Low Stock', price: 12, category: 'Room Service', quantity: 12 },
  { id: 2, productCode: 'T654321', productName: 'Towel', status: 'In Stock', price: 8, category: 'Bathroom Supplies', quantity: 50 },
  { id: 3, productCode: 'P789012', productName: 'Pillow', status: 'Out of Stock', price: 15, category: 'Room Service', quantity: 0 },
  { id: 4, productCode: 'S345678', productName: 'Shampoo', status: 'Low Stock', price: 5, category: 'Bathroom Supplies', quantity: 10 },
  { id: 5, productCode: 'S987654', productName: 'Soap', status: 'In Stock', price: 3, category: 'Bathroom Supplies', quantity: 100 },
  { id: 6, productCode: 'C123987', productName: 'Coffee', status: 'In Stock', price: 2, category: 'Beverages', quantity: 200 },
  { id: 7, productCode: 'T564738', productName: 'Tea Bags', status: 'In Stock', price: 1, category: 'Beverages', quantity: 300 },
  { id: 8, productCode: 'H135792', productName: 'Hand Sanitizer', status: 'Low Stock', price: 6, category: 'Health & Safety', quantity: 20 },
  { id: 9, productCode: 'K246810', productName: 'Keycard', status: 'In Stock', price: 1, category: 'Room Service', quantity: 500 },
  { id: 10, productCode: 'B111213', productName: 'Bathrobe', status: 'In Stock', price: 25, category: 'Bathroom Supplies', quantity: 30 },
  { id: 11, productCode: 'S778899', productName: 'Slippers', status: 'In Stock', price: 4, category: 'Room Service', quantity: 150 },
  { id: 12, productCode: 'D334455', productName: 'Dental Kit', status: 'In Stock', price: 2, category: 'Bathroom Supplies', quantity: 80 },
  { id: 13, productCode: 'W667788', productName: 'Mineral Water', status: 'In Stock', price: 1.5, category: 'Beverages', quantity: 400 },
  { id: 14, productCode: 'F990011', productName: 'Face Towel', status: 'Low Stock', price: 5, category: 'Bathroom Supplies', quantity: 15 },
  { id: 15, productCode: 'I223344', productName: 'Iron & Board', status: 'In Stock', price: 45, category: 'Room Service', quantity: 20 },
  { id: 16, productCode: 'H556677', productName: 'Hair Dryer', status: 'Out of Stock', price: 30, category: 'Bathroom Supplies', quantity: 0 },
  { id: 17, productCode: 'T889900', productName: 'Trash Bags', status: 'In Stock', price: 0.5, category: 'Housekeeping', quantity: 1000 },
];

const CATEGORIES = [
  'Room Service',
  'Bathroom Supplies',
  'Beverages',
  'Health & Safety',
  'Housekeeping',
  'Electronics',
  'Linens',
];

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

  // Status Badge Renderer
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'In Stock':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-[#e6f7ec] text-[#16a34a]">
            In Stock
          </span>
        );
      case 'Low Stock':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-[#e0f2fe] text-[#2563eb]">
            Low Stock
          </span>
        );
      case 'Out of Stock':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-[#ffedd5] text-[#ea580c]">
            Out of Stock
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

      {/* Main Card Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Card Header Toolbar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
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
          <div className="flex items-center flex-wrap gap-2.5">
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

            {/* Add Record Button (+) in Green */}
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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                {visibleColumns.checkbox && (
                  <th className="py-3.5 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                      }}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                    />
                  </th>
                )}
                {visibleColumns.productCode && (
                  <th className="py-3.5 px-4 text-xs font-semibold text-gray-700 tracking-wider">Product Code</th>
                )}
                {visibleColumns.productName && (
                  <th className="py-3.5 px-4 text-xs font-semibold text-gray-700 tracking-wider">Product Name</th>
                )}
                {visibleColumns.status && (
                  <th className="py-3.5 px-4 text-xs font-semibold text-gray-700 tracking-wider">Status</th>
                )}
                {visibleColumns.price && (
                  <th className="py-3.5 px-4 text-xs font-semibold text-gray-700 tracking-wider">Price</th>
                )}
                {visibleColumns.category && (
                  <th className="py-3.5 px-4 text-xs font-semibold text-gray-700 tracking-wider">Category</th>
                )}
                {visibleColumns.quantity && (
                  <th className="py-3.5 px-4 text-xs font-semibold text-gray-700 tracking-wider">Quantity</th>
                )}
                {visibleColumns.actions && (
                  <th className="py-3.5 px-4 text-xs font-semibold text-gray-700 tracking-wider text-right pr-6">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-sm">
              {currentStocks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    No matching stock items found.
                  </td>
                </tr>
              ) : (
                currentStocks.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors duration-150 hover:bg-gray-50/75 ${
                        isSelected ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      {visibleColumns.checkbox && (
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(item.id)}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                          />
                        </td>
                      )}
                      {visibleColumns.productCode && (
                        <td className="py-3 px-4 font-normal text-gray-600">{item.productCode}</td>
                      )}
                      {visibleColumns.productName && (
                        <td className="py-3 px-4 font-medium text-gray-800">{item.productName}</td>
                      )}
                      {visibleColumns.status && (
                        <td className="py-3 px-4">{renderStatusBadge(item.status)}</td>
                      )}
                      {visibleColumns.price && (
                        <td className="py-3 px-4 font-normal text-gray-700">{item.price}</td>
                      )}
                      {visibleColumns.category && (
                        <td className="py-3 px-4 font-normal text-gray-600">{item.category}</td>
                      )}
                      {visibleColumns.quantity && (
                        <td className="py-3 px-4 font-normal text-gray-700">{item.quantity}</td>
                      )}
                      {visibleColumns.actions && (
                        <td className="py-3 px-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              title="Edit Record"
                              className="text-indigo-600 hover:text-indigo-800 p-1 hover:bg-indigo-50 rounded transition"
                            >
                              <EditIcon sx={{ fontSize: 17 }} />
                            </button>
                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteClick(item)}
                              title="Delete Record"
                              className="text-orange-500 hover:text-orange-700 p-1 hover:bg-orange-50 rounded transition"
                            >
                              <DeleteIcon sx={{ fontSize: 18 }} />
                            </button>
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

        {/* Card Footer / Pagination Controls */}
        <div className="p-4 border-t border-gray-100 flex flex-wrap items-center justify-end gap-6 text-xs text-gray-500 font-medium">
          {/* Items Per Page Select */}
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

          {/* Range Indicator */}
          <div>
            {startRecord} – {endRecord} of {totalItems}
          </div>

          {/* Next / Prev Navigation */}
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

      {/* Add / Edit Record Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-scaleUp">
            {/* Modal Top Header with Solid Vibrant Gradient */}
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="text-base font-semibold tracking-wide">
                {modalMode === 'add' ? 'New Record' : editingItem.productName || 'Edit Record'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveModal(editingItem);
              }}
              className="p-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Product Code */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Product Code*
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.productCode || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, productCode: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800"
                  />
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Product Name*
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.productName || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, productName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Status*
                  </label>
                  <select
                    required
                    value={editingItem.status || 'In Stock'}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800 bg-white"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Category*
                  </label>
                  <select
                    required
                    value={editingItem.category || 'Room Service'}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800 bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    price*
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={editingItem.price === '' ? '' : editingItem.price}
                      onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                      className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800"
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingItem.quantity === '' ? '' : editingItem.quantity}
                    onChange={(e) => setEditingItem({ ...editingItem, quantity: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800"
                  />
                </div>
              </div>

              {/* Form Action Buttons: Save & Cancel */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-7 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition active:scale-95 cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-7 py-2 rounded-full bg-white hover:bg-red-50 text-red-500 border border-red-400 font-medium text-sm transition active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <WarningIcon sx={{ fontSize: 28 }} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Record</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-700">"{deleteConfirmItem.productName}"</span> ({deleteConfirmItem.productCode})? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow-sm transition active:scale-95 cursor-pointer"
              >
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
