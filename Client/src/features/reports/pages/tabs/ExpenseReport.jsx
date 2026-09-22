import React, { useState, useMemo, useRef, useEffect } from'react';
import '../../../assigned-ui/toolbarStyles.css';
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
 CalendarToday as CalendarIcon,
 Receipt as InvoiceIcon,
 Person as PersonIcon,
 AttachMoney as MoneyIcon,
 CreditCard as PaymentIcon,
 Business as VendorIcon,
 CheckCircleOutlined as StatusIcon,
 ChevronLeft as PrevIcon,
 ChevronRight as NextIcon,
 Check as CheckIcon,
 WarningAmber as WarningIcon,
} from'@mui/icons-material';

// 13 default expense records matching the Luxuria demo template
const DEFAULT_EXPENSES = [
 { id: 1, invoiceNo:'1008', date:'02/12/2022', expense:'New Laptop', expenseBy:'John Deo', amount: 158, paymentMode:'Cash', status:'Paid', paidTo:'Flipkart' },
 { id: 2, invoiceNo:'8965', date:'02/15/2022', expense:'Advertising', expenseBy:'Sarah Smith', amount: 568, paymentMode:'Cheque', status:'Unpaid', paidTo:'Ananda Media' },
 { id: 3, invoiceNo:'4587', date:'02/18/2022', expense:'Insurance Premium', expenseBy:'Edna Gilbert', amount: 2458, paymentMode:'Credit Card', status:'Paid', paidTo:'Max Life Prem' },
 { id: 4, invoiceNo:'5897', date:'02/19/2022', expense:'Employee Salary', expenseBy:'Shelia Oster', amount: 12875, paymentMode:'Cash', status:'Paid', paidTo:'Employee' },
 { id: 5, invoiceNo:'2258', date:'02/22/2022', expense:'Electricity Bill', expenseBy:'Barbara Green', amount: 365, paymentMode:'Cheque', status:'Paid', paidTo:'Torrent Power' },
 { id: 6, invoiceNo:'1236', date:'03/12/2022', expense:'Transportation', expenseBy:'Sarah Smith', amount: 54, paymentMode:'Cheque', status:'Paid', paidTo:'Bharat Travels' },
 { id: 7, invoiceNo:'4569', date:'03/25/2022', expense:'Postage and Stationery', expenseBy:'Marie Brooks', amount: 412, paymentMode:'Credit Card', status:'Paid', paidTo:'Abc Transport' },
 { id: 8, invoiceNo:'7852', date:'04/10/2022', expense:'Rent', expenseBy:'Kara Thornton', amount: 228, paymentMode:'Cash', status:'Unpaid', paidTo:'Rajesh Sharma' },
 { id: 9, invoiceNo:'9632', date:'04/15/2022', expense:'Business Meals', expenseBy:'Joseph Nye', amount: 184, paymentMode:'Credit Card', status:'Paid', paidTo:'Taj Hotel' },
 { id: 10, invoiceNo:'7412', date:'05/05/2022', expense:'Charitable Donations', expenseBy:'Ricardo Watson', amount: 149, paymentMode:'Cash', status:'Paid', paidTo:'Kirti Oldage Home' },
 { id: 11, invoiceNo:'8523', date:'05/12/2022', expense:'Software Subscription', expenseBy:'David Lee', amount: 99, paymentMode:'Credit Card', status:'Paid', paidTo:'Adobe Inc' },
 { id: 12, invoiceNo:'9512', date:'05/20/2022', expense:'Water Bill', expenseBy:'Emma Wilson', amount: 120, paymentMode:'Bank Transfer', status:'Paid', paidTo:'City Water Board' },
 { id: 13, invoiceNo:'3574', date:'06/01/2022', expense:'Repair & Maintenance', expenseBy:'Michael Brown', amount: 350, paymentMode:'Debit Card', status:'Unpaid', paidTo:'Quick Fix Repairs' },
];

const PAYMENT_MODES = ['Cash','Cheque','Credit Card','Debit Card','Bank Transfer'];
const STATUSES = ['Paid','Unpaid','Pending'];

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
 const [modalMode, setModalMode] = useState('add'); //'add' |'edit'
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
 invoiceNo:`${Math.floor(1000 + Math.random() * 9000)}`,
 date: today,
 expense:'',
 expenseBy:'',
 amount:'',
 paymentMode:'Cash',
 status:'Paid',
 paidTo:'',
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
 if (modalMode ==='add') {
 const newItem = {
 ...formData,
 id: Date.now(),
 amount: Number(formData.amount) || 0,
 };
 setExpenses((prev) => [newItem, ...prev]);
 showToast(`Added expense"${formData.expense}"`);
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
 showToast(`Updated expense"${formData.expense}"`);
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
 const exportRows = filteredExpenses.map((item) => ({'Invoice No': item.invoiceNo,'Date': item.date,'Expense': item.expense,'Expense By': item.expenseBy,'Amount ($)': item.amount,'Payment Mode': item.paymentMode,'Status': item.status,'Paid To': item.paidTo,
 }));

 const worksheet = XLSX.utils.json_to_sheet(exportRows);
 const workbook = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(workbook, worksheet,'Expenses');
 XLSX.writeFile(workbook,'Expenses_Report.xlsx');
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
 item.expenseBy,`$${item.amount}`,
 item.paymentMode,
 item.status,
 item.paidTo,
 ]);

 autoTable(doc, {
 startY: 30,
 head: [['Invoice No','Date','Expense','Expense By','Amount','Payment Mode','Status','Paid To']],
 body: tableRows,
 theme:'striped',
 headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle:'bold' },
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
 case'Paid':
 return (
 <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-[#e6f7ec] text-[#16a34a]">
 Paid
 </span>
 );
 case'Unpaid':
 return (
 <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-[#ffedd5] text-[#ea580c]">
 Unpaid
 </span>
 );
 case'Pending':
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
 <CheckIcon sx={{ fontSize: 18, color:'#10b981' }} />
 <span>{toastMessage}</span>
 </div>
 )}

 {/* Main Card Container */}
 <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
 {/* Card Header Toolbar */}
 <div className="p-2 sm:p-2.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
 {/* Left Side: Search Bar (replacing All Expenses heading) & Bulk Actions */}
 <div className="flex items-center gap-2">
 <div className="relative">
 <input
 type="text"
 placeholder="Search..."
 value={searchTerm}
 onChange={(e) => {
 setSearchTerm(e.target.value);
 setCurrentPage(1);
 }}
 className="w-52 sm:w-64 pl-3.5 pr-9 py-2 text-sm bg-slate-50 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition text-gray-700 placeholder-gray-400"
 />
 <SearchIcon
 sx={{ fontSize: 18, color:'#9ca3af' }}
 className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
 />
 </div>

 {selectedIds.size > 0 && (
 <button
 onClick={handleBulkDelete}
 className="text-xs bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition cursor-pointer"
 >
 <DeleteIcon sx={{ fontSize: 15 }} />
 Delete Selected ({selectedIds.size})
 </button>
 )}
 </div>

 {/* Right Toolbar Actions */}
 <div className="assigned-table-toolbar flex items-center flex-wrap gap-2.5">

 {/* Filter / Column Toggle Button */}
 <div className="relative" ref={filterMenuRef}>
 <button
 onClick={() => setShowColumnMenu((prev) => !prev)}
 title="Show/Hide Columns"
 className={`p-1.5 rounded-full border transition flex items-center justify-center cursor-pointer ${
 showColumnMenu
 ?'border-indigo-500 bg-indigo-50 text-indigo-600'
 :'border-gray-200 text-indigo-600 hover:bg-gray-50'
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
 <div className="space-y-2 max-h-64 overflow-y-auto text-sm">
 {[
 { key:'checkbox', label:'Checkbox' },
 { key:'invoiceNo', label:'Invoice No' },
 { key:'date', label:'Date' },
 { key:'expense', label:'Expense' },
 { key:'expenseBy', label:'Expense By' },
 { key:'amount', label:'Amount' },
 { key:'paymentMode', label:'Payment Mode' },
 { key:'status', label:'Status' },
 { key:'paidTo', label:'Paid To' },
 { key:'actions', label:'Actions' },
 ].map((col) => (
 <label
 key={col.key}
 className="flex items-center gap-2.5 cursor-pointer text-gray-700 hover:text-indigo-600 select-none text-xs font-medium"
 >
 <input
 type="checkbox"
 checked={visibleColumns[col.key]}
 onChange={() => toggleColumn(col.key)}
 className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
 />
 <span>{col.label}</span>
 </label>
 ))}
 </div>
 </div>
 )}
 </div>

 {/* Add Record Button (+) */}
 <button
 onClick={handleOpenAddModal}
 title="Add Record"
 className="p-1.5 rounded-full border border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition flex items-center justify-center cursor-pointer"
 >
 <AddIcon sx={{ fontSize: 19 }} />
 </button>

 {/* Refresh Button */}
 <button
 onClick={handleRefresh}
 title="Refresh Data"
 className={`p-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition flex items-center justify-center cursor-pointer ${
 isRefreshing ?'animate-spin text-indigo-600' :''
 }`}
 >
 <RefreshIcon sx={{ fontSize: 19 }} />
 </button>

 {/* Excel Download Button */}
 <button
 onClick={handleExportExcel}
 title="Export to Excel (.xlsx)"
 className="p-1.5 rounded-full border border-sky-400 text-sky-600 hover:bg-sky-50 transition flex items-center justify-center cursor-pointer"
 >
 <GridIcon sx={{ fontSize: 19 }} />
 </button>

 {/* PDF Download Button */}
 <button
 onClick={handleExportPdf}
 title="Export to PDF (.pdf)"
 className="p-1.5 rounded-full border border-rose-400 text-rose-600 hover:bg-rose-50 transition flex items-center justify-center cursor-pointer"
 >
 <PdfIcon sx={{ fontSize: 19 }} />
 </button>
 </div>
 </div>

 {/* Data Table */}
 <div className="">
 <table className="w-full text-left border-collapse min-w-[950px]">
 <thead>
 <tr className="border-b border-gray-100 bg-white">
 {visibleColumns.checkbox && (
 <th className="py-2 px-2.5 w-10 text-center">
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
 {visibleColumns.invoiceNo && (
 <th className="py-2 px-2.5 text-xs font-semibold text-gray-700 tracking-wider">Invoice No</th>
 )}
 {visibleColumns.date && (
 <th className="py-2 px-2.5 text-xs font-semibold text-gray-700 tracking-wider">Date</th>
 )}
 {visibleColumns.expense && (
 <th className="py-2 px-2.5 text-xs font-semibold text-gray-700 tracking-wider">Expense</th>
 )}
 {visibleColumns.expenseBy && (
 <th className="py-2 px-2.5 text-xs font-semibold text-gray-700 tracking-wider">Expense By</th>
 )}
 {visibleColumns.amount && (
 <th className="py-2 px-2.5 text-xs font-semibold text-gray-700 tracking-wider">Amount</th>
 )}
 {visibleColumns.paymentMode && (
 <th className="py-2 px-2.5 text-xs font-semibold text-gray-700 tracking-wider">Payment Mode</th>
 )}
 {visibleColumns.status && (
 <th className="py-2 px-2.5 text-xs font-semibold text-gray-700 tracking-wider">Status</th>
 )}
 {visibleColumns.paidTo && (
 <th className="py-2 px-2.5 text-xs font-semibold text-gray-700 tracking-wider">Paid To</th>
 )}
 {visibleColumns.actions && (
 <th className="py-2 px-2.5 text-xs font-semibold text-gray-700 tracking-wider text-right pr-4">
 Actions
 </th>
 )}
 </tr>
 </thead>

 <tbody className="divide-y divide-gray-100 text-sm">
 {currentExpenses.length === 0 ? (
 <tr>
 <td colSpan={10} className="text-center py-12 text-gray-400">
 No matching expense records found.
 </td>
 </tr>
 ) : (
 currentExpenses.map((item) => {
 const isSelected = selectedIds.has(item.id);
 return (
 <tr
 key={item.id}
 onClick={() => setDetailItem(item)}
 className={`transition-colors duration-150 hover:bg-gray-50/75 cursor-pointer ${
 isSelected ?'bg-indigo-50/40' :''
 }`}
 >
 {visibleColumns.checkbox && (
 <td className="py-1.5 px-2.5 text-center" onClick={(e) => e.stopPropagation()}>
 <input
 type="checkbox"
 checked={isSelected}
 onChange={(e) => handleSelectRow(item.id, e)}
 className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
 />
 </td>
 )}
 {visibleColumns.invoiceNo && (
 <td className="py-1.5 px-2.5 font-normal text-gray-600">{item.invoiceNo}</td>
 )}
 {visibleColumns.date && (
 <td className="py-1.5 px-2.5 font-normal text-gray-600">
 <span className="flex items-center gap-1.5">
 <CalendarIcon sx={{ fontSize: 15, color:'#9ca3af' }} />
 <span>{item.date}</span>
 </span>
 </td>
 )}
 {visibleColumns.expense && (
 <td className="py-1.5 px-2.5 font-medium text-gray-800">{item.expense}</td>
 )}
 {visibleColumns.expenseBy && (
 <td className="py-1.5 px-2.5 font-normal text-gray-600">{item.expenseBy}</td>
 )}
 {visibleColumns.amount && (
 <td className="py-1.5 px-2.5 font-normal text-gray-700">${item.amount}</td>
 )}
 {visibleColumns.paymentMode && (
 <td className="py-1.5 px-2.5 font-normal text-gray-600">{item.paymentMode}</td>
 )}
 {visibleColumns.status && (
 <td className="py-1.5 px-2.5">{renderStatusBadge(item.status)}</td>
 )}
 {visibleColumns.paidTo && (
 <td className="py-1.5 px-2.5 font-normal text-gray-600">{item.paidTo}</td>
 )}
 {visibleColumns.actions && (
 <td className="py-1.5 px-2.5 text-right pr-4" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center justify-end gap-2">
 {/* Edit Button */}
 <button
 onClick={(e) => handleOpenEditModal(item, e)}
 title="Edit Record"
 className="text-indigo-600 hover:text-indigo-800 p-1 hover:bg-indigo-50 rounded transition cursor-pointer"
 >
 <EditIcon sx={{ fontSize: 17 }} />
 </button>
 {/* Delete Button */}
 <button
 onClick={(e) => handleDeleteClick(item, e)}
 title="Delete Record"
 className="text-orange-500 hover:text-orange-700 p-1 hover:bg-orange-50 rounded transition cursor-pointer"
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
 <div className="p-2 border-t border-gray-100 flex flex-wrap items-center justify-end gap-4 text-xs text-gray-500 font-medium">
 {/* Items Per Page */}
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
 <option value={25}>25</option>
 <option value={100}>100</option>
 </select>
 </div>

 {/* Range Indicator */}
 <div>
 {startRecord} – {endRecord} of {totalItems}
 </div>

 {/* Navigation Arrows */}
 <div className="flex items-center gap-1">
 <button
 onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
 disabled={currentPage === 1}
 className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition text-gray-700 cursor-pointer"
 >
 <PrevIcon sx={{ fontSize: 18 }} />
 </button>
 <button
 onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
 disabled={currentPage === totalPages || totalPages === 0}
 className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition text-gray-700 cursor-pointer"
 >
 <NextIcon sx={{ fontSize: 18 }} />
 </button>
 </div>
 </div>
 </div>

 {/* Row Detail View Modal */}
 {detailItem && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fadeIn">
 <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scaleUp">
 {/* Modal Header */}
 <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4 flex items-center justify-between text-white">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
 {detailItem.expenseBy.charAt(0)}
 </div>
 <div>
 <h3 className="text-base font-semibold tracking-wide">All Expenses</h3>
 <div className="text-xs text-indigo-100 font-medium">{detailItem.status}</div>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={() => handleOpenEditModal(detailItem)}
 title="Edit Expense"
 className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
 >
 <EditIcon sx={{ fontSize: 16 }} />
 </button>
 <button
 onClick={() => setDetailItem(null)}
 title="Close"
 className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
 >
 <CloseIcon sx={{ fontSize: 16 }} />
 </button>
 </div>
 </div>

 {/* Modal Detail Cards Grid (Matching Luxuria) */}
 <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
 {/* Invoice No */}
 <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-lg flex items-center gap-3">
 <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
 <InvoiceIcon sx={{ fontSize: 18 }} />
 </div>
 <div>
 <div className="text-[11px] font-semibold text-gray-400 uppercase">Invoice No</div>
 <div className="text-sm font-semibold text-gray-800">{detailItem.invoiceNo}</div>
 </div>
 </div>

 {/* Date */}
 <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-lg flex items-center gap-3">
 <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
 <CalendarIcon sx={{ fontSize: 18 }} />
 </div>
 <div>
 <div className="text-[11px] font-semibold text-gray-400 uppercase">Date</div>
 <div className="text-sm font-semibold text-gray-800">{detailItem.date}</div>
 </div>
 </div>

 {/* Expense */}
 <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-lg flex items-center gap-3">
 <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
 <InvoiceIcon sx={{ fontSize: 18 }} />
 </div>
 <div>
 <div className="text-[11px] font-semibold text-gray-400 uppercase">Expense</div>
 <div className="text-sm font-semibold text-gray-800">{detailItem.expense}</div>
 </div>
 </div>

 {/* Expense By */}
 <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-lg flex items-center gap-3">
 <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
 <PersonIcon sx={{ fontSize: 18 }} />
 </div>
 <div>
 <div className="text-[11px] font-semibold text-gray-400 uppercase">Expense By</div>
 <div className="text-sm font-semibold text-gray-800">{detailItem.expenseBy}</div>
 </div>
 </div>

 {/* Amount */}
 <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-lg flex items-center gap-3">
 <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
 <MoneyIcon sx={{ fontSize: 18 }} />
 </div>
 <div>
 <div className="text-[11px] font-semibold text-gray-400 uppercase">Amount</div>
 <div className="text-sm font-semibold text-gray-800">${detailItem.amount}</div>
 </div>
 </div>

 {/* Payment Mode */}
 <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-lg flex items-center gap-3">
 <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
 <PaymentIcon sx={{ fontSize: 18 }} />
 </div>
 <div>
 <div className="text-[11px] font-semibold text-gray-400 uppercase">Payment Mode</div>
 <div className="text-sm font-semibold text-gray-800">{detailItem.paymentMode}</div>
 </div>
 </div>

 {/* Status */}
 <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-lg flex items-center gap-3">
 <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
 <StatusIcon sx={{ fontSize: 18 }} />
 </div>
 <div>
 <div className="text-[11px] font-semibold text-gray-400 uppercase">Status</div>
 <div className="mt-0.5">{renderStatusBadge(detailItem.status)}</div>
 </div>
 </div>

 {/* Paid To */}
 <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-lg flex items-center gap-3">
 <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
 <VendorIcon sx={{ fontSize: 18 }} />
 </div>
 <div>
 <div className="text-[11px] font-semibold text-gray-400 uppercase">Paid To</div>
 <div className="text-sm font-semibold text-gray-800">{detailItem.paidTo}</div>
 </div>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Add / Edit Record Modal */}
 {isAddEditModalOpen && editingItem && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fadeIn">
 <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-scaleUp">
 {/* Modal Header */}
 <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4 flex items-center justify-between text-white">
 <h3 className="text-base font-semibold tracking-wide">
 {modalMode ==='add' ?'New Record' : editingItem.expense ||'Edit Record'}
 </h3>
 <button
 onClick={() => setIsAddEditModalOpen(false)}
 className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
 >
 <CloseIcon sx={{ fontSize: 16 }} />
 </button>
 </div>

 {/* Modal Form */}
 <form
 onSubmit={(e) => {
 e.preventDefault();
 handleSaveModal(editingItem);
 }}
 className="p-6"
 >
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
 {/* Invoice No */}
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1">
 Invoice No*
 </label>
 <input
 type="text"
 required
 value={editingItem.invoiceNo ||''}
 onChange={(e) => setEditingItem({ ...editingItem, invoiceNo: e.target.value })}
 className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800"
 />
 </div>

 {/* Date */}
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1">
 Date*
 </label>
 <input
 type="date"
 required
 value={editingItem.date ||''}
 onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
 className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800"
 />
 </div>

 {/* Expense */}
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1">
 Expense*
 </label>
 <input
 type="text"
 required
 value={editingItem.expense ||''}
 onChange={(e) => setEditingItem({ ...editingItem, expense: e.target.value })}
 className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800"
 />
 </div>

 {/* Expense By */}
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1">
 Expense By*
 </label>
 <input
 type="text"
 required
 value={editingItem.expenseBy ||''}
 onChange={(e) => setEditingItem({ ...editingItem, expenseBy: e.target.value })}
 className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800"
 />
 </div>

 {/* Amount */}
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1">
 Amount*
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
 value={editingItem.amount ==='' ?'' : editingItem.amount}
 onChange={(e) => setEditingItem({ ...editingItem, amount: e.target.value })}
 className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800"
 />
 </div>
 </div>

 {/* Payment Mode */}
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1">
 Payment Mode*
 </label>
 <select
 required
 value={editingItem.paymentMode ||'Cash'}
 onChange={(e) => setEditingItem({ ...editingItem, paymentMode: e.target.value })}
 className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800 bg-white"
 >
 {PAYMENT_MODES.map((mode) => (
 <option key={mode} value={mode}>
 {mode}
 </option>
 ))}
 </select>
 </div>

 {/* Status */}
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1">
 Status*
 </label>
 <select
 required
 value={editingItem.status ||'Paid'}
 onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
 className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-800 bg-white"
 >
 {STATUSES.map((st) => (
 <option key={st} value={st}>
 {st}
 </option>
 ))}
 </select>
 </div>

 {/* Paid To */}
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1">
 Paid To*
 </label>
 <input
 type="text"
 required
 value={editingItem.paidTo ||''}
 onChange={(e) => setEditingItem({ ...editingItem, paidTo: e.target.value })}
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
 onClick={() => setIsAddEditModalOpen(false)}
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
 Are you sure you want to delete <span className="font-semibold text-gray-700">"{deleteConfirmItem.expense}"</span> (Invoice #{deleteConfirmItem.invoiceNo})? This action cannot be undone.
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
