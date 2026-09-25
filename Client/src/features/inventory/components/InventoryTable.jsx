import React from 'react';
import { 
  Inventory2, MeetingRoom, Warehouse, MoreVert, ChevronLeft, ChevronRight 
} from '@mui/icons-material';
import { IconButton } from '@mui/material';

export default function InventoryTable({
  filteredItems,
  paginatedItems,
  selectedRoom,
  setSelectedRoomForModal,
  setSelectedItemForDetail,
  handleMenuClick,
  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#e5f4eb] text-[#1b7f43] border border-[#1b7f43]/20">Available</span>;
      case 'Low Stock':
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Low Stock</span>;
      case 'Missing':
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-red-50 text-red-600 border border-red-200">Missing</span>;
      case 'Out of Stock':
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Out of Stock</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const getConditionBadge = (condition) => {
    switch (condition) {
      case 'New':
        return <span className="text-[10.5px] font-bold text-emerald-600">New</span>;
      case 'Good':
        return <span className="text-[10.5px] font-semibold text-gray-700">Good</span>;
      case 'Fair':
        return <span className="text-[10.5px] font-semibold text-amber-600">Fair</span>;
      case 'Damaged':
      case 'Broken':
        return <span className="text-[10.5px] font-bold text-red-600">{condition}</span>;
      default:
        return <span className="text-[10.5px] text-gray-500">{condition || 'Good'}</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden w-full">
      {/* Table Top Header */}
      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-tight">Inventory Items</h3>
          <span className="text-[10.5px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded-full">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {selectedRoom !== 'All' && selectedRoom !== 'Storage' && (
          <button
            onClick={() => setSelectedRoomForModal(selectedRoom)}
            className="px-2.5 py-1 bg-[#e5f4eb] text-[#1b7f43] hover:bg-[#d5ecd9] rounded-lg text-[11px] font-bold transition cursor-pointer"
          >
            Inspect Room {selectedRoom}
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="w-full overflow-x-auto min-w-0">
        <table className="w-full table-fixed text-left border-collapse min-w-[750px]">
          <colgroup>
            <col style={{ width: '22%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '4%' }} />
          </colgroup>
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
              <th className="py-2.5 px-2.5">Item & SKU</th>
              <th className="py-2.5 px-1.5">Category</th>
              <th className="py-2.5 px-1.5">Room / Location</th>
              <th className="py-2.5 px-1 text-center">Stock / Qty</th>
              <th className="py-2.5 px-1.5 text-right">Unit Price</th>
              <th className="py-2.5 px-1.5 text-right">Total Value</th>
              <th className="py-2.5 px-1 text-center">Condition</th>
              <th className="py-2.5 px-1 text-center">Status</th>
              <th className="py-2.5 px-1.5">Last Updated</th>
              <th className="py-2.5 px-1 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {paginatedItems.map((item) => {
              const isRoomItem = item.locationType === 'Room' && item.roomNumber && item.roomNumber !== '-';

              return (
                <tr 
                  key={item.id} 
                  className="hover:bg-gray-50/70 transition-colors group cursor-pointer"
                  onClick={() => setSelectedItemForDetail(item)}
                >
                  {/* Item & SKU */}
                  <td className="py-2 px-2.5">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-gray-900 group-hover:text-[#1b7f43] transition-colors leading-tight break-words">
                        {item.itemName}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-gray-400 font-mono">
                        <span className="truncate">{item.sku}</span>
                        <span>•</span>
                        <span className="truncate">{item.id}</span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-2 px-1.5">
                    <span className="text-[10.5px] font-semibold text-gray-700 bg-gray-100/80 px-1.5 py-0.5 rounded inline-block truncate max-w-full">
                      {item.category}
                    </span>
                  </td>

                  {/* Room / Location */}
                  <td className="py-2 px-1.5" onClick={(e) => e.stopPropagation()}>
                    {isRoomItem ? (
                      <button
                        onClick={() => setSelectedRoomForModal(item.roomNumber)}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-[#1b7f43] hover:bg-emerald-100 text-[10.5px] font-bold transition border border-emerald-200/50 cursor-pointer max-w-full"
                        title={`Click to view all inventory assigned to Room ${item.roomNumber}`}
                      >
                        <MeetingRoom sx={{ fontSize: 13 }} />
                        <span className="truncate">Room {item.roomNumber}</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] text-gray-600 font-medium truncate" title={item.location}>
                        <Warehouse sx={{ fontSize: 13, color: '#9ca3af', flexShrink: 0 }} />
                        <span className="truncate">{item.location}</span>
                      </div>
                    )}
                  </td>

                  {/* Quantity */}
                  <td className="py-2 px-1 text-center">
                    <div className="flex flex-col items-center justify-center leading-none">
                      <span className={`text-xs font-bold ${item.quantity === 0 ? 'text-red-500' : item.quantity <= item.minimumStock ? 'text-amber-600' : 'text-gray-900'}`}>
                        {item.quantity}
                      </span>
                      <span className="text-[9px] text-gray-400 font-medium mt-0.5">
                        {item.locationType === 'Room' ? 'in room' : 'in store'}
                      </span>
                    </div>
                  </td>

                  {/* Unit Price */}
                  <td className="py-2 px-1.5 text-right text-xs font-medium text-gray-600 font-mono">
                    ${Number(item.unitPrice).toFixed(2)}
                  </td>

                  {/* Total Value */}
                  <td className="py-2 px-1.5 text-right text-xs font-bold text-gray-900 font-mono">
                    ${Number(item.totalValue).toFixed(2)}
                  </td>

                  {/* Condition */}
                  <td className="py-2 px-1 text-center">
                    {getConditionBadge(item.condition)}
                  </td>

                  {/* Status */}
                  <td className="py-2 px-1 text-center">
                    {getStatusBadge(item.status)}
                  </td>

                  {/* Last Updated */}
                  <td className="py-2 px-1.5 text-[10px] font-medium text-gray-500 font-mono truncate">
                    {item.lastUpdated}
                  </td>

                  {/* Actions Menu */}
                  <td className="py-2 px-1 text-center" onClick={(e) => e.stopPropagation()}>
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleMenuClick(e, item.id)}
                      sx={{ padding: '2px', '&:hover': { backgroundColor: '#f3f4f6' } }}
                    >
                      <MoreVert sx={{ fontSize: 16 }} />
                    </IconButton>
                  </td>
                </tr>
              );
            })}

            {paginatedItems.length === 0 && (
              <tr>
                <td colSpan={10} className="py-12 text-center text-gray-400 text-xs">
                  <Inventory2 sx={{ fontSize: 32, color: '#d1d5db', mb: 1 }} />
                  <p className="font-semibold text-gray-600 text-sm">No inventory records match your filters.</p>
                  <p className="text-gray-400 mt-0.5">Try clearing search terms or resetting the room/category filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 0 && (
        <div className="p-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[12px] text-gray-500">
            Showing <span className="font-bold text-gray-800">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-800">{Math.min(currentPage * itemsPerPage, filteredItems.length)}</span> of <span className="font-bold text-gray-800">{filteredItems.length}</span> items
          </span>

          <div className="flex items-center space-x-1.5">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition"
            >
              <ChevronLeft sx={{ fontSize: 18 }} />
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 rounded-lg text-[12px] font-bold flex items-center justify-center transition cursor-pointer ${
                  currentPage === i + 1 
                    ? 'bg-[#1b7f43] text-white shadow-xs' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition"
            >
              <ChevronRight sx={{ fontSize: 18 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
