import ShoppingCart from'@mui/icons-material/ShoppingCart';
import Remove from'@mui/icons-material/Remove';
import Add from'@mui/icons-material/Add';
import React from'react';

/**
 * MenuItemCard — shows a single menu item with +/- quantity control.
 * qty=0 shows just the cart icon; qty>0 shows full counter.
 */
export default function MenuItemCard({ item, qty, onAdd, onRemove }) {
 return (
 <div className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col gap-2 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
 {/* Item name row */}
 <div className="flex items-start justify-between gap-2">
 <p className="text-[13px] font-semibold text-gray-800 leading-tight flex-1 group-hover:text-[var(--primary-main)] transition-colors">
 {item.name}
 </p>
 {/* Cart icon — shows when qty=0, acts as quick-add */}
 {qty === 0 && (
 <button
 onClick={onAdd}
 className="shrink-0 w-7 h-7 rounded-lg bg-[var(--primary-main)] flex items-center justify-center text-white shadow-sm hover:brightness-110 active:scale-95 transition-all"
 title={`Add ${item.name}`}
 >
 <ShoppingCart sx={{ fontSize: 14 }} />
 </button>
 )}
 </div>

 {/* Description */}
 {item.description && (
 <p className="text-[11px] text-gray-400 leading-tight line-clamp-1">{item.description}</p>
 )}

 {/* Price + Qty Controls */}
 <div className="flex items-center justify-between mt-auto">
 <span className="text-[14px] font-bold text-gray-900">PKR {item.price}</span>

 {qty > 0 ? (
 <div className="flex items-center gap-1.5 bg-[#e5f4eb] rounded-xl px-1.5 py-0.5">
 <button
 onClick={onRemove}
 className="w-5 h-5 rounded-lg flex items-center justify-center text-[var(--primary-main)] hover:bg-[var(--primary-main)] hover:text-white active:scale-90 transition-all"
 >
 <Remove sx={{ fontSize: 12 }} />
 </button>
 <span className="text-[13px] font-bold text-[var(--primary-main)] min-w-[18px] text-center">
 {qty}
 </span>
 <button
 onClick={onAdd}
 className="w-5 h-5 rounded-lg flex items-center justify-center text-[var(--primary-main)] hover:bg-[var(--primary-main)] hover:text-white active:scale-90 transition-all"
 >
 <Add sx={{ fontSize: 12 }} />
 </button>
 </div>
 ) : (
 // Placeholder to keep card height consistent
 <div className="h-[26px]" />
 )}
 </div>
 </div>
 );
}
