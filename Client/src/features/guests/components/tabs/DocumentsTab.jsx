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
  BadgeOutlined,
  OpenInNewOutlined,
  Close
} from '@mui/icons-material';
import AddDocumentModal from '../AddDocumentModal';

export default function DocumentsTab({
  guest,
  documents = [],
  currentRoom,
  onDocumentAdded,
  onDocumentDeleted,
  isLoading = false
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
        <div className="w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Document Ref</th>
                <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Document Type</th>
                <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Identification Number</th>
                <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Allocated Room</th>
                <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Registration Date</th>
                <th className="py-3 px-3 text-[12px] font-bold text-gray-700 text-center">Status</th>
                <th className="py-3 px-3 text-[12px] font-bold text-gray-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs text-gray-700">
              {currentItems.map((doc, idx) => (
                <tr key={doc.id || doc.formNo || idx} className="hover:bg-gray-50/30 transition">
                  <td className="py-2 px-3 font-mono font-bold text-gray-900">
                    {doc.formNo || doc.id}
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-semibold text-gray-800 flex items-center gap-1">
                      <BadgeOutlined sx={{ fontSize: 14 }} className="text-gray-400" />
                      {doc.idType || 'Identity Document'}
                    </div>
                    {doc.name && <span className="text-[10.5px] text-gray-400 block">{doc.name}</span>}
                  </td>
                  <td className="py-2 px-3 font-mono font-semibold text-gray-800">
                    {doc.idNumber}
                  </td>
                  <td className="py-2 px-3 font-medium text-gray-600">
                    <div className="flex items-center gap-1">
                      <MeetingRoomOutlined sx={{ fontSize: 14 }} className="text-gray-400" />
                      Room {doc.room || '101'}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-gray-600">
                    <div className="flex items-center gap-1">
                      <CalendarTodayOutlined sx={{ fontSize: 13 }} className="text-gray-400" />
                      {doc.date || 'Today'}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    {getStatusBadge(doc.status)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setViewingDoc(doc)}
                        className="p-1 text-gray-400 hover:text-[#1b7f43] hover:bg-emerald-50 rounded transition cursor-pointer"
                        title="View document details"
                        aria-label="View document details"
                      >
                        <VisibilityOutlined sx={{ fontSize: 16 }} />
                      </button>

                      <button
                        onClick={() => {
                          window.print();
                        }}
                        className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition cursor-pointer"
                        title="Print document"
                        aria-label="Print document"
                      >
                        <PrintOutlined sx={{ fontSize: 16 }} />
                      </button>

                      {(doc.id || doc._id) && (
                        <button
                          onClick={() => {
                            if (onDocumentDeleted) onDocumentDeleted(doc.id || doc._id);
                          }}
                          className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Remove document"
                          aria-label="Remove document"
                        >
                          <DeleteOutlined sx={{ fontSize: 16 }} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 text-xs">
                    <div className="w-5 h-5 border-2 border-[var(--primary-main)] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500 font-medium">Loading documents from database...</p>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
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
              ) : null}
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
                aria-label="Previous page"
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
                aria-label="Next page"
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

      {/* Image Viewer Lightbox Modal */}
      {viewingDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setViewingDoc(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-gray-100 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#1b7f43] px-5 py-3.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <BadgeOutlined sx={{ fontSize: 20 }} />
                <div>
                  <h3 className="font-bold text-sm tracking-wide flex items-center gap-2">
                    <span>{viewingDoc.idType || 'Document'}</span>
                    <span className="text-[11px] font-normal text-emerald-100 bg-white/15 px-2 py-0.5 rounded-full">
                      {viewingDoc.formNo || viewingDoc.id}
                    </span>
                  </h3>
                  <p className="text-[11px] text-emerald-100">
                    {guest?.name || viewingDoc.name} • {viewingDoc.idNumber && viewingDoc.idNumber !== 'N/A' ? `ID: ${viewingDoc.idNumber}` : 'Document View'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {viewingDoc.imageUrl && (
                  <>
                    <a
                      href={viewingDoc.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition text-xs flex items-center gap-1"
                      title="Open full size in new tab"
                    >
                      <OpenInNewOutlined sx={{ fontSize: 16 }} />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        const w = window.open('');
                        w.document.write(`<img src="${viewingDoc.imageUrl}" style="max-width:100%;height:auto;" onload="window.print();window.close()" />`);
                        w.document.close();
                      }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition text-xs cursor-pointer"
                      title="Print image"
                    >
                      <PrintOutlined sx={{ fontSize: 16 }} />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setViewingDoc(null)}
                  aria-label="Close"
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition text-xs cursor-pointer ml-1"
                >
                  <Close sx={{ fontSize: 18 }} />
                </button>
              </div>
            </div>

            {/* Modal Body - Image Preview */}
            <div className="p-4 sm:p-6 bg-gray-950/5 flex flex-col items-center justify-center min-h-[300px] max-h-[calc(92vh-120px)] overflow-auto">
              {viewingDoc.imageUrl ? (
                <div className="flex flex-col items-center justify-center w-full">
                  <img
                    src={viewingDoc.imageUrl}
                    alt={viewingDoc.name || viewingDoc.idType}
                    className="max-h-[66vh] max-w-full object-contain rounded-xl shadow-lg border border-gray-200 bg-white"
                  />
                  {viewingDoc.notes && (
                    <p className="mt-3 text-xs text-gray-500 italic text-center max-w-lg">
                      {viewingDoc.notes}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                  <DescriptionOutlined sx={{ fontSize: 54 }} className="text-gray-300 mb-2" />
                  <p className="font-bold text-gray-700 text-sm">No Preview Image Available</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm">
                    This document record does not have an uploaded image file attached.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-3">
                <span>Room: <strong className="text-gray-800">{viewingDoc.room || '101'}</strong></span>
                <span>Date: <strong className="text-gray-800">{viewingDoc.date || 'Today'}</strong></span>
                <span>Status: <strong className="text-emerald-700">{viewingDoc.status || 'Verified'}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
