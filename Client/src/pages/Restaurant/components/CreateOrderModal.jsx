import React, { useState, useEffect, useCallback } from 'react';
import Close from '@mui/icons-material/Close';
import Bed from '@mui/icons-material/Bed';
import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';
import Search from '@mui/icons-material/Search';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Badge from '@mui/icons-material/Badge';
import { CATEGORIES, getMenuItems, placeOrder, updateOrder } from '../restaurantStore';

const EMPTY_FORM = { customer: '', roomNo: '', deliveryDate: '', deliveryTime: '', gratuity: 0, description: '' };

/**
 * CreateOrderModal — lets staff place a new order from the Orders tab.
 * Allows picking items from the full menu with +/- controls.
 */
export default function CreateOrderModal({ isOpen, onClose, onOrderPlaced, initialOrder }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [menuItems] = useState(getMenuItems);
  const [orderItems, setOrderItems] = useState({}); // { itemId: { name, price, qty } }
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialOrder) {
        setForm({
          customer: initialOrder.customer || '',
          roomNo: initialOrder.roomNo || '',
          deliveryDate: initialOrder.deliveryDate || '',
          deliveryTime: initialOrder.deliveryTime || '',
          gratuity: initialOrder.gratuity || 0,
          description: initialOrder.description || ''
        });
        const itemsMap = {};
        if (initialOrder.items) {
          initialOrder.items.forEach(item => {
            itemsMap[item.itemId] = { itemId: item.itemId, name: item.name, price: item.price, qty: item.qty };
          });
        }
        setOrderItems(itemsMap);
      } else {
        setForm(EMPTY_FORM);
        setOrderItems({});
      }
      setErrors({});
      setSelectedCat(CATEGORIES[0].id);
      setSearchQuery('');
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen, initialOrder]);

  const filteredItems = menuItems.filter(i => {
    const matchCat = i.categoryId === selectedCat;
    const matchSearch = !searchQuery.trim() || i.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchAvail = i.availability === 'Available';
    return matchCat && matchSearch && matchAvail;
  });

  const addItem = useCallback((item) => {
    setOrderItems(prev => ({
      ...prev,
      [item.id]: { itemId: item.id, name: item.name, price: item.price, qty: (prev[item.id]?.qty || 0) + 1 },
    }));
  }, []);

  const removeItem = useCallback((itemId) => {
    setOrderItems(prev => {
      const cur = prev[itemId]?.qty || 0;
      if (cur <= 1) { const n = { ...prev }; delete n[itemId]; return n; }
      return { ...prev, [itemId]: { ...prev[itemId], qty: cur - 1 } };
    });
  }, []);

  const selectedItems = Object.values(orderItems).filter(i => i.qty > 0);
  const subtotal = selectedItems.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = +(subtotal * 0.0525).toFixed(2);
  const gratuity = parseFloat(form.gratuity) || 0;
  const total = +(subtotal + tax + gratuity).toFixed(2);

  const validate = () => {
    const e = {};
    if (!form.customer.trim()) e.customer = 'Guest name required';
    if (!form.roomNo.trim()) e.roomNo = 'Room number required';
    if (selectedItems.length === 0) e.items = 'Add at least one item';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlace = () => {
    if (!validate()) return;
    const orderData = { 
      customer: form.customer.trim(), 
      roomNo: form.roomNo.trim(),
      deliveryDate: form.deliveryDate,
      deliveryTime: form.deliveryTime,
      gratuity: gratuity,
      description: form.description.trim() || 'Folio Charge',
      items: selectedItems, 
      paymentMode: 'Room Folio',
      total: total
    };
    
    if (initialOrder) {
      updateOrder(initialOrder.id, orderData);
    } else {
      placeOrder(orderData);
    }

    setForm(EMPTY_FORM);
    setOrderItems({});
    onOrderPlaced?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${isAnimating ? 'bg-black/40 backdrop-blur-sm' : 'bg-transparent'}`}
    >
      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300 ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Bed className="text-indigo-600" sx={{ fontSize: 24 }} />
            <div>
              <h2 className="text-gray-900 font-bold text-[16px]">{initialOrder ? 'Edit Room Folio' : 'Charge to Guest Room Folio'}</h2>
              <p className="text-gray-500 font-medium text-[12px]">Room #{form.roomNo || '01'} • Bill Total: PKR {total.toLocaleString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all">
            <Close sx={{ fontSize: 20 }} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* LEFT — Menu Picker */}
          <div className="flex-1 flex flex-col border-r border-gray-100 overflow-hidden">
            {/* Category tabs */}
            <div className="flex gap-1 px-4 pt-3 pb-2 overflow-x-auto hide-scrollbar flex-shrink-0 border-b border-gray-100">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap border transition-all ${
                    selectedCat === cat.id
                      ? 'bg-[var(--primary-main)] text-white border-[var(--primary-main)]'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            {/* Item search */}
            <div className="px-4 py-2 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 14 }} />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[var(--primary-main)] bg-gray-50"
                />
              </div>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-3 space-y-1.5">
              {errors.items && <p className="text-[11px] text-red-500 bg-red-50 rounded-lg px-3 py-1.5">⚠ {errors.items}</p>}
              {filteredItems.map(item => {
                const qty = orderItems[item.id]?.qty || 0;
                return (
                  <div key={item.id} className="flex items-center justify-between gap-3 bg-gray-50 hover:bg-[#f0f9f4] rounded-xl px-3 py-2.5 transition-all group">
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-semibold text-gray-800 truncate">{item.name}</p>
                      <p className="text-[11px] text-gray-400 font-bold">PKR {item.price}</p>
                    </div>
                    {qty === 0 ? (
                      <button
                        onClick={() => addItem(item)}
                        className="w-7 h-7 rounded-lg bg-[var(--primary-main)] text-white flex items-center justify-center hover:brightness-110 active:scale-90 transition-all shadow-sm"
                      >
                        <Add sx={{ fontSize: 14 }} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-[#e5f4eb] rounded-xl px-1.5 py-0.5">
                        <button onClick={() => removeItem(item.id)} className="w-5 h-5 flex items-center justify-center text-[var(--primary-main)] hover:bg-[var(--primary-main)] hover:text-white rounded-md transition-all active:scale-90">
                          <Remove sx={{ fontSize: 12 }} />
                        </button>
                        <span className="text-[12px] font-bold text-[var(--primary-main)] w-4 text-center">{qty}</span>
                        <button onClick={() => addItem(item)} className="w-5 h-5 flex items-center justify-center text-[var(--primary-main)] hover:bg-[var(--primary-main)] hover:text-white rounded-md transition-all active:scale-90">
                          <Add sx={{ fontSize: 12 }} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-[12px]">No available items in this category</div>
              )}
            </div>
          </div>

          {/* RIGHT — Order Form (Folio Style) */}
          <div className="w-[320px] flex flex-col overflow-hidden flex-shrink-0 bg-white">
            <div className="flex-1 overflow-y-auto hide-scrollbar p-5 space-y-4">
              
              {/* Room No */}
              <fieldset className={`border rounded-md px-3 pb-2 pt-1 transition-all ${errors.roomNo ? 'border-red-400' : 'border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'}`}>
                <legend className="text-[11px] text-gray-500 font-medium px-1">In-House Room # *</legend>
                <div className="flex items-center gap-2">
                  <Bed sx={{ fontSize: 16 }} className="text-gray-400" />
                  <input
                    type="text" placeholder="e.g. 804"
                    value={form.roomNo}
                    onChange={e => { setForm(p => ({ ...p, roomNo: e.target.value })); setErrors(p => ({ ...p, roomNo: '' })); }}
                    className="w-full outline-none text-[13.5px] bg-transparent text-gray-800"
                  />
                </div>
              </fieldset>
              {errors.roomNo && <p className="text-[10px] text-red-500 -mt-3">⚠ {errors.roomNo}</p>}

              {/* Guest Name */}
              <fieldset className={`border rounded-md px-3 pb-2 pt-1 transition-all ${errors.customer ? 'border-red-400' : 'border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'}`}>
                <legend className="text-[11px] text-gray-500 font-medium px-1">Guest Name *</legend>
                <div className="flex items-center gap-2">
                  <Badge sx={{ fontSize: 16 }} className="text-gray-800" />
                  <input
                    type="text" placeholder="Victoria Sterling"
                    value={form.customer}
                    onChange={e => { setForm(p => ({ ...p, customer: e.target.value })); setErrors(p => ({ ...p, customer: '' })); }}
                    className="w-full outline-none text-[13.5px] bg-transparent text-gray-800 font-medium"
                  />
                </div>
              </fieldset>
              {errors.customer && <p className="text-[10px] text-red-500 -mt-3">⚠ {errors.customer}</p>}

              {/* Gratuity & Total Box */}
              <div className="flex gap-3 items-stretch">
                <fieldset className="flex-1 border border-gray-300 rounded-md px-3 pb-2 pt-1 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                  <legend className="text-[11px] text-gray-500 font-medium px-1">Gratuity / Tip (PKR)</legend>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-gray-800">PKR</span>
                    <input
                      type="number" min="0"
                      value={form.gratuity}
                      onChange={e => setForm(p => ({ ...p, gratuity: e.target.value }))}
                      className="w-full outline-none text-[14px] bg-transparent text-gray-800"
                    />
                  </div>
                </fieldset>
                
                <div className="flex-1 bg-[#f5f3ff] border border-indigo-100 rounded-lg p-2.5 flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Folio Charge</p>
                  <p className="text-[18px] font-bold text-indigo-500">PKR {total.toLocaleString()}</p>
                </div>
              </div>

              {/* Date & Time (User requested additions) */}
              <div className="flex gap-3">
                <fieldset className="flex-1 border border-gray-300 rounded-md px-3 pb-2 pt-1 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                  <legend className="text-[11px] text-gray-500 font-medium px-1">Date</legend>
                  <input type="date" value={form.deliveryDate} onChange={e => setForm(p => ({ ...p, deliveryDate: e.target.value }))} className="w-full outline-none text-[12px] bg-transparent text-gray-800" />
                </fieldset>
                <fieldset className="flex-1 border border-gray-300 rounded-md px-3 pb-2 pt-1 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                  <legend className="text-[11px] text-gray-500 font-medium px-1">Time</legend>
                  <input type="time" value={form.deliveryTime} onChange={e => setForm(p => ({ ...p, deliveryTime: e.target.value }))} className="w-full outline-none text-[12px] bg-transparent text-gray-800" />
                </fieldset>
              </div>

              {/* Description */}
              <fieldset className="border border-gray-300 rounded-md px-3 pb-2 pt-1 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                <legend className="text-[11px] text-gray-500 font-medium px-1">Folio Transaction Description</legend>
                <textarea
                  rows="2"
                  placeholder="e.g. Dining at Table #01"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full outline-none text-[13px] bg-transparent text-gray-800 resize-none"
                />
              </fieldset>

              {/* Success Alert */}
              <div className="bg-[#effef5] border border-green-200 rounded-lg p-3 flex items-start gap-2.5">
                <CheckCircle className="text-green-500 shrink-0 mt-0.5" sx={{ fontSize: 16 }} />
                <p className="text-[11.5px] text-green-700 font-medium leading-tight">
                  Guest signature captured on digital terminal. Automated PMS Ledger billing authorized.
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-4 shrink-0 bg-white">
              <button onClick={onClose} className="text-[13px] font-bold text-indigo-500 hover:text-indigo-600">
                Cancel
              </button>
              <button
                onClick={handlePlace}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-bold text-white shadow-md hover:brightness-110 active:scale-[0.97] transition-all bg-indigo-500"
              >
                <CheckCircle sx={{ fontSize: 16 }} />
                {initialOrder ? 'Update Folio' : 'Post to Folio'} (PKR {total.toLocaleString()})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
