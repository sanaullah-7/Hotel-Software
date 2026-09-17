import React, { useState } from 'react';
import {
  HomeOutlined as HomeIcon,
  Celebration as CelebrationIcon,
  EventSeat as SeatIcon,
  Apartment as VenueIcon,
  Receipt as SpendIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  RestaurantMenu as MenuIcon,
  ArticleOutlined as BeoIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  Add as AddIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Print as PrintIcon
} from '@mui/icons-material';

// Initial BEO Events list matching the Luxuria template exactly
const INITIAL_EVENTS = [
  {
    id: 'BEO-401',
    title: 'Vance & Sterling Royal Wedding Gala',
    client: 'Baroness Evelyn Vance • Vance Family Trust',
    venue: 'Grand Crystal Ballroom',
    status: 'Confirmed & Deposit Paid',
    statusType: 'confirmed',
    schedule: 'Oct 28, 2026 (18:00 – 23:30)',
    attendance: '320 Guests (Round Table Banquet (10-top))',
    catering: '6-Course Michelin Gala Dinner & Vintage Champagne Toast',
    totalPrice: '$68,500',
    depositPaid: '$35,000',
    avSetup: 'Full Line Array Audio, 4K LED Backdrop & Stage Spotlight',
    coordinator: 'Marcella Dubois (Senior Event Director)',
  },
  {
    id: 'BEO-402',
    title: 'Global Private Wealth & Tech Summit 2026',
    client: 'Julian Thorne • Thorne Capital Partners',
    venue: 'Grand Crystal Ballroom',
    status: 'BEO In Preparation',
    statusType: 'in-prep',
    schedule: 'Nov 04, 2026 (08:30 – 17:00)',
    attendance: '380 Guests (Theater Keynote & Stage)',
    catering: 'Executive All-Day Coffee Bar & Gourmet Buffet Luncheon',
    totalPrice: '$42,000',
    depositPaid: '$20,000',
    avSetup: 'Dual Projectors, Live Webcast Rig & 8 Wireless Lapel Mics',
    coordinator: 'Jonathan Sterling (Conference Lead)',
  },
  {
    id: 'BEO-403',
    title: 'Haute Horlogerie Luxury Watch Showcase',
    client: 'Genevieve Moreau • Vacheron & Patek Guild',
    venue: 'Skyline Rooftop Pavilion',
    status: 'In-Progress Live Event',
    statusType: 'in-progress',
    schedule: 'Today (19:00 – 23:00)',
    attendance: '140 Guests (Cocktail Reception Standing)',
    catering: 'Beluga Caviar Tasting, Truffle Canapés & Sommelier Wine Pairing',
    totalPrice: '$29,800',
    depositPaid: '$29,800',
    avSetup: 'Ambient DJ Sound System & Museum-Grade Vitrine Lighting',
    coordinator: 'Elena Rostova (VIP Hospitality)',
  },
  {
    id: 'BEO-404',
    title: 'Diplomatic Corps Autumn Ambassadorial Dinner',
    client: 'Ambassador Henri Zhao • Consular Diplomatic Mission',
    venue: 'Royal Executive Boardroom',
    status: 'Confirmed & Deposit Paid',
    statusType: 'confirmed',
    schedule: 'Oct 30, 2026 (19:30 – 22:30)',
    attendance: '28 Guests (U-Shape Executive)',
    catering: 'Private Chef 5-Course State Banquet with Wine Pairing',
    totalPrice: '$12,400',
    depositPaid: '$12,400',
    avSetup: 'Encrypted Video Teleconference & Interpretation Booths',
    coordinator: 'Marcella Dubois (Senior Event Director)',
  },
  {
    id: 'BEO-405',
    title: 'Luminis Biotech European Board Meeting',
    client: 'Dr. Aris Thorne • Luminis Therapeutics',
    venue: 'Botanical Garden Terrace',
    status: 'BEO In Preparation',
    statusType: 'in-prep',
    schedule: 'Nov 12, 2026 (11:00 – 16:00)',
    attendance: '160 Guests (Classroom & Workshop)',
    catering: 'Farm-to-Table Organic Garden Lunch & Artisan Gelato Bar',
    totalPrice: '$24,800',
    depositPaid: '$10,000',
    avSetup: 'High-Brightness Laser Displays & Polycom Hybrid Audio',
    coordinator: 'Jonathan Sterling (Conference Lead)',
  },
];

const VENUE_FILTERS = [
  { id: 'all', label: 'All Venues', icon: VenueIcon },
  { id: 'grand-crystal', label: 'Grand Crystal Ballroom', pax: '450 Pax' },
  { id: 'skyline-rooftop', label: 'Skyline Rooftop Pavilion', pax: '180 Pax' },
  { id: 'royal-executive', label: 'Royal Executive Boardroom', pax: '35 Pax' },
  { id: 'botanical-garden', label: 'Botanical Garden Terrace', pax: '220 Pax' },
];

const STATUS_FILTERS = [
  'All Statuses',
  'Confirmed & Deposit Paid',
  'BEO In Preparation',
  'In-Progress Live Event',
  'Completed & Invoiced',
];

export default function BanquetManager() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [activeBeoSheet, setActiveBeoSheet] = useState(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // New BEO Form state
  const [newBEO, setNewBEO] = useState({
    title: '',
    client: '',
    venue: 'Grand Crystal Ballroom',
    status: 'Confirmed & Deposit Paid',
    schedule: '',
    attendance: '',
    catering: '',
    totalPrice: '',
    depositPaid: '',
  });

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleResetFilters = () => {
    setSelectedVenue('all');
    setSelectedStatus('All Statuses');
    setSearchQuery('');
    showToast('Filters reset.');
  };

  const handleExportCSV = () => {
    const headers = ['BEO ID', 'Event Title', 'Client', 'Venue', 'Status', 'Schedule', 'Total Price', 'Deposit Paid'];
    const rows = filteredEvents.map(e => [
      e.id,
      `"${e.title}"`,
      `"${e.client}"`,
      `"${e.venue}"`,
      `"${e.status}"`,
      `"${e.schedule}"`,
      `"${e.totalPrice}"`,
      `"${e.depositPaid}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'BEO_Banquet_Events.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('BEO export downloaded successfully!');
  };

  const handleCreateBEO = (e) => {
    e.preventDefault();
    if (!newBEO.title || !newBEO.client) return;

    const created = {
      id: `BEO-${400 + events.length + 1}`,
      title: newBEO.title,
      client: newBEO.client,
      venue: newBEO.venue,
      status: newBEO.status,
      statusType: newBEO.status.includes('Confirmed') ? 'confirmed' : 'in-prep',
      schedule: newBEO.schedule || 'Upcoming Scheduled Date',
      attendance: newBEO.attendance || '100 Guests (Standard Banquet)',
      catering: newBEO.catering || 'Chef Tasting Menu & Beverage Package',
      totalPrice: newBEO.totalPrice.startsWith('$') ? newBEO.totalPrice : `$${newBEO.totalPrice}`,
      depositPaid: newBEO.depositPaid.startsWith('$') ? newBEO.depositPaid : `$${newBEO.depositPaid}`,
      avSetup: 'Standard Stage, Podium Mic & Ambient Lighting',
      coordinator: 'Marcella Dubois (Senior Event Director)',
    };

    setEvents(prev => [created, ...prev]);
    setIsGenerateModalOpen(false);
    setNewBEO({
      title: '',
      client: '',
      venue: 'Grand Crystal Ballroom',
      status: 'Confirmed & Deposit Paid',
      schedule: '',
      attendance: '',
      catering: '',
      totalPrice: '',
      depositPaid: '',
    });
    showToast(`New Banquet Order ${created.id} generated!`);
  };

  // Filter logic
  const filteredEvents = events.filter((item) => {
    const matchesVenue =
      selectedVenue === 'all' ||
      item.venue.toLowerCase().includes(selectedVenue.replace('-', ' '));

    const matchesStatus =
      selectedStatus === 'All Statuses' || item.status === selectedStatus;

    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesVenue && matchesStatus && matchesSearch;
  });

  return (
    <div className="w-full space-y-3  font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-[#1e293b] text-white px-4 py-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircleIcon sx={{ fontSize: 20, color: '#10b981' }} />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}


      {/* 2. Top 4 Metric KPI Cards (2x2 Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Card 1: MONTHLY BANQUET REVENUE */}
        <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 tracking-wider uppercase block">
                MONTHLY BANQUET REVENUE
              </span>
              <div className="text-xl font-extrabold text-[#3b5998] tracking-tight mt-2.5 mb-3">
                $184,500
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-full px-2.5 py-1 bg-[#e8f8f0] text-[#0abb75] text-xs font-bold">
                  +18.4% vs Last Month
                </span>
                <span className="rounded-full px-2.5 py-1 bg-[#f1f5f9] text-gray-600 text-xs font-medium">
                  F&B + AV Included
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#ede9fe] text-[#7c3aed] flex items-center justify-center shrink-0">
              <CelebrationIcon sx={{ fontSize: 24 }} />
            </div>
          </div>
        </div>

        {/* Card 2: ACTIVE FUNCTIONS & BEOS */}
        <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 tracking-wider uppercase block">
                ACTIVE FUNCTIONS & BEOS
              </span>
              <div className="text-xl font-extrabold text-[#10b981] tracking-tight mt-2.5 mb-3">
                14 Events
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-full px-2.5 py-1 bg-[#f1f5f9] text-gray-600 text-xs font-medium">
                  Weddings & Galas
                </span>
                <span className="rounded-full px-2.5 py-1 bg-[#f1f5f9] text-gray-600 text-xs font-medium">
                  Corporate Summits
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#d1fae5] text-[#10b981] flex items-center justify-center shrink-0">
              <SeatIcon sx={{ fontSize: 24 }} />
            </div>
          </div>
        </div>

        {/* Card 3: VENUE UTILIZATION */}
        <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 tracking-wider uppercase block">
                VENUE UTILIZATION
              </span>
              <div className="text-xl font-extrabold text-[#6366f1] tracking-tight mt-2.5 mb-3">
                88%
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-full px-2.5 py-1 bg-[#f1f5f9] text-gray-600 text-xs font-medium">
                  4 Luxury Venues
                </span>
                <span className="rounded-full px-2.5 py-1 bg-[#f1f5f9] text-gray-600 text-xs font-medium">
                  Peak Weekend Par
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#f3e8ff] text-[#9333ea] flex items-center justify-center shrink-0">
              <VenueIcon sx={{ fontSize: 24 }} />
            </div>
          </div>
        </div>

        {/* Card 4: AVG SPEND PER GUEST */}
        <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 tracking-wider uppercase block">
                AVG SPEND PER GUEST
              </span>
              <div className="text-xl font-extrabold text-[#ea580c] tracking-tight mt-2.5 mb-3 flex items-baseline">
                $285 <span className="text-sm font-normal text-gray-500 ml-1.5">/ Pax</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-full px-2.5 py-1 bg-[#f1f5f9] text-gray-600 text-xs font-medium">
                  Michelin Plated
                </span>
                <span className="rounded-full px-2.5 py-1 bg-[#f1f5f9] text-gray-600 text-xs font-medium">
                  Sommelier Packages
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#fef3c7] text-[#d97706] flex items-center justify-center shrink-0">
              <SpendIcon sx={{ fontSize: 24 }} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Venues Filter Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
        {VENUE_FILTERS.map((venue) => {
          const isSelected = selectedVenue === venue.id;
          const IconComp = venue.icon;
          return (
            <button
              key={venue.id}
              onClick={() => setSelectedVenue(venue.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-[#4f46e5] text-white shadow-xs'
                  : 'bg-[#f1f5f9] hover:bg-gray-200 text-gray-700'
              }`}
            >
              {IconComp && <IconComp sx={{ fontSize: 16 }} />}
              {venue.pax && (
                <span className={`text-[11px] font-bold ${isSelected ? 'text-indigo-200' : 'text-gray-500'}`}>
                  {venue.pax}
                </span>
              )}
              <span>{venue.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Status Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {STATUS_FILTERS.map((status) => {
          const isSelected = selectedStatus === status;
          return (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#e0e7ff] text-[#4f46e5] font-bold'
                  : 'text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          );
        })}
      </div>

      {/* 5. Search & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <SearchIcon sx={{ fontSize: 18 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search event, client, venue, BEO #..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#4f46e5]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetFilters}
            title="Reset Filters"
            className="p-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition cursor-pointer"
          >
            <RefreshIcon sx={{ fontSize: 18 }} />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <DownloadIcon sx={{ fontSize: 16 }} />
            Export BEOs
          </button>

          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="px-4 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <AddIcon sx={{ fontSize: 16 }} />
            Generate New BEO
          </button>
        </div>
      </div>

      {/* 6. Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.map((event) => {
          const isConfirmed = event.statusType === 'confirmed';
          const isInProgress = event.statusType === 'in-progress';

          return (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Card Header Row */}
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <span className="font-bold text-gray-900 text-sm">
                    {event.id}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#eef2ff] text-[#4f46e5] text-xs font-semibold">
                      <LocationIcon sx={{ fontSize: 13 }} />
                      {event.venue}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isConfirmed
                          ? 'bg-[#e8f8f0] text-[#0abb75]'
                          : isInProgress
                          ? 'bg-[#f3e8ff] text-[#9333ea]'
                          : 'bg-[#fffbeb] text-[#d97706]'
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                </div>

                {/* Event Title & Client */}
                <h3 className="text-[16px] font-bold text-gray-900 mt-1 mb-0.5">
                  {event.title}
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  {event.client}
                </p>

                {/* Schedule & Attendance Box */}
                <div className="space-y-2 text-xs py-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                      <ScheduleIcon sx={{ fontSize: 15 }} className="text-gray-400" />
                      Schedule
                    </span>
                    <span className="font-bold text-gray-800">
                      {event.schedule}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                      <PeopleIcon sx={{ fontSize: 15 }} className="text-gray-400" />
                      Attendance
                    </span>
                    <span className="font-bold text-[#4f46e5]">
                      {event.attendance}
                    </span>
                  </div>
                </div>

                {/* Menu / Catering Banner */}
                <div className="bg-[#f8faff] border border-blue-50/80 rounded-xl p-3 flex items-center gap-2 text-xs text-gray-700 font-medium my-4">
                  <MenuIcon sx={{ fontSize: 17, color: '#6366f1' }} className="shrink-0" />
                  <span className="line-clamp-1">{event.catering}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-lg font-extrabold text-gray-900">
                    {event.totalPrice}
                  </span>
                  <span className="text-xs font-semibold text-[#10b981] ml-2">
                    Deposit: {event.depositPaid}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveBeoSheet(event)}
                  className="text-xs font-bold text-[#4f46e5] hover:text-[#4338ca] flex items-center gap-1 transition cursor-pointer"
                >
                  <BeoIcon sx={{ fontSize: 16 }} />
                  View BEO Sheet
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 7. Footer */}
      <div className="pt-4 text-left text-sm text-gray-500 font-normal">
        Copyright © 2026 Design By <span className="text-gray-700 font-semibold">Luxuria</span>
      </div>

      {/* Modal: View BEO Sheet */}
      {activeBeoSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-gray-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ede9fe] text-[#7c3aed] flex items-center justify-center">
                  <BeoIcon sx={{ fontSize: 22 }} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Banquet Event Order ({activeBeoSheet.id})
                  </h3>
                  <p className="text-xs text-gray-500">Official Production Specification Sheet</p>
                </div>
              </div>
              <button
                onClick={() => setActiveBeoSheet(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <CloseIcon sx={{ fontSize: 20 }} />
              </button>
            </div>

            {/* BEO Details Body */}
            <div className="py-6 space-y-6 text-sm">
              {/* Event & Client Banner */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-100">
                <h4 className="text-lg font-bold text-gray-900">{activeBeoSheet.title}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                  <p><span className="font-semibold text-gray-800">Client:</span> {activeBeoSheet.client}</p>
                  <p><span className="font-semibold text-gray-800">Venue:</span> {activeBeoSheet.venue}</p>
                  <p><span className="font-semibold text-gray-800">Date & Time:</span> {activeBeoSheet.schedule}</p>
                  <p><span className="font-semibold text-gray-800">Coordinator:</span> {activeBeoSheet.coordinator}</p>
                </div>
              </div>

              {/* Attendance & Setup */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Room Configuration & Attendance
                </h5>
                <div className="bg-[#f8faff] rounded-xl p-3 border border-blue-100/60 text-xs space-y-1">
                  <p className="font-bold text-gray-900">{activeBeoSheet.attendance}</p>
                  <p className="text-gray-600">AV & Staging: {activeBeoSheet.avSetup}</p>
                </div>
              </div>

              {/* Food & Beverage Menu */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Culinary & Bar Specifications
                </h5>
                <div className="bg-[#f0fdf4] rounded-xl p-3 border border-green-100 text-xs text-green-900">
                  <p className="font-bold">{activeBeoSheet.catering}</p>
                  <p className="text-green-700 mt-1">Special Dietary: Kosher & Halal options pre-flagged with Banquet Captain.</p>
                </div>
              </div>

              {/* Billing Summary */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Financials & Billing
                </h5>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-xs text-gray-500">Contract Total</span>
                    <p className="text-xl font-extrabold text-gray-900">{activeBeoSheet.totalPrice}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Deposit Received</span>
                    <p className="text-xl font-extrabold text-[#10b981]">{activeBeoSheet.depositPaid}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => {
                  window.print();
                  showToast('Preparing BEO Document for Print...');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition flex items-center gap-1.5 cursor-pointer"
              >
                <PrintIcon sx={{ fontSize: 16 }} />
                Print BEO Sheet
              </button>
              <button
                onClick={() => setActiveBeoSheet(null)}
                className="px-5 py-2 bg-[#4f46e5] text-white text-xs font-bold rounded-xl hover:bg-[#4338ca] transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Generate New BEO */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-gray-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#4f46e5] text-white flex items-center justify-center">
                  <AddIcon sx={{ fontSize: 20 }} />
                </div>
                <h4 className="font-bold text-gray-900 text-base">
                  Generate New Banquet Event Order
                </h4>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <CloseIcon sx={{ fontSize: 20 }} />
              </button>
            </div>

            <form onSubmit={handleCreateBEO} className="space-y-4 mt-5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Event Title*
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cambridge Tech Gala & Reception"
                  value={newBEO.title}
                  onChange={(e) => setNewBEO({ ...newBEO, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#4f46e5]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Client / Sponsor*
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lady Clara Sterling • Sterling Foundation"
                  value={newBEO.client}
                  onChange={(e) => setNewBEO({ ...newBEO, client: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#4f46e5]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Venue
                  </label>
                  <select
                    value={newBEO.venue}
                    onChange={(e) => setNewBEO({ ...newBEO, venue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#4f46e5] bg-white"
                  >
                    <option value="Grand Crystal Ballroom">Grand Crystal Ballroom (450 Pax)</option>
                    <option value="Skyline Rooftop Pavilion">Skyline Rooftop Pavilion (180 Pax)</option>
                    <option value="Royal Executive Boardroom">Royal Executive Boardroom (35 Pax)</option>
                    <option value="Botanical Garden Terrace">Botanical Garden Terrace (220 Pax)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={newBEO.status}
                    onChange={(e) => setNewBEO({ ...newBEO, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#4f46e5] bg-white"
                  >
                    <option value="Confirmed & Deposit Paid">Confirmed & Deposit Paid</option>
                    <option value="BEO In Preparation">BEO In Preparation</option>
                    <option value="In-Progress Live Event">In-Progress Live Event</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Schedule
                  </label>
                  <input
                    type="text"
                    placeholder="Nov 18, 2026 (18:00 – 23:00)"
                    value={newBEO.schedule}
                    onChange={(e) => setNewBEO({ ...newBEO, schedule: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#4f46e5]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Attendance
                  </label>
                  <input
                    type="text"
                    placeholder="250 Guests (Round Table 10-top)"
                    value={newBEO.attendance}
                    onChange={(e) => setNewBEO({ ...newBEO, attendance: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#4f46e5]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Food & Beverage Menu
                </label>
                <input
                  type="text"
                  placeholder="5-Course Plated Dinner & Open Bar"
                  value={newBEO.catering}
                  onChange={(e) => setNewBEO({ ...newBEO, catering: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#4f46e5]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Total Contract Price ($)
                  </label>
                  <input
                    type="text"
                    placeholder="$35,000"
                    value={newBEO.totalPrice}
                    onChange={(e) => setNewBEO({ ...newBEO, totalPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#4f46e5]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Deposit Paid ($)
                  </label>
                  <input
                    type="text"
                    placeholder="$15,000"
                    value={newBEO.depositPaid}
                    onChange={(e) => setNewBEO({ ...newBEO, depositPaid: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#4f46e5]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4f46e5] text-white font-bold rounded-xl hover:bg-[#4338ca] transition shadow-xs cursor-pointer"
                >
                  Generate BEO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
