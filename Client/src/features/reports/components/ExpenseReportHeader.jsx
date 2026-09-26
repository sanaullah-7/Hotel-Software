import React from 'react';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  GridOn as GridIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';

export default function ExpenseReportHeader({
  searchTerm,
  setSearchTerm,
  onOpenAddModal,
  onRefresh,
  onExportPDF,
  onExportExcel,
  showColumnMenu,
  setShowColumnMenu,
  showFilterMenu,
  setShowFilterMenu
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-bold text-gray-800">Expense Report</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs w-full sm:w-64 focus:outline-none focus:border-[#1b7f43]"
          />
        </div>

        <button
          onClick={() => setShowFilterMenu((prev) => !prev)}
          className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          title="Filter"
        >
          <FilterIcon fontSize="small" />
        </button>

        <button
          onClick={() => setShowColumnMenu((prev) => !prev)}
          className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          title="Columns"
        >
          <GridIcon fontSize="small" />
        </button>

        <button
          onClick={onExportPDF}
          className="p-2 border border-gray-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          title="Export PDF"
        >
          <PdfIcon fontSize="small" />
        </button>

        <button
          onClick={onRefresh}
          className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          title="Refresh"
        >
          <RefreshIcon fontSize="small" />
        </button>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1b7f43] text-white text-xs font-semibold rounded-lg hover:bg-[#156334] transition-colors cursor-pointer"
        >
          <AddIcon fontSize="small" />
          <span>Add Expense</span>
        </button>
      </div>
    </div>
  );
}
