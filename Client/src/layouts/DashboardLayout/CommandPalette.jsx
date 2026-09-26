import React, { useState, useEffect, useRef, useMemo } from 'react';
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
} from '@mui/icons-material';

import { getRooms as getRoomInventory } from '../../features/rooms/state/roomStore';
import { getGuests } from '../../features/guests/state/guestStore';
import { getStoredStaff } from '../../pages/HR/Staff/staffStore';

const STATIC_ACTIONS = [
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
    path: '/reservation/new'
  },
  {
    id: 'a1',
    category: 'ACTIONS',
    title: 'Fast Front Desk Check-in',
    description: 'Issue keycards and check-in arrival to vacant clean room',
    tag: 'Front Desk',
    tagColor: 'bg-emerald-100 text-emerald-700',
    icon: CheckInIcon,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
    path: '/front-office/check-in-out'
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
    path: '/restaurant'
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
    path: '/events'
  },
  {
    id: 'a4',
    category: 'ACTIONS',
    title: 'Daily Night Audit & Cashier Balance',
    description: 'Reconcile ledger, balance cashier drawers, and roll date',
    tag: 'Finance',
    tagColor: 'bg-amber-100 text-amber-700',
    icon: FinanceIcon,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50',
    path: '/payment-billing/invoices'
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
    path: '/reports'
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
    path: '/housekeeping/rooms-cleaning'
  }
];

const STATIC_NAVIGATION = [
  {
    id: 'n1', category: 'NAVIGATION', title: 'Dashboard', description: 'Main ERP overview and key metrics',
    tag: 'Home', tagColor: 'bg-gray-100 text-gray-700', icon: DashboardIcon, iconColor: 'text-gray-500', iconBg: 'bg-gray-50', path: '/'
  },
  {
    id: 'n2', category: 'NAVIGATION', title: 'Visual Floor Plan & Room Grid (Occupancy)', description: 'Multi-floor building visualizer, live occupancy, room statuses',
    tag: 'Rooms', tagColor: 'bg-gray-100 text-gray-700', icon: DashboardIcon, iconColor: 'text-gray-500', iconBg: 'bg-gray-50', path: '/occupancy'
  },
  {
    id: 'n3', category: 'NAVIGATION', title: 'Front Office & Check-in', description: 'Manage arrivals, departures, and operations alerts',
    tag: 'Front Desk', tagColor: 'bg-gray-100 text-gray-700', icon: FrontOfficeIcon, iconColor: 'text-gray-500', iconBg: 'bg-gray-50', path: '/front-office/check-in-out'
  },
  {
    id: 'n4', category: 'NAVIGATION', title: 'Reservations & Bookings', description: 'All reservations, history, and group bookings',
    tag: 'Booking', tagColor: 'bg-gray-100 text-gray-700', icon: ReservationIcon, iconColor: 'text-gray-500', iconBg: 'bg-gray-50', path: '/reservation/all'
  },
  {
    id: 'n5', category: 'NAVIGATION', title: 'Room Management', description: 'Room types, individual room status, and settings',
    tag: 'Rooms', tagColor: 'bg-gray-100 text-gray-700', icon: RoomIcon, iconColor: 'text-gray-500', iconBg: 'bg-gray-50', path: '/rooms'
  },
  {
    id: 'n6', category: 'NAVIGATION', title: 'Guest Profiles', description: 'Guest directory, feedback, and history',
    tag: 'Guests', tagColor: 'bg-gray-100 text-gray-700', icon: GuestIcon, iconColor: 'text-gray-500', iconBg: 'bg-gray-50', path: '/guests'
  },
  {
    id: 'n6b', category: 'NAVIGATION', title: 'Car Parking', description: 'Manage hotel parking spaces and car check-ins',
    tag: 'Facilities', tagColor: 'bg-gray-100 text-gray-700', icon: CarParkingIcon, iconColor: 'text-gray-500', iconBg: 'bg-gray-50', path: '/car-parking'
  },
  {
    id: 'n7', category: 'NAVIGATION', title: 'Housekeeping', description: 'Room cleaning schedule, lost and found, inspections',
    tag: 'Housekeeping', tagColor: 'bg-gray-100 text-gray-700', icon: HousekeepingIcon, iconColor: 'text-gray-500', iconBg: 'bg-gray-50', path: '/housekeeping/rooms-cleaning'
  },
  {
    id: 'n8', category: 'NAVIGATION', title: 'Inventory & Stock', description: 'Consumables, guest charges, and missing items',
    tag: 'Inventory', tagColor: 'bg-gray-100 text-gray-700', icon: InventoryIcon, iconColor: 'text-gray-500', iconBg: 'bg-gray-50', path: '/inventory'
  },
  {
    id: 'n9', category: 'NAVIGATION', title: 'Restaurant POS & Table Ordering Terminal', description: 'Touch menu, table floor plan, KOT firing, guest folio charge',
    tag: 'Restaurant', tagColor: 'bg-gray-100 text-gray-700', icon: RestaurantIcon, iconColor: 'text-gray-500', iconBg: 'bg-gray-50', path: '/restaurant'
  },
  {
    id: 'n10', category: 'NAVIGATION', title: 'Grand Banquet, Wedding & Event Manager', description: 'BEO studio, multi-venue function diary, catering packages',
    tag: 'Events', tagColor: 'bg-gray-100 text-gray-700', icon: EventsIcon, iconColor: 'text-gray-500', iconBg: 'bg-gray-50', path: '/events'
  },
  {
    id: 'n11', category: 'NAVIGATION', title: 'Rates & Pricing', description: 'Rate plans, discounts, taxes & fees',
    tag: 'Finance', tagColor: 'bg-gray-100 text-gray-700', icon: RatesPricingIcon, iconColor: 'text-gray-500', iconBg: 'bg-gray-50', path: '/rates-pricing/rate-plans'
  },
  {
    id: 'n12', category: 'NAVIGATION', title: 'Payment & Billing', description: 'Invoices, payment history, and refunds',
    tag: 'Finance', tagColor: 'bg-gray-100 text-gray-700', icon: FinanceIcon, iconColor: 'text-gray-500', iconBg: 'bg-gray-50', path: '/payment-billing/invoices'
  },
  {
    id: 'n13', category: 'NAVIGATION', title: 'Human Resources (HR)', description: 'Staff directory, attendance, payroll, shifts',
    tag: 'HR', tagColor: 'bg-gray-100 text-gray-700', icon: HRIcon, iconColor: 'text-gray-500', iconBg: 'bg-gray-50', path: '/hr/staff'
  },
  {
    id: 'n14', category: 'NAVIGATION', title: 'Reports & Analytics', description: 'Financial statements, night audit, occupancy stats',
    tag: 'Reports', tagColor: 'bg-gray-100 text-gray-700', icon: ReportsIcon, iconColor: 'text-gray-500', iconBg: 'bg-gray-50', path: '/reports'
  },
  {
    id: 'n15', category: 'NAVIGATION', title: 'Hotel Settings', description: 'Configuration, POS setup, user roles',
    tag: 'Settings', tagColor: 'bg-gray-100 text-gray-700', icon: SettingsIcon, iconColor: 'text-gray-500', iconBg: 'bg-gray-50', path: '/settings'
  },
  {
    id: 'n16', category: 'NAVIGATION', title: 'Audit Log & Security Center', description: 'System access monitor, override traces, activity logs',
    tag: 'Security', tagColor: 'bg-gray-100 text-gray-700', icon: AuditIcon, iconColor: 'text-gray-500', iconBg: 'bg-gray-50', path: '/audit-log'
  },
  {
    id: 'n17', category: 'NAVIGATION', title: 'AI Assistant', description: 'Smart hotel management insights and automation',
    tag: 'Assistant', tagColor: 'bg-gray-100 text-gray-700', icon: AssistantIcon, iconColor: 'text-gray-500', iconBg: 'bg-gray-50', path: '/ai-assistant'
  }
];

export default function CommandPalette({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const searchResults = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    
    // Process dynamic guests and rooms
    const dynamicGuests = getGuests().map(g => ({
      id: `g-${g.id}`,
      category: 'GUESTS & ROOMS',
      title: g.name,
      description: `${g.email} • ${g.phone}`,
      tag: 'Guest',
      tagColor: 'bg-blue-100 text-blue-700',
      icon: GuestIcon,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50',
      path: '/guests'
    }));

    const dynamicRooms = getRoomInventory().map(r => ({
      id: `r-${r.id || r.roomNo}`,
      category: 'GUESTS & ROOMS',
      title: `Room ${r.roomNo}`,
      description: `${r.roomType} • Status: ${r.status}`,
      tag: r.roomType,
      tagColor: 'bg-gray-100 text-gray-700',
      icon: RoomIcon,
      iconColor: 'text-gray-500',
      iconBg: 'bg-gray-50',
      path: '/rooms'
    }));

    const dynamicStaff = getStoredStaff().map(s => ({
      id: `s-${s.id}`,
      category: 'STAFF',
      title: s.name,
      description: `${s.department || 'Staff'} • ${s.role || 'Employee'}`,
      tag: 'Staff',
      tagColor: 'bg-orange-100 text-orange-700',
      icon: HRIcon,
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-50',
      path: '/hr/staff'
    }));

    // Combine all available items
    const allItems = [...STATIC_ACTIONS, ...dynamicGuests, ...dynamicRooms, ...dynamicStaff, ...STATIC_NAVIGATION];

    if (!query) {
      // By default show some actions and navigation
      return [...STATIC_ACTIONS, ...STATIC_NAVIGATION];
    }

    return allItems.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  }, [searchTerm]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = searchResults[selectedIndex];
      if (selected && selected.path) {
        navigate(selected.path);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  // Grouping results for render
  const groupedResults = searchResults.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  let globalIndex = 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-[550px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up font-sans border border-slate-200">
        
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100">
          <SearchIcon className="text-blue-500 mr-3" sx={{ fontSize: 24 }} />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-lg text-slate-800 placeholder-slate-400"
            placeholder="Type a command, guest name, room #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] font-bold text-slate-400 border border-slate-200 rounded px-2 py-0.5 ml-2 uppercase hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[350px] overflow-y-auto pb-4 custom-scrollbar">
          {Object.keys(groupedResults).length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No results found for "{searchTerm}"
            </div>
          ) : (
            Object.keys(groupedResults).map(category => (
              <div key={category} className="mt-4 px-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
                  {category}
                </div>
                <div className="space-y-1">
                  {groupedResults[category].map(item => {
                    const currentIndex = globalIndex++;
                    const isSelected = currentIndex === selectedIndex;
                    
                    return (
                      <div 
                        key={item.id}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                        }`}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        onClick={() => {
                          if (item.path) {
                            navigate(item.path);
                            onClose();
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg} ${item.iconColor}`}>
                            <item.icon sx={{ fontSize: 20 }} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] font-bold text-slate-800">{item.title}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.tagColor}`}>
                                {item.tag}
                              </span>
                            </div>
                            <div className="text-[12.5px] text-slate-500 mt-0.5 line-clamp-1">
                              {item.description}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="text-blue-500 shrink-0 ml-4 hidden sm:block text-xl">
                            ↵
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="border border-slate-200 bg-white rounded px-1.5 py-0.5">↑</span>
              <span className="border border-slate-200 bg-white rounded px-1.5 py-0.5">↓</span>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <span className="border border-slate-200 bg-white rounded px-1.5 py-0.5">↵</span>
              Select
            </span>
            <span className="flex items-center gap-1">
              <span className="border border-slate-200 bg-white rounded px-1.5 py-0.5">ESC</span>
              Close
            </span>
          </div>
          <div className="hidden sm:block">Luxuria Hotel Command Center</div>
        </div>

      </div>
    </div>
  );
}
