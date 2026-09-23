import React, { useState, useRef, useEffect } from 'react';
import { Popover } from '@mui/material';
import {
  FilterList,
  AddCircleOutlined,
  TableChart,
  PictureAsPdf
} from '@mui/icons-material';
import SearchInput from '../../../components/common/SearchInput';
import RefreshButton from '../../../components/common/RefreshButton';

export default function ReservationToolbar({
  title = 'Bookings',
  search,
  onSearchChange,
  showDateFilter = false,
  dateFilter,
  onDateFilterChange,
  customStartDate,
  onCustomStartDateChange,
  customEndDate,
  onCustomEndDateChange,
  visibleColumns,
  onToggleColumn,
  onOpenNewModal,
  onRefresh,
  onExportCSV,
  onExportPDF
}) {
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const filterMenuRef = useRef(null);

  const [customAnchorEl, setCustomAnchorEl] = useState(null);

  const handleCustomClick = (event) => {
    onDateFilterChange('Custom');
    setCustomAnchorEl(event.currentTarget);
  };

  const handleCustomClose = () => {
    setCustomAnchorEl(null);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowColumnsMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-[6px] p-2 flex flex-col xl:flex-row xl:items-center justify-between border-b border-gray-100 gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-[16px] font-bold text-gray-700 whitespace-nowrap">{title}</h1>

        <SearchInput
          placeholder="Search..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          width="w-[140px] lg:w-[180px]"
          inputClassName="border-gray-400"
        />

        {showDateFilter && (
          <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {['Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom'].map((filter) => (
              <button
                key={filter}
                onClick={(e) => (filter === 'Custom' ? handleCustomClick(e) : onDateFilterChange(filter))}
                className={`px-3 py-1.5 text-[12px] md:text-[13px] font-medium transition-colors border-r border-gray-200 last:border-r-0 ${
                  dateFilter === filter
                    ? 'bg-[#e5f4eb] text-[#1b7f43]'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {filter}
              </button>
            ))}
            <Popover
              open={Boolean(customAnchorEl)}
              anchorEl={customAnchorEl}
              onClose={handleCustomClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <div className="p-4 w-[280px]">
                <h3 className="font-bold text-gray-700 text-sm mb-3">Custom Date Range</h3>
                <div className="space-y-4">
                  <div>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => onCustomStartDateChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg text-sm px-3 py-2 text-gray-700 focus:outline-none focus:border-[#1b7f43]"
                    />
                  </div>
                  <div className="text-center text-gray-400 font-semibold text-xs">TO</div>
                  <div>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => onCustomEndDateChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg text-sm px-3 py-2 text-gray-700 focus:outline-none focus:border-[#1b7f43]"
                    />
                  </div>
                </div>
              </div>
            </Popover>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative" ref={filterMenuRef}>
          <button
            onClick={() => setShowColumnsMenu(!showColumnsMenu)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"
            title="Filter"
          >
            <FilterList sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
          </button>
          {showColumnsMenu && (
            <div className="absolute right-0 top-10 w-48 bg-[#f8f9fa] shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-md border border-gray-100 z-50 py-2 animate-fade-in">
              <div className="px-4 py-2 border-b border-gray-100 text-[12px] font-bold text-gray-700">
                Show/Hide Column
              </div>
              <div className="max-h-[250px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                {Object.keys(visibleColumns).map((col) => (
                  <label
                    key={col}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer gap-3 text-[13px] text-gray-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns[col]}
                      onChange={() => onToggleColumn(col)}
                      className="w-4 h-4 accent-[#1b7f43] cursor-pointer rounded-sm"
                    />
                    {col}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onOpenNewModal}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"
          title="Add Booking"
        >
          <AddCircleOutlined sx={{ fontSize: 20 }} className="text-[#1b7f43]" />
        </button>
        <RefreshButton
          onClick={onRefresh}
          title="Refresh"
          variant="circle"
        />
        <button
          onClick={onExportCSV}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"
          title="Export CSV"
        >
          <TableChart sx={{ fontSize: 18 }} className="text-[#0ea5e9]" />
        </button>
        <button
          onClick={onExportPDF}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
          title="Export PDF"
        >
          <PictureAsPdf sx={{ fontSize: 18 }} className="text-[#ef4444]" />
        </button>
      </div>
    </div>
  );
}
