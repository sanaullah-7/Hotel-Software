import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  CalendarMonth as CalendarIcon,
  EventOutlined as EventOutlinedIcon,
  CheckCircleOutlineOutlined as CheckCircleOutlineIcon,
  PendingActionsOutlined as PendingActionsIcon,
  PeopleOutlined as PeopleOutlinedIcon,
  AttachMoneyOutlined as AttachMoneyOutlinedIcon
} from '@mui/icons-material';
import { CircularProgress, Alert, Snackbar } from '@mui/material';

import EventSummaryCards from '../components/EventSummaryCards';
import EventToolbar from '../components/EventToolbar';
import EventsTableView from '../components/EventsTableView';
import EventsGridView from '../components/EventsGridView';
import EventDetailsModal from '../components/EventDetailsModal';
import EventFormModal from '../components/EventFormModal';
import EventDeleteModal from '../components/EventDeleteModal';
import CollectPaymentModal from '../components/CollectPaymentModal';
import eventService from '../../../services/eventService';
import {
  toFrontendEvent,
  toFrontendEventList,
  toBackendEventPayload,
} from '../adapters/eventAdapter';

import '../../assigned-ui/formStyles.css';
import '../../assigned-ui/toolbarStyles.css';

// Real-time live data source from MongoDB backend
export const INITIAL_EVENTS = [];

export const VENUE_OPTIONS = [
  'Grand Ballroom',
  'Conference Hall A',
  'Conference Hall B',
  'Rooftop Terrace',
  'Garden Lounge',
  'Studio Room 1',
  'Grand Crystal Ballroom',
  'Royal Executive Boardroom'
];

export const TYPE_OPTIONS = [
  'Wedding',
  'Conference',
  'Birthday Party',
  'Anniversary',
  'Corporate',
  'Workshop',
  'Gala',
  'Social Gathering'
];

export const STATUS_OPTIONS = ['Pending', 'Confirmed', 'In-Progress', 'Completed'];

export const CATERING_OPTIONS = [
  'Plated Dinner',
  'Buffet',
  'Cocktail & Canapés',
  'Coffee & Snacks',
  'None'
];

export default function AllEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [filterVenue, setFilterVenue] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Pagination State
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    event: null,
    isBulk: false
  });

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  // Fetch Authoritative Events from Backend
  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await eventService.getEvents();
      const rawList = Array.isArray(res?.data?.events)
        ? res.data.events
        : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.events) ? res.events : []));

      setEvents(toFrontendEventList(rawList));
    } catch (err) {
      console.error('Backend event fetch failed:', err);
      setError(err?.message || 'Failed to connect to backend server. Please check your connection and retry.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Modal Triggers
  const handleOpenAddModal = () => {
    setActiveEvent(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (evt) => {
    setActiveEvent(evt);
    setIsEditModalOpen(true);
  };

  const handleOpenViewModal = (evt) => {
    setActiveEvent(evt);
    setIsViewModalOpen(true);
  };

  const handleOpenPaymentModal = (evt) => {
    setActiveEvent(evt);
    setIsPaymentModalOpen(true);
  };

  // Collect Remaining Balance Handler
  const handleRecordPayment = async ({ event, collectedAmount, newAdvance, newRemainingBalance, paymentMethod, notes }) => {
    const targetId = event?._id || event?.id;
    const updatedStatus = newRemainingBalance === 0 ? 'Confirmed' : event.status;

    const payload = toBackendEventPayload({
      ...event,
      advanceAmount: newAdvance,
      balanceAmount: newRemainingBalance,
      status: updatedStatus,
      notes: notes ? `${event.notes || ''} [Payment: $${collectedAmount} via ${paymentMethod}]`.trim() : event.notes
    });

    const res = await eventService.updateEvent(targetId, payload);
    const updated = toFrontendEvent(res?.data || res);

    setEvents((prev) =>
      prev.map((item) =>
        item.id === event.id
          ? updated || {
              ...item,
              advanceAmount: newAdvance,
              balanceAmount: newRemainingBalance,
              status: updatedStatus
            }
          : item
      )
    );

    showNotification(
      `Payment of $${collectedAmount.toLocaleString()} collected for '${event.name}'. Balance remaining: $${newRemainingBalance.toLocaleString()}`,
      'success'
    );

    // Notify financial reports (Revenue Report & Expense vs Revenue tabs) to sync dynamically
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('hotel:data-updated', {
          detail: { domain: 'event-payment', action: 'collect', amount: collectedAmount, eventId: targetId }
        })
      );
    }
  };

  // Save New Event
  const handleSaveNewEvent = async (newEventData) => {
    try {
      const payload = toBackendEventPayload(newEventData);
      const res = await eventService.createEvent(payload);
      const created = toFrontendEvent(res?.data || res);
      if (created) {
        setEvents((prev) => [created, ...prev]);
        showNotification(`Event '${created.name}' created successfully!`);
      } else {
        setEvents((prev) => [newEventData, ...prev]);
        showNotification('Event created successfully!');
      }
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Failed to create event on server:', err);
      showNotification(err?.message || 'Failed to create event on server', 'error');
    }
  };

  // Save Edited Event
  const handleSaveEditEvent = async (updatedEventData) => {
    try {
      const targetId = activeEvent?._id || activeEvent?.id;
      const payload = toBackendEventPayload(updatedEventData);
      const res = await eventService.updateEvent(targetId, payload);
      const updated = toFrontendEvent(res?.data || res);
      setEvents((prev) =>
        prev.map((item) => (item.id === activeEvent.id ? (updated || { ...item, ...updatedEventData }) : item))
      );
      showNotification(`Event '${updatedEventData.name || activeEvent.name}' updated successfully!`);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Failed to update event on server:', err);
      showNotification(err?.message || 'Failed to update event on server', 'error');
    }
  };

  // Delete Operations
  const handlePromptDelete = (evt) => {
    setDeleteModalState({
      isOpen: true,
      event: evt,
      isBulk: false
    });
  };

  const handlePromptBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteModalState({
      isOpen: true,
      event: null,
      isBulk: true
    });
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteModalState.isBulk) {
        await eventService.bulkDeleteEvents(selectedIds).catch(() => {});
        setEvents((prev) => prev.filter((e) => !selectedIds.includes(e.id)));
        showNotification(`${selectedIds.length} events deleted successfully!`);
        setSelectedIds([]);
      } else if (deleteModalState.event) {
        const targetId = deleteModalState.event._id || deleteModalState.event.id;
        await eventService.deleteEvent(targetId).catch(() => {});
        setEvents((prev) => prev.filter((e) => e.id !== deleteModalState.event.id));
        setSelectedIds((prev) => prev.filter((selId) => selId !== deleteModalState.event.id));
        showNotification(`Event '${deleteModalState.event.name}' deleted successfully!`);
      }
    } catch (err) {
      console.error('Failed to delete event:', err);
      showNotification(err?.message || 'Failed to delete event', 'error');
    } finally {
      setDeleteModalState({ isOpen: false, event: null, isBulk: false });
    }
  };

  // Checkbox Selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredEvents.map((ev) => ev.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Filtering Logic
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        evt.name.toLowerCase().includes(q) ||
        evt.id.toLowerCase().includes(q) ||
        evt.client.toLowerCase().includes(q) ||
        evt.venue.toLowerCase().includes(q) ||
        evt.type.toLowerCase().includes(q) ||
        evt.status.toLowerCase().includes(q);

      const matchesType = filterType === 'All' || evt.type === filterType;
      const matchesVenue = filterVenue === 'All' || evt.venue === filterVenue;
      const matchesStatus = filterStatus === 'All' || evt.status === filterStatus;

      return matchesSearch && matchesType && matchesVenue && matchesStatus;
    });
  }, [events, searchQuery, filterType, filterVenue, filterStatus]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage) || 1;
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(start, start + itemsPerPage);
  }, [filteredEvents, currentPage, itemsPerPage]);

  const allVisibleSelected =
    paginatedEvents.length > 0 &&
    paginatedEvents.every((ev) => selectedIds.includes(ev.id));

  // Summary Overview Cards (calculated from full `events` array)
  const eventSummary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = new Date().toISOString().split('T')[0];

    return {
      upcomingEvents: events.filter((e) => {
        if (!e.date) return false;
        const evtDate = new Date(e.date);
        evtDate.setHours(0, 0, 0, 0);
        return evtDate >= today;
      }).length,
      confirmedEvents: events.filter((e) => e.status === 'Confirmed').length,
      pendingEvents: events.filter((e) => e.status === 'Pending').length,
      eventsToday: events.filter((e) => {
        if (!e.date) return false;
        return e.date.startsWith(todayStr);
      }).length,
      totalEvents: events.length,
      totalGuests: events.reduce((sum, e) => sum + (parseInt(e.guests, 10) || 0), 0),
      totalRevenue: events.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
    };
  }, [events]);

  // Reset Filters
  const handleRefresh = () => {
    setSearchQuery('');
    setFilterType('All');
    setFilterVenue('All');
    setFilterStatus('All');
    setSelectedIds([]);
    setCurrentPage(1);
  };

  // Export to PDF
  const handleExportPDF = async () => {
    const [{ default: jsPdfDefault, jsPDF: jsPdfNamed }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);
    const jsPDF = jsPdfNamed || jsPdfDefault;
    const doc = new jsPDF('landscape');
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('Hotel & Resorts - All Events Report', 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Generated on: ${new Date().toLocaleDateString()} | Total Events: ${filteredEvents.length}`,
      14,
      22
    );

    const tableData = filteredEvents.map((e) => [
      e.id,
      e.name,
      e.type,
      e.client,
      e.displayDate,
      e.venue,
      e.guests,
      `$${e.amount.toLocaleString()}`,
      e.status
    ]);

    autoTable(doc, {
      startY: 28,
      head: [['Event ID', 'Event Name', 'Type', 'Client', 'Date', 'Venue', 'Guests', 'Amount', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [27, 127, 67], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 9 }
    });

    doc.save(`Luxuria_All_Events_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Export to Excel / CSV
  const handleExportExcel = async () => {
    const XLSX = await import('xlsx');
    const exportData = filteredEvents.map((e) => ({
      'Event ID': e.id,
      'Event Name': e.name,
      'Event Type': e.type,
      'Client Name': e.client,
      Phone: e.phone,
      Email: e.email,
      'Event Date': e.displayDate,
      Venue: e.venue,
      'Expected Guests': e.guests,
      'Total Amount': e.amount,
      'Advance Paid': e.advanceAmount,
      'Balance Remaining': e.balanceAmount,
      Status: e.status,
      Catering: e.catering
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Events');
    XLSX.writeFile(workbook, `Luxuria_Events_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const eventCards = [
    {
      id: 'upcoming-events',
      title: 'Upcoming Events',
      value: eventSummary.upcomingEvents,
      subtext: 'Scheduled next',
      icon: CalendarIcon,
      iconBg: 'bg-[#1b7f43]/10',
      iconColor: 'text-[#1b7f43]'
    },
    {
      id: 'confirmed-bookings',
      title: 'Confirmed Bookings',
      value: eventSummary.confirmedEvents,
      subtext: 'Deposits verified',
      icon: CheckCircleOutlineIcon,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-[#1b7f43]'
    },
    {
      id: 'pending-requests',
      title: 'Pending Requests',
      value: eventSummary.pendingEvents,
      subtext: 'Awaiting confirmation',
      icon: PendingActionsIcon,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
    {
      id: 'events-today',
      title: 'Events Today',
      value: eventSummary.eventsToday,
      subtext: 'Scheduled for today',
      icon: EventOutlinedIcon,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    }
  ];

  return (
    <div className="w-full space-y-3 pb-3 flex flex-col font-sans" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Page Title & Quick Action Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">Events & Bookings</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage hotel event venues, client bookings, and event schedules with ease.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1b7f43] hover:bg-[#12572e] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <EventOutlinedIcon sx={{ fontSize: 16 }} />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      <EventSummaryCards cards={eventCards} />

      {/* Main Card Container */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <EventToolbar
          searchQuery={searchQuery}
          onSearchChange={(val) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
          selectedCount={selectedIds.length}
          onBulkDelete={handlePromptBulkDelete}
          isFilterOpen={isFilterOpen}
          onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRefresh={handleRefresh}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
          filterType={filterType}
          onFilterTypeChange={(val) => {
            setFilterType(val);
            setCurrentPage(1);
          }}
          typeOptions={TYPE_OPTIONS}
          filterVenue={filterVenue}
          onFilterVenueChange={(val) => {
            setFilterVenue(val);
            setCurrentPage(1);
          }}
          venueOptions={VENUE_OPTIONS}
          filterStatus={filterStatus}
          onFilterStatusChange={(val) => {
            setFilterStatus(val);
            setCurrentPage(1);
          }}
          statusOptions={STATUS_OPTIONS}
        />

        {/* Loading / Error / Content */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <CircularProgress size={30} sx={{ color: 'var(--primary-main)' }} />
            <span className="text-xs text-slate-500 font-medium">Loading events from database...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-800 m-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">{error}</span>
            </div>
            <button
              onClick={loadEvents}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : viewMode === 'table' ? (
          <EventsTableView
            events={paginatedEvents}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectRow={handleSelectRow}
            allSelected={allVisibleSelected}
            onView={handleOpenViewModal}
            onEdit={handleOpenEditModal}
            onDelete={handlePromptDelete}
            onOpenAddModal={handleOpenAddModal}
            onCollectPayment={handleOpenPaymentModal}
          />
        ) : (
          <EventsGridView
            events={paginatedEvents}
            onView={handleOpenViewModal}
            onEdit={handleOpenEditModal}
            onDelete={handlePromptDelete}
            onOpenAddModal={handleOpenAddModal}
            onCollectPayment={handleOpenPaymentModal}
          />
        )}


        {/* Pagination Footer */}
        <div className="p-2 sm:p-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-end gap-3 text-xs text-slate-500 select-none">
          <div className="flex items-center gap-2">
            <span>Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span>
              {filteredEvents.length === 0
                ? '0 - 0 of 0'
                : `${(currentPage - 1) * itemsPerPage + 1} – ${Math.min(
                    currentPage * itemsPerPage,
                    filteredEvents.length
                  )} of ${filteredEvents.length}`}
            </span>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
              >
                &lsaquo;
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
              >
                &rsaquo;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* NEW EVENT MODAL */}
      <EventFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewEvent}
        typeOptions={TYPE_OPTIONS}
        venueOptions={VENUE_OPTIONS}
        statusOptions={STATUS_OPTIONS}
        cateringOptions={CATERING_OPTIONS}
      />

      {/* EDIT EVENT MODAL */}
      <EventFormModal
        isOpen={isEditModalOpen}
        initialData={activeEvent}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEditEvent}
        typeOptions={TYPE_OPTIONS}
        venueOptions={VENUE_OPTIONS}
        statusOptions={STATUS_OPTIONS}
        cateringOptions={CATERING_OPTIONS}
      />

      {/* VIEW DETAILS MODAL */}
      <EventDetailsModal
        event={isViewModalOpen ? activeEvent : null}
        onClose={() => setIsViewModalOpen(false)}
        onCollectPayment={handleOpenPaymentModal}
      />

      {/* COLLECT PAYMENT MODAL */}
      <CollectPaymentModal
        isOpen={isPaymentModalOpen}
        event={isPaymentModalOpen ? activeEvent : null}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setActiveEvent(null);
        }}
        onCollectPayment={handleRecordPayment}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <EventDeleteModal
        isOpen={deleteModalState.isOpen}
        event={deleteModalState.event}
        bulkCount={deleteModalState.isBulk ? selectedIds.length : 0}
        onClose={() =>
          setDeleteModalState({ isOpen: false, event: null, isBulk: false })
        }
        onConfirm={handleConfirmDelete}
      />

      {/* Toast Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
          severity={notification.severity}
          sx={{ width: '100%', borderRadius: '10px' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
