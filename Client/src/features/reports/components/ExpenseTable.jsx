import React from 'react';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  GridOn as GridIcon,
  PictureAsPdf as PdfIcon,
  EditOutlined as EditIcon,
  DeleteOutlined as DeleteIcon,
  CalendarToday as CalendarIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
} from '@mui/icons-material';

export const ExpenseTable = ({
  searchTerm,
  setSearchTerm,
  setCurrentPage,
  selectedIds,
  handleBulkDelete,
  filterMenuRef,
  showColumnMenu,
  setShowColumnMenu,
  visibleColumns,
  toggleColumn,
  handleOpenAddModal,
  handleRefresh,
  isRefreshing,
  handleExportExcel,
  handleExportPdf,
  isAllSelected,
  isIndeterminate,
  handleSelectAll,
  currentExpenses,
  setDetailItem,
  handleSelectRow,
  renderStatusBadge,
  handleOpenEditModal,
  handleDeleteClick,
  itemsPerPage,
  setItemsPerPage,
  startRecord,
  endRecord,
  totalItems,
  currentPage,
  totalPages
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Card Header Toolbar */}
      <div className="p-2 sm:p-2.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
        {/* Left Side: Search Bar & Bulk Actions */}
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
              sx={{ fontSize: 18, color: '#9ca3af' }}
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
                <div className="space-y-2 max-h-64 overflow-y-auto text-sm">
                  {[
                    { key: 'checkbox', label: 'Checkbox' },
                    { key: 'invoiceNo', label: 'Invoice No' },
                    { key: 'date', label: 'Date' },
                    { key: 'expense', label: 'Expense' },
                    { key: 'expenseBy', label: 'Expense By' },
                    { key: 'amount', label: 'Amount' },
                    { key: 'paymentMode', label: 'Payment Mode' },
                    { key: 'status', label: 'Status' },
                    { key: 'paidTo', label: 'Paid To' },
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
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                      />
                      <span>{col.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleOpenAddModal}
            title="Add Record"
            className="p-1.5 rounded-full border border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition flex items-center justify-center cursor-pointer"
          >
            <AddIcon sx={{ fontSize: 19 }} />
          </button>

          <button
            onClick={handleRefresh}
            title="Refresh Data"
            className={`p-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition flex items-center justify-center cursor-pointer ${
              isRefreshing ? 'animate-spin text-indigo-600' : ''
            }`}
          >
            <RefreshIcon sx={{ fontSize: 19 }} />
          </button>

          <button
            onClick={handleExportExcel}
            title="Export to Excel (.xlsx)"
            className="p-1.5 rounded-full border border-sky-400 text-sky-600 hover:bg-sky-50 transition flex items-center justify-center cursor-pointer"
          >
            <GridIcon sx={{ fontSize: 19 }} />
          </button>

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
      <div className="overflow-x-auto">
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
                      isSelected ? 'bg-indigo-50/40' : ''
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
                          <CalendarIcon sx={{ fontSize: 15, color: '#9ca3af' }} />
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
                          <button
                            onClick={(e) => handleOpenEditModal(item, e)}
                            title="Edit Record"
                            className="text-indigo-600 hover:text-indigo-800 p-1 hover:bg-indigo-50 rounded transition cursor-pointer"
                          >
                            <EditIcon sx={{ fontSize: 17 }} />
                          </button>
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

      {/* Pagination Controls */}
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
            <option value={25}>25</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div>
          {startRecord} – {endRecord} of {totalItems}
        </div>

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
  );
};
