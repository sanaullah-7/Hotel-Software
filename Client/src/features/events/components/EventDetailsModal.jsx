import React from 'react';
import { Close as CloseIcon } from '@mui/icons-material';
import { getTypeBadgeStyle, getStatusBadgeStyle } from './EventsTableView';

export default function EventDetailsModal({
  event,
  onClose
}) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div>
            <span className="text-xs font-mono text-slate-400 block">{event.id}</span>
            <h3 className="text-lg font-bold tracking-tight">{event.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700">
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs text-slate-400 block">Event Type</span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${getTypeBadgeStyle(
                  event.type
                )}`}
              >
                {event.type}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Current Status</span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${getStatusBadgeStyle(
                  event.status
                )}`}
              >
                {event.status}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Client</span>
              <span className="font-semibold text-slate-900">{event.client}</span>
              <div className="text-xs text-slate-500 mt-0.5">
                {event.phone} • {event.email}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Venue &amp; Capacity</span>
              <span className="font-semibold text-slate-900">{event.venue}</span>
              <div className="text-xs text-slate-500 mt-0.5">
                {event.guests} Expected Guests
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Date &amp; Schedule</span>
              <span className="font-semibold text-slate-900">{event.displayDate}</span>
              <div className="text-xs text-slate-500 mt-0.5">
                {event.startTime} – {event.endTime}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Catering Service</span>
              <span className="font-semibold text-slate-900">{event.catering}</span>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-slate-50 p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Financial Summary
            </h4>
            <div className="flex justify-between items-center text-xs">
              <span>Total Amount:</span>
              <span className="font-bold text-slate-900">
                ${event.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span>Advance Paid:</span>
              <span className="font-semibold text-emerald-600">
                ${event.advanceAmount?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
              <span className="font-bold text-slate-800">Remaining Balance:</span>
              <span className="font-bold text-rose-600">
                ${event.balanceAmount?.toLocaleString() || 0}
              </span>
            </div>
          </div>

          {event.specialRequests && (
            <div>
              <span className="text-xs text-slate-400 block font-semibold">
                Special Requests
              </span>
              <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg">
                {event.specialRequests}
              </p>
            </div>
          )}

          {event.notes && (
            <div>
              <span className="text-xs text-slate-400 block font-semibold">
                Coordinator Notes
              </span>
              <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg">
                {event.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
