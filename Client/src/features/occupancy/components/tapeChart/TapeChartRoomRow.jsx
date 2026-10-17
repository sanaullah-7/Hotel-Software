import React, { useState } from 'react';
import {
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Block as BlockIcon,
  CleaningServices as CleanIcon,
} from '@mui/icons-material';
import TapeChartBlock from './TapeChartBlock';
import { toYMD } from '../../utils/tapeChartDates';

const opStatusStyles = {
  AVAILABLE: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  OCCUPIED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  MAINTENANCE: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  'OUT OF ORDER': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  CLEANING: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

const hkStatusStyles = {
  CLEAN: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  DIRTY: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  INSPECTED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  INSPECTING: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
};

export default function TapeChartRoomRow({
  room,
  timelineItems = [],
  visibleDates = [],
  rangeStartDate,
  totalDays,
  colWidth,
  onCellClick,
  onBlockClick,
}) {
  const [showMaintTooltip, setShowMaintTooltip] = useState(false);

  const isRoomOutOfOrder = room.status === 'OUT OF ORDER';

  const isDateOccupied = (dateStr) => {
    return timelineItems.some((item) => {
      const start = toYMD(item.start_date);
      const end = toYMD(item.end_date);
      return start <= dateStr && dateStr < end;
    });
  };

  const opStyle = opStatusStyles[room.status] || {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
  };

  const hkStyle = hkStatusStyles[room.housekeeping_status] || {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
  };

  const hasMaintenance = Array.isArray(room.active_maintenance) && room.active_maintenance.length > 0;

  return (
    <div className="flex border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
      {/* Sticky Left Column: Physical Room Card */}
      <div className="sticky left-0 z-20 w-48 sm:w-56 shrink-0 bg-white group-hover:bg-gray-50 border-r border-gray-200 p-2 flex flex-col justify-center shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-gray-900 tracking-tight font-mono">
              {room.room_number}
            </span>
            {room.floor && (
              <span className="text-[10px] text-gray-400 font-medium">
                Fl.{room.floor}
              </span>
            )}
          </div>

          {/* Operational Status Badge */}
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border ${opStyle.bg} ${opStyle.text} ${opStyle.border}`}
          >
            {room.status}
          </span>
        </div>

        {/* Sub-row: Housekeeping status and Active maintenance metadata */}
        <div className="flex items-center justify-between gap-1 mt-1 text-[10px]">
          <span
            className={`font-medium px-1.5 py-0.2 rounded border ${hkStyle.bg} ${hkStyle.text} ${hkStyle.border}`}
            title={`Housekeeping: ${room.housekeeping_status}`}
          >
            {room.housekeeping_status}
          </span>

          {hasMaintenance && (
            <div
              className="relative"
              onMouseEnter={() => setShowMaintTooltip(true)}
              onMouseLeave={() => setShowMaintTooltip(false)}
            >
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-300 font-semibold cursor-help">
                <BuildIcon sx={{ fontSize: 10 }} />
                <span>Ticket ({room.active_maintenance.length})</span>
              </span>

              {showMaintTooltip && (
                <div
                  role="tooltip"
                  className="absolute z-50 left-0 bottom-full mb-1.5 w-60 p-2.5 bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700 text-xs pointer-events-none"
                >
                  <div className="font-bold text-amber-300 pb-1 border-b border-gray-700 mb-1 flex items-center gap-1">
                    <BuildIcon sx={{ fontSize: 12 }} /> Active Maintenance Ticket
                  </div>
                  {room.active_maintenance.map((ticket) => (
                    <div key={ticket.id || ticket.ticket_ref} className="space-y-0.5 text-[11px] text-gray-300">
                      <div className="flex justify-between font-mono text-[10px] text-amber-200">
                        <span>{ticket.ticket_ref}</span>
                        <span className="uppercase">{ticket.priority} PRIORITY</span>
                      </div>
                      <div className="text-white font-medium">{ticket.title}</div>
                      <div className="text-gray-400 text-[10px]">Status: {ticket.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Grid Timeline row */}
      <div
        className="relative shrink-0 grid min-h-11"
        style={{
          gridTemplateColumns: `repeat(${totalDays}, minmax(${colWidth}px, 1fr))`,
          width: `${totalDays * colWidth}px`,
        }}
      >
        {/* Background Grid Cells for each calendar date */}
        {visibleDates.map((d) => {
          const isOccupied = isDateOccupied(d.dateStr);
          const isEligibleEmpty = !isOccupied && !isRoomOutOfOrder;

          if (isEligibleEmpty) {
            return (
              <button
                key={d.dateStr}
                type="button"
                data-testid={`empty-cell-${room.room_number}-${d.dateStr}`}
                aria-label={`Book Room ${room.room_number} on ${d.dateStr}`}
                onClick={() => {
                  if (onCellClick) onCellClick({ room, dateStr: d.dateStr });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (onCellClick) onCellClick({ room, dateStr: d.dateStr });
                  }
                }}
                className={`border-r border-gray-100/80 h-full w-full p-0 m-0 bg-transparent text-left relative flex items-center justify-center cursor-pointer transition-colors group/cell focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:bg-emerald-50/70 hover:bg-emerald-50/60 ${
                  d.isToday ? 'bg-emerald-50/20' : ''
                }`}
              >
                <span className="opacity-0 group-hover/cell:opacity-100 group-focus/cell:opacity-100 transition-opacity text-[10px] font-bold text-emerald-700 bg-white/95 border border-emerald-300 rounded px-1 py-0.5 shadow-2xs select-none pointer-events-none">
                  + Book
                </span>
              </button>
            );
          }

          if (isRoomOutOfOrder && !isOccupied) {
            return (
              <div
                key={d.dateStr}
                data-testid={`cell-${room.room_number}-${d.dateStr}`}
                title="Room is Out of Order"
                className="border-r border-gray-100/80 h-full bg-gray-100/60 cursor-not-allowed select-none"
              />
            );
          }

          return (
            <div
              key={d.dateStr}
              data-testid={`cell-${room.room_number}-${d.dateStr}`}
              className={`border-r border-gray-100/80 h-full ${
                d.isToday ? 'bg-emerald-50/30' : ''
              }`}
            />
          );
        })}

        {/* Timeline Items (Stays & Reservations) Layer */}
        <div
          className="absolute inset-0 grid items-center pointer-events-none"
          style={{
            gridTemplateColumns: `repeat(${totalDays}, minmax(${colWidth}px, 1fr))`,
          }}
        >
          {timelineItems.map((item) => (
            <TapeChartBlock
              key={item.id}
              item={item}
              rangeStartDate={rangeStartDate}
              totalDays={totalDays}
              onBlockClick={onBlockClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
