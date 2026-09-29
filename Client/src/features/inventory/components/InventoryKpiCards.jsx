import React from 'react';
import { Inventory, CheckCircle, Warning, ReportProblem, AttachMoney } from '@mui/icons-material';

export default function InventoryKpiCards({ metrics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mt-1">
      {/* Total Items */}
      <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{metrics.totalCount}</div>
          <div className="text-[13px] text-gray-500 font-medium">Total Items ({metrics.totalQuantity} Units)</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
          <Inventory sx={{ fontSize: 18 }} />
        </div>
      </div>

      {/* Available Stock */}
      <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{metrics.availableStock}</div>
          <div className="text-[13px] text-gray-500 font-medium">Available Stock</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-50 text-green-600">
          <CheckCircle sx={{ fontSize: 18 }} />
        </div>
      </div>

      {/* Low Stock */}
      <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{metrics.lowStock}</div>
          <div className="text-[13px] text-gray-500 font-medium">Low Stock</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-50 text-amber-600">
          <Warning sx={{ fontSize: 18 }} />
        </div>
      </div>

      {/* Missing Items */}
      <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{metrics.missingItems}</div>
          <div className="text-[13px] text-gray-500 font-medium">Missing Items</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-red-600">
          <ReportProblem sx={{ fontSize: 18 }} />
        </div>
      </div>

      {/* Total Valuation */}
      <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none mb-1">
            ${metrics.totalValuation.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-[13px] text-gray-500 font-medium">Valuation</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-50 text-purple-600">
          <AttachMoney sx={{ fontSize: 18 }} />
        </div>
      </div>
    </div>
  );
}
