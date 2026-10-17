import React from 'react';
import {
  Close as CloseIcon,
  WarningAmber as WarningIcon,
  Event as EventIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { toYMD } from '../../utils/tapeChartDates';

export default function UnassignedBookingsDrawer({
  unassignedItems = [],
  isOpen,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <WarningIcon sx={{ fontSize: 16 }} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 leading-tight">
              Unassigned Bookings
            </h2>
            <p className="text-[11px] text-gray-500">
              {unassignedItems.length} booking{unassignedItems.length !== 1 ? 's' : ''} awaiting room assignment
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
          aria-label="Close unassigned bookings drawer"
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </button>
      </div>

      {/* Body: List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {unassignedItems.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#1b7f43] mx-auto flex items-center justify-center mb-2.5">
              <EventIcon sx={{ fontSize: 24 }} />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              All Bookings Assigned
            </h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Every confirmed reservation in this date range has been assigned to a physical room.
            </p>
          </div>
        ) : (
          unassignedItems.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg border border-amber-200 bg-amber-50/40 hover:bg-amber-50 transition-colors text-xs"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/60 mb-2">
                <span className="font-bold text-gray-900 font-mono text-[11px]">
                  {item.booking_ref || 'UNASSIGNED'}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider bg-amber-200 text-amber-900">
                  {item.status || 'CONFIRMED'}
                </span>
              </div>

              <div className="space-y-1 text-[11px] text-gray-700">
                <div className="flex items-center gap-1 font-semibold text-gray-900">
                  <PersonIcon sx={{ fontSize: 13 }} className="text-amber-700" />
                  <span>{item.guest?.name || 'Guest'}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Stay Window:</span>
                  <span className="font-medium text-gray-800">
                    {toYMD(item.start_date)} &rarr; {toYMD(item.end_date)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Guests:</span>
                  <span>
                    {item.adults || 1} Adult{item.adults > 1 ? 's' : ''}
                    {item.children ? `, ${item.children} Child` : ''}
                  </span>
                </div>
                {item.special_requests && (
                  <div className="pt-1 text-[10px] text-amber-800 italic">
                    Note: {item.special_requests}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Notice */}
      <div className="p-3 border-t border-gray-100 bg-gray-50 text-[11px] text-gray-500 text-center">
        Read-only preview. Physical room allocation will be available in future workflow steps.
      </div>
    </div>
  );
}
