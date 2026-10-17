import React, { useState, useEffect, useCallback, useMemo } from 'react';

import {
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
  Print as PrintIcon,
  EditOutlined as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { STATUS_FILTERS, VENUE_FILTERS } from '../data/banquetData';
import eventService from '../../../services/eventService';
import {
  toFrontendBeo,
  toFrontendBeoList,
  toBackendBeoPayload,
} from '../adapters/eventAdapter';
import '../../assigned-ui/formStyles.css';

export default function BanquetManager() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [activeBeoSheet, setActiveBeoSheet] = useState(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [editingBeo, setEditingBeo] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteBeoState, setDeleteBeoState] = useState({ isOpen: false, beo: null });

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

  const loadBeos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, eventsRes] = await Promise.allSettled([
        eventService.getBeos(),
        eventService.getEvents()
      ]);
      if (res.status === 'rejected') throw res.reason;
      const resVal = res.value;
      if (eventsRes.status === 'fulfilled') {
        const evData = eventsRes.value?.data?.events || eventsRes.value?.data || eventsRes.value || [];
        setAvailableEvents(Array.isArray(evData) ? evData : []);
      }
      const rawList = Array.isArray(resVal?.data) ? resVal.data : (Array.isArray(resVal) ? resVal : []);
      setEvents(toFrontendBeoList(rawList));
    } catch (err) {
      console.error('Backend BEO fetch failed:', err);
      setError(err?.message || 'Failed to load event plans from backend. Please check connection and retry.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBeos();
  }, [loadBeos]);

  const handleResetFilters = () => {
    setSelectedVenue('all');
    setSelectedStatus('All Statuses');
    setSearchQuery('');
    showToast('Filters reset.');
  };

  const handleExportCSV = () => {
    const headers = ['Plan ID', 'Event Title', 'Customer', 'Venue', 'Status', 'Schedule', 'Total Price', 'Deposit Paid'];
    const rows = filteredEvents.map((e) => [
      e.id,
      `"${e.title}"`,
      `"${e.client}"`,
      `"${e.venue}"`,
      `"${e.status}"`,
      `"${e.schedule}"`,
      `"${e.totalPrice}"`,
      `"${e.depositPaid}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Event_Plans_BEO.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Event plans exported successfully!');
  };

  const handleCreateBEO = async (e) => {
    e.preventDefault();
    if (!newBEO.title?.trim() || !newBEO.client?.trim()) {
      showToast('Please provide both Event Title and Customer Name');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = toBackendBeoPayload(newBEO);
      const res = await eventService.createBeo(payload);
      const created = toFrontendBeo(res?.data || res);

      if (created) {
        setEvents((prev) => [created, ...prev]);
        showToast(`Event Plan ${created.id} created successfully!`);
      } else {
        showToast('Event plan created successfully!');
        loadBeos();
      }

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
    } catch (err) {
      console.error('Failed to create event plan on server:', err);
      showToast(err?.message || 'Failed to create event plan on server');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter logic
  const filteredEvents = useMemo(() => {
    return events.filter((item) => {
      const matchesVenue =
        selectedVenue === 'all' ||
        item.venue.toLowerCase().includes(selectedVenue.replace('-', ''));

      const matchesStatus =
        selectedStatus === 'All Statuses' || item.status === selectedStatus;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        item.client.toLowerCase().includes(q) ||
        item.venue.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);

      return matchesVenue && matchesStatus && matchesSearch;
    });
  }, [events, selectedVenue, selectedStatus, searchQuery]);

  const parseCurrency = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9.-]+/g, '');
    return parseFloat(cleaned) || 0;
  };

  const parseGuests = (str) => {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    const m = String(str).match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  };

  const kpiMetrics = useMemo(() => {
    const totalRevenue = events.reduce((sum, e) => sum + parseCurrency(e.totalPrice), 0);
    const activeFunctions = events.filter((e) => e.statusType === 'confirmed' || e.statusType === 'in-progress').length || events.length;
    const bookedVenues = new Set(events.map((e) => e.venue).filter(Boolean));
    const totalPossibleVenues = Math.max(1, VENUE_FILTERS.filter(v => v.id !== 'all').length);
    const venueUtilization = events.length > 0 ? Math.min(100, Math.round((bookedVenues.size / totalPossibleVenues) * 100)) : 0;
    const totalGuests = events.reduce((sum, e) => sum + parseGuests(e.attendance), 0);
    const avgSpend = totalGuests > 0 ? Math.round(totalRevenue / totalGuests) : 0;

    return {
      totalRevenue,
      activeFunctions,
      venueUtilization,
      avgSpend,
    };
  }, [events]);

  return (
    <div className="flex flex-col gap-3 pb-6 animate-fade-in w-full font-sans" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* 1. Header Banner */}
      <div className="bg-white rounded-xl border border-gray-100 p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">Event Plans & Checklists</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Operational floor sheets, seating setups, and catering schedules for hotel staff.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1b7f43] hover:bg-[#12572e] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <AddIcon sx={{ fontSize: 16 }} />
            <span>Generate New BEO</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-[#12572e] text-white px-3.5 py-2 rounded-xl shadow-xl text-xs font-medium">
          <CheckCircleIcon sx={{ fontSize: 16, color: '#28a75a' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Overview Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-lg sm:text-xl font-bold text-gray-900 leading-none mb-1">
              ${kpiMetrics.totalRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 font-medium">Total Booked Value</div>
          </div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 text-[#1b7f43] shrink-0">
            <CelebrationIcon sx={{ fontSize: 17 }} />
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-lg sm:text-xl font-bold text-gray-900 leading-none mb-1">
              {kpiMetrics.activeFunctions}
            </div>
            <div className="text-xs text-gray-500 font-medium">Active Plans</div>
          </div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
            <SeatIcon sx={{ fontSize: 17 }} />
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-lg sm:text-xl font-bold text-gray-900 leading-none mb-1">
              {kpiMetrics.venueUtilization}%
            </div>
            <div className="text-xs text-gray-500 font-medium">Venue Occupancy</div>
          </div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600 shrink-0">
            <VenueIcon sx={{ fontSize: 17 }} />
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-lg sm:text-xl font-bold text-gray-900 leading-none mb-1">
              ${kpiMetrics.avgSpend}
            </div>
            <div className="text-xs text-gray-500 font-medium">Average / Guest</div>
          </div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600 shrink-0">
            <SpendIcon sx={{ fontSize: 17 }} />
          </div>
        </div>
      </div>

      {/* 3. Unified Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <SearchIcon sx={{ fontSize: 16 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by event, customer, venue, plan ID..."
            className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1b7f43] focus:bg-white focus:ring-1 focus:ring-[#1b7f43]/20 transition"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Venue Dropdown */}
          <select
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 sm:py-2 text-gray-700 focus:outline-none focus:border-[#1b7f43] cursor-pointer"
          >
            {VENUE_FILTERS.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label} {v.pax ? `(${v.pax})` : ''}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 sm:py-2 text-gray-700 focus:outline-none focus:border-[#1b7f43] cursor-pointer"
          >
            {STATUS_FILTERS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Reset Button */}
          <button
            onClick={handleResetFilters}
            title="Reset Filters"
            aria-label="Reset filters"
            className="p-1.5 sm:p-2 bg-white border border-gray-200 text-gray-500 hover:text-[#1b7f43] hover:border-[#1b7f43]/40 rounded-lg transition cursor-pointer"
          >
            <RefreshIcon sx={{ fontSize: 16 }} />
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 sm:py-2 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
          >
            <DownloadIcon sx={{ fontSize: 15 }} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* 4. Event Plans List */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2 bg-white rounded-xl border border-gray-100 shadow-xs">
          <CircularProgress size={28} sx={{ color: '#1b7f43' }} />
          <span className="text-xs text-gray-500 font-medium">Loading event plans...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">{error}</span>
          </div>
          <button
            onClick={loadBeos}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-14 px-4 text-center bg-white rounded-xl border border-gray-100 shadow-xs flex flex-col items-center justify-center gap-2">
          <p className="text-sm font-semibold text-gray-700">No Banquet Event Orders recorded yet</p>
          <p className="text-xs text-gray-400">Click &ldquo;Generate New BEO&rdquo; above to create your first event plan.</p>
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="mt-1 px-3.5 py-1.5 bg-[#1b7f43] hover:bg-[#12572e] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            + Generate First Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredEvents.map((event) => {
            const isConfirmed = event.statusType === 'confirmed';
            const isInProgress = event.statusType === 'in-progress';

            return (
              <div
                key={event.id}
                className="bg-white rounded-xl border border-gray-100 shadow-xs hover:border-[#1b7f43]/40 hover:shadow-sm transition-all p-3.5 sm:p-4 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                      {event.id}
                    </span>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-100 text-[11px] font-medium">
                        <LocationIcon sx={{ fontSize: 11 }} />
                        {event.venue}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          isConfirmed
                            ? 'bg-emerald-50 text-[#1b7f43] border border-emerald-100'
                            : isInProgress
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                  </div>

                  {/* Title & Customer */}
                  <h3 className="text-sm font-bold text-gray-900 leading-snug mb-0.5">
                    {event.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3 truncate">
                    Customer: <span className="font-medium text-gray-700">{event.client}</span>
                  </p>

                  {/* Schedule & Attendance */}
                  <div className="space-y-1.5 text-xs mb-3 bg-gray-50/70 p-2.5 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-1.5">
                        <ScheduleIcon sx={{ fontSize: 13 }} className="text-gray-400" />
                        Schedule
                      </span>
                      <span className="font-semibold text-gray-800">{event.schedule}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-1.5">
                        <PeopleIcon sx={{ fontSize: 13 }} className="text-gray-400" />
                        Attendance
                      </span>
                      <span className="font-semibold text-[#1b7f43]">{event.attendance}</span>
                    </div>
                  </div>

                  {/* Catering Banner */}
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-xs text-emerald-900 font-medium">
                    <MenuIcon sx={{ fontSize: 14, color: '#1b7f43' }} className="shrink-0" />
                    <span className="truncate">{event.catering}</span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-gray-900">{event.totalPrice}</span>
                    <span className="text-[11px] font-medium text-emerald-700 ml-2">
                      Deposit: {event.depositPaid}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBeo(event);
                        setIsEditModalOpen(true);
                      }}
                      className="p-1 text-gray-400 hover:text-[#1b7f43] hover:bg-emerald-50 rounded transition cursor-pointer"
                      title="Edit Event Plan"
                      aria-label="Edit event plan"
                    >
                      <EditIcon sx={{ fontSize: 16 }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteBeoState({ isOpen: true, beo: event })}
                      className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                      title="Delete Event Plan"
                      aria-label="Delete event plan"
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveBeoSheet(event)}
                      className="text-xs font-semibold text-[#1b7f43] hover:text-[#12572e] flex items-center gap-1 transition cursor-pointer ml-1"
                    >
                      <BeoIcon sx={{ fontSize: 14 }} />
                      <span>View Plan Sheet</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Modal: View BEO Sheet */}
      {activeBeoSheet && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn"
          onClick={() => setActiveBeoSheet(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-100 max-h-[90vh] overflow-y-auto animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#1b7f43] px-6 py-4 flex items-center justify-between text-white rounded-t-2xl">
              <div>
                <span className="text-xs font-mono text-emerald-100 block">{activeBeoSheet.id}</span>
                <h3 className="text-base font-bold tracking-tight">Event Plan Checklist</h3>
              </div>
              <button
                onClick={() => setActiveBeoSheet(null)}
                aria-label="Close"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-sm text-gray-700">
              {/* Event & Client Banner */}
              <div className="bg-gray-50 rounded-xl p-3.5 space-y-2 border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 leading-snug">{activeBeoSheet.title}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                  <p><span className="font-semibold text-gray-800">Customer:</span> {activeBeoSheet.client}</p>
                  <p><span className="font-semibold text-gray-800">Venue:</span> {activeBeoSheet.venue}</p>
                  <p><span className="font-semibold text-gray-800">Schedule:</span> {activeBeoSheet.schedule}</p>
                  <p><span className="font-semibold text-gray-800">Coordinator:</span> {activeBeoSheet.coordinator}</p>
                </div>
              </div>

              {/* Room Configuration */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Room Configuration & Setup
                </h5>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-xs space-y-1">
                  <p className="font-semibold text-gray-800">{activeBeoSheet.attendance}</p>
                  <p className="text-gray-600">Audio/Visual & Staging: {activeBeoSheet.avSetup}</p>
                </div>
              </div>

              {/* Food & Beverage */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Food & Beverage Menu
                </h5>
                <div className="bg-emerald-50/50 rounded-lg p-3 border border-emerald-100 text-xs">
                  <p className="font-semibold text-emerald-900">{activeBeoSheet.catering}</p>
                  <p className="text-emerald-700 mt-1">Special dietary and service times confirmed with Banquet Captain.</p>
                </div>
              </div>

              {/* Financials */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Financial Breakdown
                </h5>
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <span className="text-xs text-gray-500">Contract Total</span>
                    <p className="text-lg font-bold text-gray-900 leading-tight">{activeBeoSheet.totalPrice}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Deposit Received</span>
                    <p className="text-lg font-bold text-[#1b7f43] leading-tight">{activeBeoSheet.depositPaid}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between rounded-b-2xl">
              <button
                onClick={() => {
                  window.print();
                  showToast('Preparing Plan Document for Print...');
                }}
                className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-white transition flex items-center gap-1.5 cursor-pointer"
              >
                <PrintIcon sx={{ fontSize: 15 }} />
                <span>Print Plan Sheet</span>
              </button>
              <button
                onClick={() => setActiveBeoSheet(null)}
                className="px-5 py-2 bg-[#1b7f43] hover:bg-[#12572e] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit BEO Modal */}
      {isEditModalOpen && editingBeo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn"
          onClick={() => {
            setIsEditModalOpen(false);
            setEditingBeo(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-gray-100 max-h-[90vh] overflow-y-auto animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#1b7f43] px-6 py-4 flex items-center justify-between text-white rounded-t-2xl">
              <div>
                <span className="text-xs font-mono text-emerald-100 block">{editingBeo.id}</span>
                <h4 className="font-bold text-white text-sm">Edit Banquet Event Order</h4>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingBeo(null);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <form onSubmit={handleUpdateBEO} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={editingBeo.title || ''}
                  onChange={(e) => setEditingBeo({ ...editingBeo, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#1b7f43]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Customer</label>
                <input
                  type="text"
                  required
                  value={editingBeo.client || ''}
                  onChange={(e) => setEditingBeo({ ...editingBeo, client: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#1b7f43]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Venue</label>
                  <select
                    value={editingBeo.venue || 'Grand Crystal Ballroom'}
                    onChange={(e) => setEditingBeo({ ...editingBeo, venue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#1b7f43] cursor-pointer"
                  >
                    <option value="Grand Crystal Ballroom">Grand Crystal Ballroom</option>
                    <option value="Skyline Rooftop Pavilion">Skyline Rooftop Pavilion</option>
                    <option value="Royal Executive Boardroom">Royal Executive Boardroom</option>
                    <option value="Botanical Garden Terrace">Botanical Garden Terrace</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={editingBeo.status || 'Confirmed & Deposit Paid'}
                    onChange={(e) => setEditingBeo({ ...editingBeo, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#1b7f43] cursor-pointer"
                  >
                    <option value="Confirmed & Deposit Paid">Confirmed & Deposit Paid</option>
                    <option value="BEO In Preparation">BEO In Preparation</option>
                    <option value="In-Progress Live Event">In-Progress Live Event</option>
                    <option value="Completed & Invoiced">Completed & Invoiced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Schedule</label>
                  <input
                    type="text"
                    value={editingBeo.schedule || ''}
                    onChange={(e) => setEditingBeo({ ...editingBeo, schedule: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#1b7f43]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Attendance</label>
                  <input
                    type="text"
                    value={editingBeo.attendance || ''}
                    onChange={(e) => setEditingBeo({ ...editingBeo, attendance: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#1b7f43]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Catering / Menu</label>
                <input
                  type="text"
                  value={editingBeo.catering || ''}
                  onChange={(e) => setEditingBeo({ ...editingBeo, catering: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#1b7f43]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contract Total</label>
                  <input
                    type="text"
                    value={editingBeo.totalPrice || ''}
                    onChange={(e) => setEditingBeo({ ...editingBeo, totalPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#1b7f43]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Deposit Paid</label>
                  <input
                    type="text"
                    value={editingBeo.depositPaid || ''}
                    onChange={(e) => setEditingBeo({ ...editingBeo, depositPaid: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#1b7f43]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingBeo(null);
                  }}
                  className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#1b7f43] hover:bg-[#12572e] text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete BEO Confirmation Modal */}
      {deleteBeoState.isOpen && deleteBeoState.beo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn"
          onClick={() => setDeleteBeoState({ isOpen: false, beo: null })}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 p-6 space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <DeleteIcon sx={{ fontSize: 22 }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Delete Event Plan?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to permanently delete plan <span className="font-semibold text-gray-800">{deleteBeoState.beo.id}</span> (&ldquo;{deleteBeoState.beo.title}&rdquo;)? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteBeoState({ isOpen: false, beo: null })}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBEO}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal: Generate New BEO */}
      {isGenerateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn"
          onClick={() => setIsGenerateModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-gray-100 max-h-[90vh] overflow-y-auto animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#1b7f43] px-6 py-4 flex items-center justify-between text-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                <AddIcon sx={{ fontSize: 20 }} />
                <h4 className="font-bold text-white text-sm">
                  Generate New Banquet Event Order
                </h4>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                aria-label="Close"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <form onSubmit={handleCreateBEO} className="p-6 space-y-3.5 text-xs">
              {/* Event Title */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Event Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cambridge Tech Gala"
                  value={newBEO.title}
                  onChange={(e) => setNewBEO({ ...newBEO, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition"
                />
              </div>

              {/* Customer */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Customer / Organizer <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lady Clara Sterling"
                  value={newBEO.client}
                  onChange={(e) => setNewBEO({ ...newBEO, client: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition"
                />
              </div>

              {/* Venue & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Event Venue</label>
                  <select
                    value={newBEO.venue}
                    onChange={(e) => setNewBEO({ ...newBEO, venue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition cursor-pointer"
                  >
                    <option value="Grand Crystal Ballroom">Grand Crystal Ballroom</option>
                    <option value="Skyline Rooftop Pavilion">Skyline Rooftop Pavilion</option>
                    <option value="Royal Executive Boardroom">Royal Executive Boardroom</option>
                    <option value="Botanical Garden Terrace">Botanical Garden Terrace</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={newBEO.status}
                    onChange={(e) => setNewBEO({ ...newBEO, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition cursor-pointer"
                  >
                    <option value="Confirmed & Deposit Paid">Confirmed & Deposit Paid</option>
                    <option value="BEO In Preparation">BEO In Preparation</option>
                    <option value="In-Progress Live Event">In-Progress Live Event</option>
                  </select>
                </div>
              </div>

              {/* Schedule & Attendance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Date & Time</label>
                  <input
                    type="text"
                    placeholder="Nov 15, 2026 (18:00 – 23:00)"
                    value={newBEO.schedule}
                    onChange={(e) => setNewBEO({ ...newBEO, schedule: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Expected Attendance</label>
                  <input
                    type="text"
                    placeholder="250 Guests (Round Table)"
                    value={newBEO.attendance}
                    onChange={(e) => setNewBEO({ ...newBEO, attendance: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition"
                  />
                </div>
              </div>

              {/* Catering */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Food & Beverage Menu</label>
                <input
                  type="text"
                  placeholder="5-Course Plated Dinner & Open Bar"
                  value={newBEO.catering}
                  onChange={(e) => setNewBEO({ ...newBEO, catering: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition"
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Total Contract Price ($)</label>
                  <input
                    type="text"
                    placeholder="$35,000"
                    value={newBEO.totalPrice}
                    onChange={(e) => setNewBEO({ ...newBEO, totalPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Deposit Paid ($)</label>
                  <input
                    type="text"
                    placeholder="$15,000"
                    value={newBEO.depositPaid}
                    onChange={(e) => setNewBEO({ ...newBEO, depositPaid: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 flex justify-end gap-2.5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#1b7f43] hover:bg-[#12572e] text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <CircularProgress size={14} color="inherit" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    'Generate BEO'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
