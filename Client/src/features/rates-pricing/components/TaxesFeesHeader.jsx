import React from 'react';
import { IconButton, Tooltip, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function TaxesFeesHeader({
  searchQuery,
  setSearchQuery,
  onOpenAddModal,
  onRefresh,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <div>
        <h1 className="text-lg font-bold text-gray-800">Taxes & Fees Management</h1>
        <p className="text-xs text-gray-500">Configure global tax rates, service charges, and fee rules</p>
      </div>

      <div className="flex items-center gap-2">
        <TextField
          size="small"
          placeholder="Search tax rules..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" className="text-gray-400" />
              </InputAdornment>
            ),
          }}
          className="w-full sm:w-64"
        />

        <Tooltip title="Refresh">
          <IconButton onClick={onRefresh} size="small" className="border border-gray-200">
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1b7f43] text-white text-xs font-semibold rounded-lg hover:bg-[#156334] transition-colors cursor-pointer"
        >
          <AddIcon fontSize="small" />
          <span>Add Tax / Fee Rule</span>
        </button>
      </div>
    </div>
  );
}
