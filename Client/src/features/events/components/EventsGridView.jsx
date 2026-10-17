import React from 'react';
import {
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  VisibilityOutlined as ViewIcon,
  EditOutlined as EditIcon,
  Delete as DeleteIcon,
  PaymentsOutlined as PaymentsIcon
} from '@mui/icons-material';
import { getTypeBadgeStyle, getStatusBadgeStyle } from './EventsTableView';

export default function EventsGridView({
  events = [],
  onView,
  onEdit,
  onDelete,
  onOpenAddModal,
  onCollectPayment
}) {
  if (events.length === 0) {
    return (
      <div className="py-12 px-4 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
        <p className="text-sm font-semibold text-slate-700">No events found. Create your first event.</p>
        <p className="text-xs text-slate-400">All registered bookings and venues will appear here.</p>
        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="mt-1 px-3.5 py-1.5 bg-[#1b7f43] hover:bg-[#12572e] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            + Create First Event
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-2.5 sm:p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {events.map((evt) => (
        <div
          key={evt.id}
          className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                {evt.id}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${getStatusBadgeStyle(
                  evt.status
                )}`}
              >
                {evt.status}
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">
              {evt.name}
            </h3>
            <div className="flex items-center gap-1.5 mb-2">
              <span
                className={`px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${getTypeBadgeStyle(
                  evt.type
                )}`}
              >
                {evt.type}
              </span>
              <span className="text-xs text-slate-500">• {evt.client}</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <CalendarIcon sx={{ fontSize: 14 }} className="text-slate-400" />
                <span>
                  {evt.displayDate} ({evt.startTime} - {evt.endTime})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <LocationIcon sx={{ fontSize: 14 }} className="text-slate-400" />
                <span className="truncate">{evt.venue}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <PeopleIcon sx={{ fontSize: 14 }} className="text-slate-400" />
                <span>{evt.guests} Expected Guests</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Total: ${evt.amount.toLocaleString()}</span>
              {evt.balanceAmount > 0 ? (
                <span className="text-xs font-bold text-rose-600">
                  Due: ${evt.balanceAmount.toLocaleString()}
                </span>
              ) : (
                <span className="text-xs font-semibold text-emerald-600">
                  Fully Paid
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {evt.balanceAmount > 0 && (
                <button
                  onClick={() => onCollectPayment && onCollectPayment(evt)}
                  className="px-2 py-1 bg-emerald-50 hover:bg-[#1b7f43] text-[#1b7f43] hover:text-white border border-emerald-200 rounded font-bold text-[10px] transition-colors flex items-center gap-0.5 cursor-pointer shadow-2xs mr-1"
                  title="Collect remaining balance"
                >
                  <PaymentsIcon sx={{ fontSize: 13 }} />
                  <span>Collect</span>
                </button>
              )}
              <button
                onClick={() => onView(evt)}
                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="View Details"
                aria-label="View event details"
              >
                <ViewIcon sx={{ fontSize: 16 }} />
              </button>
              <button
                onClick={() => onEdit(evt)}
                className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                title="Edit Event"
                aria-label="Edit event"
              >
                <EditIcon sx={{ fontSize: 16 }} />
              </button>
              <button
                onClick={() => onDelete(evt)}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Delete Event"
                aria-label="Delete event"
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
