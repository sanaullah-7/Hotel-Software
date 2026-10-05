import React from 'react';
import {
  Search, Clear, Edit, Delete, AccountBalance,
  ChevronLeft, ChevronRight
} from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { CheckCircle, ReceiptLong, Percent } from '@mui/icons-material';

export const TaxesTable = ({
  totalTaxesCount,
  activeTaxesCount,
  exclusiveTaxesCount,
  inclusiveTaxesCount,
  taxSearch,
  setTaxSearch,
  setTaxPage,
  taxStatusFilter,
  setTaxStatusFilter,
  taxCalcFilter,
  setTaxCalcFilter,
  handleOpenAddTax,
  paginatedTaxes,
  handleToggleTaxStatus,
  handleOpenEditTax,
  handlePromptDeleteTax,
  totalTaxPages,
  taxPage,
  itemsPerPage,
  filteredTaxes
}) => {
  return (
    <div className="space-y-2">
      {/* Tax Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
        <div className="bg-white p-3 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-gray-900 leading-none mb-1">{totalTaxesCount}</div>
            <div className="text-[11px] text-gray-500 font-medium">Total Taxes</div>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
            <AccountBalance sx={{ fontSize: 16 }} />
          </div>
        </div>

        <div className="bg-white p-3 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-emerald-700 leading-none mb-1">{activeTaxesCount}</div>
            <div className="text-[11px] text-gray-500 font-medium">Active Taxes</div>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle sx={{ fontSize: 16 }} />
          </div>
        </div>

        <div className="bg-white p-3 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-gray-900 leading-none mb-1">{exclusiveTaxesCount}</div>
            <div className="text-[11px] text-gray-500 font-medium">Exclusive</div>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-600 shrink-0">
            <ReceiptLong sx={{ fontSize: 16 }} />
          </div>
        </div>

        <div className="bg-white p-3 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-gray-900 leading-none mb-1">{inclusiveTaxesCount}</div>
            <div className="text-[11px] text-gray-500 font-medium">Inclusive</div>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-amber-50 text-amber-600 shrink-0">
            <Percent sx={{ fontSize: 16 }} />
          </div>
        </div>
      </div>

      {/* Tax Table Card */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
        {/* Controls Bar */}
        <div className="p-2.5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            {/* Search */}
            <div className="relative w-full sm:w-60 shrink-0">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" sx={{ fontSize: 15 }} />
              <input
                type="text"
                placeholder="Search tax name, code, applies to..."
                value={taxSearch}
                onChange={(e) => {
                  setTaxSearch(e.target.value);
                  setTaxPage(1);
                }}
                className="w-full pl-7 pr-7 py-1 bg-white border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow placeholder-gray-400 text-gray-800"
              />
              {taxSearch && (
                <button
                  onClick={() => {
                    setTaxSearch('');
                    setTaxPage(1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Clear sx={{ fontSize: 13 }} />
                </button>
              )}
            </div>

            {/* Status Segmented */}
            <div className="flex bg-gray-50 p-0.5 border border-gray-200 rounded-lg hide-scrollbar shrink-0">
              {['All', 'Active', 'Inactive'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setTaxStatusFilter(tab);
                    setTaxPage(1);
                  }}
                  className={`px-2.5 py-0.5 text-[10.5px] font-semibold transition-all rounded-md cursor-pointer ${
                    taxStatusFilter === tab
                      ? 'bg-white text-[#1b7f43] shadow-xs font-bold'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end lg:self-auto">
            <select
              value={taxCalcFilter}
              onChange={(e) => {
                setTaxCalcFilter(e.target.value);
                setTaxPage(1);
              }}
              className="py-1 px-2 border border-gray-200 rounded-lg text-[10.5px] font-semibold text-gray-700 bg-white focus:outline-none focus:border-[#1b7f43]"
            >
              <option value="All">All Calculations</option>
              <option value="Percentage">Percentage Only</option>
              <option value="Fixed Amount">Fixed Amount Only</option>
            </select>

            <button
              onClick={handleOpenAddTax}
              className="px-2.5 py-1 bg-[#1b7f43] hover:bg-[#156736] text-white rounded text-[11px] font-bold shadow-xs transition cursor-pointer"
            >
              + Add Tax
            </button>
          </div>
        </div>

        {/* Taxes Data Table */}
        <div className="w-full overflow-x-auto min-w-0">
          <table className="w-full table-fixed text-left border-collapse min-w-[700px]">
            <colgroup>
              <col style={{ width: '22%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '6%' }} />
            </colgroup>
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                <th className="py-2 px-2.5">Tax Name</th>
                <th className="py-2 px-2">Tax Code</th>
                <th className="py-2 px-1.5">Calculation</th>
                <th className="py-2 px-1.5">Rate / Value</th>
                <th className="py-2 px-2">Application</th>
                <th className="py-2 px-1.5">Nature</th>
                <th className="py-2 px-1 text-center">Status</th>
                <th className="py-2 px-1 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {paginatedTaxes.map((tax) => (
                <tr key={tax.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-1.5 px-2.5">
                    <div className="min-w-0">
                      <span className="font-bold text-gray-900 block text-[11px] leading-tight break-words">{tax.name}</span>
                      {tax.description && (
                        <p className="text-[9.5px] text-gray-500 truncate mt-0.5" title={tax.description}>
                          {tax.description}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="py-1.5 px-2">
                    <span className="font-mono font-bold text-[10px] bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded border border-gray-200 truncate inline-block max-w-full">
                      {tax.code}
                    </span>
                  </td>

                  <td className="py-1.5 px-1.5 text-gray-700 font-semibold text-[10.5px] truncate">
                    {tax.calculationType}
                  </td>

                  <td className="py-1.5 px-1.5">
                    <span className="font-extrabold text-[11px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-mono truncate inline-block max-w-full">
                      {tax.calculationType === 'Percentage' ? `${tax.value}%` : `PKR ${Number(tax.value).toLocaleString()}`}
                    </span>
                  </td>

                  <td className="py-1.5 px-2">
                    <span className="text-gray-800 font-medium text-[11px] break-words">{tax.appliesTo}</span>
                  </td>

                  <td className="py-1.5 px-1.5">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold max-w-full truncate ${
                      tax.taxNature === 'Exclusive'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <span className="truncate">{tax.taxNature}</span>
                    </span>
                  </td>

                  <td className="py-1.5 px-1 text-center">
                    <button
                      onClick={() => handleToggleTaxStatus(tax)}
                      title="Toggle Active Status"
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold cursor-pointer transition-all ${
                        tax.status === 'Active'
                          ? 'bg-[#e5f4eb] text-[#1b7f43] hover:bg-[#d0ebd8] border border-[#1b7f43]/20'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tax.status === 'Active' ? 'bg-[#1b7f43]' : 'bg-gray-400'}`}></span>
                      <span>{tax.status}</span>
                    </button>
                  </td>

                  <td className="py-1.5 px-1 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <Tooltip title="Edit Tax">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEditTax(tax)}
                          sx={{ padding: '2px', color: '#3b82f6', '&:hover': { backgroundColor: '#eff6ff' } }}
                        >
                          <Edit sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Tax">
                        <IconButton
                          size="small"
                          onClick={() => handlePromptDeleteTax(tax)}
                          sx={{ padding: '2px', color: '#ef4444', '&:hover': { backgroundColor: '#fef2f2' } }}
                        >
                          <Delete sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedTaxes.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <AccountBalance sx={{ fontSize: 30, color: '#d1d5db' }} />
                      <p className="text-[12px] font-semibold text-gray-600">No taxes match your search or filter criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalTaxPages > 0 && (
          <div className="p-2.5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] text-gray-500">
              Showing <span className="font-semibold text-gray-700">{(taxPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-semibold text-gray-700">{Math.min(taxPage * itemsPerPage, filteredTaxes.length)}</span> of{' '}
              <span className="font-semibold text-gray-700">{filteredTaxes.length}</span> taxes
            </span>

            <div className="flex items-center space-x-1 self-end sm:self-auto">
              <button
                onClick={() => setTaxPage((prev) => Math.max(prev - 1, 1))}
                disabled={taxPage === 1}
                className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronLeft fontSize="small" />
              </button>

              {[...Array(totalTaxPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTaxPage(i + 1)}
                  className={`w-6 h-6 rounded-md text-[11px] font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                    taxPage === i + 1
                      ? 'bg-[#1b7f43] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setTaxPage((prev) => Math.min(prev + 1, totalTaxPages))}
                disabled={taxPage === totalTaxPages}
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
