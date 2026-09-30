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
    <div className="w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <table className="w-full text-left min-w-[750px]">
        <thead className="bg-gray-50/50">
          <tr>
            <th className="py-3 px-3 w-10 text-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                className="w-4 h-4 rounded border-slate-300 text-[#1b7f43] focus:ring-[#1b7f43]/20 cursor-pointer"
              />
            </th>
            <th className="py-3 px-3 text-[12px] font-bold text-gray-700 whitespace-nowrap">Event ID</th>
            <th className="py-3 px-3 text-[12px] font-bold text-gray-700 whitespace-nowrap">Event Name</th>
            <th className="py-3 px-3 text-[12px] font-bold text-gray-700 whitespace-nowrap">Type</th>
            <th className="py-3 px-3 text-[12px] font-bold text-gray-700 whitespace-nowrap">Client</th>
            <th className="py-3 px-3 text-[12px] font-bold text-gray-700 whitespace-nowrap">Date</th>
            <th className="py-3 px-3 text-[12px] font-bold text-gray-700 whitespace-nowrap">Venue</th>
            <th className="py-3 px-3 text-[12px] font-bold text-gray-700 whitespace-nowrap">Guests</th>
            <th className="py-3 px-3 text-[12px] font-bold text-gray-700 whitespace-nowrap">Amount</th>
            <th className="py-3 px-3 text-[12px] font-bold text-gray-700 whitespace-nowrap">Status</th>
            <th className="py-3 px-3 text-[12px] font-bold text-gray-700 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.length === 0 ? (
            <tr>
              <td colSpan="11" className="py-8 text-center text-slate-400">
                No events found matching your search or filters.
              </td>
            </tr>
          ) : (
            events.map((evt) => {
              const isChecked = selectedIds.includes(evt.id);
              return (
                <tr
                  key={evt.id}
                  className="hover:bg-gray-50/30 transition-colors cursor-pointer"
                  style={{ backgroundColor: isChecked ? '#edf7f2' : '' }}
                >
                  <td className="py-2 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onSelectRow(evt.id)}
                      className="w-4 h-4 rounded border-slate-300 text-[#1b7f43] focus:ring-[#1b7f43]/20 cursor-pointer"
                    />
                  </td>
                  <td className="py-2 px-3 text-[11.5px] text-gray-600 font-mono font-medium">
                    {evt.id}
                  </td>
                  <td className="py-2 px-3 text-[12px] text-gray-800 font-bold">
                    {evt.name}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${getTypeBadgeStyle(
                        evt.type
                      )}`}
                    >
                      {evt.type}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[11.5px] text-gray-600">
                    {evt.client}
                  </td>
                  <td className="py-2 px-3 text-[11px] text-gray-600">
                    <div className="flex items-center gap-1 font-medium text-gray-800">
                      <CalendarIcon sx={{ fontSize: 12 }} className="text-gray-400" />
                      <span>{evt.displayDate}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-[11.5px] text-gray-600">
                    {evt.venue}
                  </td>
                  <td className="py-2 px-3 text-[11.5px] text-gray-600">
                    {evt.guests}
                  </td>
                  <td className="py-2 px-3 text-[11.5px] font-semibold text-gray-900">
                    ${evt.amount.toLocaleString()}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${getStatusBadgeStyle(
                        evt.status
                      )}`}
                    >
                      {evt.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onView(evt)}
                        title="View Details"
                        aria-label="View event details"
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <ViewIcon sx={{ fontSize: 16 }} />
                      </button>
                      <button
                        onClick={() => onEdit(evt)}
                        title="Edit Event"
                        aria-label="Edit event"
                        className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                      </button>
                      <button
                        onClick={() => onDelete(evt)}
                        title="Delete Event"
                        aria-label="Delete event"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
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
