import Bed from '@mui/icons-material/Bed';
import Close from '@mui/icons-material/Close';
import Search from '@mui/icons-material/Search';
import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';
import Badge from '@mui/icons-material/Badge';
import CheckCircle from '@mui/icons-material/CheckCircle';
import AttachMoney from '@mui/icons-material/AttachMoney';
import CreditCard from '@mui/icons-material/CreditCard';
import Receipt from '@mui/icons-material/Receipt';
import CircularProgress from '@mui/material/CircularProgress';
import React, { useState, useEffect, useCallback } from 'react';
import { CATEGORIES, getCategories, getMenuItems, placeOrder, updateOrder } from '../restaurantStore';
import stayService from '../../../../services/stayService';
import roomService from '../../../../services/roomService';

const EMPTY_FORM = {
  customer: '',
  roomNo: '',
  paymentMode: 'Room Folio',
  deliveryDate: '',
  deliveryTime: '',
  gratuity: 0,
  description: '',
};

/**
 * CreateOrderModal — lets staff place a new order from the Orders tab.
 * Allows picking items from the full menu with +/- controls.
 * Supports Room Folio, Cash, Card, and Online settlements.
 */
export default function CreateOrderModal({ isOpen, onClose, onOrderPlaced, initialOrder }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuItems, setMenuItems] = useState(getMenuItems());
  const [categories, setCategories] = useState(getCategories());
  const [orderItems, setOrderItems] = useState({}); // { itemId: { itemId, name, price, qty } }
  const [selectedCat, setSelectedCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [checkedInRooms, setCheckedInRooms] = useState([]);

  // Fetch checked-in stays & rooms for dynamic Room Folio selection
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    async function loadInHouseGuests() {
      try {
        const [stayRes, roomRes] = await Promise.all([
          stayService.getStays({ status: 'CHECKED_IN', limit: 100 }).catch(() => null),
          roomService.getRooms({ limit: 100 }).catch(() => null),
        ]);

        const rawStays = Array.isArray(stayRes?.data?.items)
          ? stayRes.data.items
          : Array.isArray(stayRes?.data?.stays)
          ? stayRes.data.stays
          : Array.isArray(stayRes?.data)
          ? stayRes.data
          : Array.isArray(stayRes?.stays)
          ? stayRes.stays
          : Array.isArray(stayRes)
          ? stayRes
          : [];

        const rawRooms = Array.isArray(roomRes?.data?.items)
          ? roomRes.data.items
          : Array.isArray(roomRes?.data?.rooms)
          ? roomRes.data.rooms
          : Array.isArray(roomRes?.data)
          ? roomRes.data
          : Array.isArray(roomRes)
          ? roomRes
          : [];

        const roomMap = {};
        rawRooms.forEach((r) => {
          if (r._id) roomMap[r._id] = r.room_number;
        });

        const activeList = [];
        rawStays.forEach((s) => {
          // Strictly verify stay is currently active (checked-in)
          const stayStatus = String(s.status || '').toUpperCase();
          if (stayStatus !== 'CHECKED_IN' && stayStatus !== 'IN-HOUSE' && stayStatus !== 'IN_HOUSE') {
            return;
          }

          const roomNum = s.room_number ||
            (Array.isArray(s.rooms) && s.rooms.find((r) => r.status === 'OCCUPIED')?.room_id?.room_number) ||
            (Array.isArray(s.rooms) && s.rooms[0]?.room_id?.room_number) ||
            roomMap[s.room_id] ||
            (typeof s.room_id === 'object' ? s.room_id?.room_number : '');

          const guestName = s.guest_name ||
            (s.primary_guest_id && typeof s.primary_guest_id === 'object'
              ? `${s.primary_guest_id.first_name || ''} ${s.primary_guest_id.last_name || ''}`.trim()
              : '') ||
            (s.guest_id && typeof s.guest_id === 'object'
              ? `${s.guest_id.first_name || ''} ${s.guest_id.last_name || ''}`.trim()
              : '');

          if (roomNum) {
            activeList.push({
              roomNumber: String(roomNum).trim(),
              guestName: guestName || 'Checked-in Guest',
            });
          }
        });

        if (isMounted) {
          setCheckedInRooms(activeList);
        }
      } catch (e) {
        console.warn('Could not load checked-in rooms:', e.message);
      }
    }

    loadInHouseGuests();
    return () => { isMounted = false; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const currentItems = getMenuItems();
      const currentCats = getCategories();
      setMenuItems(currentItems);
      setCategories(currentCats);

      if (initialOrder) {
        setForm({
          customer: initialOrder.customer || '',
          roomNo: initialOrder.roomNo && initialOrder.roomNo !== '—' && initialOrder.roomNo !== '-' ? initialOrder.roomNo : '',
          paymentMode: initialOrder.paymentMode || 'Room Folio',
          deliveryDate: initialOrder.deliveryDate || '',
          deliveryTime: initialOrder.deliveryTime || '',
          gratuity: initialOrder.gratuity || 0,
          description: initialOrder.notes || initialOrder.description || '',
        });
        const itemsMap = {};
        if (initialOrder.items) {
          initialOrder.items.forEach((item) => {
            const id = item.itemId || item.id || item._id;
            itemsMap[id] = { itemId: id, name: item.name, price: item.price, qty: item.qty };
          });
        }
        setOrderItems(itemsMap);
      } else {
        setForm(EMPTY_FORM);
        setOrderItems({});
      }
      setErrors({});
      setServerError('');
      setSelectedCat('all');
      setSearchQuery('');
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen, initialOrder]);

  const filteredItems = menuItems.filter((i) => {
    const matchCat =
      selectedCat === 'all' ||
      i.categoryId === selectedCat ||
      categories.some(
        (c) =>
          (c.id === selectedCat || c._id === selectedCat) &&
          (c.id === i.categoryId || c._id === i.categoryId)
      );
    const matchSearch =
      !searchQuery.trim() ||
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchAvail = i.availability === 'Available' || i.is_available === true;
    return matchCat && matchSearch && matchAvail;
  });

  const addItem = useCallback((item) => {
    setOrderItems((prev) => ({
      ...prev,
      [item.id]: { itemId: item.id, name: item.name, price: item.price, qty: (prev[item.id]?.qty || 0) + 1 },
    }));
  }, []);

  const removeItem = useCallback((itemId) => {
    setOrderItems((prev) => {
      const cur = prev[itemId]?.qty || 0;
      if (cur <= 1) {
        const n = { ...prev };
        delete n[itemId];
        return n;
      }
      return { ...prev, [itemId]: { ...prev[itemId], qty: cur - 1 } };
    });
  }, []);

  const selectedItems = Object.values(orderItems).filter((i) => i.qty > 0);
  const subtotal = selectedItems.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = +(subtotal * 0.0525).toFixed(2);
  const gratuity = parseFloat(form.gratuity) || 0;
  const total = +(subtotal + tax + gratuity).toFixed(2);

  const validate = () => {
    const e = {};
    if (!form.customer.trim() && form.paymentMode === 'Room Folio') {
      e.customer = 'Guest name required for room folio';
    }
    if (form.paymentMode === 'Room Folio' && !form.roomNo.trim()) {
      e.roomNo = 'Room number required for folio charge';
    }
    if (selectedItems.length === 0) {
      e.items = 'Please select at least one menu item';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlace = async () => {
    if (!validate()) return;
    setServerError('');
    setIsSubmitting(true);

    const orderData = {
      customer: form.customer.trim() || (form.paymentMode === 'Room Folio' ? 'Hotel Guest' : 'Walk-in Diner'),
      roomNo: form.roomNo.trim(),
      paymentMode: form.paymentMode,
      deliveryDate: form.deliveryDate,
      deliveryTime: form.deliveryTime,
      gratuity: gratuity,
      description: form.description.trim() || `${form.paymentMode} Charge`,
      notes: form.description.trim() || `${form.paymentMode} Charge`,
      items: selectedItems,
      total: total,
    };

    try {
      if (initialOrder) {
        await updateOrder(initialOrder.id, orderData);
      } else {
        await placeOrder(orderData);
      }

      setForm(EMPTY_FORM);
      setOrderItems({});
      onOrderPlaced?.();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to place order';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoomSelect = (e) => {
    const val = typeof e === 'string' ? e : e?.target?.value || '';
    handleRoomNumberChange(val);
  };

  const handleRoomNumberChange = (rawVal) => {
    const val = String(rawVal || '').trim();
    // Only pick actively checked-in guest (excludes checked-out or vacant rooms)
    const matched = checkedInRooms.find(
      (r) => String(r.roomNumber).trim().toLowerCase() === val.toLowerCase()
    );

    setForm((p) => ({
      ...p,
      roomNo: rawVal,
      customer: matched ? matched.guestName : '',
    }));
    setErrors((p) => ({ ...p, roomNo: '', customer: '' }));
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${
        isAnimating ? 'bg-black/40 backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <div
        className={`bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300 ${
          isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              {form.paymentMode === 'Room Folio' ? (
                <Bed sx={{ fontSize: 22 }} />
              ) : form.paymentMode === 'Cash' ? (
                <AttachMoney sx={{ fontSize: 22 }} />
              ) : (
                <CreditCard sx={{ fontSize: 22 }} />
              )}
            </div>
            <div>
              <h2 className="text-gray-900 font-bold text-[16px]">
                {initialOrder ? 'Edit Order' : 'Create Restaurant Order'}
              </h2>
              <p className="text-gray-500 font-medium text-[12px]">
                {form.paymentMode === 'Room Folio'
                  ? `Room Folio • ${form.roomNo ? `Room #${form.roomNo}` : 'Select Room'}`
                  : `${form.paymentMode} Settlement • Direct POS`}{' '}
                • Bill Total: PKR {total.toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all cursor-pointer"
          >
            <Close sx={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Server Error Alert Banner */}
        {serverError && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 text-xs text-red-600 font-semibold flex items-center gap-2">
            <span>⚠</span>
            <span>{serverError}</span>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* LEFT — Menu Picker */}
          <div className="flex-1 flex flex-col border-r border-gray-100 overflow-hidden">
            {/* Category tabs */}
            <div className="flex gap-1.5 px-4 pt-3 pb-2 hide-scrollbar flex-shrink-0 border-b border-gray-100 overflow-x-auto">
              <button
                onClick={() => setSelectedCat('all')}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all whitespace-nowrap cursor-pointer ${
                  selectedCat === 'all'
                    ? 'bg-[var(--primary-main)] text-white border-[var(--primary-main)]'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                All Menu
              </button>
              {(categories || CATEGORIES).map((cat) => {
                const catKey = cat.id || cat._id;
                return (
                  <button
                    key={catKey}
                    onClick={() => setSelectedCat(catKey)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all whitespace-nowrap cursor-pointer ${
                      selectedCat === catKey
                        ? 'bg-[var(--primary-main)] text-white border-[var(--primary-main)]'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {cat.label || cat.name}
                  </button>
                );
              })}
            </div>

            {/* Item search */}
            <div className="px-4 py-2 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 14 }} />
                <input
                  type="text"
                  placeholder="Search dishes, drinks, appetizers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[var(--primary-main)] bg-gray-50"
                />
              </div>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-3 space-y-1.5">
              {errors.items && (
                <p className="text-[11px] text-red-500 bg-red-50 rounded-lg px-3 py-1.5">⚠ {errors.items}</p>
              )}
              {filteredItems.map((item) => {
                const qty = orderItems[item.id]?.qty || 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 bg-gray-50 hover:bg-[#f0f9f4] rounded-xl px-3 py-2.5 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.dietary === 'Veg' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        />
                        <p className="text-[12.5px] font-semibold text-gray-800 truncate">{item.name}</p>
                      </div>
                      <p className="text-[11px] text-gray-400 font-bold ml-3.5">PKR {item.price}</p>
                    </div>
                    {qty === 0 ? (
                      <button
                        onClick={() => addItem(item)}
                        className="w-7 h-7 rounded-lg bg-[var(--primary-main)] text-white flex items-center justify-center hover:brightness-110 active:scale-90 transition-all shadow-sm cursor-pointer"
                      >
                        <Add sx={{ fontSize: 14 }} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-[#e5f4eb] rounded-xl px-1.5 py-0.5">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-5 h-5 flex items-center justify-center text-[var(--primary-main)] hover:bg-[var(--primary-main)] hover:text-white rounded-md transition-all active:scale-90 cursor-pointer"
                        >
                          <Remove sx={{ fontSize: 12 }} />
                        </button>
                        <span className="text-[12px] font-bold text-[var(--primary-main)] w-4 text-center">{qty}</span>
                        <button
                          onClick={() => addItem(item)}
                          className="w-5 h-5 flex items-center justify-center text-[var(--primary-main)] hover:bg-[var(--primary-main)] hover:text-white rounded-md transition-all active:scale-90 cursor-pointer"
                        >
                          <Add sx={{ fontSize: 12 }} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredItems.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-[12px]">
                  No menu items found in this category.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Order Details & Billing */}
          <div className="w-[340px] flex flex-col overflow-hidden flex-shrink-0 bg-white">
            <div className="flex-1 overflow-y-auto hide-scrollbar p-5 space-y-3.5">
              {/* Payment Mode Selector */}
              <div>
                <label className="text-[11px] text-gray-500 font-semibold block mb-1">Payment Method *</label>
                <div className="grid grid-cols-4 gap-1 bg-gray-100 p-1 rounded-xl">
                  {['Room Folio', 'Cash', 'Card', 'Online'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setForm((p) => ({ ...p, paymentMode: mode }));
                        setErrors((p) => ({ ...p, roomNo: '', customer: '' }));
                      }}
                      className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        form.paymentMode === mode
                          ? 'bg-white text-[var(--primary-main)] shadow-sm'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Selection (for Room Folio) */}
              {form.paymentMode === 'Room Folio' ? (
                <div>
                  <fieldset
                    className={`border rounded-md px-3 pb-2 pt-1 transition-all ${
                      errors.roomNo
                        ? 'border-red-400'
                        : 'border-gray-300 focus-within:border-[var(--primary-main)] focus-within:ring-1 focus-within:ring-[var(--primary-main)]'
                    }`}
                  >
                    <legend className="text-[11px] text-gray-500 font-medium px-1">In-House Guest Room *</legend>
                    <div className="flex items-center gap-2">
                      <Bed sx={{ fontSize: 16 }} className="text-gray-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="e.g. 101"
                        list="checked-in-rooms-datalist"
                        value={form.roomNo}
                        onChange={(e) => handleRoomNumberChange(e.target.value)}
                        className="w-full outline-none text-[13px] bg-transparent text-gray-800 font-semibold"
                      />
                      {checkedInRooms.length > 0 && (
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) handleRoomNumberChange(e.target.value);
                          }}
                          className="text-[11px] text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded px-1.5 py-0.5 outline-none cursor-pointer max-w-[125px] shrink-0 font-medium"
                          title="Quick pick from currently checked-in rooms"
                        >
                          <option value="">Rooms ({checkedInRooms.length})</option>
                          {checkedInRooms.map((r, idx) => (
                            <option key={idx} value={r.roomNumber}>
                              #{r.roomNumber} - {r.guestName}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    {/* Native datalist autocomplete while typing */}
                    <datalist id="checked-in-rooms-datalist">
                      {checkedInRooms.map((r, idx) => (
                        <option key={idx} value={r.roomNumber}>
                          Room #{r.roomNumber} — {r.guestName}
                        </option>
                      ))}
                    </datalist>
                  </fieldset>

                  {/* Active guest feedback or warning */}
                  {errors.roomNo && <p className="text-[10px] text-red-500 mt-1">⚠ {errors.roomNo}</p>}
                  {form.roomNo.trim() && (() => {
                    const matched = checkedInRooms.find(
                      (r) => String(r.roomNumber).trim().toLowerCase() === form.roomNo.trim().toLowerCase()
                    );
                    if (matched) {
                      return (
                        <p className="text-[10.5px] text-green-600 mt-1 font-medium flex items-center gap-1">
                          <CheckCircle sx={{ fontSize: 13 }} /> Checked-in: {matched.guestName}
                        </p>
                      );
                    } else {
                      return (
                        <p className="text-[10.5px] text-amber-600 mt-1">
                          ⚠ Room {form.roomNo} is not currently checked-in
                        </p>
                      );
                    }
                  })()}
                  {!form.roomNo.trim() && checkedInRooms.length === 0 && (
                    <p className="text-[10px] text-amber-600 mt-1 leading-tight">
                      ℹ No active checked-in stays found. If dining directly, switch payment to Cash or Card.
                    </p>
                  )}
                </div>
              ) : (
                <fieldset className="border border-gray-300 rounded-md px-3 pb-2 pt-1 focus-within:border-[var(--primary-main)] focus-within:ring-1 focus-within:ring-[var(--primary-main)]">
                  <legend className="text-[11px] text-gray-500 font-medium px-1">Table # or Room (Optional)</legend>
                  <input
                    type="text"
                    placeholder="e.g. Table 4 or Takeaway"
                    value={form.roomNo}
                    onChange={(e) => setForm((p) => ({ ...p, roomNo: e.target.value }))}
                    className="w-full outline-none text-[13px] bg-transparent text-gray-800"
                  />
                </fieldset>
              )}

              {/* Guest / Customer Name */}
              <fieldset
                className={`border rounded-md px-3 pb-2 pt-1 transition-all ${
                  errors.customer
                    ? 'border-red-400'
                    : 'border-gray-300 focus-within:border-[var(--primary-main)] focus-within:ring-1 focus-within:ring-[var(--primary-main)]'
                }`}
              >
                <legend className="text-[11px] text-gray-500 font-medium px-1">Customer / Guest Name</legend>
                <div className="flex items-center gap-2">
                  <Badge sx={{ fontSize: 16 }} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder={form.paymentMode === 'Room Folio' ? 'e.g. Victoria Sterling' : 'Walk-in Diner'}
                    value={form.customer}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, customer: e.target.value }));
                      setErrors((p) => ({ ...p, customer: '' }));
                    }}
                    className="w-full outline-none text-[13px] bg-transparent text-gray-800 font-medium"
                  />
                </div>
              </fieldset>
              {errors.customer && <p className="text-[10px] text-red-500 mt-0.5">⚠ {errors.customer}</p>}

              {/* Gratuity & Total Box */}
              <div className="flex gap-2.5 items-stretch">
                <fieldset className="flex-1 border border-gray-300 rounded-md px-3 pb-2 pt-1 focus-within:border-[var(--primary-main)] focus-within:ring-1 focus-within:ring-[var(--primary-main)]">
                  <legend className="text-[11px] text-gray-500 font-medium px-1">Tip / Gratuity</legend>
                  <div className="flex items-center gap-1">
                    <span className="text-[12px] font-bold text-gray-600">PKR</span>
                    <input
                      type="number"
                      min="0"
                      value={form.gratuity}
                      onChange={(e) => setForm((p) => ({ ...p, gratuity: e.target.value }))}
                      className="w-full outline-none text-[13px] bg-transparent text-gray-800 font-semibold"
                    />
                  </div>
                </fieldset>

                <div className="flex-1 bg-[#f5f3ff] border border-indigo-100 rounded-lg p-2.5 flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Amount</p>
                  <p className="text-[17px] font-bold text-indigo-600 leading-tight">PKR {total.toLocaleString()}</p>
                </div>
              </div>

              {/* Notes / Special Instructions */}
              <fieldset className="border border-gray-300 rounded-md px-3 pb-2 pt-1 focus-within:border-[var(--primary-main)] focus-within:ring-1 focus-within:ring-[var(--primary-main)]">
                <legend className="text-[11px] text-gray-500 font-medium px-1">Order Notes / Kitchen Requests</legend>
                <textarea
                  rows="2"
                  placeholder="e.g. Extra spicy, serve warm, urgent delivery"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full outline-none text-[12px] bg-transparent text-gray-800 resize-none"
                />
              </fieldset>

              {/* Summary pill */}
              <div className="bg-[#effef5] border border-green-200 rounded-lg p-2.5 flex items-start gap-2">
                <CheckCircle className="text-green-600 shrink-0 mt-0.5" sx={{ fontSize: 15 }} />
                <p className="text-[11px] text-green-800 font-medium leading-tight">
                  {form.paymentMode === 'Room Folio'
                    ? 'Order will be posted directly to the guest room folio & billing invoice.'
                    : `Direct ${form.paymentMode} receipt will be issued upon order completion.`}
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0 bg-white">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-[12.5px] font-bold text-gray-500 hover:text-gray-700 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePlace}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-bold text-white shadow-sm hover:brightness-110 active:scale-[0.98] transition-all bg-[var(--primary-main)] cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={14} color="inherit" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Receipt sx={{ fontSize: 16 }} />
                    <span>{initialOrder ? 'Update Order' : 'Place Order'} (PKR {total.toLocaleString()})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
