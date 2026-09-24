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
    <div className="">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-600 text-xs font-bold uppercase tracking-wider select-none">
            <th className="py-2 px-2.5 w-10 text-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                className="w-4 h-4 rounded border-slate-300 text-[#1b7f43] focus:ring-[#1b7f43]/20 cursor-pointer"
              />
            </th>
            <th className="py-2 px-2.5 font-bold">Event ID</th>
            <th className="py-2 px-2.5 font-bold">Event Name</th>
            <th className="py-2 px-2.5 font-bold">Type</th>
            <th className="py-2 px-2.5 font-bold">Client</th>
            <th className="py-2 px-2.5 font-bold">Date</th>
            <th className="py-2 px-2.5 font-bold">Venue</th>
            <th className="py-2 px-2.5 font-bold">Guests</th>
            <th className="py-2 px-2.5 font-bold">Amount</th>
            <th className="py-2 px-2.5 font-bold">Status</th>
            <th className="py-2 px-2.5 font-bold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
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
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isChecked ? 'bg-emerald-50/30' : ''
                  }`}
                >
                  <td className="py-1.5 px-2.5 text-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onSelectRow(evt.id)}
                      className="w-4 h-4 rounded border-slate-300 text-[#1b7f43] focus:ring-[#1b7f43]/20 cursor-pointer"
                    />
                  </td>
                  <td className="py-1.5 px-2.5 font-medium text-slate-700 font-mono text-xs">
                    {evt.id}
                  </td>
                  <td className="py-1.5 px-2.5 font-semibold text-slate-900">
                    {evt.name}
                  </td>
                  <td className="py-1.5 px-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getTypeBadgeStyle(
                        evt.type
                      )}`}
                    >
                      {evt.type}
                    </span>
                  </td>
                  <td className="py-1.5 px-2.5 text-slate-700 font-medium">
                    {evt.client}
                  </td>
                  <td className="py-1.5 px-2.5 text-slate-600">
                    <div className="flex items-center gap-1">
                      <CalendarIcon sx={{ fontSize: 15 }} className="text-slate-400" />
                      <span>{evt.displayDate}</span>
                    </div>
                  </td>
                  <td className="py-1.5 px-2.5 text-slate-700">
                    {evt.venue}
                  </td>
                  <td className="py-1.5 px-2.5 text-slate-800 font-medium">
                    {evt.guests}
                  </td>
                  <td className="py-1.5 px-2.5 text-slate-900 font-bold">
                    ${evt.amount.toLocaleString()}
                  </td>
                  <td className="py-1.5 px-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeStyle(
                        evt.status
                      )}`}
                    >
                      {evt.status}
                    </span>
                  </td>
                  <td className="py-1.5 px-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onView(evt)}
                        title="View Details"
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <ViewIcon sx={{ fontSize: 16 }} />
                      </button>
                      <button
                        onClick={() => onEdit(evt)}
                        title="Edit Event"
                        className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                      </button>
                      <button
                        onClick={() => onDelete(evt)}
                        title="Delete Event"
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
