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
            onChange={(e) => onSearchChange(e.target.value)}
            width="w-[140px] sm:w-[170px]"
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

        {/* Middle Side: Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1 xl:justify-center">
          <FormControl size="small" sx={{ minWidth: 120, ...muiSelectSx }}>
            <InputLabel>Event Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => onFilterTypeChange(e.target.value)}
              label="Event Type"
            >
              <MenuItem value="All" sx={{ fontSize: 12 }}>All Types</MenuItem>
              {typeOptions.map((t) => (
                <MenuItem key={t} value={t} sx={{ fontSize: 12 }}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>

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
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
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
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
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

          {/* Excel Export Button */}
          <button
            onClick={onExportExcel}
            title="Export Excel"
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"
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
