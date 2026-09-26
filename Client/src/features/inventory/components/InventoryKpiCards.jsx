import React from 'react';

export default function InventoryKpiCards({ metrics }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {/* Total Items */}
      <div className="bg-white p-2.5 rounded-lg shadow-xs border border-gray-100 flex flex-col justify-between">
        <span className="text-gray-500 font-semibold text-[10.5px] uppercase tracking-wider truncate">Total Items</span>
        <div className="flex items-baseline justify-between mt-0.5">
          <span className="text-lg font-bold text-gray-900 leading-none">{metrics.totalCount}</span>
          <span className="text-[10px] text-gray-400 font-medium">{metrics.totalQuantity} Units</span>
        </div>
      </div>

      {/* Available Stock */}
      <div className="bg-white p-2.5 rounded-lg shadow-xs border border-gray-100 flex flex-col justify-between">
        <span className="text-gray-500 font-semibold text-[10.5px] uppercase tracking-wider truncate">Available Stock</span>
        <div className="flex items-baseline justify-between mt-0.5">
          <span className="text-lg font-bold text-emerald-700 leading-none">{metrics.availableStock}</span>
          <span className="text-[10px] text-emerald-600 font-semibold">Ready</span>
        </div>
      </div>

      {/* Low Stock */}
      <div className="bg-white p-2.5 rounded-lg shadow-xs border border-gray-100 flex flex-col justify-between">
        <span className="text-gray-500 font-semibold text-[10.5px] uppercase tracking-wider truncate">Low Stock</span>
        <div className="flex items-baseline justify-between mt-0.5">
          <span className="text-lg font-bold text-amber-600 leading-none">{metrics.lowStock}</span>
          <span className="text-[10px] text-amber-600 font-medium">Below Min</span>
        </div>
      </div>

      {/* Missing Items */}
      <div className="bg-white p-2.5 rounded-lg shadow-xs border border-gray-100 flex flex-col justify-between">
        <span className="text-gray-500 font-semibold text-[10.5px] uppercase tracking-wider truncate">Missing Items</span>
        <div className="flex items-baseline justify-between mt-0.5">
          <span className="text-lg font-bold text-red-600 leading-none">{metrics.missingItems}</span>
          <span className="text-[10px] text-red-600 font-medium">Active Loss</span>
        </div>
      </div>

      {/* Total Valuation */}
      <div className="bg-white p-2.5 rounded-lg shadow-xs border border-gray-100 flex flex-col justify-between">
        <span className="text-gray-500 font-semibold text-[10.5px] uppercase tracking-wider truncate">Valuation</span>
        <div className="flex items-baseline justify-between mt-0.5">
          <span className="text-base font-bold text-gray-900 leading-none">
            ${metrics.totalValuation.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">Total Assets</span>
        </div>
      </div>
    </div>
  );
}
