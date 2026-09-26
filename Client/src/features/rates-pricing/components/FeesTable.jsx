import React from 'react';
import {
  Search, Clear, Edit, Delete, ReceiptLong,
  ChevronLeft, ChevronRight
} from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

export const FeesTable = ({
  totalFeesCount,
  activeFeesCount,
  fixedFeesCount,
  percentageFeesCount,
  feeSearch,
  setFeeSearch,
  setFeePage,
  feeStatusFilter,
  setFeeStatusFilter,
  feeCalcFilter,
  setFeeCalcFilter,
  handleOpenAddFee,
  paginatedFees,
  handleToggleFeeStatus,
  handleOpenEditFee,
  handlePromptDeleteFee,
  totalFeePages,
  feePage,
  itemsPerPage,
  filteredFees
}) => {
  return (
    <div className="space-y-2">
      {/* Fee Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Total Fees</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-gray-900">{totalFeesCount}</span>
            <span className="text-[10px] text-gray-400 font-medium">Configured</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Active Fees</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-emerald-700">{activeFeesCount}</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Live in Billing</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Fixed Surcharges</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-gray-900">{fixedFeesCount}</span>
            <span className="text-[10px] text-blue-600 font-medium">PKR Flat Amount</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Percentage Fees</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-gray-900">{percentageFeesCount}</span>
            <span className="text-[10px] text-amber-600 font-medium">% Of Total Bill</span>
          </div>
        </div>
      </div>

      {/* Fee Table Card */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
        {/* Controls Bar */}
        <div className="p-3 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" sx={{ fontSize: 16 }} />
              <input
                type="text"
                placeholder="Search fee name, code, applies to..."
                value={feeSearch}
                onChange={(e) => {
                  setFeeSearch(e.target.value);
                  setFeePage(1);
                }}
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow placeholder-gray-400 text-gray-800"
              />
              {feeSearch && (
                <button
                  onClick={() => {
                    setFeeSearch('');
                    setFeePage(1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Clear sx={{ fontSize: 14 }} />
                </button>
              )}
            </div>

            {/* Status Segmented */}
            <div className="flex bg-gray-50 p-0.5 border border-gray-200 rounded-xl hide-scrollbar shrink-0">
              {['All', 'Active', 'Inactive'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setFeeStatusFilter(tab);
                    setFeePage(1);
                  }}
                  className={`px-3 py-1 text-[11px] font-semibold transition-all rounded-lg cursor-pointer ${
                    feeStatusFilter === tab
                      ? 'bg-white text-[#1b7f43] shadow-xs font-bold'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end lg:self-auto">
            <select
              value={feeCalcFilter}
              onChange={(e) => {
                setFeeCalcFilter(e.target.value);
                setFeePage(1);
              }}
              className="py-1.5 px-2.5 border border-gray-200 rounded-xl text-[11px] font-semibold text-gray-700 bg-white focus:outline-none focus:border-[#1b7f43]"
            >
              <option value="All">All Calculations</option>
              <option value="Fixed Amount">Fixed Amount Only</option>
              <option value="Percentage">Percentage Only</option>
            </select>

            <button
              onClick={handleOpenAddFee}
              className="px-3.5 py-1.5 bg-[#1b7f43] hover:bg-[#156736] text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
            >
              + Add Fee
            </button>
          </div>
        </div>

        {/* Fees Data Table */}
        <div className="w-full overflow-x-auto min-w-0">
          <table className="w-full table-fixed text-left border-collapse min-w-[700px]">
            <colgroup>
              <col style={{ width: '25%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '6%' }} />
            </colgroup>
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                <th className="py-2.5 px-2">Fee Name</th>
                <th className="py-2.5 px-2">Fee Code</th>
                <th className="py-2.5 px-1.5">Calculation</th>
                <th className="py-2.5 px-1.5">Value / Rate</th>
                <th className="py-2.5 px-2">Application</th>
                <th className="py-2.5 px-1 text-center">Status</th>
                <th className="py-2.5 px-1 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {paginatedFees.map((fee) => (
                <tr key={fee.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-2 px-2">
                    <div className="min-w-0">
                      <span className="font-bold text-gray-900 block text-xs leading-tight break-words">{fee.name}</span>
                      {fee.description && (
                        <p className="text-[10px] text-gray-500 truncate mt-0.5" title={fee.description}>
                          {fee.description}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="py-2 px-2">
                    <span className="font-mono font-bold text-[10.5px] bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded border border-gray-200 truncate inline-block max-w-full">
                      {fee.code}
                    </span>
                  </td>

                  <td className="py-2 px-1.5 text-gray-700 font-semibold text-[10.5px] truncate">
                    {fee.calculationType}
                  </td>

                  <td className="py-2 px-1.5">
                    <span className="font-extrabold text-xs text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-mono truncate inline-block max-w-full">
                      {fee.calculationType === 'Percentage' ? `${fee.value}%` : `PKR ${Number(fee.value).toLocaleString()}`}
                    </span>
                  </td>

                  <td className="py-2 px-2">
                    <span className="text-gray-800 font-medium text-xs break-words">{fee.appliesTo}</span>
                  </td>

                  <td className="py-2 px-1 text-center">
                    <button
                      onClick={() => handleToggleFeeStatus(fee)}
                      title="Toggle Active Status"
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-bold cursor-pointer transition-all ${
                        fee.status === 'Active'
                          ? 'bg-[#e5f4eb] text-[#1b7f43] hover:bg-[#d0ebd8] border border-[#1b7f43]/20'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${fee.status === 'Active' ? 'bg-[#1b7f43]' : 'bg-gray-400'}`}></span>
                      <span>{fee.status}</span>
                    </button>
                  </td>

                  <td className="py-2 px-1 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <Tooltip title="Edit Fee">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEditFee(fee)}
                          sx={{ padding: '2px', color: '#3b82f6', '&:hover': { backgroundColor: '#eff6ff' } }}
                        >
                          <Edit sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Fee">
                        <IconButton
                          size="small"
                          onClick={() => handlePromptDeleteFee(fee)}
                          sx={{ padding: '2px', color: '#ef4444', '&:hover': { backgroundColor: '#fef2f2' } }}
                        >
                          <Delete sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedFees.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ReceiptLong sx={{ fontSize: 36, color: '#d1d5db' }} />
                      <p className="text-sm font-semibold text-gray-600">No fees match your search or filter criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalFeePages > 0 && (
          <div className="p-3.5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs text-gray-500">
              Showing <span className="font-semibold text-gray-700">{(feePage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-semibold text-gray-700">{Math.min(feePage * itemsPerPage, filteredFees.length)}</span> of{' '}
              <span className="font-semibold text-gray-700">{filteredFees.length}</span> fees
            </span>

            <div className="flex items-center space-x-1 self-end sm:self-auto">
              <button
                onClick={() => setFeePage((prev) => Math.max(prev - 1, 1))}
                disabled={feePage === 1}
                className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronLeft fontSize="small" />
              </button>

              {[...Array(totalFeePages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFeePage(i + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                    feePage === i + 1
                      ? 'bg-[#1b7f43] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setFeePage((prev) => Math.min(prev + 1, totalFeePages))}
                disabled={feePage === totalFeePages}
                className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronRight fontSize="small" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
