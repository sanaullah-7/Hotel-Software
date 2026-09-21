import Bed from'@mui/icons-material/Bed';
import AttachMoney from'@mui/icons-material/AttachMoney';
import CreditCard from'@mui/icons-material/CreditCard';
import React from'react';

/**
 * Returns badge styles based on order status.
 * Uses existing Tailwind color tokens (not global CSS vars) for
 * semantic status colors since these are universal UX patterns.
 */
function StatusBadge({ status }) {
 const styles = {'In Progress':'bg-amber-100 text-amber-700 border border-amber-200','Completed':'bg-[#e5f4eb] text-[var(--primary-main)] border border-green-200','Cancelled':'bg-red-50 text-red-600 border border-red-200',
 };
 const dots = {'In Progress':'bg-amber-500','Completed':'bg-[var(--primary-main)]','Cancelled':'bg-red-500',
 };
 return (
 <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${styles[status] ||'bg-gray-100 text-gray-600'}`}>
 <span className={`w-1.5 h-1.5 rounded-full ${dots[status] ||'bg-gray-400'}`} />
 {status}
 </span>
 );
}

/**
 * Status description line shown under the badge.
 */
function statusDescription(status) {
 if (status ==='In Progress') return'Preparing your order';
 if (status ==='Completed') return'Ready to serve';
 if (status ==='Cancelled') return'Order cancelled';
 return'';
}

/**
 * OrderCard — card displayed in the Orders tab grid.
 */
export default function OrderCard({ order }) {
 // Generate avatar initials from customer name
 const initials = order.customer
 .split('')
 .map(w => w[0])
 .slice(0, 2)
 .join('')
 .toUpperCase();

 const placedAt = new Date(order.placedAt);
 const timeStr = placedAt.toLocaleString('en-IN', {
 month:'short', day:'2-digit', year:'numeric',
 hour:'2-digit', minute:'2-digit',
 });

 return (
 <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden flex flex-col">
 {/* Card Header */}
 <div className="p-4 border-b border-gray-50 flex items-start justify-between gap-3">
 <div className="flex items-center gap-3">
 {/* Avatar */}
 <div className="w-10 h-10 rounded-xl bg-[var(--primary-main)] flex items-center justify-center text-white font-bold text-[13px] shrink-0 shadow-sm">
 {initials}
 </div>
 {/* Name + Order ID */}
 <div className="min-w-0">
 <p className="text-[13.5px] font-bold text-gray-900 leading-tight truncate">{order.customer}</p>
 <p className="text-[10.5px] text-gray-400 font-mono mt-0.5">#{order.id} / Dine in</p>
 <div className="flex items-center gap-1 mt-0.5">
 <Bed sx={{ fontSize: 12 }} className="text-gray-400" />
 <span className="text-[10.5px] text-gray-500 font-medium">
 Room → {order.roomNo ||'N/A'}
 </span>
 </div>
 {(order.deliveryDate || order.deliveryTime) && (
 <div className="flex items-center gap-1 mt-0.5">
 <span className="text-[10px] text-orange-600 font-medium">
 Due: {order.deliveryDate} {order.deliveryTime}
 </span>
 </div>
 )}
 </div>
 </div>

 {/* Status */}
 <div className="flex flex-col items-end gap-1 shrink-0">
 <StatusBadge status={order.status} />
 <p className="text-[10px] text-gray-400">{statusDescription(order.status)}</p>
 </div>
 </div>

 {/* Card Body */}
 <div className="px-4 py-3 flex-1">
 {/* Items preview */}
 <div className="space-y-1.5">
 {order.items.slice(0, 3).map((item, idx) => (
 <div key={idx} className="flex justify-between text-[11.5px]">
 <span className="text-gray-600 truncate max-w-[60%]">{item.name}</span>
 <span className="text-gray-500 font-medium">x{item.qty} · PKR {(item.price * item.qty).toLocaleString()}</span>
 </div>
 ))}
 {order.items.length > 3 && (
 <p className="text-[11px] text-gray-400">+{order.items.length - 3} more items</p>
 )}
 </div>
 </div>

 {/* Card Footer */}
 <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between gap-2">
 <div className="flex items-center gap-1.5 text-gray-400">
 <span className="text-[10.5px] font-medium">{timeStr}</span>
 <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-medium text-gray-500">
 {order.items.reduce((s, i) => s + i.qty, 0)} Items
 </span>
 </div>

 <div className="flex items-center gap-1.5">
 {order.paymentMode ==='Cash'
 ? <AttachMoney sx={{ fontSize: 13 }} className="text-gray-400" />
 : <CreditCard sx={{ fontSize: 13 }} className="text-gray-400" />}
 <div className="text-right">
 <p className="text-[10px] text-gray-400">Total</p>
 <p className="text-[14px] font-bold text-gray-900">PKR {order.total.toLocaleString()}</p>
 </div>
 </div>
 </div>
 </div>
 );
}
