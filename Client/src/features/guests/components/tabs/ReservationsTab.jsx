import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HotelOutlined,
  CalendarTodayOutlined,
  Search,
  Add,
  ChevronLeft,
  ChevronRight,
  VisibilityOutlined,
  EditOutlined,
  MeetingRoomOutlined
} from '@mui/icons-material';
import { getBookingDues } from '../../../payment-billing/pages/paymentBillingStore';

export default function ReservationsTab({ reservations = [], guest }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Filter reservations
  const filtered = reservations.filter((res) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      String(res.id || '').toLowerCase().includes(query) ||
      String(res.bookingId || '').toLowerCase().includes(query) ||
      String(res.roomNumber || res.room || '').toLowerCase().includes(query) ||
      String(res.roomType || '').toLowerCase().includes(query) ||
      String(res.package || '').toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === 'All' ||
      String(res.status || '').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const currentItems = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'booked' || s === 'confirmed') {
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">Booked</span>;
    }
    if (s === 'checkin' || s === 'checked in' || s === 'checkedin') {
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Checked-In</span>;
    }
    if (s === 'cancelled' || s === 'canceled') {
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>;
    }
    if (s === 'checkout' || s === 'checked out' || s === 'completed') {
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Checked-Out</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">{status || 'Standard'}</span>;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Table Container Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden flex flex-col">
        {/* Table Header Controls */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HotelOutlined className="text-[#1b7f43]" sx={{ fontSize: 20 }} />
            <div>
              <h3 className="text-sm font-bold text-gray-900">Stay & Reservation History</h3>
              <p className="text-[11px] text-gray-500">{reservations.length} total recorded stays for this guest</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 16 }} />
              <input
                type="text"
                placeholder="Search stay or room..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs w-44 sm:w-56 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition"
              />
            </div>

            {/* Status Segmented Filter */}
            <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-0.5 text-xs">
              {['All', 'Booked', 'CheckIn', 'Cancelled'].map((tab) => (
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
                  {tab === 'CheckIn' ? 'Checked In' : tab}
                </button>
              ))}
            </div>

            {/* Add Reservation Action */}
            <Link
              to="/reservation/new"
              className="flex items-center gap-1 px-3 py-1.5 bg-[#1b7f43] text-white rounded-lg text-xs font-semibold hover:brightness-105 transition shadow-2xs"
            >
              <Add sx={{ fontSize: 16 }} />
              <span>New Reservation</span>
            </Link>
          </div>
        </div>

        {/* Table Content */}
        <div className="w-full overflow-x-auto min-w-0 hide-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Reservation Ref</th>
                <th className="py-3 px-4">Room & Type</th>
                <th className="py-3 px-4">Check-In</th>
                <th className="py-3 px-4">Check-Out</th>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4">Stay Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Dues</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
              {currentItems.map((res) => {
                const dues = getBookingDues(res);
                const bookingRef = res.bookingId || `BK-${res.id}`;
                return (
                  <tr key={res.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {bookingRef}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-800 flex items-center gap-1">
                        <MeetingRoomOutlined sx={{ fontSize: 14 }} className="text-gray-400" />
                        Room {res.roomNumber || res.room || '101'}
                      </div>
                      <span className="text-[10.5px] text-gray-500 block">{res.roomType || 'Standard'}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-medium">
                      <div className="flex items-center gap-1">
                        <CalendarTodayOutlined sx={{ fontSize: 13 }} className="text-gray-400" />
                        {res.checkIn || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-medium">
                      <div className="flex items-center gap-1">
                        <CalendarTodayOutlined sx={{ fontSize: 13 }} className="text-gray-400" />
                        {res.checkOut || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700 font-medium">
                      {res.package || 'Standard'}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(res.status)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        res.payment === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {res.payment || 'Unpaid'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold">
                      {dues > 0 ? (
                        <span className="text-rose-600">${Number(dues).toFixed(2)}</span>
                      ) : (
                        <span className="text-gray-400 font-normal">$0.00</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          to={`/reservation/edit/${res.id}`}
                          className="p-1 text-gray-400 hover:text-[#1b7f43] hover:bg-emerald-50 rounded transition cursor-pointer"
                          title="Edit reservation"
                        >
                          <EditOutlined sx={{ fontSize: 16 }} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400 text-xs">
                    <HotelOutlined sx={{ fontSize: 36 }} className="text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-600">No reservations found</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {searchQuery || statusFilter !== 'All'
                        ? 'No reservations matched your filter criteria.'
                        : 'No stay or booking history is registered for this guest yet.'}
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
              Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filtered.length)} of {filtered.length} reservations
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
    </div>
  );
}
