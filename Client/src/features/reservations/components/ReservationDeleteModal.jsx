import React from 'react';

export default function ReservationDeleteModal({
  open,
  booking,
  onClose,
  onDelete
}) {
  if (!open || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fcf8fa] rounded-xl shadow-2xl w-[320px] p-6 text-center animate-scale-in border border-gray-100">
        <h2 className="text-[22px] font-medium text-gray-800 mb-6 text-left">Are you sure?</h2>

        <div className="text-left space-y-3 mb-8 text-[14px] text-gray-700">
          <p>
            Name: <span className="text-gray-600">{booking.name}</span>
          </p>
          <p>
            Email: <span className="text-gray-600">{booking.email}</span>
          </p>
          <p>
            Mobile: <span className="text-gray-600">{booking.mobile}</span>
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={onDelete}
            className="px-2 py-2 rounded-full bg-[#c23e3e] hover:bg-red-700 text-white font-bold text-[14px] transition-colors shadow-sm"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="px-2 py-2 rounded-full bg-[#0a6c32] hover:bg-green-800 text-white font-bold text-[14px] transition-colors shadow-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
