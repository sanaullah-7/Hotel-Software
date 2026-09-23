import React from 'react';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Person as PersonIcon
} from '@mui/icons-material';

export default function CheckInOutDeleteModal({ guest, onClose, onConfirm }) {
  if (!guest) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-[450px] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#f43f5e] px-5 py-4 flex items-start gap-4">
          <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 border border-white/40 bg-white/10">
            <DeleteIcon className="text-white" sx={{ fontSize: 22 }} />
          </div>
          <div className="flex-1 mt-0.5">
            <h2 className="text-white text-[17px] font-bold leading-tight">
              Delete Check-in Record
            </h2>
            <p className="text-white/80 text-[13px] mt-0.5 font-medium">
              This action cannot be undone
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center text-white hover:bg-black/20 transition-colors cursor-pointer"
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-500 text-[14px] font-medium mb-4">
            Are you sure you want to delete the following check-in record?
          </p>
          <div className="bg-rose-50 border border-rose-100 rounded-lg p-3.5 flex items-center gap-3">
            <PersonIcon className="text-[#f43f5e]" sx={{ fontSize: 20 }} />
            <span className="text-slate-800 text-[14px] font-bold">{guest.name}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end items-center gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-5 py-2 text-[13px] font-bold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-lg bg-[#b91c1c] hover:bg-[#991b1b] text-white text-[13px] font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <DeleteIcon sx={{ fontSize: 16 }} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
