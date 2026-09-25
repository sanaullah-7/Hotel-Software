import React, { useState } from 'react';
import {
  ReportProblemOutlined,
  Search,
  Add,
  CheckCircle,
  Warning,
  PendingActions,
  MeetingRoomOutlined,
  CalendarTodayOutlined,
  ChevronLeft,
  ChevronRight,
  DoneAll
} from '@mui/icons-material';
import AddComplaintModal from '../AddComplaintModal';

export default function RequestsComplaintsTab({
  guest,
  complaints = [],
  currentRoom,
  onComplaintAdded,
  onComplaintStatusUpdate
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const itemsPerPage = 8;

  // Filter complaints
  const filtered = complaints.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      String(c.description || '').toLowerCase().includes(q) ||
      String(c.type || '').toLowerCase().includes(q) ||
      String(c.roomNo || '').toLowerCase().includes(q) ||
      String(c.id || '').toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'All' ||
      String(c.status || '').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const currentItems = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
      case 'Urgent':
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200">{priority}</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">{priority || 'Low'}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle sx={{ fontSize: 13 }} /> Resolved
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <PendingActions sx={{ fontSize: 13 }} /> In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
            <Warning sx={{ fontSize: 13 }} /> Open
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Table Container Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden flex flex-col">
        {/* Header Controls */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ReportProblemOutlined className="text-[#1b7f43]" sx={{ fontSize: 20 }} />
            <div>
              <h3 className="text-sm font-bold text-gray-900">Guest Requests & Operational Tickets</h3>
              <p className="text-[11px] text-gray-500">{complaints.length} tickets recorded for this guest</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 16 }} />
              <input
                type="text"
                placeholder="Search ticket or issue..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs w-44 sm:w-56 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition"
              />
            </div>

            {/* Filter */}
            <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-0.5 text-xs">
              {['All', 'Open', 'In Progress', 'Resolved'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setStatusFilter(tab);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-white text-[#1b7f43] font-bold shadow-2xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Add Action */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#1b7f43] text-white rounded-lg text-xs font-semibold hover:brightness-105 transition shadow-2xs cursor-pointer"
            >
              <Add sx={{ fontSize: 16 }} />
              <span>New Ticket</span>
            </button>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-4">Description / Notes</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
              {currentItems.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-gray-900">
                    #{c.id}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <CalendarTodayOutlined sx={{ fontSize: 13 }} className="text-gray-400" />
                      {c.date || 'Today'}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-800">
                    {c.type || 'General'}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-600">
                    <div className="flex items-center gap-1">
                      <MeetingRoomOutlined sx={{ fontSize: 14 }} className="text-gray-400" />
                      Room {c.roomNo || 'N/A'}
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-xs text-gray-700">
                    <p className="line-clamp-2">{c.description}</p>
                  </td>
                  <td className="py-3 px-4">
                    {getPriorityBadge(c.priority)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(c.status)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {c.status !== 'Resolved' ? (
                      <button
                        onClick={() => {
                          if (onComplaintStatusUpdate) {
                            onComplaintStatusUpdate(c.id, 'Resolved');
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#e5f4eb] hover:bg-[#d5eee0] text-[#1b7f43] rounded-lg text-[11px] font-bold transition cursor-pointer"
                        title="Mark as Resolved"
                      >
                        <DoneAll sx={{ fontSize: 14 }} /> Mark Resolved
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-400 font-medium">Completed</span>
                    )}
                  </td>
                </tr>
              ))}

              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 text-xs">
                    <ReportProblemOutlined sx={{ fontSize: 36 }} className="text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-600">No requests or complaints found</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {searchQuery || statusFilter !== 'All'
                        ? 'No operational tickets match your filter criteria.'
                        : 'No issues or service requests have been registered for this guest.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filtered.length > itemsPerPage && (
          <div className="p-3.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filtered.length)} of {filtered.length} tickets
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft sx={{ fontSize: 16 }} />
              </button>
              <span className="px-2 font-bold text-gray-800">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight sx={{ fontSize: 16 }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Complaint Modal */}
      {isAddModalOpen && (
        <AddComplaintModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          guest={guest}
          defaultRoom={currentRoom}
          onSave={(newComplaint) => {
            if (onComplaintAdded) onComplaintAdded(newComplaint);
          }}
        />
      )}
    </div>
  );
}
