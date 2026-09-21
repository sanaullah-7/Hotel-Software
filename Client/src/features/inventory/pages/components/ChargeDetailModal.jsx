import React from'react';
import { 
 Dialog, DialogContent, DialogActions, 
 IconButton 
} from'@mui/material';
import { Close, Receipt, CheckCircle, Person, MeetingRoom, CalendarToday } from'@mui/icons-material';
import { updateGuestCharge } from'../inventoryStore';

export default function ChargeDetailModal({
 open,
 onClose,
 charge,
 onChargeUpdated
}) {
 if (!charge) return null;

 const handleStatusChange = (newStatus) => {
 updateGuestCharge(charge.id, { status: newStatus });
 if (onChargeUpdated) onChargeUpdated();
 onClose();
 };

 const getStatusBadge = (status) => {
 switch (status) {
 case'Added to Folio':
 return <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#e5f4eb] text-[#1b7f43] border border-[#1b7f43]/20">Added to Folio</span>;
 case'Pending':
 return <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Pending Approval</span>;
 case'Paid':
 return <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Paid / Settled</span>;
 case'Invoiced':
 return <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Invoiced</span>;
 default:
 return <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-gray-100 text-gray-700">{status}</span>;
 }
 };

 const getTypeBadge = (type) => {
 switch (type) {
 case'Consumption':
 return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Consumption</span>;
 case'Damage':
 return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Damage</span>;
 case'External Order':
 return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200">External Order</span>;
 default:
 return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-gray-100 text-gray-700 border border-gray-200">{type}</span>;
 }
 };

 return (
 <Dialog 
 open={open} 
 onClose={onClose} 
 maxWidth="sm" 
 fullWidth
 PaperProps={{
 sx: { 
 borderRadius:'12px',
 overflow:'hidden',
 boxShadow:'0 10px 25px rgba(0,0,0,0.1)' 
 }
 }}
 >
 <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between">
 <div>
 <div className="flex items-center gap-2">
 <Receipt sx={{ fontSize: 20 }} />
 <h2 className="text-base font-bold">Folio Charge Breakdown</h2>
 <span className="bg-white/15 text-white text-[11px] font-mono px-1.5 py-0.5 rounded">
 {charge.id}
 </span>
 </div>
 <p className="text-[11px] text-white/70 mt-0.5">
 Folio Ref: <span className="text-white font-mono font-semibold">{charge.folioId ||`FOL-${charge.roomNumber}`}</span>
 </p>
 </div>
 <div className="flex items-center gap-2">
 {getStatusBadge(charge.status)}
 <IconButton 
 onClick={onClose} 
 size="small" 
 sx={{ color:'white','&:hover': { backgroundColor:'rgba(255,255,255,0.2)' } }}
 >
 <Close sx={{ fontSize: 18 }} />
 </IconButton>
 </div>
 </div>

 <DialogContent sx={{ p: 2.5, backgroundColor:'#f9fafb' }}>
 <div className="space-y-3">
 
 {/* Guest & Room Header Card */}
 <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs flex items-center justify-between">
 <div className="flex items-center gap-2.5">
 <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#1b7f43] flex items-center justify-center font-bold text-sm border border-emerald-100">
 {charge.guestName ? charge.guestName.charAt(0) :'G'}
 </div>
 <div>
 <h3 className="text-xs font-bold text-gray-900">{charge.guestName}</h3>
 <span className="text-[11px] font-semibold text-gray-500">Room {charge.roomNumber}</span>
 </div>
 </div>
 <div className="text-right">
 <span className="text-[10px] text-gray-400 block font-medium">Charge Type</span>
 {getTypeBadge(charge.chargeType)}
 </div>
 </div>

 {/* Itemized Charge Breakdown */}
 <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs space-y-2">
 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
 Itemized Folio Entry
 </span>

 <div className="bg-gray-50 p-2.5 rounded border border-gray-100 space-y-1.5">
 <div className="flex justify-between items-start">
 <div>
 <span className="text-xs font-bold text-gray-900 block">{charge.itemName}</span>
 {charge.inventoryItemId && (
 <span className="text-[10.5px] text-emerald-700 font-mono block">
 Linked Stock Item: {charge.inventoryItemId} (Auto Stock Deducted)
 </span>
 )}
 {charge.chargeType ==='External Order' && (
 <span className="text-[10.5px] text-amber-700 font-medium block">
 External Vendor Order (No hotel stock reduced)
 </span>
 )}
 </div>
 <div className="text-right">
 <span className="text-xs font-bold text-gray-900 font-mono">
 Rs. {Number(charge.amount || 0).toLocaleString()}
 </span>
 </div>
 </div>

 <div className="flex justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-200">
 <span>Quantity: {charge.quantity}</span>
 <span>Unit Rate: Rs. {Number(charge.unitPrice || 0).toLocaleString()}</span>
 </div>
 </div>

 {/* Notes */}
 {charge.notes && (
 <div className="pt-1">
 <span className="text-[10.5px] font-semibold text-gray-400 block">Folio Notes / Justification</span>
 <p className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-100 italic mt-0.5">"{charge.notes}"
 </p>
 </div>
 )}
 </div>

 {/* Flow Indicator */}
 <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs">
 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
 Folio Pipeline Progress
 </span>
 <div className="flex items-center justify-between text-[11px] font-semibold text-gray-600 bg-gray-50 p-2 rounded">
 <span className="text-[#1b7f43] font-bold">1. Charge Created</span>
 <span>→</span>
 <span className={charge.status ==='Added to Folio' || charge.status ==='Paid' ?'text-[#1b7f43] font-bold' :'text-gray-400'}>
 2. Guest Folio
 </span>
 <span>→</span>
 <span className={charge.status ==='Paid' ?'text-[#1b7f43] font-bold' :'text-gray-400'}>
 3. Invoice & Payment
 </span>
 </div>
 </div>

 {/* Update Action Buttons */}
 <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs space-y-1.5">
 <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider block">
 Folio Actions
 </span>
 <div className="grid grid-cols-2 gap-2">
 {charge.status !=='Added to Folio' && (
 <button
 onClick={() => handleStatusChange('Added to Folio')}
 className="w-full py-1.5 px-2.5 bg-[#1b7f43] hover:bg-[#166b37] text-white rounded text-xs font-semibold transition cursor-pointer"
 >
 Post to Folio
 </button>
 )}
 {charge.status !=='Paid' && (
 <button
 onClick={() => handleStatusChange('Paid')}
 className="w-full py-1.5 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition cursor-pointer"
 >
 Mark as Paid
 </button>
 )}
 {charge.status !=='Pending' && (
 <button
 onClick={() => handleStatusChange('Pending')}
 className="w-full py-1.5 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold transition cursor-pointer"
 >
 Set as Pending
 </button>
 )}
 </div>
 </div>

 </div>
 </DialogContent>

 <DialogActions sx={{ p: 2, backgroundColor:'white', borderTop:'1px solid #f3f4f6' }}>
 <button
 onClick={onClose}
 className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition cursor-pointer"
 >
 Close
 </button>
 </DialogActions>
 </Dialog>
 );
}
