import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';
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

const muiSelectSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    fontSize: '12px',
    height: '32px',
    color: '#1f2937',
    '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: '#1b7f43', borderWidth: '1.5px' },
  },
  '& .MuiSelect-select': {
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
    height: '32px',
  },
  '& .MuiInputLabel-root': {
    fontSize: '13px',
    color: '#6b7280',
    transform: 'translate(14px, 7px) scale(1)',
    '&.Mui-focused': { color: '#1b7f43' }
  },
  '& .MuiInputLabel-root.MuiInputLabel-shrink': {
    transform: 'translate(14px, -9px) scale(0.75)',
  },
};

export default function EventToolbar({
  title = "All Events",
  searchQuery,
  onSearchChange,
  selectedCount = 0,
  onBulkDelete,
  isFilterOpen,
  onToggleFilter, // We might not need this anymore if filters are always visible, but keep for prop signature
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
      <div className="p-3 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        
        {/* Left Side: Title & Search */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <h2 className="text-[15px] font-bold text-gray-800 whitespace-nowrap">{title}</h2>
          <SearchInput
            placeholder="Search..."
            value={searchQuery}
            onChange={onSearchChange}
            variant="slate"
            size="sm"
            inputClassName="border-gray-300"
          />

          {selectedCount > 0 && (
            <button
              onClick={onBulkDelete}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer ml-2"
            >
              <DeleteIcon sx={{ fontSize: 15 }} />
              Delete ({selectedCount})
            </button>
          )}
        </div>

        {/* Right Side: Action Icons */}
        <div className="flex items-center flex-wrap gap-1.5">
          {/* Filter Toggle Button */}
          <button
            onClick={onToggleFilter}
            title="Filter Events"
            aria-label="Filter events"
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              filterType !== 'All' || filterVenue !== 'All' || filterStatus !== 'All'
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FilterIcon sx={{ fontSize: 18 }} />
          </button>

          <FormControl size="small" sx={{ minWidth: 120, ...muiSelectSx }}>
            <InputLabel>Venue</InputLabel>
            <Select
              value={filterVenue}
              onChange={(e) => onFilterVenueChange(e.target.value)}
              label="Venue"
            >
              <MenuItem value="All" sx={{ fontSize: 12 }}>All Venues</MenuItem>
              {venueOptions.map((v) => (
                <MenuItem key={v} value={v} sx={{ fontSize: 12 }}>{v}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120, ...muiSelectSx }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => onFilterStatusChange(e.target.value)}
              label="Status"
            >
              <MenuItem value="All" sx={{ fontSize: 12 }}>All Statuses</MenuItem>
              {statusOptions.map((s) => (
                <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Right Side: Action Icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* View Mode Toggle: Table View */}
          <button
            onClick={() => onViewModeChange('table')}
            title="Table View"
            aria-label="Table view"
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-[#1b7f43] text-white shadow-xs'
                : 'text-gray-600 hover:bg-[#e5f4eb]'
            }`}
          >
            <TableIcon sx={{ fontSize: 16 }} />
          </button>

          {/* View Mode Toggle: Grid View */}
          <button
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
            aria-label="Grid view"
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#1b7f43] text-white shadow-xs'
                : 'text-gray-600 hover:bg-[#e5f4eb]'
            }`}
          >
            <GridIcon sx={{ fontSize: 16 }} />
          </button>

          {/* Reload / Refresh Button */}
          <RefreshButton
            onClick={onRefresh}
            title="Refresh"
            size="sm"
            variant="circle"
          />

          {/* PDF Export Button */}
          <button
            onClick={onExportPDF}
            title="Export PDF"
            aria-label="Export PDF"
            className="toolbar-export-icon p-1.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl transition-all cursor-pointer"
          >
            <PdfIcon sx={{ fontSize: 18 }} />
          </button>

          {/* Excel Export Button */}
          <button
            onClick={onExportExcel}
            title="Export Excel"
            aria-label="Export Excel"
            className="toolbar-export-icon p-1.5 bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all cursor-pointer"
          >
            <DownloadIcon sx={{ fontSize: 16 }} className="text-[#0ea5e9]" />
          </button>
          
          {/* PDF Export Button */}
          <button
            onClick={onExportPDF}
            title="Export PDF"
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
          >
            <PdfIcon sx={{ fontSize: 16 }} className="text-[#ef4444]" />
          </button>
        </div>
      </div>
    </>
  );
}
