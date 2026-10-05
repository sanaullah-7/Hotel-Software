import React from 'react';
import {
  CalendarMonth as CalendarIcon,
  VisibilityOutlined as ViewIcon,
  EditOutlined as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

export const getTypeBadgeStyle = (type) => {
  switch (type) {
    case 'Wedding':
      return 'bg-pink-50 text-pink-700 border border-pink-200';
    case 'Conference':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'Birthday Party':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'Anniversary':
      return 'bg-purple-50 text-purple-700 border border-purple-200';
    case 'Corporate':
      return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
    case 'Workshop':
      return 'bg-teal-50 text-teal-700 border border-teal-200';
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
};

export const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'Confirmed':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'Pending':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'In-Progress':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'Completed':
      return 'bg-slate-100 text-slate-700 border border-slate-200';
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-200';
  }
};

export default function EventsTableView({
  events = [],
  selectedIds = [],
  onSelectAll,
  onSelectRow,
  allSelected = false,
  onView,
  onEdit,
  onDelete
}) {
  return (
    <div className="w-full overflow-hidden">
      <table className="table-fixed w-full text-left border-collapse">
        <colgroup>
          <col style={{ width: '4%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '16%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '13%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '6%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '7%' }} />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-100 bg-slate-50/50">
            <th className="py-2 px-1 text-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                className="w-3.5 h-3.5 rounded border-slate-300 text-[#1b7f43] focus:ring-[#1b7f43]/20 cursor-pointer"
              />
            </th>
            <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Event ID</th>
            <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Event Name</th>
            <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Type</th>
            <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Client</th>
            <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Date</th>
            <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Venue</th>
            <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider text-center whitespace-nowrap">Guests</th>
            <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">Amount</th>
            <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider text-center whitespace-nowrap">Status</th>
            <th className="py-2 px-1 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider text-center whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {events.length === 0 ? (
            <tr>
              <td colSpan="11" className="py-8 text-center text-slate-400 text-xs">
                No events found matching your search or filters.
              </td>
            </tr>
          ) : (
            events.map((evt) => {
              const isChecked = selectedIds.includes(evt.id);
              return (
                <tr
                  key={evt.id}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer border-b border-gray-50/60"
                  style={{ backgroundColor: isChecked ? '#edf7f2' : '' }}
                >
                  <td className="py-1.5 px-1 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onSelectRow(evt.id)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-[#1b7f43] focus:ring-[#1b7f43]/20 cursor-pointer"
                    />
                  </td>
                  <td className="py-1.5 px-1.5 text-[11px] text-gray-600 font-mono font-medium truncate">
                    {evt.id}
                  </td>
                  <td className="py-1.5 px-1.5 text-[11px] text-gray-800 font-bold truncate" title={evt.name}>
                    {evt.name}
                  </td>
                  <td className="py-1.5 px-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9.5px] font-semibold whitespace-nowrap inline-block ${getTypeBadgeStyle(
                        evt.type
                      )}`}
                    >
                      {evt.type}
                    </span>
                  </td>
                  <td className="py-1.5 px-1.5 text-[11px] text-gray-600 truncate" title={evt.client}>
                    {evt.client}
                  </td>
                  <td className="py-1.5 px-1.5 text-[11px] text-gray-600 whitespace-nowrap">
                    <div className="flex items-center gap-1 font-medium text-gray-800">
                      <CalendarIcon sx={{ fontSize: 11 }} className="text-gray-400 shrink-0" />
                      <span>{evt.displayDate}</span>
                    </div>
                  </td>
                  <td className="py-1.5 px-1.5 text-[11px] text-gray-600 truncate" title={evt.venue}>
                    {evt.venue}
                  </td>
                  <td className="py-1.5 px-1.5 text-[11px] text-gray-600 text-center">
                    {evt.guests}
                  </td>
                  <td className="py-1.5 px-1.5 text-[11px] font-semibold text-gray-900 text-right">
                    ${evt.amount.toLocaleString()}
                  </td>
                  <td className="py-1.5 px-1.5 text-center">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9.5px] font-semibold uppercase tracking-wider whitespace-nowrap inline-block ${getStatusBadgeStyle(
                        evt.status
                      )}`}
                    >
                      {evt.status}
                    </span>
                  </td>
                  <td className="py-1.5 px-1 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-0.5">
                      <button
                        onClick={() => onView(evt)}
                        title="View Details"
                        aria-label="View event details"
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                      >
                        <ViewIcon sx={{ fontSize: 14 }} />
                      </button>
                      <button
                        onClick={() => onEdit(evt)}
                        title="Edit Event"
                        aria-label="Edit event"
                        className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                      >
                        <EditIcon sx={{ fontSize: 14 }} />
                      </button>
                      <button
                        onClick={() => onDelete(evt)}
                        title="Delete Event"
                        aria-label="Delete event"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      >
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
