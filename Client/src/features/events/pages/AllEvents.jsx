import React, { useState, useMemo } from 'react';
import {
  CalendarMonth as CalendarIcon,
  EventOutlined as EventOutlinedIcon,
  CheckCircleOutlineOutlined as CheckCircleOutlineIcon,
  PendingActionsOutlined as PendingActionsIcon,
  PeopleOutlined as PeopleOutlinedIcon,
  AttachMoneyOutlined as AttachMoneyOutlinedIcon
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import EventSummaryCards from '../components/EventSummaryCards';
import EventToolbar from '../components/EventToolbar';
import EventsTableView from '../components/EventsTableView';
import EventsGridView from '../components/EventsGridView';
import EventDetailsModal from '../components/EventDetailsModal';
import EventFormModal from '../components/EventFormModal';
import EventDeleteModal from '../components/EventDeleteModal';

import '../../assigned-ui/formStyles.css';
import '../../assigned-ui/toolbarStyles.css';

// Initial Event Data
export const INITIAL_EVENTS = [
  {
    id: 'EVT31232CFL',
    name: 'Johnson Wedding',
    type: 'Wedding',
    client: 'Sarah Johnson',
    phone: '+1 (555) 234-5678',
    email: 'sarah.j@example.com',
    date: '2024-01-15',
    displayDate: '01/15/2024',
    startTime: '16:00',
    endTime: '23:00',
    venue: 'Grand Ballroom',
    guests: 150,
    amount: 15000,
    advanceAmount: 8000,
    balanceAmount: 7000,
    catering: 'Plated Dinner',
    status: 'Confirmed',
    specialRequests: 'Pastel floral table centrepieces and white carpet aisle.',
    notes: 'Bride requested Grand Piano entrance accompaniment.'
  },
  {
    id: 'EVT3123I1K2',
    name: 'Tech Conference 2024',
    type: 'Conference',
    client: 'TechCorp Ltd',
    phone: '+1 (555) 876-5432',
    email: 'events@techcorp.io',
    date: '2024-01-20',
    displayDate: '01/20/2024',
    startTime: '09:00',
    endTime: '18:00',
    venue: 'Conference Hall A',
    guests: 200,
    amount: 25000,
    advanceAmount: 15000,
    balanceAmount: 10000,
    catering: 'Buffet',
    status: 'Confirmed',
    specialRequests: 'High-speed dedicated Wi-Fi access and live webcast rig.',
    notes: 'Dual 4K laser projectors and 8 wireless lapel mics.'
  },
  {
    id: 'EVT31230X5B',
    name: 'Birthday Celebration',
    type: 'Birthday Party',
    client: 'Mike Wilson',
    phone: '+1 (555) 345-6789',
    email: 'mike.wilson@email.com',
    date: '2024-01-25',
    displayDate: '01/25/2024',
    startTime: '19:00',
    endTime: '00:00',
    venue: 'Rooftop Terrace',
    guests: 50,
    amount: 8000,
    advanceAmount: 4000,
    balanceAmount: 4000,
    catering: 'Cocktail & Canapés',
    status: 'Pending',
    specialRequests: 'Custom Belgian chocolate fountain and DJ booth setup.',
    notes: 'Outdoor fire pits and heated lamps on patio.'
  },
  {
    id: 'EVT3123D2FW',
    name: 'Anderson Anniversary',
    type: 'Anniversary',
    client: 'Laura Anderson',
    phone: '+1 (555) 456-7890',
    email: 'laura.a@andersonlaw.com',
    date: '2024-02-10',
    displayDate: '02/10/2024',
    startTime: '18:30',
    endTime: '22:30',
    venue: 'Garden Lounge',
    guests: 80,
    amount: 12000,
    advanceAmount: 12000,
    balanceAmount: 0,
    catering: 'Plated Dinner',
    status: 'Confirmed',
    specialRequests: 'Silver theme decorations for 25th wedding anniversary.',
    notes: 'String quartet booked for arrival reception.'
  },
  {
    id: 'EVT3123YHOW',
    name: 'Startup Pitch Night',
    type: 'Corporate',
    client: 'InnovateX',
    phone: '+1 (555) 567-8901',
    email: 'pitch@innovatex.co',
    date: '2024-03-05',
    displayDate: '03/05/2024',
    startTime: '17:00',
    endTime: '21:30',
    venue: 'Conference Hall B',
    guests: 120,
    amount: 10000,
    advanceAmount: 5000,
    balanceAmount: 5000,
    catering: 'Coffee & Snacks',
    status: 'Pending',
    specialRequests: 'Pitch podium with countdown timer display.',
    notes: '6 demo table stations with power strips.'
  },
  {
    id: 'EVT3123MM1I',
    name: "Children's Art Workshop",
    type: 'Workshop',
    client: 'Creative Kids',
    phone: '+1 (555) 678-9012',
    email: 'art@creativekids.org',
    date: '2024-03-12',
    displayDate: '03/12/2024',
    startTime: '10:00',
    endTime: '14:00',
    venue: 'Studio Room 1',
    guests: 40,
    amount: 4000,
    advanceAmount: 4000,
    balanceAmount: 0,
    catering: 'Coffee & Snacks',
    status: 'Completed',
    specialRequests: 'Washable table covers and extra clean-up bins.',
    notes: 'Studio 1 sinks prepped with art wash equipment.'
  }
];

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
  const [events, setEvents] = useState(INITIAL_EVENTS);
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
  const [activeEvent, setActiveEvent] = useState(null);
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    event: null,
    isBulk: false
  });

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

  // Save New Event
  const handleSaveNewEvent = (newEventData) => {
    setEvents((prev) => [newEventData, ...prev]);
    setIsAddModalOpen(false);
  };

  // Save Edited Event
  const handleSaveEditEvent = (updatedEventData) => {
    setEvents((prev) =>
      prev.map((item) => (item.id === activeEvent.id ? { ...item, ...updatedEventData } : item))
    );
    setIsEditModalOpen(false);
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

  const handleConfirmDelete = () => {
    if (deleteModalState.isBulk) {
      setEvents((prev) => prev.filter((e) => !selectedIds.includes(e.id)));
      setSelectedIds([]);
    } else if (deleteModalState.event) {
      const targetId = deleteModalState.event.id;
      setEvents((prev) => prev.filter((e) => e.id !== targetId));
      setSelectedIds((prev) => prev.filter((selId) => selId !== targetId));
    }
    setDeleteModalState({ isOpen: false, event: null, isBulk: false });
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

  // Summary Cards (calculated from full `events` array)
  const eventSummary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      totalEvents: events.length,
      confirmedEvents: events.filter((e) => e.status === 'Confirmed').length,
      pendingEvents: events.filter((e) => e.status === 'Pending').length,
      upcomingEvents: events.filter((e) => {
        if (!e.date) return false;
        const evtDate = new Date(e.date);
        evtDate.setHours(0, 0, 0, 0);
        return evtDate >= today;
      }).length,
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
  const handleExportPDF = () => {
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
  const handleExportExcel = () => {
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
      id: 'total-events',
      title: 'Total Events',
      value: eventSummary.totalEvents,
      subtext: 'All registered',
      icon: EventOutlinedIcon,
      iconBg: 'bg-[var(--primary-main)]/10',
      iconColor: 'text-[var(--primary-main)]'
    },
    {
      id: 'confirmed',
      title: 'Confirmed',
      value: eventSummary.confirmedEvents,
      subtext: 'Bookings',
      icon: CheckCircleOutlineIcon,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      id: 'pending',
      title: 'Pending',
      value: eventSummary.pendingEvents,
      subtext: 'Awaiting confirm',
      icon: PendingActionsIcon,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
    {
      id: 'upcoming',
      title: 'Upcoming',
      value: eventSummary.upcomingEvents,
      subtext: 'Scheduled',
      icon: CalendarIcon,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      id: 'guests',
      title: 'Expected Guests',
      value: eventSummary.totalGuests.toLocaleString(),
      subtext: 'Total attendees',
      icon: PeopleOutlinedIcon,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    },
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: `$${eventSummary.totalRevenue.toLocaleString()}`,
      subtext: 'Contract value',
      icon: AttachMoneyOutlinedIcon,
      iconBg: 'bg-[var(--primary-main)]/10',
      iconColor: 'text-[var(--primary-main)]'
    }
  ];

  return (
    <div className="assigned-form-surface w-full p-0">
      <EventSummaryCards cards={eventCards} />

      {/* Main Card Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
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

        {/* View Mode: Table View */}
        {viewMode === 'table' ? (
          <EventsTableView
            events={paginatedEvents}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectRow={handleSelectRow}
            allSelected={allVisibleSelected}
            onView={handleOpenViewModal}
            onEdit={handleOpenEditModal}
            onDelete={handlePromptDelete}
          />
        ) : (
          /* View Mode: Grid View */
          <EventsGridView
            events={paginatedEvents}
            onView={handleOpenViewModal}
            onEdit={handleOpenEditModal}
            onDelete={handlePromptDelete}
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
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
              >
                &lsaquo;
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
    </div>
  );
}
