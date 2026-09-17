import Receipt from '@mui/icons-material/Receipt';
import Delete from '@mui/icons-material/Delete';
import AttachMoney from '@mui/icons-material/AttachMoney';
import CreditCard from '@mui/icons-material/CreditCard';
import Print from '@mui/icons-material/Print';
import React, { useState } from 'react';
import { placeOrder } from '../restaurantStore';

const TAX_RATE = 0.0525;

/**
 * OrderPanel — right-side sticky panel showing the current order.
 * Handles customer name, room number, order items, totals, and placing order.
 *
 * Props:
 *   orderItems  — { [itemId]: { name, price, qty } }
 *   onRemoveItem(itemId)
 *   onUpdateQty(itemId, delta)
 *   onClearOrder()
 *   onOrderPlaced()
 */
export default function OrderPanel({ orderItems, onRemoveItem, onUpdateQty, onClearOrder, onOrderPlaced }) {
  const [customerName, setCustomerName] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [successMsg, setSuccessMsg] = useState('');
  const [errors, setErrors] = useState({});

  const items = Object.values(orderItems).filter(i => i.qty > 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  const validate = () => {
    const e = {};
    if (!customerName.trim()) e.customerName = 'Customer name required';
    if (!roomNo.toString().trim()) e.roomNo = 'Room number required';
    if (items.length === 0) e.items = 'Add at least one item';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = () => {
    if (!validate()) return;

    placeOrder({
      customer: customerName.trim(),
      roomNo: roomNo,
      items: items.map(i => ({ itemId: i.itemId || i.name, name: i.name, price: i.price, qty: i.qty })),
      paymentMode,
    });

    setSuccessMsg(`Order placed for Room ${roomNo}!`);
    setTimeout(() => setSuccessMsg(''), 3000);
    setCustomerName('');
    setRoomNo('');
    setPaymentMode('Cash');
    setErrors({});
    onClearOrder();
    if (onOrderPlaced) onOrderPlaced();
  };

  const handlePrint = () => {
    if (items.length === 0) return;
    const lines = [
      '═══════════════════════════',
      '       HOTEL RESTAURANT     ',
      '═══════════════════════════',
      `Customer : ${customerName || '—'}`,
      `Room     : ${roomNo || '—'}`,
      `Payment  : ${paymentMode}`,
      '───────────────────────────',
      ...items.map(i => `${i.name.padEnd(16)} x${i.qty}  PKR ${(i.price * i.qty)}`),
      `--------------------------------`,
      `Subtotal : PKR ${subtotal}`,
      `Tax(5.25%): PKR ${tax}`,
      `TOTAL    : PKR ${total}`,
      '═══════════════════════════',
    ].join('\n');
    const w = window.open('', '_blank', 'width=350,height=600');
    w.document.write(`<pre style="font-family:monospace;padding:16px">${lines}</pre>`);
    w.print();
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-[var(--primary-main)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-[14px]">New Order</p>
            <p className="text-white/70 text-[11px]">{items.length} item{items.length !== 1 ? 's' : ''} selected</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={onClearOrder}
              className="text-white/70 hover:text-white text-[11px] font-semibold hover:bg-white/10 px-2 py-1 rounded-lg transition-all"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Customer Info */}
      <div className="px-4 pt-3 pb-2 border-b border-gray-100 space-y-2">
        <div>
          <label className="text-[10.5px] font-semibold text-gray-500 block mb-1">Customer Name</label>
          <input
            type="text"
            placeholder="Enter customer name"
            value={customerName}
            onChange={e => { setCustomerName(e.target.value); setErrors(p => ({ ...p, customerName: '' })); }}
            className={`w-full px-3 py-1.5 border rounded-lg text-[12px] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] focus:border-[var(--primary-main)] transition-all ${errors.customerName ? 'border-red-400' : 'border-gray-200'}`}
          />
          {errors.customerName && <p className="text-[10px] text-red-500 mt-0.5">{errors.customerName}</p>}
        </div>
        <div>
          <label className="text-[10.5px] font-semibold text-gray-500 block mb-1">Room No.</label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 5"
            value={roomNo}
            onChange={e => { setRoomNo(e.target.value); setErrors(p => ({ ...p, roomNo: '' })); }}
            className={`w-full px-3 py-1.5 border rounded-lg text-[12px] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] focus:border-[var(--primary-main)] transition-all ${errors.roomNo ? 'border-red-400' : 'border-gray-200'}`}
          />
          {errors.roomNo && <p className="text-[10px] text-red-500 mt-0.5">{errors.roomNo}</p>}
        </div>
      </div>

      {/* Order Items List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-2 space-y-2">
        {errors.items && (
          <p className="text-[11px] text-red-500 text-center py-2 bg-red-50 rounded-lg">{errors.items}</p>
        )}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 text-gray-400">
            <Receipt sx={{ fontSize: 28 }} className="mb-1 opacity-40" />
            <p className="text-[11px]">No items added yet</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.itemId || item.name} className="flex items-start justify-between gap-2 py-2 border-b border-gray-50 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-gray-800 truncate">{item.name}</p>
                <p className="text-[10.5px] text-gray-400">PKR {item.price} × {item.qty}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Qty controls */}
                <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-1 py-0.5">
                  <button onClick={() => onUpdateQty(item.itemId || item.name, -1)} className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-[var(--primary-main)] active:scale-90 transition-all">
                    <span className="text-base leading-none">−</span>
                  </button>
                  <span className="text-[12px] font-bold text-gray-700 w-4 text-center">{item.qty}</span>
                  <button onClick={() => onUpdateQty(item.itemId || item.name, +1)} className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-[var(--primary-main)] active:scale-90 transition-all">
                    <span className="text-base leading-none">+</span>
                  </button>
                </div>
                <span className="text-[12px] font-bold text-gray-900 w-14 text-right">PKR {(item.price * item.qty).toLocaleString()}</span>
                <button
                  onClick={() => onRemoveItem(item.itemId || item.name)}
                  className="text-gray-300 hover:text-red-500 transition-colors p-0.5"
                  title="Remove item"
                >
                  <Delete sx={{ fontSize: 15 }} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals + Payment */}
      <div className="px-4 pt-3 pb-4 border-t border-gray-100 space-y-3">
        {/* Subtotal & tax */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11.5px] text-gray-500">
            <span>Items ({items.length})</span>
            <span>PKR {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[13px] text-gray-500">
            <span>Tax (5.25%)</span>
            <span>PKR {tax}</span>
          </div>
          <div className="flex justify-between text-[16px] font-bold text-gray-900 pt-3 border-t border-gray-100">
            <span>Total</span>
            <span className="text-[var(--primary-main)]">PKR {total.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Mode Toggle */}
        <div className="flex gap-2">
          {['Cash', 'Online'].map(mode => (
            <button
              key={mode}
              onClick={() => setPaymentMode(mode)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[12px] font-semibold border transition-all duration-200 ${
                paymentMode === mode
                  ? 'bg-[var(--primary-main)] text-white border-[var(--primary-main)] shadow-sm'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[var(--primary-main)] hover:text-[var(--primary-main)]'
              }`}
            >
              {mode === 'Cash' ? <AttachMoney sx={{ fontSize: 14 }} /> : <CreditCard sx={{ fontSize: 14 }} />}
              {mode}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            disabled={items.length === 0}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-bold border border-gray-200 bg-gray-50 text-gray-700 hover:border-[var(--primary-main)] hover:text-[var(--primary-main)] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            <Print sx={{ fontSize: 14 }} />
            Print Receipt
          </button>
          <button
            onClick={handlePlaceOrder}
            disabled={items.length === 0}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-bold bg-[var(--primary-main)] text-white shadow-sm hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            Place Order
          </button>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="text-center text-[11px] font-semibold text-[var(--primary-main)] bg-[#e5f4eb] py-1.5 rounded-lg animate-fade-in">
            ✅ {successMsg}
          </div>
        )}
      </div>
    </div>
  );
}
