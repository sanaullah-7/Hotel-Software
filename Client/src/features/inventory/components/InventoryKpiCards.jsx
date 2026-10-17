import React from 'react';
import { Inventory, CheckCircle, Warning, ReportProblem, AttachMoney } from '@mui/icons-material';

export default function InventoryKpiCards({ metrics }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
      {/* Total Items */}
      <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2">
        <div className="text-left min-w-0">
          <p className="text-[10.5px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">Total Items</p>
          <p className="text-lg sm:text-xl font-bold text-gray-800 leading-none mt-1">{metrics.totalCount}</p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5 truncate">{metrics.totalQuantity} Units</p>
        </div>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
          <Inventory sx={{ fontSize: 16 }} />
        </div>
      </div>

      {/* Available Stock */}
      <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2">
        <div className="text-left min-w-0">
          <p className="text-[10.5px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">Available</p>
          <p className="text-lg sm:text-xl font-bold text-gray-800 leading-none mt-1">{metrics.availableStock}</p>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5 truncate">In Stock</p>
        </div>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-green-50 text-green-600 shrink-0">
          <CheckCircle sx={{ fontSize: 16 }} />
        </div>
      </div>

      {/* Low Stock */}
      <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2">
        <div className="text-left min-w-0">
          <p className="text-[10.5px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">Low Stock</p>
          <p className="text-lg sm:text-xl font-bold text-gray-800 leading-none mt-1">{metrics.lowStock}</p>
          <p className="text-[10px] text-amber-600 font-medium mt-0.5 truncate">Needs Reorder</p>
        </div>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600 shrink-0">
          <Warning sx={{ fontSize: 16 }} />
        </div>
      </div>

      {/* Missing Items */}
      <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2">
        <div className="text-left min-w-0">
          <p className="text-[10.5px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">Missing</p>
          <p className="text-lg sm:text-xl font-bold text-gray-800 leading-none mt-1">{metrics.missingItems}</p>
          <p className="text-[10px] text-red-500 font-medium mt-0.5 truncate">Investigating</p>
        </div>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50 text-red-600 shrink-0">
          <ReportProblem sx={{ fontSize: 16 }} />
        </div>
      </div>

      {/* Total Valuation */}
      <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2 col-span-2 sm:col-span-1">
        <div className="text-left min-w-0">
          <p className="text-[10.5px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">Valuation</p>
          <p className="text-lg sm:text-xl font-bold text-gray-800 leading-none mt-1 truncate">
            ${metrics.totalValuation.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5 truncate">Asset Total</p>
        </div>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600 shrink-0">
          <AttachMoney sx={{ fontSize: 16 }} />
        </div>
      </div>
    </div>
  );
}
