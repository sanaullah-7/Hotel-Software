import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search as SearchIcon,
  MeetingRoom as RoomIcon,
  Login as CheckInIcon,
  PointOfSale as RestaurantIcon,
  Celebration as EventsIcon,
  AccountBalance as FinanceIcon,
  Security as SecurityIcon,
  Inventory as HousekeepingIcon,
  Person as GuestIcon,
  GridView as DashboardIcon,
  LocalMall as InventoryIcon,
  People as HRIcon,
  BarChart as ReportsIcon,
  Settings as SettingsIcon,
  HistoryToggleOff as AuditIcon,
  AutoAwesome as AssistantIcon,
  Laptop as FrontOfficeIcon,
  EventNote as ReservationIcon,
  Payments as RatesPricingIcon,
  LocalParking as CarParkingIcon,
  Close as CloseIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';

import { quickSearchService } from '../../services/quickSearchService';

export const STATIC_ACTIONS = [
  {
    id: 'a0',
    category: 'ACTIONS',
    title: 'Create New Reservation',
    description: 'Book a new room for a guest arrival',
    tag: 'Booking',
    tagColor: 'bg-emerald-100 text-emerald-700',
    icon: ReservationIcon,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
    path: '/reservation/new',
  },
  {
    id: 'a1',
    category: 'ACTIONS',
    title: 'Fast Front Desk Check-in',
    description: 'Rapid 30-second walk-in reservation, keycard & check-in',
    tag: 'Front Desk',
    tagColor: 'bg-emerald-100 text-emerald-700',
    icon: CheckInIcon,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
    path: '/front-office/check-in-out?express=true',
  },
  {
    id: 'a_express',
    category: 'ACTIONS',
    title: 'Express Check-In',
    description: 'Instant 30-second guest lookup, room assignment & check-in',
    tag: 'Express',
    tagColor: 'bg-teal-100 text-teal-800',
    icon: CheckInIcon,
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-50',
    path: '/front-office/check-in-out?express=true',
  },
  {
    id: 'a_shift',
    category: 'ACTIONS',
    title: 'Open Shift & Cash Handover',
    description: 'Manage cash drawer, blind counts, and cashier shift handover',
    tag: 'Cash Shift',
    tagColor: 'bg-emerald-100 text-emerald-700',
    icon: FinanceIcon,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
    path: '/payment-billing/shift-handover',
  },
  {
    id: 'a2',
    category: 'ACTIONS',
    title: 'New Table Order & POS Charge',
    description: 'Fire KOT ticket to kitchen and post to guest folio',
    tag: 'Restaurant',
    tagColor: 'bg-indigo-100 text-indigo-700',
    icon: RestaurantIcon,
    iconColor: 'text-indigo-500',
    iconBg: 'bg-indigo-50',
    path: '/restaurant',
  },
  {
    id: 'a3',
    category: 'ACTIONS',
    title: 'Generate Banquet Event Order (BEO)',
    description: 'Book ballroom or terrace venue for gala / wedding',
    tag: 'Events',
    tagColor: 'bg-purple-100 text-purple-700',
    icon: EventsIcon,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-50',
    path: '/events',
  },
  {
    id: 'a4',
    category: 'ACTIONS',
    title: 'Daily Night Audit & Date Roll (Phase 5)',
    description: 'Automated date-roll and multi-folio audit wizard is scheduled for Phase 5',
    tag: 'Phase 5',
    tagColor: 'bg-amber-100 text-amber-800',
    icon: AuditIcon,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50',
    disabled: true,
    disabledReason: 'Automated Night Audit date-roll wizard is scheduled for Phase 5.',
    path: null,
  },
  {
    id: 'a5',
    category: 'ACTIONS',
    title: 'Log Security Anomaly & Keycard Override',
    description: 'Report unauthorized access or rate discount bypass',
    tag: 'Security',
    tagColor: 'bg-rose-100 text-rose-700',
    icon: SecurityIcon,
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-50',
    path: '/reports',
  },
  {
    id: 'a6',
    category: 'ACTIONS',
    title: 'Restock Linen & Consumables PO',
    description: 'Create purchase order for Egyptian cotton sheets or bathrobes',
    tag: 'Housekeeping',
    tagColor: 'bg-cyan-100 text-cyan-700',
    icon: HousekeepingIcon,
    iconColor: 'text-cyan-500',
    iconBg: 'bg-cyan-50',
    path: '/housekeeping/rooms-cleaning',
  },
];

export const STATIC_NAVIGATION = [
  {
    id: 'n1',
    category: 'NAVIGATION',
    title: 'Dashboard',
    description: 'Main ERP overview and key metrics',
    tag: 'Home',
    tagColor: 'bg-gray-100 text-gray-700',
    icon: DashboardIcon,
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-50',
    path: '/dashboard',
  },
  {
    id: 'n2',
    category: 'NAVIGATION',
    title: 'Visual Floor Plan & Room Grid (Occupancy)',
    description: 'Multi-floor building visualizer, live occupancy, room statuses',
    tag: 'Rooms',
    tagColor: 'bg-gray-100 text-gray-700',
    icon: DashboardIcon,
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-50',
    path: '/occupancy',
  },
  {
    id: 'n3',
    category: 'NAVIGATION',
    title: 'Front Office & Check-in',
    description: 'Manage arrivals, departures, and operations alerts',
    tag: 'Front Desk',
    tagColor: 'bg-gray-100 text-gray-700',
    icon: FrontOfficeIcon,
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-50',
    path: '/front-office/check-in-out',
  },
  {
    id: 'n4',
    category: 'NAVIGATION',
    title: 'Reservations & Bookings',
    description: 'All reservations, history, and group bookings',
    tag: 'Booking',
    tagColor: 'bg-gray-100 text-gray-700',
    icon: ReservationIcon,
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-50',
    path: '/reservation/all',
  },
  {
    id: 'n5',
    category: 'NAVIGATION',
    title: 'Room Management',
    description: 'Room types, individual room status, and settings',
    tag: 'Rooms',
    tagColor: 'bg-gray-100 text-gray-700',
    icon: RoomIcon,
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-50',
    path: '/rooms',
  },
  {
    id: 'n6',
    category: 'NAVIGATION',
    title: 'Guest Profiles',
    description: 'Guest directory, feedback, and history',
    tag: 'Guests',
    tagColor: 'bg-gray-100 text-gray-700',
    icon: GuestIcon,
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-50',
    path: '/guests',
  },
  {
    id: 'n6b',
    category: 'NAVIGATION',
    title: 'Car Parking',
    description: 'Manage hotel parking spaces and car check-ins',
    tag: 'Facilities',
    tagColor: 'bg-gray-100 text-gray-700',
    icon: CarParkingIcon,
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-50',
    path: '/car-parking',
  },
  {
    id: 'n7',
    category: 'NAVIGATION',
    title: 'Housekeeping',
    description: 'Room cleaning schedule, lost and found, inspections',
    tag: 'Housekeeping',
    tagColor: 'bg-gray-100 text-gray-700',
    icon: HousekeepingIcon,
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-50',
    path: '/housekeeping/rooms-cleaning',
  },
  {
    id: 'n8',
    category: 'NAVIGATION',
    title: 'Inventory & Stock',
    description: 'Consumables, guest charges, and missing items',
    tag: 'Inventory',
    tagColor: 'bg-gray-100 text-gray-700',
    icon: InventoryIcon,
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-50',
    path: '/inventory',
  },
  {
    id: 'n9',
    category: 'NAVIGATION',
    title: 'Restaurant POS & Table Ordering Terminal',
    description: 'Touch menu, table floor plan, KOT firing, guest folio charge',
    tag: 'Restaurant',
    tagColor: 'bg-gray-100 text-gray-700',
    icon: RestaurantIcon,
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-50',
    path: '/restaurant',
  },
  {
    id: 'n10',
    category: 'NAVIGATION',
    title: 'Grand Banquet, Wedding & Event Manager',
    description: 'BEO studio, multi-venue function diary, catering packages',
    tag: 'Events',
    tagColor: 'bg-gray-100 text-gray-700',
    icon: EventsIcon,
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-50',
    path: '/events',
  },
  {
    id: 'n11',
    category: 'NAVIGATION',
    title: 'Rates & Pricing',
    description: 'Rate plans, discounts, taxes & fees',
    tag: 'Finance',
    tagColor: 'bg-gray-100 text-gray-700',
    icon: RatesPricingIcon,
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-50',
    path: '/rates-pricing/rate-plans',
  },
  {
    id: 'n12',
    category: 'NAVIGATION',
    title: 'Payment & Billing',
    description: 'Invoices, payment history, and refunds',
    tag: 'Finance',
    tagColor: 'bg-gray-100 text-gray-700',
    icon: FinanceIcon,
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-50',
    path: '/payment-billing/invoices',
  },
  {
    id: 'n13',
    category: 'NAVIGATION',
    title: 'Human Resources (HR)',
    description: 'Staff directory, attendance, payroll, shifts',
    tag: 'HR',
    tagColor: 'bg-gray-100 text-gray-700',
    icon: HRIcon,
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-50',
    path: '/hr/staff',
  },
  {
    id: 'n14',
    category: 'NAVIGATION',
    title: 'Reports & Analytics',
    description: 'Financial statements, night audit, occupancy stats',
    tag: 'Reports',
    tagColor: 'bg-gray-100 text-gray-700',
    icon: ReportsIcon,
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-50',
    path: '/reports',
  },
  {
    id: 'n15',
    category: 'NAVIGATION',
    title: 'Hotel Settings',
    description: 'Configuration, POS setup, user roles',
    tag: 'Settings',
    tagColor: 'bg-gray-100 text-gray-700',
    icon: SettingsIcon,
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-50',
    path: '/settings',
  },
  {
    id: 'n16',
    category: 'NAVIGATION',
    title: 'Audit Log & Security Center',
    description: 'System access monitor, override traces, activity logs',
    tag: 'Security',
    tagColor: 'bg-gray-100 text-gray-700',
    icon: AuditIcon,
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-50',
    path: '/audit-log',
  },
  {
    id: 'n17',
    category: 'NAVIGATION',
    title: 'AI Assistant',
    description: 'Smart hotel management insights and automation',
    tag: 'Assistant',
    tagColor: 'bg-gray-100 text-gray-700',
    icon: AssistantIcon,
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-50',
    path: '/ai-assistant',
  },
];

/**
 * Checks whether an element is an input, textarea, select, or contenteditable
 * outside of the command palette dialog.
 */
function isUnrelatedEditableElement(el, paletteRef) {
  if (!el || typeof el !== 'object') return false;
  if (paletteRef?.current && paletteRef.current.contains(el)) {
    return false;
  }
  const tagName = el.tagName ? el.tagName.toUpperCase() : '';
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    Boolean(el.isContentEditable)
  );
}

export default function CommandPalette({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  onOpen: controlledOnOpen,
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({ rooms: [], guests: [], reservations: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);
  const latestRequestIdRef = useRef(0);
  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const itemRefs = useRef([]);

  const navigate = useNavigate();

  const handleOpen = useCallback(() => {
    if (controlledOnOpen) controlledOnOpen();
    if (!isControlled) setInternalIsOpen(true);
  }, [controlledOnOpen, isControlled]);

  const handleClose = useCallback(() => {
    if (controlledOnClose) controlledOnClose();
    if (!isControlled) setInternalIsOpen(false);
  }, [controlledOnClose, isControlled]);

  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const handleCloseRef = useRef(handleClose);
  handleCloseRef.current = handleClose;
  const handleOpenRef = useRef(handleOpen);
  handleOpenRef.current = handleOpen;

  // Single global keyboard listener for Ctrl+K, Cmd+K, and Escape
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const isCmdK = (e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K');
      if (isCmdK) {
        if (isUnrelatedEditableElement(e.target, modalRef)) {
          return;
        }
        e.preventDefault();
        if (isOpenRef.current) {
          handleCloseRef.current();
        } else {
          handleOpenRef.current();
        }
        return;
      }

      if (e.key === 'Escape' && isOpenRef.current) {
        e.preventDefault();
        handleCloseRef.current();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  // Focus management and cleanup on open/close
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      setSearchTerm('');
      setSearchResults({ rooms: [], guests: [], reservations: [] });
      setError(null);
      setNotice(null);
      setIsLoading(false);
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen]);

  // Execute debounced Quick Search when query length >= 2
  const executeSearch = useCallback((queryToSearch) => {
    const trimmed = (queryToSearch || '').trim();

    if (trimmed.length < 2) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      setIsLoading(false);
      setError(null);
      setSearchResults({ rooms: [], guests: [], reservations: [] });
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const requestId = ++latestRequestIdRef.current;

    setIsLoading(true);
    setError(null);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await quickSearchService.quickSearch(trimmed, 5, {
          signal: controller.signal,
        });

        if (requestId === latestRequestIdRef.current) {
          const payload = response?.data || response || {};
          setSearchResults({
            rooms: Array.isArray(payload.rooms) ? payload.rooms : [],
            guests: Array.isArray(payload.guests) ? payload.guests : [],
            reservations: Array.isArray(payload.reservations) ? payload.reservations : [],
          });
          setIsLoading(false);
          setError(null);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          return;
        }
        if (requestId === latestRequestIdRef.current) {
          setIsLoading(false);
          setError(err.message || 'Error executing search. Please try again.');
        }
      }
    }, 250);
  }, []);

  useEffect(() => {
    if (isOpen) {
      executeSearch(searchTerm);
    }
  }, [searchTerm, isOpen, executeSearch]);

  // Transform backend rooms, guests, reservations & static commands into display items
  const { flatResults, groupedResults } = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    // 1. Backend Rooms mapping
    const roomItems = searchResults.rooms.map((r) => ({
      id: `room-${r.id || r.room_number}`,
      category: 'ROOMS',
      title: `Room ${r.room_number}`,
      description: `${r.room_type_name || 'Room'} • Floor ${r.floor || '—'} • ${r.status || ''}${r.housekeeping_status ? ` (${r.housekeeping_status})` : ''}`,
      tag: r.status || 'ROOM',
      tagColor:
        r.status === 'AVAILABLE'
          ? 'bg-emerald-100 text-emerald-800'
          : r.status === 'OCCUPIED'
          ? 'bg-blue-100 text-blue-800'
          : 'bg-amber-100 text-amber-800',
      icon: RoomIcon,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50',
      path: '/rooms',
      raw: r,
    }));

    // 2. Backend Guests mapping (phone & CNIC already masked by backend)
    const guestItems = searchResults.guests.map((g) => ({
      id: `guest-${g.id || g.guest_ref}`,
      category: 'GUESTS',
      title: g.full_name || `${g.first_name || ''} ${g.last_name || ''}`.trim() || g.guest_ref || 'Guest',
      description: [
        g.guest_ref,
        g.phone ? `Phone: ${g.phone}` : null,
        g.national_id ? `CNIC: ${g.national_id}` : null,
      ]
        .filter(Boolean)
        .join(' • '),
      tag: g.vip_status ? 'VIP Guest' : 'Guest',
      tagColor: g.vip_status ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-700',
      icon: GuestIcon,
      iconColor: g.vip_status ? 'text-amber-500' : 'text-indigo-500',
      iconBg: g.vip_status ? 'bg-amber-50' : 'bg-indigo-50',
      path: `/guests/${g.id}`,
      raw: g,
    }));

    // 3. Backend Reservations mapping
    const reservationItems = searchResults.reservations.map((res) => ({
      id: `res-${res.id || res.booking_ref}`,
      category: 'RESERVATIONS',
      title: `Booking ${res.booking_ref}`,
      description: [
        res.guest_name ? `Guest: ${res.guest_name}` : null,
        res.room_numbers && res.room_numbers.length > 0 ? `Room: ${res.room_numbers.join(', ')}` : null,
        res.status ? `Status: ${res.status}` : null,
      ]
        .filter(Boolean)
        .join(' • '),
      tag: res.status || 'RESERVATION',
      tagColor:
        res.status === 'CONFIRMED'
          ? 'bg-emerald-100 text-emerald-800'
          : res.status === 'CHECKED_IN'
          ? 'bg-blue-100 text-blue-800'
          : 'bg-purple-100 text-purple-700',
      icon: ReservationIcon,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-50',
      path: `/reservation/edit/${res.id}`,
      raw: res,
    }));

    // Filter static commands and navigation based on query text
    const filterStatic = (items) => {
      if (!query) return items;
      return items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tag.toLowerCase().includes(query)
      );
    };

    const matchingActions = filterStatic(STATIC_ACTIONS);
    const matchingNavigation = filterStatic(STATIC_NAVIGATION);

    let allItems = [];
    if (!query) {
      allItems = [...STATIC_ACTIONS, ...STATIC_NAVIGATION];
    } else {
      // Prioritize backend search results first, then matching commands
      allItems = [
        ...roomItems,
        ...guestItems,
        ...reservationItems,
        ...matchingActions,
        ...matchingNavigation,
      ];
    }

    const grouped = allItems.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    return { flatResults: allItems, groupedResults: grouped };
  }, [searchTerm, searchResults]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [flatResults.length]);

  // Ensure selected item scrolls into view
  useEffect(() => {
    if (typeof itemRefs.current[selectedIndex]?.scrollIntoView === 'function') {
      itemRefs.current[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleSelectItem = (item) => {
    if (!item) return;
    if (item.disabled) {
      setNotice(item.disabledReason || 'This command is currently unavailable.');
      return;
    }
    if (item.path) {
      navigate(item.path);
      handleClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = flatResults[selectedIndex];
      if (selected) {
        handleSelectItem(selected);
      }
    }
  };

  if (!isOpen) return null;

  let globalIndexCounter = 0;
  const trimmedLen = searchTerm.trim().length;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-3 sm:p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Global Command Palette"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        ref={modalRef}
        className="relative w-full max-w-[580px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden font-sans border border-slate-200 mt-12 sm:mt-0"
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 bg-white">
          <SearchIcon className="text-emerald-600 mr-2.5 shrink-0" sx={{ fontSize: 22 }} />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-[15px] sm:text-base text-slate-800 placeholder-slate-400 font-medium"
            placeholder="Search rooms, guests, bookings, commands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-results"
            aria-autocomplete="list"
            aria-label="Search hotel"
          />

          {isLoading && (
            <div className="mr-2 flex items-center text-emerald-600" aria-label="Searching...">
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-slate-400 hover:text-slate-600 p-1 mr-1 rounded cursor-pointer"
              aria-label="Clear search input"
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </button>
          )}

          <button
            type="button"
            onClick={handleClose}
            className="text-[11px] font-bold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 uppercase hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Close Command Palette"
          >
            ESC
          </button>
        </div>

        {/* Notices & Short Query Guidance */}
        {notice && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-[12.5px] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <InfoIcon sx={{ fontSize: 16 }} />
              <span>{notice}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-amber-700 hover:text-amber-900 text-xs font-bold ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {trimmedLen === 1 && (
          <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-100 text-slate-500 text-[11.5px] flex items-center gap-1.5">
            <InfoIcon sx={{ fontSize: 14 }} className="text-slate-400" />
            <span>Type at least 2 characters to search rooms, guests, and reservations.</span>
          </div>
        )}

        {error && (
          <div className="px-4 py-2.5 bg-rose-50 border-b border-rose-200 text-rose-700 text-[12.5px] flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => executeSearch(searchTerm)}
              className="text-rose-800 underline font-semibold hover:text-rose-900 cursor-pointer ml-3 text-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* Results List */}
        <div
          id="command-palette-results"
          role="listbox"
          className="max-h-[380px] overflow-y-auto pb-3 custom-scrollbar"
        >
          {flatResults.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              {trimmedLen >= 2 ? (
                <>No matches found for "{searchTerm}"</>
              ) : (
                <>No commands found matching "{searchTerm}"</>
              )}
            </div>
          ) : (
            Object.keys(groupedResults).map((category) => (
              <div key={category} className="mt-3 px-2 sm:px-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-3 flex items-center justify-between">
                  <span>{category}</span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {groupedResults[category].length}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {groupedResults[category].map((item) => {
                    const currentIndex = globalIndexCounter++;
                    const isSelected = currentIndex === selectedIndex;
                    const IconComponent = item.icon || DashboardIcon;

                    return (
                      <div
                        key={item.id}
                        ref={(el) => (itemRefs.current[currentIndex] = el)}
                        role="option"
                        aria-selected={isSelected}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-50/80 border border-emerald-200/60'
                            : 'hover:bg-slate-50 border border-transparent'
                        } ${item.disabled ? 'opacity-70' : ''}`}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        onClick={() => handleSelectItem(item)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg} ${item.iconColor}`}
                          >
                            <IconComponent sx={{ fontSize: 20 }} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[13.5px] font-bold truncate ${
                                  isSelected ? 'text-emerald-950' : 'text-slate-800'
                                }`}
                              >
                                {item.title}
                              </span>
                              {item.tag && (
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${item.tagColor}`}
                                >
                                  {item.tag}
                                </span>
                              )}
                            </div>
                            <div className="text-[12px] text-slate-500 mt-0.5 truncate">
                              {item.description}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 ml-3 flex items-center gap-1.5">
                          {item.disabled && (
                            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              Unavailable
                            </span>
                          )}
                          {isSelected && !item.disabled && (
                            <div className="text-emerald-600 font-bold hidden sm:block text-sm">
                              ↵
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="border border-slate-200 bg-white rounded px-1 py-0.2">↑</span>
              <span className="border border-slate-200 bg-white rounded px-1 py-0.2">↓</span>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <span className="border border-slate-200 bg-white rounded px-1 py-0.2">↵</span>
              Select
            </span>
            <span className="flex items-center gap-1">
              <span className="border border-slate-200 bg-white rounded px-1 py-0.2">ESC</span>
              Close
            </span>
          </div>
          <div className="hidden sm:block text-slate-400 font-medium">Global Quick Search</div>
        </div>
      </div>
    </div>
  );
}
