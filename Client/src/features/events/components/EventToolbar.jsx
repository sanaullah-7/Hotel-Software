import React from 'react';
import {
  FilterList as FilterIcon,
  GridView as GridIcon,
  TableRows as TableIcon,
  PictureAsPdf as PdfIcon,
  FileDownload as DownloadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import SearchInput from '../../../components/common/SearchInput';
import RefreshButton from '../../../components/common/RefreshButton';

export default function EventToolbar({
  searchQuery,
  onSearchChange,
  selectedCount = 0,
  onBulkDelete,
  isFilterOpen,
  onToggleFilter,
  viewMode,
  onViewModeChange,
  onRefresh,
  onExportPDF,
  onExportExcel,
  filterType,
  onFilterTypeChange,
  typeOptions = [],
  filterVenue,
  onFilterVenueChange,
  venueOptions = [],
  filterStatus,
  onFilterStatusChange,
  statusOptions = []
}) {
  return (
    <>
      {/* Card Header & Action Toolbar */}
      <div className="p-2 sm:p-2.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Left Side: Search Bar Input & Bulk Actions */}
        <div className="assigned-table-toolbar flex items-center gap-2 flex-1 max-w-md">
          <SearchInput
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            variant="slate"
            size="sm"
            width="w-full sm:w-72"
          />

          {selectedCount > 0 && (
            <button
              onClick={onBulkDelete}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
            >
              <DeleteIcon sx={{ fontSize: 15 }} />
              Delete Selected ({selectedCount})
            </button>
          )}
        </div>

        {/* Right Side: Action Icons */}
        <div className="flex items-center flex-wrap gap-1.5">
          {/* Filter Toggle Button */}
          <button
            onClick={onToggleFilter}
            title="Filter Events"
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              filterType !== 'All' || filterVenue !== 'All' || filterStatus !== 'All'
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FilterIcon sx={{ fontSize: 18 }} />
          </button>

          {/* View Mode Toggle: Table View */}
          <button
            onClick={() => onViewModeChange('table')}
            title="Table View"
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-[#1b7f43] border-[#1b7f43] text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <TableIcon sx={{ fontSize: 18 }} />
          </button>

          {/* View Mode Toggle: Grid View */}
          <button
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#1b7f43] border-[#1b7f43] text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <GridIcon sx={{ fontSize: 18 }} />
          </button>

          {/* Reload / Refresh Button */}
          <RefreshButton
            onClick={onRefresh}
            title="Refresh"
            variant="square"
          />

          {/* PDF Export Button */}
          <button
            onClick={onExportPDF}
            title="Export PDF"
            className="toolbar-export-icon p-1.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl transition-all cursor-pointer"
          >
            <PdfIcon sx={{ fontSize: 18 }} />
          </button>

          {/* Excel Export Button */}
          <button
            onClick={onExportExcel}
            title="Export Excel"
            className="toolbar-export-icon p-1.5 bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all cursor-pointer"
          >
            <DownloadIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      </div>

      {/* Collapsible Filter Bar */}
      {isFilterOpen && (
        <div className="p-2.5 bg-slate-50 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5 animate-fadeIn">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Event Type</label>
            <select
              value={filterType}
              onChange={(e) => onFilterTypeChange(e.target.value)}
              className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1b7f43]/20"
            >
              <option value="All">All Types</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Venue</label>
            <select
              value={filterVenue}
              onChange={(e) => onFilterVenueChange(e.target.value)}
              className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1b7f43]/20"
            >
              <option value="All">All Venues</option>
              {venueOptions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => onFilterStatusChange(e.target.value)}
              className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1b7f43]/20"
            >
              <option value="All">All Statuses</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </>
  );
}
