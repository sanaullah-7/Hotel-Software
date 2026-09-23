import React from 'react';
import { Close } from '@mui/icons-material';

export default function ReservationCancelModal({
  open,
  onClose,
  onSubmit
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#fcf8fa] rounded-lg shadow-2xl w-full max-w-[400px] overflow-hidden flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between">
          <h2 className="text-white text-[16px] font-bold">Cancel Booking</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center"
          >
            <Close sx={{ fontSize: 16 }} />
          </button>
        </div>

        <div className="p-5 bg-white">
          <p className="text-[13px] text-gray-600 mb-3">
            Please provide a reason for cancelling the booking:
          </p>
          <textarea
            rows="3"
            placeholder="Reason"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-[13px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all resize-y"
          ></textarea>
        </div>

        <div className="px-5 py-4 bg-white flex gap-4">
          <button
            onClick={onClose}
            className="text-[#e11d48] font-medium text-[14px] hover:text-red-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="text-[#1b7f43] font-medium text-[14px] hover:text-green-800 transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
