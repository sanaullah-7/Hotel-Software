import React, { useState } from 'react';
import {
  DescriptionOutlined,
  Search,
  Add,
  PrintOutlined,
  VisibilityOutlined,
  DeleteOutlined,
  CheckCircle,
  AccessTime,
  MeetingRoomOutlined,
  CalendarTodayOutlined,
  ChevronLeft,
  ChevronRight,
  BadgeOutlined
} from '@mui/icons-material';
import AddDocumentModal from '../AddDocumentModal';

export default function DocumentsTab({
  guest,
  documents = [],
  currentRoom,
  onDocumentAdded,
  onDocumentDeleted
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const itemsPerPage = 8;

  // Filter documents
  const filtered = documents.filter((doc) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      String(doc.formNo || doc.id || '').toLowerCase().includes(q) ||
      String(doc.name || '').toLowerCase().includes(q) ||
      String(doc.idType || '').toLowerCase().includes(q) ||
      String(doc.idNumber || '').toLowerCase().includes(q) ||
      String(doc.room || '').toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Verified' && String(doc.status).includes('Verified')) ||
      (statusFilter === 'Pending' && String(doc.status).includes('Pending'));

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const currentItems = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getStatusBadge = (status) => {
    if (String(status).includes('Verified')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e5f4eb] text-[#1b7f43] border border-[#1b7f43]/20">
          <CheckCircle sx={{ fontSize: 13 }} /> Verified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <AccessTime sx={{ fontSize: 13 }} /> Pending Signature
      </span>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Table Container Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden flex flex-col">
        {/* Header Controls */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <DescriptionOutlined className="text-[#1b7f43]" sx={{ fontSize: 20 }} />
            <div>
              <h3 className="text-sm font-bold text-gray-900">Guest Identity & Registration Documents</h3>
              <p className="text-[11px] text-gray-500">{documents.length} verified documents on file</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 16 }} />
              <input
                type="text"
                placeholder="Search doc number or type..."
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
              {['All', 'Verified', 'Pending'].map((tab) => (
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
              <span>Attach Document</span>
            </button>
          </div>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Document Ref</th>
                <th className="py-3 px-4">Document Type</th>
                <th className="py-3 px-4">Identification Number</th>
                <th className="py-3 px-4">Allocated Room</th>
                <th className="py-3 px-4">Registration Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
              {currentItems.map((doc, idx) => (
                <tr key={doc.id || doc.formNo || idx} className="hover:bg-gray-50/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-gray-900">
                    {doc.formNo || doc.id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-800 flex items-center gap-1">
                      <BadgeOutlined sx={{ fontSize: 14 }} className="text-gray-400" />
                      {doc.idType || 'Identity Document'}
                    </div>
                    {doc.name && <span className="text-[10.5px] text-gray-400 block">{doc.name}</span>}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-gray-800">
                    {doc.idNumber}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-600">
                    <div className="flex items-center gap-1">
                      <MeetingRoomOutlined sx={{ fontSize: 14 }} className="text-gray-400" />
                      Room {doc.room || '101'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <CalendarTodayOutlined sx={{ fontSize: 13 }} className="text-gray-400" />
                      {doc.date || 'Today'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(doc.status)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setViewingDoc(doc)}
                        className="p-1 text-gray-400 hover:text-[#1b7f43] hover:bg-emerald-50 rounded transition cursor-pointer"
                        title="View document details"
                      >
                        <VisibilityOutlined sx={{ fontSize: 16 }} />
                      </button>

                      <button
                        onClick={() => {
                          window.print();
                        }}
                        className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition cursor-pointer"
                        title="Print document"
                      >
                        <PrintOutlined sx={{ fontSize: 16 }} />
                      </button>

                      {doc.id && doc.id.startsWith('DOC-') && (
                        <button
                          onClick={() => {
                            if (onDocumentDeleted) onDocumentDeleted(doc.id);
                          }}
                          className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Remove document"
                        >
                          <DeleteOutlined sx={{ fontSize: 16 }} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 text-xs">
                    <DescriptionOutlined sx={{ fontSize: 36 }} className="text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-600">No documents uploaded</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {searchQuery || statusFilter !== 'All'
                        ? 'No registration or identity documents match your search.'
                        : 'No CNIC, passport, or registration forms attached for this guest.'}
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
              Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filtered.length)} of {filtered.length} documents
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

      {/* Add Document Modal */}
      {isAddModalOpen && (
        <AddDocumentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          guest={guest}
          defaultRoom={currentRoom}
          onSave={(newDoc) => {
            if (onDocumentAdded) onDocumentAdded(newDoc);
          }}
        />
      )}

      {/* View Document Modal */}
      {viewingDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
          onClick={() => setViewingDoc(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[500px] overflow-hidden flex flex-col border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#1b7f43] px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-bold text-base">Document Details</h3>
              <button
                onClick={() => setViewingDoc(null)}
                className="text-white/80 hover:text-white p-1 rounded-full"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-3.5 text-xs text-gray-700">
              <div className="p-3 bg-gray-50 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Form / Document #</span>
                  <span className="font-mono font-bold text-gray-900">{viewingDoc.formNo || viewingDoc.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Guest Name</span>
                  <span className="font-bold text-gray-900">{guest.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Document Type</span>
                  <span className="font-semibold text-gray-800">{viewingDoc.idType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Document / ID Number</span>
                  <span className="font-mono font-bold text-gray-900">{viewingDoc.idNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Allocated Room</span>
                  <span className="font-semibold text-gray-800">Room {viewingDoc.room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Date</span>
                  <span className="text-gray-700">{viewingDoc.date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Verification Status</span>
                  {getStatusBadge(viewingDoc.status)}
                </div>
              </div>

              {viewingDoc.notes && (
                <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100">
                  <span className="text-gray-500 font-bold block mb-1">Notes:</span>
                  <p className="text-gray-700">{viewingDoc.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setViewingDoc(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
