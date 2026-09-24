import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Home as HomeIcon,
  EmailOutlined,
  PhoneOutlined,
  LocationOnOutlined,
  CalendarTodayOutlined,
  HotelOutlined,
  ReceiptLongOutlined,
  ArrowBack,
  CreditCard,
  AttachMoney,
  CheckCircle,
  Schedule,
  Person
} from '@mui/icons-material';
import { getGuestById, getGuests, GUESTS_UPDATED_EVENT } from '../state/guestStore';
import { getReservations, RESERVATIONS_UPDATED_EVENT } from '../../reservations/state/reservationStore';
import { getInvoices, getBookingDues } from '../../payment-billing/pages/paymentBillingStore';

export default function GuestProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guest, setGuest] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const loadData = () => {
      const g = getGuestById(id);
      setGuest(g);

      if (g) {
        // Find all reservations matching this guest's name, email, or ID
        const allRes = getReservations();
        const guestRes = allRes.filter((r) => 
          (g.email && r.email && r.email.toLowerCase() === g.email.toLowerCase()) ||
          (g.name && r.name && r.name.toLowerCase() === g.name.toLowerCase()) ||
          `GST-${r.id}`.toLowerCase() === String(g.id).toLowerCase() ||
          String(r.id) === String(g.id)
        );
        setReservations(guestRes);

        // Find all invoices matching this guest
        const allInv = getInvoices();
        const guestInv = allInv.filter((inv) =>
          (g.name && inv.guestName && inv.guestName.toLowerCase() === g.name.toLowerCase()) ||
          (g.email && inv.guestEmail && inv.guestEmail.toLowerCase() === g.email.toLowerCase())
        );
        setInvoices(guestInv);
      }
    };

    loadData();

    window.addEventListener(GUESTS_UPDATED_EVENT, loadData);
    window.addEventListener(RESERVATIONS_UPDATED_EVENT, loadData);
    window.addEventListener('storage', loadData);

    return () => {
      window.removeEventListener(GUESTS_UPDATED_EVENT, loadData);
      window.removeEventListener(RESERVATIONS_UPDATED_EVENT, loadData);
      window.removeEventListener('storage', loadData);
    };
  }, [id]);

  if (!guest) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm mt-4">
        <Person sx={{ fontSize: 48 }} className="text-gray-300 mb-2" />
        <h2 className="text-lg font-bold text-gray-800">Guest Not Found</h2>
        <p className="text-sm text-gray-500 mt-1 mb-4">The requested guest record ({id}) could not be located.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-[#1b7f43] text-white rounded-lg text-sm font-semibold hover:brightness-105 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Financial calculations
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (Number(inv.paidAmount) || 0), 0);
  const totalDues = invoices.reduce((sum, inv) => sum + (Number(inv.balanceDue) || 0), 0);

  const currentBooking = reservations[0] || null;

  return (
    <div className="animate-fade-in pb-8 space-y-5">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pt-2">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Guest Profile</h1>
          <p className="text-xs text-gray-500 mt-0.5">Comprehensive profile, reservations, and financial ledger</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition shadow-xs cursor-pointer"
          >
            <ArrowBack sx={{ fontSize: 16 }} /> Back
          </button>
          <Link
            to="/reservation/all"
            className="px-3 py-1.5 bg-[#e5f4eb] text-[#1b7f43] rounded-lg text-xs font-semibold hover:brightness-95 transition"
          >
            All Reservations
          </Link>
          <Link
            to="/guests"
            className="px-3 py-1.5 bg-[#1b7f43] text-white rounded-lg text-xs font-semibold hover:brightness-105 transition"
          >
            All Guests
          </Link>
        </div>
      </div>

      {/* Guest Main Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50/60 to-teal-50/40 p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <img
            src={guest.avatar || 'https://i.pravatar.cc/150?u=guest'}
            alt={guest.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md bg-gray-100"
          />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-bold text-gray-900">{guest.name}</h2>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#e5f4eb] text-[#1b7f43] border border-[#1b7f43]/20">
                {guest.status || 'Active'}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-gray-100 text-gray-600">
                {guest.id}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <EmailOutlined sx={{ fontSize: 16 }} className="text-red-400 shrink-0" />
                <span className="truncate">{guest.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneOutlined sx={{ fontSize: 16 }} className="text-emerald-500 shrink-0" />
                <span>{guest.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <LocationOnOutlined sx={{ fontSize: 16 }} className="text-blue-500 shrink-0" />
                <span>{guest.city || 'New York, USA'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 border-b border-gray-100 text-center bg-gray-50/40">
          <div className="p-4">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Stays</span>
            <span className="text-lg font-extrabold text-gray-800">{guest.totalStays || reservations.length || 1}</span>
          </div>
          <div className="p-4">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Invoiced</span>
            <span className="text-lg font-extrabold text-gray-800">${totalInvoiced.toLocaleString()}</span>
          </div>
          <div className="p-4">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Paid</span>
            <span className="text-lg font-extrabold text-emerald-600">${totalPaid.toLocaleString()}</span>
          </div>
          <div className="p-4">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Outstanding Dues</span>
            <span className={`text-lg font-extrabold ${totalDues > 0 ? 'text-red-600' : 'text-gray-700'}`}>
              ${totalDues.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Current Stay / Reservation & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Current Active Booking Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <div className="flex items-center gap-2">
              <HotelOutlined className="text-[#1b7f43]" sx={{ fontSize: 20 }} />
              <h3 className="text-sm font-bold text-gray-800">Current / Latest Reservation</h3>
            </div>
            {currentBooking && (
              <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md ${
                currentBooking.status === 'Booked' ? 'bg-green-100 text-green-700' :
                currentBooking.status === 'CheckIn' ? 'bg-blue-100 text-blue-700' :
                currentBooking.status === 'Cancelled' ? 'bg-orange-100 text-orange-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {currentBooking.status}
              </span>
            )}
          </div>

          {currentBooking ? (
            <div className="space-y-3.5 text-xs text-gray-700 flex-1">
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 font-semibold block text-[10.5px]">Room Type</span>
                  <span className="font-bold text-gray-800 text-sm">{currentBooking.roomType}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block text-[10.5px]">Package</span>
                  <span className="font-bold text-gray-800 text-sm">{currentBooking.package}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 font-semibold block text-[10.5px]">Check-In</span>
                  <div className="flex items-center gap-1.5 font-bold text-gray-800 mt-0.5">
                    <CalendarTodayOutlined sx={{ fontSize: 13 }} className="text-gray-400" />
                    {currentBooking.checkIn}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 font-semibold block text-[10.5px]">Check-Out</span>
                  <div className="flex items-center gap-1.5 font-bold text-gray-800 mt-0.5">
                    <CalendarTodayOutlined sx={{ fontSize: 13 }} className="text-gray-400" />
                    {currentBooking.checkOut}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#f8faf9] rounded-xl border border-emerald-100/60">
                <div>
                  <span className="text-gray-500 font-medium block text-[11px]">Payment Status</span>
                  <span className={`font-bold ${currentBooking.payment === 'Paid' ? 'text-[#1b7f43]' : 'text-orange-600'}`}>
                    {currentBooking.payment}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 font-medium block text-[11px]">Outstanding Dues</span>
                  <span className="font-extrabold text-sm text-red-600">
                    ${getBookingDues(currentBooking).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-6 text-center">No active reservation record found for this guest.</p>
          )}
        </div>

        {/* Invoices & Financial Folio */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <div className="flex items-center gap-2">
              <ReceiptLongOutlined className="text-[#1b7f43]" sx={{ fontSize: 20 }} />
              <h3 className="text-sm font-bold text-gray-800">Invoices & Folio Ledger</h3>
            </div>
            <Link 
              to={`/payment-billing/invoices?guest=${encodeURIComponent(guest.name)}`}
              state={{ search: guest.name, guestName: guest.name }}
              className="text-xs text-[#1b7f43] font-bold hover:underline"
            >
              View All Invoices
            </Link>
          </div>

          {invoices.length > 0 ? (
            <div className="space-y-2.5 overflow-y-auto max-h-[260px] pr-1">
              {invoices.map((inv) => (
                <Link
                  key={inv.id}
                  to={`/payment-billing/invoices?guest=${encodeURIComponent(guest.name)}`}
                  state={{ search: guest.name, guestName: guest.name }}
                  className="p-3 bg-gray-50 hover:bg-gray-100/60 transition rounded-xl border border-gray-100 flex items-center justify-between cursor-pointer block"
                  title="Click to view in Invoices & Billing"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-800">{inv.invoiceNumber}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        inv.status === 'Paid' ? 'bg-[#e5f4eb] text-[#1b7f43]' :
                        inv.status === 'Partially Paid' ? 'bg-blue-50 text-blue-700' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">Room {inv.roomNumber} • Due {inv.dueDate}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-gray-900 block">${Number(inv.totalAmount).toFixed(2)}</span>
                    <span className="text-[10.5px] text-gray-500">
                      Balance: <strong className={inv.balanceDue > 0 ? 'text-red-600' : 'text-gray-700'}>${Number(inv.balanceDue).toFixed(2)}</strong>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 text-xs">
              <p>No formal invoices generated yet for this guest.</p>
              <p className="mt-1 text-[11px] text-gray-400">Folio will be compiled upon front office checkout settlement.</p>
            </div>
          )}
        </div>
      </div>

      {/* Stay & Reservation History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-sm font-bold text-gray-800">Stay & Reservation History</h3>
          <span className="text-xs text-gray-500 font-semibold">{reservations.length} total records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="py-3 px-4 text-[12px] font-bold text-gray-500 uppercase">Package</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-500 uppercase">Room Type</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-500 uppercase">Check In</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-500 uppercase">Check Out</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-500 uppercase">Status</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-500 uppercase">Payment</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-500 uppercase text-right">Dues</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res) => {
                const dues = getBookingDues(res);
                return (
                  <tr key={res.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="py-3 px-4 text-xs font-semibold text-gray-800">{res.package}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{res.roomType}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{res.checkIn}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{res.checkOut}</td>
                    <td className="py-3 px-4 text-xs">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-700">
                        {res.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        res.payment === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {res.payment}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-bold text-right">
                      {dues > 0 ? (
                        <span className="text-red-600">${dues.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-400 font-normal">$0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {reservations.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-xs text-gray-400">
                    No reservations recorded for this guest.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
