import Edit from'@mui/icons-material/Edit';
import Close from'@mui/icons-material/Close';
import FormatListBulleted from'@mui/icons-material/FormatListBulleted';
import CalendarToday from'@mui/icons-material/CalendarToday';
import LabelImportant from'@mui/icons-material/LabelImportant';
import React, { useState, useEffect } from'react';
import { CATEGORIES } from'../restaurantStore';

export default function ViewItemModal({ isOpen, onClose, onEdit, item }) {
 const [isAnimating, setIsAnimating] = useState(false);

 useEffect(() => {
 if (isOpen) {
 setTimeout(() => setIsAnimating(true), 10);
 } else {
 setIsAnimating(false);
 }
 }, [isOpen]);

 if (!isOpen || !item) return null;

 const handleBackdropClick = (e) => {
 if (e.target === e.currentTarget) onClose();
 };

 const category = CATEGORIES.find(c => c.id === item.categoryId);
 const catLabel = category ? category.label : item.categoryId;

 return (
 <div
 onClick={handleBackdropClick}
 className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${
 isAnimating ?'bg-black/40 backdrop-blur-sm' :'bg-transparent'
 }`}
 >
 <div className={`bg-white rounded-xl shadow-2xl w-full max-w-[600px] overflow-hidden transition-all duration-300 ${
 isAnimating ?'opacity-100 scale-100 translate-y-0' :'opacity-0 scale-95 translate-y-4'
 }`}>
 
 {/* ── Header ── */}
 <div className="bg-[#5c6df7] px-6 py-5 flex items-center justify-between relative">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center bg-transparent">
 <span className="text-white text-xl font-bold">{item.name.charAt(0).toUpperCase()}</span>
 </div>
 <div>
 <h2 className="text-white font-bold text-xl leading-tight">{item.name}</h2>
 <p className="text-white/80 text-sm mt-0.5">{item.availability ||'Available'}</p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={() => { onClose(); onEdit(item); }}
 className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all"
 >
 <Edit sx={{ fontSize: 16 }} />
 </button>
 <button
 onClick={onClose}
 className="w-8 h-8 rounded-full bg-transparent hover:bg-white/20 flex items-center justify-center text-white transition-all"
 >
 <Close sx={{ fontSize: 20 }} />
 </button>
 </div>
 </div>

 {/* ── Body ── */}
 <div className="p-6">
 <div className="grid grid-cols-2 gap-4">
 
 {/* Category */}
 <div className="bg-[#fafbff] border border-gray-100 rounded-xl p-4 flex items-center gap-4">
 <div className="w-8 h-8 rounded-full bg-[#edf0ff] flex items-center justify-center text-[#5c6df7] shrink-0">
 <FormatListBulleted sx={{ fontSize: 16 }} />
 </div>
 <div>
 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Category</p>
 <p className="text-[14px] font-bold text-gray-800">{catLabel}</p>
 </div>
 </div>

 {/* Price */}
 <div className="bg-[#fafbff] border border-gray-100 rounded-xl p-4 flex items-center gap-4">
 <div className="w-8 h-8 rounded-full bg-[#edf0ff] flex items-center justify-center text-[#5c6df7] shrink-0">
 <FormatListBulleted sx={{ fontSize: 16 }} />
 </div>
 <div>
 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Price</p>
 <p className="text-[14px] font-bold text-gray-800">{item.price}</p>
 </div>
 </div>

 {/* Dietary */}
 <div className="bg-[#fafbff] border border-gray-100 rounded-xl p-4 flex items-center gap-4">
 <div className="w-8 h-8 rounded-full bg-[#edf0ff] flex items-center justify-center text-[#5c6df7] shrink-0">
 <FormatListBulleted sx={{ fontSize: 16 }} />
 </div>
 <div>
 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Dietary</p>
 <p className="text-[14px] font-bold text-gray-800">{item.dietary ||'Veg'}</p>
 </div>
 </div>

 {/* Last Updated */}
 <div className="bg-[#fafbff] border border-gray-100 rounded-xl p-4 flex items-center gap-4">
 <div className="w-8 h-8 rounded-full bg-[#edf0ff] flex items-center justify-center text-[#5c6df7] shrink-0">
 <CalendarToday sx={{ fontSize: 16 }} />
 </div>
 <div>
 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Last Updated</p>
 <p className="text-[14px] font-bold text-gray-800">
 {new Date(item.updatedAt || Date.now()).toLocaleDateString()}
 </p>
 </div>
 </div>

 {/* Availability */}
 <div className="bg-[#fafbff] border border-gray-100 rounded-xl p-4 flex items-center gap-4 col-span-1">
 <div className="w-8 h-8 rounded-full bg-[#edf0ff] flex items-center justify-center text-[#5c6df7] shrink-0">
 <LabelImportant sx={{ fontSize: 16 }} />
 </div>
 <div>
 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Availability</p>
 <span className={`px-2.5 py-1 rounded border text-[12px] font-bold ${
 item.availability ==='Available' ?'bg-[#e5f4eb] text-[#2e7d32] border-[#2e7d32]/20' :'bg-red-50 text-red-600 border-red-600/20'
 }`}>
 {item.availability ||'Available'}
 </span>
 </div>
 </div>

 </div>
 </div>

 </div>
 </div>
 );
}
