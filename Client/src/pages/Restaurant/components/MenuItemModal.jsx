import Restaurant from '@mui/icons-material/Restaurant';
import Close from '@mui/icons-material/Close';
import { useState, useEffect } from 'react';
import { CATEGORIES } from '../restaurantStore';

const EMPTY_FORM = {
  name: '',
  categoryId: '',
  price: '',
  description: '',
  dietary: 'Veg',
  availability: 'Available',
};

/**
 * MenuItemModal — Add / Edit menu item modal.
 * Beautiful glassmorphism-style modal with animated entrance.
 *
 * Props:
 *   isOpen      — boolean
 *   onClose     — fn()
 *   onSave      — fn(formData)
 *   initialData — item object for edit mode, null for add
 */
export default function MenuItemModal({ isOpen, onClose, onSave, initialData }) {
  const isEdit = Boolean(initialData);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (isOpen) {
      setForm(initialData
        ? { name: initialData.name, categoryId: initialData.categoryId, price: String(initialData.price),
            description: initialData.description || '', dietary: initialData.dietary || 'Veg',
            availability: initialData.availability || 'Available' }
        : EMPTY_FORM
      );
      setErrors({});
      // Trigger entrance animation
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const set = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())       e.name = 'Item name is required';
    if (!form.categoryId)        e.categoryId = 'Please select a category';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
                                  e.price = 'Enter a valid price';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      name: form.name.trim(),
      categoryId: form.categoryId,
      price: Number(form.price),
      description: form.description.trim(),
      dietary: form.dietary,
      availability: form.availability,
    });
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    /* Backdrop */
    <div
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${
        isAnimating ? 'bg-black/40 backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      {/* Modal Card */}
      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transition-all duration-300 ${
        isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
      }`}>

        {/* ── Modal Header (gradient) */}
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-main) 60%, var(--primary-light) 100%)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Restaurant sx={{ fontSize: 20 }} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-[16px] leading-tight">
                {isEdit ? 'Edit Menu Item' : 'New Menu Item'}
              </h2>
              <p className="text-white/70 text-[11px]">
                {isEdit ? 'Update item details below' : 'Fill in the details to add a new item'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-all active:scale-90"
          >
            <Close sx={{ fontSize: 18 }} />
          </button>
        </div>

        {/* ── Modal Body */}
        <div className="p-6 space-y-4">

          {/* Image Upload */}
          <fieldset className={`border rounded-md px-3 pb-2 pt-1 transition-all ${errors.image ? 'border-red-400' : 'border-gray-300 focus-within:border-[var(--primary-main)] focus-within:ring-1 focus-within:ring-[var(--primary-main)]'}`}>
            <legend className="text-[11px] text-gray-500 px-1">Upload Image</legend>
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  set('image', e.target.files[0]);
                }
              }}
              className="w-full outline-none text-[13px] bg-transparent text-gray-800 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-[var(--primary-main)] hover:file:bg-indigo-100"
            />
          </fieldset>

          {/* Item Name */}
          <fieldset className={`border rounded-md px-3 pb-2 pt-1 transition-all ${errors.name ? 'border-red-400' : 'border-gray-300 focus-within:border-[var(--primary-main)] focus-within:ring-1 focus-within:ring-[var(--primary-main)]'}`}>
            <legend className="text-[11px] text-gray-500 px-1">Item Name*</legend>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full outline-none text-[13px] bg-transparent text-gray-800"
            />
          </fieldset>
          {errors.name && <p className="text-[11px] text-red-500 mt-1 pl-1">⚠ {errors.name}</p>}

          {/* Category + Price row */}
          <div className="grid grid-cols-2 gap-4">
            <fieldset className={`border rounded-md px-3 pb-2 pt-1 transition-all ${errors.categoryId ? 'border-red-400' : 'border-gray-300 focus-within:border-[var(--primary-main)] focus-within:ring-1 focus-within:ring-[var(--primary-main)]'}`}>
              <legend className="text-[11px] text-gray-500 px-1">Category*</legend>
              <select
                value={form.categoryId}
                onChange={e => set('categoryId', e.target.value)}
                className="w-full outline-none text-[13px] bg-transparent text-gray-800 appearance-none cursor-pointer"
              >
                <option value="">Select category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </fieldset>

            <fieldset className={`border rounded-md px-3 pb-2 pt-1 transition-all flex items-center ${errors.price ? 'border-red-400' : 'border-gray-300 focus-within:border-[var(--primary-main)] focus-within:ring-1 focus-within:ring-[var(--primary-main)]'}`}>
              <legend className="text-[11px] text-gray-500 px-1">Price*</legend>
              <span className="text-gray-500 text-[13px] mr-1">$</span>
              <input
                type="number"
                min="1"
                value={form.price}
                onChange={e => set('price', e.target.value)}
                className="w-full outline-none text-[13px] bg-transparent text-gray-800"
              />
            </fieldset>
          </div>

          {/* Description */}
          <fieldset className="border border-gray-300 rounded-md px-3 pb-2 pt-1 focus-within:border-[var(--primary-main)] focus-within:ring-1 focus-within:ring-[var(--primary-main)] transition-all">
            <legend className="text-[11px] text-gray-500 px-1">Description</legend>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
              className="w-full outline-none text-[13px] bg-transparent text-gray-800 resize-none"
            />
          </fieldset>

          {/* Dietary + Availability row */}
          <div className="grid grid-cols-2 gap-4">
            <fieldset className="border border-gray-300 rounded-md px-3 pb-2 pt-1 focus-within:border-[var(--primary-main)] focus-within:ring-1 focus-within:ring-[var(--primary-main)] transition-all">
              <legend className="text-[11px] text-gray-500 px-1">Dietary</legend>
              <select
                value={form.dietary}
                onChange={e => set('dietary', e.target.value)}
                className="w-full outline-none text-[13px] bg-transparent text-gray-800 appearance-none cursor-pointer"
              >
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
              </select>
            </fieldset>

            <fieldset className="border border-gray-300 rounded-md px-3 pb-2 pt-1 focus-within:border-[var(--primary-main)] focus-within:ring-1 focus-within:ring-[var(--primary-main)] transition-all">
              <legend className="text-[11px] text-gray-500 px-1">Availability</legend>
              <select
                value={form.availability}
                onChange={e => set('availability', e.target.value)}
                className="w-full outline-none text-[13px] bg-transparent text-gray-800 appearance-none cursor-pointer"
              >
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </fieldset>
          </div>
        </div>

        {/* ── Modal Footer */}
        <div className="px-6 pb-6 flex items-center justify-start gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-[20px] text-[13px] font-bold text-gray-400 bg-gray-100 hover:bg-gray-200 transition-all"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-[20px] text-[13px] font-bold text-red-500 border border-red-200 hover:bg-red-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
