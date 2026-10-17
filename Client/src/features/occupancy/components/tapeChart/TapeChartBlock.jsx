import React, { useState } from 'react';
import {
  Person as PersonIcon,
  Event as EventIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Phone as PhoneIcon,
  Notes as NotesIcon,
  SwapHoriz as SwapIcon,
} from '@mui/icons-material';
import { toYMD, addDaysYMD, diffDaysYMD } from '../../utils/tapeChartDates';

export default function TapeChartBlock({ item, rangeStartDate, totalDays, onBlockClick }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const exclusiveEndDate = addDaysYMD(rangeStartDate, totalDays);
  const itemStartYMD = toYMD(item.start_date);
  const itemEndYMD = toYMD(item.end_date);

  const clampedStart = itemStartYMD < rangeStartDate ? rangeStartDate : itemStartYMD;
  const clampedEnd = itemEndYMD > exclusiveEndDate ? exclusiveEndDate : itemEndYMD;

  const startCol = diffDaysYMD(rangeStartDate, clampedStart) + 1;
  const spanCols = diffDaysYMD(clampedStart, clampedEnd);

  if (spanCols <= 0) return null;

  const startsBefore = itemStartYMD < rangeStartDate;
  const endsAfter = itemEndYMD > exclusiveEndDate;

  const isStay = item.type === 'STAY' || item.item_type === 'STAY' || item.status === 'IN_HOUSE';
  const isConfirmed = item.status === 'CONFIRMED';
  const isPending = item.status === 'PENDING';

  // Theme configuration based on lifecycle status
  let bgClasses = 'bg-gradient-to-r from-gray-600 to-gray-700 text-white border-gray-500';
  let badgeClasses = 'bg-gray-800 text-gray-200';
  let statusLabel = item.status || 'BOOKED';

  if (isStay) {
    bgClasses = 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white border-emerald-400/40';
    badgeClasses = 'bg-emerald-900/60 text-emerald-100 border border-emerald-400/30';
    statusLabel = 'In-House';
  } else if (isConfirmed) {
    bgClasses = 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white border-blue-400/40';
    badgeClasses = 'bg-blue-900/60 text-blue-100 border border-blue-400/30';
    statusLabel = 'Confirmed';
  } else if (isPending) {
    bgClasses = 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white border-amber-300';
    badgeClasses = 'bg-amber-900/60 text-amber-100 border border-amber-300/40';
    statusLabel = 'Pending';
  }

  const guestName = item.guest?.name || 'Guest';
  const refCode = item.booking_ref || item.stay_ref || 'BOOKING';

  return (
    <div
      style={{
        gridColumnStart: startCol,
        gridColumnEnd: `span ${spanCols}`,
      }}
      className="relative z-10 my-1 mx-0.5 pointer-events-auto"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        data-testid={`tapechart-block-${item.id}`}
        aria-label={`${isStay ? 'Active Stay' : 'Reservation'}: ${guestName}, Room ${item.room_id}`}
        className={`h-9 rounded-[5px] px-2 flex items-center justify-between text-xs font-medium border shadow-xs select-none cursor-default ${bgClasses} ${
          startsBefore ? 'rounded-l-none border-l-0 pl-1' : ''
        } ${endsAfter ? 'rounded-r-none border-r-0 pr-1' : ''}`}
      >
        {/* Left: Continued-from indicator & Main info */}
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          {startsBefore && (
            <ChevronLeftIcon
              sx={{ fontSize: 13 }}
              className="text-white/80 shrink-0"
              titleAccess="Reservation started before visible timeline"
            />
          )}

          <div className="flex items-center gap-1 min-w-0">
            {isStay ? (
              <PersonIcon sx={{ fontSize: 13 }} className="text-emerald-200 shrink-0" />
            ) : (
              <EventIcon sx={{ fontSize: 13 }} className="text-blue-200 shrink-0" />
            )}
            <span className="font-bold truncate text-[11px] leading-tight">
              {guestName}
            </span>
          </div>
        </div>

        {/* Right: Booking Ref & Status pill & Action button */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0 ml-1.5">
          <span className="text-[10px] text-white/80 font-mono tracking-tight">
            {refCode}
          </span>
          <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${badgeClasses}`}>
            {statusLabel}
          </span>
          {onBlockClick && (
            <button
              type="button"
              data-testid={`action-btn-${item.id}`}
              aria-label={isStay ? `Transfer Stay ${refCode}` : `Reassign Room ${refCode}`}
              title={isStay ? 'Transfer Active Stay to another room' : 'Reassign Reservation to another room'}
              onClick={(e) => {
                e.stopPropagation();
                onBlockClick(item);
              }}
              className="p-0.5 rounded bg-white/20 hover:bg-white/40 text-white transition-colors cursor-pointer flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-white"
            >
              <SwapIcon sx={{ fontSize: 13 }} />
            </button>
          )}
          {endsAfter && (
            <ChevronRightIcon
              sx={{ fontSize: 13 }}
              className="text-white/80 shrink-0"
              titleAccess="Reservation extends past visible timeline"
            />
          )}
        </div>
      </div>

      {/* Hover Details Popover / Tooltip */}
      {showTooltip && (
        <div
          role="tooltip"
          className="absolute z-50 top-full left-2 mt-1.5 w-64 p-3 bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700 text-xs animate-fade-in pointer-events-none"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-gray-700 mb-1.5">
            <span className="font-bold text-white text-[12px]">{guestName}</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${badgeClasses}`}>
              {statusLabel}
            </span>
          </div>

          <div className="space-y-1 text-[11px] text-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-400">Ref:</span>
              <span className="font-mono text-white">{refCode}</span>
            </div>
            {item.stay_ref && (
              <div className="flex justify-between">
                <span className="text-gray-400">Stay Ref:</span>
                <span className="font-mono text-white">{item.stay_ref}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Dates:</span>
              <span className="text-gray-200 font-medium">
                {itemStartYMD} &rarr; {itemEndYMD}
              </span>
            </div>
            {item.guest?.phone && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1">
                  <PhoneIcon sx={{ fontSize: 11 }} /> Phone:
                </span>
                <span className="text-gray-200">{item.guest.phone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Guests:</span>
              <span className="text-gray-200">
                {item.adults || 1} Adult{item.adults > 1 ? 's' : ''}
                {item.children ? `, ${item.children} Child` : ''}
              </span>
            </div>
            {item.special_requests && (
              <div className="pt-1 border-t border-gray-800 text-[10px] text-amber-300 flex items-start gap-1">
                <NotesIcon sx={{ fontSize: 12 }} className="shrink-0 mt-0.5" />
                <span className="italic">{item.special_requests}</span>
              </div>
            )}
            <div className="pt-1.5 border-t border-gray-800 text-[10px] text-gray-400 font-medium text-center tracking-tight">
              Click to {isStay ? 'transfer stay' : 'reassign room'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
