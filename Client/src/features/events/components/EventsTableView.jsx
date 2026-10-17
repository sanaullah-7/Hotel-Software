import React, { useState, useEffect, useRef } from 'react';
import {
  CalendarMonth as CalendarIcon,
  VisibilityOutlined as ViewIcon,
  EditOutlined as EditIcon,
  Delete as DeleteIcon,
  PaymentsOutlined as PaymentsIcon,
  MoreVert as MoreVertIcon
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
  onDelete,
  onOpenAddModal,
  onCollectPayment
}) {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);
  return (
    <div className="w-full overflow-hidden">
      <table className="table-fixed w-full text-left border-collapse">
        <colgroup>
          <col style={{ width: '11%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '6%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '11%' }} />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-100 bg-slate-50/50">
            <th className="py-2.5 px-2.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Event ID</th>
            <th className="py-2.5 px-2 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Event Name</th>
            <th className="py-2.5 px-2 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Type</th>
            <th className="py-2.5 px-2 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Customer</th>
            <th className="py-2.5 px-2 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Date</th>
            <th className="py-2.5 px-2 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Venue</th>
            <th className="py-2.5 px-2 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider text-center whitespace-nowrap">Guests</th>
            <th className="py-2.5 px-3 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider text-left whitespace-nowrap">Payment / Due</th>
            <th className="py-2.5 px-2 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider text-center whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {events.length === 0 ? (
            <tr>
              <td colSpan="9" className="py-12 text-center text-slate-500">
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="text-sm font-semibold text-slate-700">No events found matching your search or filters.</p>
                  <p className="text-xs text-slate-400">All registered bookings and venues will appear here.</p>
                  {onOpenAddModal && (
                    <button
                      onClick={onOpenAddModal}
                      className="mt-1 px-3 py-1.5 bg-[#1b7f43] hover:bg-[#12572e] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      + Create First Event
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ) : (
            events.map((evt) => {
              return (
                <tr
                  key={evt.id}
                  className="hover:bg-gray-50/60 transition-colors border-b border-gray-50/60"
                >
                  <td className="py-2 px-2.5 text-[11px] text-gray-600 font-mono font-medium truncate">
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
                  <td className="py-1.5 px-3 text-[11px] text-left whitespace-nowrap">
                    <div className="font-bold text-gray-900">${evt.amount.toLocaleString()}</div>
                    {evt.balanceAmount > 0 ? (
                      <div className="text-[10px] text-rose-600 font-semibold flex items-center justify-start gap-1">
                        <span>Due: ${evt.balanceAmount.toLocaleString()}</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-emerald-600 font-semibold">
                        Paid Full
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-1 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5 relative">
                      {/* Collect Payment Button (quick shortcut for due balance) */}
                      {evt.balanceAmount > 0 ? (
                        <button
                          onClick={() => onCollectPayment && onCollectPayment(evt)}
                          title={`Collect Due Balance ($${evt.balanceAmount.toLocaleString()})`}
                          aria-label="Collect payment"
                          className="px-2 py-1 bg-emerald-50 hover:bg-[#1b7f43] text-[#1b7f43] hover:text-white border border-emerald-200 rounded font-bold text-[10px] transition-colors flex items-center gap-0.5 cursor-pointer shadow-2xs"
                        >
                          <PaymentsIcon sx={{ fontSize: 13 }} />
                          <span>Collect</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium px-1.5 py-0.5 bg-slate-50 rounded">
                          Cleared
                        </span>
                      )}

                      {/* Three Dots (...) Action Menu Button */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onDelete(evt)}
                          className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Event"
                          aria-label="Delete Event"
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </button>
                        <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() => setOpenDropdownId((prev) => (prev === evt.id ? null : evt.id))}
                          className="p-1 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
                          title="Actions menu"
                          aria-label="More actions"
                        >
                          <MoreVertIcon sx={{ fontSize: 18 }} />
                        </button>

                        {/* Dropdown Menu */}
                        {openDropdownId === evt.id && (
                          <div
                            ref={dropdownRef}
                            className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 text-left animate-fadeIn"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownId(null);
                                onView(evt);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <ViewIcon sx={{ fontSize: 15 }} className="text-blue-600" />
                              <span>View Details</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownId(null);
                                onEdit(evt);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 hover:text-emerald-700 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <EditIcon sx={{ fontSize: 15 }} className="text-[#1b7f43]" />
                              <span>Edit Event</span>
                            </button>

                            <div className="border-t border-gray-100 my-1"></div>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownId(null);
                                onDelete(evt);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <DeleteIcon sx={{ fontSize: 15 }} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                        </div>
                      </div>
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
