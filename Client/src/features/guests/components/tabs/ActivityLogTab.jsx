import React, { useState } from 'react';
import {
  HistoryOutlined,
  Search,
  HotelOutlined,
  PaymentOutlined,
  ReceiptLongOutlined,
  ReportProblemOutlined,
  DescriptionOutlined,
  PersonOutlined,
  CheckCircle,
  CalendarTodayOutlined
} from '@mui/icons-material';

export default function ActivityLogTab({ activities = [], guest }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Filter activities
  const filtered = activities.filter((act) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      String(act.title || '').toLowerCase().includes(q) ||
      String(act.description || '').toLowerCase().includes(q) ||
      String(act.performedBy || '').toLowerCase().includes(q) ||
      String(act.category || '').toLowerCase().includes(q);

    const matchesCategory =
      categoryFilter === 'All' ||
      String(act.category || '').toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Reservation':
        return <HotelOutlined sx={{ fontSize: 16 }} className="text-[#1b7f43]" />;
      case 'Financial':
      case 'Payment':
        return <PaymentOutlined sx={{ fontSize: 16 }} className="text-emerald-600" />;
      case 'Invoice':
        return <ReceiptLongOutlined sx={{ fontSize: 16 }} className="text-blue-600" />;
      case 'Complaint':
      case 'Service':
        return <ReportProblemOutlined sx={{ fontSize: 16 }} className="text-amber-500" />;
      case 'Document':
        return <DescriptionOutlined sx={{ fontSize: 16 }} className="text-purple-600" />;
      default:
        return <PersonOutlined sx={{ fontSize: 16 }} className="text-gray-500" />;
    }
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'Reservation':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">Reservation</span>;
      case 'Financial':
      case 'Payment':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Payment</span>;
      case 'Invoice':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Invoice</span>;
      case 'Complaint':
      case 'Service':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Request</span>;
      case 'Document':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Document</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">Profile</span>;
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Container Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden flex flex-col">
        {/* Header Controls */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HistoryOutlined className="text-[#1b7f43]" sx={{ fontSize: 20 }} />
            <div>
              <h3 className="text-sm font-bold text-gray-900">Guest Interaction & Audit History</h3>
              <p className="text-[11px] text-gray-500">
                {activities.length} real events and system actions tracked
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 16 }} />
              <input
                type="text"
                placeholder="Search audit log..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs w-44 sm:w-56 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition"
              />
            </div>

            {/* Filter */}
            <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-0.5 text-xs">
              {['All', 'Reservation', 'Financial', 'Invoice', 'Complaint', 'Document'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-white text-[#1b7f43] font-bold shadow-2xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {cat === 'All' ? 'All Activities' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="p-6">
          {filtered.length > 0 ? (
            <div className="relative border-l-2 border-gray-100 ml-4 space-y-6">
              {filtered.map((act, idx) => (
                <div key={idx} className="relative pl-6 group">
                  {/* Timeline dot */}
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#1b7f43] group-hover:bg-[#1b7f43] transition flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1b7f43] group-hover:bg-white transition" />
                  </div>

                  {/* Activity Item Card */}
                  <div className="p-4 bg-gray-50/70 hover:bg-emerald-50/30 rounded-xl border border-gray-100 transition space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(act.category)}
                        <span className="font-bold text-xs text-gray-900">{act.title}</span>
                        {getCategoryBadge(act.category)}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                        <CalendarTodayOutlined sx={{ fontSize: 13 }} />
                        {act.date}
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      {act.description}
                    </p>

                    {act.performedBy && (
                      <div className="pt-1 text-[10.5px] text-gray-400 flex items-center gap-1">
                        <span>Logged by:</span>
                        <strong className="text-gray-600 font-medium">{act.performedBy}</strong>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 text-xs">
              <HistoryOutlined sx={{ fontSize: 36 }} className="text-gray-300 mb-2" />
              <p className="font-semibold text-gray-600">No activity recorded</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {searchQuery || categoryFilter !== 'All'
                  ? 'No activity entries match your filter criteria.'
                  : 'No guest actions or audit events recorded yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
