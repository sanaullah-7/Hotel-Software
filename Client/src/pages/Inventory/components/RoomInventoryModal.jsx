import React from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  IconButton, Divider, Chip, Tooltip 
} from '@mui/material';
import { 
  Close, MeetingRoom, Inventory2, Category, 
  CheckCircle, Warning, MonetizationOn, Warehouse,
  Bathtub, Bed, Tv, Kitchen, Weekend, Sanitizer, DryCleaning
} from '@mui/icons-material';
import { getRoomInventoryBreakdown, getStorageReserveForItem } from '../inventoryStore';

const CATEGORY_ICONS = {
  Bathroom: Bathtub,
  Bedroom: Bed,
  Electronics: Tv,
  Kitchen: Kitchen,
  Furniture: Weekend,
  Cleaning: Sanitizer,
  Amenities: DryCleaning,
  Linens: DryCleaning
};

export default function RoomInventoryModal({ open, onClose, roomNumber, inventoryItems = [] }) {
  if (!roomNumber) return null;

  const breakdown = getRoomInventoryBreakdown(roomNumber, inventoryItems);
  const categories = Object.keys(breakdown.byCategory);

  const getStatusChip = (status) => {
    switch (status) {
      case 'Available':
        return <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#e5f4eb] text-[#1b7f43] border border-[#1b7f43]/20 whitespace-nowrap">Available</span>;
      case 'Low Stock':
        return <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">Low Stock</span>;
      case 'Missing':
        return <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-red-50 text-red-600 border border-red-200 animate-pulse whitespace-nowrap">Missing</span>;
      case 'Out of Stock':
        return <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">Out of Stock</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-gray-100 text-gray-700 whitespace-nowrap">{status}</span>;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)' 
        }
      }}
    >
      {/* Modal Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-[#1b7f43] p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
            <MeetingRoom sx={{ fontSize: 24 }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Room {roomNumber} Inventory</h2>
              <span className="bg-white/20 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                Physically Placed in Room
              </span>
            </div>
            <p className="text-xs text-white/80 mt-0.5">
              Live audit of stock, electronics & amenities assigned and stationed inside Room {roomNumber}
            </p>
          </div>
        </div>
        <IconButton 
          onClick={onClose} 
          size="small" 
          sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' } }}
        >
          <Close sx={{ fontSize: 20 }} />
        </IconButton>
      </div>

      <DialogContent sx={{ p: 3, backgroundColor: '#f9fafb' }}>
        {/* Quick Stats Banner */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#e5f4eb] text-[#1b7f43] flex items-center justify-center">
              <Inventory2 sx={{ fontSize: 18 }} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase">Total In-Room Units</p>
              <p className="text-base font-extrabold text-gray-900">{breakdown.totalItems} Placed</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Category sx={{ fontSize: 18 }} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase">Categories</p>
              <p className="text-base font-extrabold text-gray-900">{categories.length} Types</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <MonetizationOn sx={{ fontSize: 18 }} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase">Room Asset Value</p>
              <p className="text-base font-extrabold text-emerald-700">${breakdown.totalValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Categorized List */}
        {categories.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500 border border-gray-100">
            <Inventory2 sx={{ fontSize: 36, color: '#9ca3af', mb: 1 }} />
            <p className="text-sm font-semibold">No inventory items assigned to Room {roomNumber}.</p>
            <p className="text-xs text-gray-400 mt-1">Use the "Add Inventory" page to assign items to this room.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((catName) => {
              const catItems = breakdown.byCategory[catName];
              const CatIcon = CATEGORY_ICONS[catName] || Category;

              return (
                <div key={catName} className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
                  <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-white border border-gray-200 text-gray-700">
                        <CatIcon sx={{ fontSize: 15 }} />
                      </div>
                      <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                        {catName}
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold text-gray-500 bg-gray-200/60 px-2 py-0.5 rounded-full">
                      {catItems.length} {catItems.length === 1 ? 'item type' : 'item types'}
                    </span>
                  </div>

                  <div className="divide-y divide-gray-50">
                    {catItems.map((item) => {
                      const storageReserve = getStorageReserveForItem(item, inventoryItems);

                      return (
                        <div key={item.id} className="p-3.5 hover:bg-gray-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-bold text-gray-800 truncate">{item.itemName}</span>
                              <span className="text-[10px] text-gray-400 font-mono">({item.sku})</span>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[11px] text-gray-500">
                                Placed at: <span className="text-gray-700 font-semibold">{item.location}</span>
                              </span>
                              {item.condition && (
                                <span className="text-[11px] text-gray-400">
                                  • Condition: <span className="text-gray-600 font-medium">{item.condition}</span>
                                </span>
                              )}
                            </div>

                            {/* Storage Backup Indicator */}
                            {storageReserve && (
                              <div className="mt-1 flex items-center gap-1 text-[10.5px] text-emerald-700 bg-emerald-50/80 border border-emerald-100 px-2 py-0.5 rounded-md w-fit">
                                <Warehouse sx={{ fontSize: 13 }} />
                                <span>Hotel Storage Reserve: <strong>{storageReserve.availableUnits} units</strong> ({storageReserve.location})</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                            <div className="text-left sm:text-right">
                              <span className={`text-[13px] font-bold block ${item.quantity === 0 ? 'text-red-500' : 'text-gray-900'}`}>
                                In Room: {item.quantity} {item.quantity === 1 ? 'Unit' : 'Units'}
                              </span>
                              <span className="text-[11px] text-gray-400 font-medium">
                                ${Number(item.unitPrice).toFixed(2)} each
                              </span>
                            </div>

                            <div className="w-24 text-right">
                              {getStatusChip(item.status)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, backgroundColor: 'white', borderTop: '1px solid #f3f4f6' }}>
        <button
          onClick={onClose}
          className="px-5 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
        >
          Close Detail View
        </button>
      </DialogActions>
    </Dialog>
  );
}
