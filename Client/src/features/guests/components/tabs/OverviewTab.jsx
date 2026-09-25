import React from 'react';
import { Link } from 'react-router-dom';
import {
  HotelOutlined,
  CalendarTodayOutlined,
  ReceiptLongOutlined,
  PaymentOutlined,
  ReportProblemOutlined,
  DescriptionOutlined,
  CheckCircle,
  Warning,
  ArrowForward,
  RoomServiceOutlined,
  BadgeOutlined,
  HistoryOutlined
} from '@mui/icons-material';

export default function OverviewTab({
  guest,
  reservations = [],
  invoices = [],
  charges = [],
  complaints = [],
  documents = [],
  activities = [],
  totalInvoiced,
  totalPaid,
  totalDues,
  onSwitchTab
}) {
  const latestReservation = reservations[0] || null;
  const activeComplaints = complaints.filter(c => c.status !== 'Resolved');
  const recentActivities = activities.slice(0, 4);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Quick Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Stays</span>
            <HotelOutlined sx={{ fontSize: 18 }} className="text-[#1b7f43]" />
          </div>
          <div className="text-xl font-black text-gray-900">
            {guest.totalStays || reservations.length || 0}
          </div>
          <p className="text-[10.5px] text-gray-400 mt-0.5">Lifetime hotel visits</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Invoiced</span>
            <ReceiptLongOutlined sx={{ fontSize: 18 }} className="text-blue-600" />
          </div>
          <div className="text-xl font-black text-gray-900">
            ${Number(totalInvoiced).toFixed(2)}
          </div>
          <p className="text-[10.5px] text-gray-400 mt-0.5">{invoices.length} invoice records</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Paid</span>
            <PaymentOutlined sx={{ fontSize: 18 }} className="text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-600">
            ${Number(totalPaid).toFixed(2)}
          </div>
          <p className="text-[10.5px] text-gray-400 mt-0.5">Settled transactions</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Outstanding Dues</span>
            <Warning sx={{ fontSize: 18 }} className={totalDues > 0 ? 'text-rose-500' : 'text-gray-300'} />
          </div>
          <div className={`text-xl font-black ${totalDues > 0 ? 'text-rose-600' : 'text-gray-800'}`}>
            ${Number(totalDues).toFixed(2)}
          </div>
          <p className="text-[10.5px] text-gray-400 mt-0.5">
            {totalDues > 0 ? 'Pending folio settlement' : 'Account is clear'}
          </p>
        </div>
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Stay & Profile Details */}
        <div className="space-y-5">
          {/* Current / Latest Stay Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <HotelOutlined className="text-[#1b7f43]" sx={{ fontSize: 20 }} />
                <h3 className="text-sm font-bold text-gray-900">Current / Latest Reservation</h3>
              </div>
              <button
                onClick={() => onSwitchTab('reservations')}
                className="text-xs text-[#1b7f43] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                View Stays <ArrowForward sx={{ fontSize: 13 }} />
              </button>
            </div>

            {latestReservation ? (
              <div className="space-y-3.5 text-xs text-gray-700">
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-gray-400 font-semibold block text-[10.5px]">Room / Type</span>
                    <span className="font-bold text-gray-800 text-sm">
                      Room {latestReservation.roomNumber || latestReservation.room || 'Assigned'} ({latestReservation.roomType || 'Standard'})
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block text-[10.5px]">Package / Plan</span>
                    <span className="font-bold text-gray-800 text-sm">
                      {latestReservation.package || 'Standard Package'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                    <span className="text-gray-400 font-semibold block text-[10.5px]">Check-In</span>
                    <div className="flex items-center gap-1.5 font-bold text-gray-800 mt-0.5">
                      <CalendarTodayOutlined sx={{ fontSize: 13 }} className="text-gray-400" />
                      {latestReservation.checkIn || 'N/A'}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                    <span className="text-gray-400 font-semibold block text-[10.5px]">Check-Out</span>
                    <div className="flex items-center gap-1.5 font-bold text-gray-800 mt-0.5">
                      <CalendarTodayOutlined sx={{ fontSize: 13 }} className="text-gray-400" />
                      {latestReservation.checkOut || 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#f8faf9] rounded-xl border border-emerald-100/60">
                  <div>
                    <span className="text-gray-500 font-medium block text-[11px]">Stay Status</span>
                    <span className="font-bold text-emerald-700">
                      {latestReservation.status || 'Booked'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 font-medium block text-[11px]">Payment Status</span>
                    <span className={`font-bold ${latestReservation.payment === 'Paid' ? 'text-[#1b7f43]' : 'text-amber-600'}`}>
                      {latestReservation.payment || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 text-xs">
                <HotelOutlined sx={{ fontSize: 32 }} className="text-gray-300 mb-1" />
                <p>No active or historical reservations on record for this guest.</p>
              </div>
            )}
          </div>

          {/* Quick Profile Summary Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <BadgeOutlined className="text-[#1b7f43]" sx={{ fontSize: 20 }} />
                <h3 className="text-sm font-bold text-gray-900">Guest Information Summary</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-gray-50 rounded-lg">
                <span className="text-[10.5px] text-gray-400 block font-medium">Guest Code</span>
                <span className="font-mono font-bold text-gray-800">{guest.id}</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg">
                <span className="text-[10.5px] text-gray-400 block font-medium">Profile Status</span>
                <span className="font-bold text-emerald-700">{guest.status || 'Active'}</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg">
                <span className="text-[10.5px] text-gray-400 block font-medium">City / Country</span>
                <span className="font-bold text-gray-800">{guest.city || 'Not specified'}</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg">
                <span className="text-[10.5px] text-gray-400 block font-medium">Phone Number</span>
                <span className="font-bold text-gray-800">{guest.phone || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Financial & Operational Overview */}
        <div className="space-y-5">
          {/* Invoices & Folio Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <ReceiptLongOutlined className="text-[#1b7f43]" sx={{ fontSize: 20 }} />
                <h3 className="text-sm font-bold text-gray-900">Invoices & Financial Summary</h3>
              </div>
              <button
                onClick={() => onSwitchTab('invoices')}
                className="text-xs text-[#1b7f43] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                All Invoices <ArrowForward sx={{ fontSize: 13 }} />
              </button>
            </div>

            {invoices.length > 0 ? (
              <div className="space-y-2.5">
                {invoices.slice(0, 3).map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => onSwitchTab('invoices')}
                    className="p-3 bg-gray-50 hover:bg-emerald-50/40 transition rounded-xl border border-gray-100 flex items-center justify-between cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-800">{inv.invoiceNumber}</span>
                        <span className={`px-2 py-0.2 text-[10px] font-bold rounded-full ${
                          inv.status === 'Paid' ? 'bg-[#e5f4eb] text-[#1b7f43]' :
                          inv.status === 'Partially Paid' ? 'bg-blue-50 text-blue-700' :
                          'bg-rose-50 text-rose-600'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Room {inv.roomNumber || '101'} • Due {inv.dueDate}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-gray-900 block">${Number(inv.totalAmount).toFixed(2)}</span>
                      <span className="text-[10.5px] text-gray-500">
                        Due: <strong className={inv.balanceDue > 0 ? 'text-rose-600' : 'text-gray-700'}>${Number(inv.balanceDue).toFixed(2)}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-400 text-xs">
                <ReceiptLongOutlined sx={{ fontSize: 28 }} className="text-gray-300 mb-1" />
                <p>No formal invoices generated yet for this guest.</p>
              </div>
            )}
          </div>

          {/* Operational Status (Complaints & Documents Quick glance) */}
          <div className="grid grid-cols-2 gap-3.5">
            <div
              onClick={() => onSwitchTab('requests-complaints')}
              className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs hover:border-[#1b7f43]/30 transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-gray-400 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Active Requests</span>
                <ReportProblemOutlined sx={{ fontSize: 18 }} className="text-amber-500" />
              </div>
              <div className="text-xl font-extrabold text-gray-800">
                {activeComplaints.length}
              </div>
              <p className="text-[10.5px] text-gray-400 mt-0.5">
                {activeComplaints.length > 0 ? `${activeComplaints.length} pending issues` : 'All resolved'}
              </p>
            </div>

            <div
              onClick={() => onSwitchTab('documents')}
              className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs hover:border-[#1b7f43]/30 transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-gray-400 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Documents</span>
                <DescriptionOutlined sx={{ fontSize: 18 }} className="text-blue-500" />
              </div>
              <div className="text-xl font-extrabold text-gray-800">
                {documents.length}
              </div>
              <p className="text-[10.5px] text-gray-400 mt-0.5">
                {documents.length > 0 ? 'ID & registration verified' : 'No docs attached'}
              </p>
            </div>
          </div>

          {/* Recent Activity Quick Preview */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <div className="flex items-center gap-2">
                <HistoryOutlined className="text-[#1b7f43]" sx={{ fontSize: 20 }} />
                <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
              </div>
              <button
                onClick={() => onSwitchTab('activity-log')}
                className="text-xs text-[#1b7f43] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                Full Log <ArrowForward sx={{ fontSize: 13 }} />
              </button>
            </div>

            {recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#1b7f43] mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{act.title}</p>
                      <p className="text-[11px] text-gray-500 truncate">{act.description}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">{act.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-2 text-center">No recent activity recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
