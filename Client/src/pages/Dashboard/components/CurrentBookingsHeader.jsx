import React from 'react';
import { TextField, InputAdornment, IconButton, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function CurrentBookingsHeader({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  onRefresh,
}) {
  const tabs = [
    { id: 'all', label: 'All Bookings' },
    { id: 'checked-in', label: 'Checked In' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'pending', label: 'Pending' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-100">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#e5f4eb] text-[#1b7f43]'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <TextField
          size="small"
          placeholder="Search bookings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" className="text-gray-400" />
              </InputAdornment>
            ),
          }}
          className="w-full sm:w-56"
        />

        <Tooltip title="Refresh">
          <IconButton onClick={onRefresh} size="small" className="border border-gray-200">
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}
