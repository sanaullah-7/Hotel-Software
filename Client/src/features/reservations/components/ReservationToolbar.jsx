import React, { useState } from 'react';
import { Popover } from '@mui/material';
import {
  AddCircleOutlined,
  TableChart,
  PictureAsPdf
} from '@mui/icons-material';
import SearchInput from '../../../components/common/SearchInput';
import RefreshButton from '../../../components/common/RefreshButton';

export default function ReservationToolbar({
  title = 'All Booking',
  search,
  onSearchChange,
  showDateFilter = false,
  dateFilter,
  onDateFilterChange,
  customStartDate,
  onCustomStartDateChange,
  customEndDate,
  onCustomEndDateChange,
  onOpenNewModal,
  onRefresh,
  onExportCSV,
  onExportPDF
}) {
  const [customAnchorEl, setCustomAnchorEl] = useState(null);

  const handleCustomClick = (event) => {
    onDateFilterChange('Custom');
    setCustomAnchorEl(event.currentTarget);
  };

  const handleCustomClose = () => {
    setCustomAnchorEl(null);
  };

  return (
    <div className="bg-white rounded-lg p-2 sm:p-2.5 flex flex-col xl:flex-row xl:items-center justify-between border border-gray-100 shadow-xs gap-2.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <h1 className="text-sm sm:text-base font-bold text-gray-800 tracking-tight whitespace-nowrap">{title}</h1>

        <SearchInput
          placeholder="Search..."
          value={search}
          onChange={onSearchChange}
          width="w-[140px] lg:w-[180px]"
          inputClassName="border-gray-300"
        />

        {showDateFilter && (
          <div className="flex items-center bg-white border border-gray-200 rounded-md shadow-2xs overflow-hidden">
            {['Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom'].map((filter) => (
              <button
                key={filter}
                onClick={(e) => (filter === 'Custom' ? handleCustomClick(e) : onDateFilterChange(filter))}
                className={`px-2.5 py-1 text-[11px] sm:text-xs font-semibold transition-colors border-r border-gray-200 last:border-r-0 cursor-pointer ${
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
              <div className="p-3 w-[260px]">
                <h3 className="font-bold text-gray-700 text-xs mb-2.5">Custom Date Range</h3>
                <div className="space-y-3">
                  <div>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => onCustomStartDateChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-md text-xs px-2.5 py-1.5 text-gray-700 focus:outline-none focus:border-[#1b7f43]"
                    />
                  </div>
                  <div className="text-center text-gray-400 font-semibold text-[10px]">TO</div>
                  <div>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => onCustomEndDateChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-md text-xs px-2.5 py-1.5 text-gray-700 focus:outline-none focus:border-[#1b7f43]"
                    />
                  </div>
                </div>
              </div>
            </Popover>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenNewModal}
          className="w-7.5 h-7.5 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"
          title="Add New Booking"
          aria-label="Add new booking"
        >
          <AddCircleOutlined sx={{ fontSize: 19 }} className="text-[#1b7f43]" />
        </button>
        <RefreshButton
          onClick={onRefresh}
          title="Refresh"
          variant="circle"
        />
        <button
          onClick={onExportCSV}
          className="w-7.5 h-7.5 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"
          title="Export CSV"
          aria-label="Export CSV"
        >
          <TableChart sx={{ fontSize: 17 }} className="text-[#0ea5e9]" />
        </button>
        <button
          onClick={onExportPDF}
          className="w-7.5 h-7.5 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
          title="Export PDF"
          aria-label="Export PDF"
        >
          <PictureAsPdf sx={{ fontSize: 17 }} className="text-[#ef4444]" />
        </button>
      </div>
    </div>
  );
}
