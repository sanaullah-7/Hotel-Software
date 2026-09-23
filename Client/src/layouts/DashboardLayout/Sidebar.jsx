import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  Laptop as FrontOfficeIcon,
  EventNote as BookingIcon,
  Domain as OccupancyIcon,
  Bed as RoomIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  CleaningServices as HousekeepingIcon,
  Inventory2 as InventoryIcon,
  Payments as RatesPricingIcon,
  ReceiptLong as PaymentBillingIcon,
  People as HRIcon,
  PersonPin as GuestsIcon,
  BarChart as ReportsIcon,
  Settings as SettingsIcon,
  RestaurantMenu as RestaurantIcon,
  Celebration as EventsIcon,
  AutoAwesome as AssistantIcon,
} from '@mui/icons-material';

// Reusable submenu renderer
const renderSubItems = (items, pathname) => {
  return (
    <div className="bg-[#f0f4fa] rounded-2xl p-1.5 space-y-1">
      {items.map((subItem) => {
        const isSelected = pathname === subItem.path;

        return (
          <Link
            key={subItem.id}
            to={subItem.path}
            className={`flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer no-underline ${
              isSelected
                ? 'bg-[#dcefe5] text-[#1b7f43]'
                : 'hover:bg-[#dcefe5] text-slate-600 hover:text-[#1b7f43]'
            }`}
          >
            {isSelected ? (
              <div className="w-2.5 h-2.5 rounded-full bg-[#1b7f43] ring-3 ring-[#1b7f43]/20 mr-3 shrink-0" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-[#86efac] mr-3 shrink-0 ml-0.5" />
            )}

            <span className={`text-[12.5px] font-semibold transition-colors ${
              isSelected ? 'text-[#1b7f43]' : 'text-slate-600 group-hover:text-[#1b7f43]'
            }`}>
              {subItem.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

// Reusable dropdown component
const DropdownSection = ({
  isOpen,
  pathname,
  active,
  open,
  toggle,
  icon: Icon,
  label,
  items,
}) => {
  return (
    <li>
      <button
        type="button"
        onClick={toggle}
        title={!isOpen ? label : undefined}
        className={`w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer border-none text-left ${
          active
            ? 'bg-[#f0f9f4] text-[#1b7f43]'
            : 'hover:bg-[#dcefe5] text-gray-600 hover:text-[#1b7f43]'
        } ${isOpen ? 'justify-between' : 'justify-center'}`}
      >
        <div className="flex items-center min-w-0">
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors ${
              active
                ? 'bg-[#e5f4eb] text-[#1b7f43]'
                : 'bg-gray-50 text-gray-400 group-hover:bg-[#cce7d6] group-hover:text-[#1b7f43]'
            }`}
          >
            <Icon sx={{ fontSize: 20 }} />
          </div>

          <span
            className={`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 ${
              isOpen
                ? 'opacity-100 block truncate'
                : 'opacity-0 hidden'
            } ${
              active
                ? 'font-bold text-gray-900'
                : 'text-gray-600 font-medium'
            }`}
          >
            {label}
          </span>
        </div>

        {isOpen && (
          <div className="pr-1 shrink-0">
            <ChevronRightIcon
              fontSize="small"
              className={`transition-transform duration-300 ease-in-out ${
                active
                  ? 'text-[#1b7f43]'
                  : 'text-gray-400'
              } ${open ? 'rotate-90' : 'rotate-0'}`}
            />
          </div>
        )}
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen && open
            ? 'grid-rows-[1fr] opacity-100 mt-1'
            : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden">
          {renderSubItems(items, pathname)}
        </div>
      </div>
    </li>
  );
};

// Group Header for visual domain separation
const NavGroupHeader = ({ title, isOpen }) => {
  if (!isOpen) {
    return <div className="my-2 border-t border-gray-100" />;
  }
  return (
    <li className="pt-3 pb-1 px-3 list-none">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
        {title}
      </span>
    </li>
  );
};

export default function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  // Active paths
  const isDashboardActive = pathname === '/';
  const isOccupancyActive = pathname.startsWith('/occupancy');
  const isFrontOfficeActive = pathname.startsWith('/front-office');
  const isReservationActive = pathname.startsWith('/reservation');
  const isRoomsActive = pathname.startsWith('/rooms');
  const isGuestsActive = pathname.startsWith('/guests');
  const isHousekeepingActive = pathname.startsWith('/housekeeping');
  const isInventoryActive = pathname.startsWith('/inventory');
  const isRatesPricingActive = pathname.startsWith('/rates-pricing');
  const isPaymentBillingActive = pathname.startsWith('/payment-billing');
  const isHRActive = pathname.startsWith('/hr');
  const isReportsActive = pathname.startsWith('/reports');
  const isSettingsActive = pathname.startsWith('/settings');
  const isRestaurantActive = pathname.startsWith('/restaurant');
  const isEventsActive = pathname.startsWith('/events');
  const isAssistantActive = pathname.startsWith('/ai-assistant');

  // Sidebar open/close
  const [isOpen, setIsOpen] = useState(true);

  // Dropdown states
  const [isFrontOfficeOpen, setIsFrontOfficeOpen] = useState(isFrontOfficeActive);
  const [isReservationOpen, setIsReservationOpen] = useState(isReservationActive);
  const [isRoomsOpen, setIsRoomsOpen] = useState(isRoomsActive);
  const [isHousekeepingOpen, setIsHousekeepingOpen] = useState(isHousekeepingActive);
  const [isInventoryOpen, setIsInventoryOpen] = useState(isInventoryActive);
  const [isRatesPricingOpen, setIsRatesPricingOpen] = useState(isRatesPricingActive);
  const [isPaymentBillingOpen, setIsPaymentBillingOpen] = useState(isPaymentBillingActive);
  const [isHROpen, setIsHROpen] = useState(isHRActive);
  const [isReportsOpen, setIsReportsOpen] = useState(isReportsActive);
  const [isSettingsOpen, setIsSettingsOpen] = useState(isSettingsActive);
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(isRestaurantActive);
  const [isEventsOpen, setIsEventsOpen] = useState(isEventsActive);

  // Sub menu data
  const frontOfficeSubItems = [
    { label: 'Operations Alerts', id: 'operations-alerts', path: '/front-office/operations-alerts' },
    { label: 'Check-in/Check-out', id: 'check-in-out', path: '/front-office/check-in-out' },
    { label: 'Guest Complaint', id: 'guest-complaint', path: '/front-office/guest-complaint' },
  ];

  const reservationSubItems = [
    { label: 'All Reservations', id: 'all-reservations', path: '/reservation/all' },
    { label: 'Reservation History', id: 'reservation-history', path: '/reservation/history' },
    { label: 'Cancel Booking', id: 'cancel-booking', path: '/reservation/cancelled' },
    { label: 'Group Booking', id: 'group-booking', path: '/reservation/group' },
    { label: 'Add New Reservation', id: 'add-new-reservation', path: '/reservation/new' },
  ];

  const roomsSubItems = [
    { label: 'All Rooms', id: 'all-rooms', path: '/rooms' },
    { label: 'Room Types', id: 'room-types', path: '/rooms/room-types' },
    { label: 'Rate & Pricing', id: 'rate-pricing', path: '/rooms/rate-pricing' },
    { label: 'Add Room', id: 'add-room', path: '/rooms/new' },
  ];

  const housekeepingSubItems = [
    { label: 'Room Cleaning', id: 'rooms-cleaning', path: '/housekeeping/rooms-cleaning' },
    { label: 'Cleaning Schedule', id: 'cleaning-schedule', path: '/housekeeping/cleaning-schedule' },
    { label: 'Lost and Found', id: 'lost-and-found', path: '/housekeeping/lost-and-found' },
    { label: 'Inspection Checklist', id: 'inspection-checklist', path: '/housekeeping/inspection-checklist' },
  ];

  const inventorySubItems = [
    { label: 'Stock', id: 'stock', path: '/inventory' },
    { label: 'Guest Charges', id: 'guest-charges', path: '/inventory/guest-charges' },
    { label: 'Missing Items', id: 'missing-items', path: '/inventory/missing' },
  ];

  const ratesPricingSubItems = [
    { label: 'Rate Plans', id: 'rate-plans', path: '/rates-pricing/rate-plans' },
    { label: 'Discounts', id: 'discounts', path: '/rates-pricing/discounts' },
    { label: 'Taxes & Fees', id: 'taxes-fees', path: '/rates-pricing/taxes-fees' },
  ];

  const paymentBillingSubItems = [
    { label: 'Invoices', id: 'invoices', path: '/payment-billing/invoices' },
    { label: 'Payment History', id: 'payment-history', path: '/payment-billing/payment-history' },
    { label: 'Pending Payments', id: 'pending-payments', path: '/payment-billing/pending-payments' },
    { label: 'Refunds', id: 'refunds', path: '/payment-billing/refunds' },
  ];

  const hrSubItems = [
    { label: 'All Staff', id: 'all-staff', path: '/hr/staff' },
    { label: 'Add Staff', id: 'add-staff', path: '/hr/staff/add' },
    { label: 'Leave Requests', id: 'leave-requests', path: '/hr/leave-requests' },
    { label: 'Attendance Sheet', id: 'attendance-sheet', path: '/hr/attendance' },
    { label: "Today's Attendance", id: 'todays-attendance', path: '/hr/attendance/today' },
    { label: 'Employee Salary', id: 'employee-salary', path: '/hr/employee-salary' },
  ];

  const restaurantSubItems = [
    { label: 'Menu', id: 'menu', path: '/restaurant/menu' },
    { label: 'Orders', id: 'orders', path: '/restaurant/orders' },
  ];

  const reportsSubItems = [
    { label: 'Stock', id: 'stock', path: '/reports/stock' },
    { label: 'Expense', id: 'expense', path: '/reports/expense' },
    { label: 'Revenue Report', id: 'revenue', path: '/reports/revenue' },
    { label: 'Occupancy Report', id: 'occupancy', path: '/reports/occupancy' },
    { label: 'Expense Vs Revenue', id: 'expense-vs-revenue', path: '/reports/expense-vs-revenue' },
  ];

  const eventsSubItems = [
    { label: 'All Events', id: 'all-events', path: '/events/all-events' },
    { label: 'Add Event', id: 'add-event', path: '/events/add-event' },
    { label: 'Banquet Manager', id: 'banquet-manager', path: '/events/banquet-manager' },
  ];

  const settingsSubItems = [
    { label: 'Hotel Profile', id: 'hotel-profile', path: '/settings/hotel-profile' },
    { label: 'Policies', id: 'policies', path: '/settings/policies' },
  ];

  // Generic dropdown toggle
  const toggleDropdown = (setter) => {
    if (!isOpen) {
      setIsOpen(true);
      setter(true);
    } else {
      setter((prev) => !prev);
    }
  };

  return (
    <aside
      className={`${
        isOpen ? 'w-60' : 'w-20'
      } h-screen border-r border-gray-100 flex flex-col sticky top-0 bg-white shadow-sm transition-all duration-300 relative z-40 shrink-0 select-none`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="absolute -right-3.5 top-9 bg-white border-2 border-[#1b7f43] text-[#1b7f43] rounded-full w-7 h-7 flex items-center justify-center cursor-pointer shadow-sm hover:bg-gray-50 transition-colors z-50"
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isOpen ? (
          <ChevronLeftIcon sx={{ fontSize: 18 }} />
        ) : (
          <ChevronRightIcon sx={{ fontSize: 18 }} />
        )}
      </button>

      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-transparent overflow-hidden mt-2">
        <h1 className="font-bold tracking-wide text-gray-800 whitespace-nowrap transition-all duration-300">
          {isOpen ? (
            <span className="text-2xl">
              {localStorage.getItem('hotelName') ? (
                <>
                  {localStorage.getItem('hotelName').split(' ')[0]}<span className="text-[#1b7f43]">{localStorage.getItem('hotelName').split(' ').slice(1).join(' ')}</span>
                </>
              ) : (
                <>Hotel<span className="text-[#1b7f43]">Admin</span></>
              )}
            </span>
          ) : (
            <span className="text-xl text-[#1b7f43]">
              HA
            </span>
          )}
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-2 pb-6 overflow-y-auto overflow-x-hidden hide-scrollbar">
        <ul className="space-y-1.5">

          {/* GROUP 1: OPERATIONS & FRONT DESK */}
          <NavGroupHeader title="Operations" isOpen={isOpen} />

          {/* Dashboard */}
          <li>
            <Link
              to="/"
              title={!isOpen ? 'Dashboard' : undefined}
              className={`flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 group ${
                isDashboardActive
                  ? 'bg-[#f4f9f6] text-[#1b7f43]'
                  : 'hover:bg-[#dcefe5] text-gray-600 hover:text-[#1b7f43]'
              } ${isOpen ? 'justify-between' : 'justify-center'}`}
            >
              <div className="flex items-center min-w-0">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-colors ${
                    isDashboardActive
                      ? 'bg-[#e5f4eb] text-[#1b7f43]'
                      : 'text-gray-400 group-hover:bg-[#cce7d6] group-hover:text-[#1b7f43]'
                  }`}
                >
                  <DashboardIcon sx={{ fontSize: 19 }} />
                </div>

                <span
                  className={`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 ${
                    isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'
                  } ${
                    isDashboardActive
                      ? 'text-gray-900 font-bold'
                      : 'text-gray-600 group-hover:text-gray-900 font-medium'
                  }`}
                >
                  Dashboard
                </span>
              </div>
            </Link>
          </li>

          {/* Occupancy */}
          <li>
            <Link
              to="/occupancy"
              title={!isOpen ? 'Occupancy' : undefined}
              className={`flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 group ${
                isOccupancyActive
                  ? 'bg-[#f4f9f6] text-[#1b7f43]'
                  : 'hover:bg-[#dcefe5] text-gray-600 hover:text-[#1b7f43]'
              } ${isOpen ? 'justify-between' : 'justify-center'}`}
            >
              <div className="flex items-center min-w-0">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${
                    isOccupancyActive
                      ? 'bg-[#e5f4eb] text-[#1b7f43]'
                      : 'text-gray-400 group-hover:bg-[#cce7d6] group-hover:text-[#1b7f43]'
                  }`}
                >
                  <OccupancyIcon sx={{ fontSize: 19 }} />
                </div>

                <span
                  className={`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 ${
                    isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'
                  } ${
                    isOccupancyActive
                      ? 'text-gray-900 font-bold'
                      : 'text-gray-600 group-hover:text-gray-900 font-medium'
                  }`}
                >
                  Occupancy
                </span>
              </div>
            </Link>
          </li>

          {/* Front Office */}
          <DropdownSection
            isOpen={isOpen}
            pathname={pathname}
            active={isFrontOfficeActive}
            open={isFrontOfficeOpen}
            toggle={() => toggleDropdown(setIsFrontOfficeOpen)}
            icon={FrontOfficeIcon}
            label="Front Office"
            items={frontOfficeSubItems}
          />

          {/* GROUP 2: BOOKINGS & ROOMS */}
          <NavGroupHeader title="Bookings & Rooms" isOpen={isOpen} />

          {/* Reservation */}
          <DropdownSection
            isOpen={isOpen}
            pathname={pathname}
            active={isReservationActive}
            open={isReservationOpen}
            toggle={() => toggleDropdown(setIsReservationOpen)}
            icon={BookingIcon}
            label="Reservation"
            items={reservationSubItems}
          />

          {/* Rooms */}
          <DropdownSection
            isOpen={isOpen}
            pathname={pathname}
            active={isRoomsActive}
            open={isRoomsOpen}
            toggle={() => toggleDropdown(setIsRoomsOpen)}
            icon={RoomIcon}
            label="Rooms"
            items={roomsSubItems}
          />

          {/* Guests */}
          <li>
            <Link
              to="/guests"
              title={!isOpen ? 'Guests' : undefined}
              className={`flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 group ${
                isGuestsActive
                  ? 'bg-[#f4f9f6] text-[#1b7f43]'
                  : 'hover:bg-[#dcefe5] text-gray-600 hover:text-[#1b7f43]'
              } ${isOpen ? 'justify-between' : 'justify-center'}`}
            >
              <div className="flex items-center min-w-0">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${
                    isGuestsActive
                      ? 'bg-[#e5f4eb] text-[#1b7f43]'
                      : 'text-gray-400 group-hover:bg-[#cce7d6] group-hover:text-[#1b7f43]'
                  }`}
                >
                  <GuestsIcon sx={{ fontSize: 19 }} />
                </div>

                <span
                  className={`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 ${
                    isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'
                  } ${
                    isGuestsActive
                      ? 'text-gray-900 font-bold'
                      : 'text-gray-600 group-hover:text-gray-900 font-medium'
                  }`}
                >
                  Guests
                </span>
              </div>
            </Link>
          </li>

          {/* GROUP 3: FACILITY & SERVICES */}
          <NavGroupHeader title="Facility & Services" isOpen={isOpen} />

          {/* Housekeeping */}
          <DropdownSection
            isOpen={isOpen}
            pathname={pathname}
            active={isHousekeepingActive}
            open={isHousekeepingOpen}
            toggle={() => toggleDropdown(setIsHousekeepingOpen)}
            icon={HousekeepingIcon}
            label="Housekeeping"
            items={housekeepingSubItems}
          />

          {/* Inventory */}
          <DropdownSection
            isOpen={isOpen}
            pathname={pathname}
            active={isInventoryActive}
            open={isInventoryOpen}
            toggle={() => toggleDropdown(setIsInventoryOpen)}
            icon={InventoryIcon}
            label="Inventory"
            items={inventorySubItems}
          />

          {/* Restaurant */}
          <DropdownSection
            isOpen={isOpen}
            pathname={pathname}
            active={isRestaurantActive}
            open={isRestaurantOpen}
            toggle={() => toggleDropdown(setIsRestaurantOpen)}
            icon={RestaurantIcon}
            label="Restaurant"
            items={restaurantSubItems}
          />

          {/* Events & Banquets */}
          <DropdownSection
            isOpen={isOpen}
            pathname={pathname}
            active={isEventsActive}
            open={isEventsOpen}
            toggle={() => toggleDropdown(setIsEventsOpen)}
            icon={EventsIcon}
            label="Events & Banquets"
            items={eventsSubItems}
          />

          {/* GROUP 4: FINANCE & BILLING */}
          <NavGroupHeader title="Finance & Billing" isOpen={isOpen} />

          {/* Payment & Billing */}
          <DropdownSection
            isOpen={isOpen}
            pathname={pathname}
            active={isPaymentBillingActive}
            open={isPaymentBillingOpen}
            toggle={() => toggleDropdown(setIsPaymentBillingOpen)}
            icon={PaymentBillingIcon}
            label="Payment & Billing"
            items={paymentBillingSubItems}
          />

          {/* Rates & Pricing */}
          <DropdownSection
            isOpen={isOpen}
            pathname={pathname}
            active={isRatesPricingActive}
            open={isRatesPricingOpen}
            toggle={() => toggleDropdown(setIsRatesPricingOpen)}
            icon={RatesPricingIcon}
            label="Rates & Pricing"
            items={ratesPricingSubItems}
          />

          {/* GROUP 5: MANAGEMENT & ADMIN */}
          <NavGroupHeader title="Management & Admin" isOpen={isOpen} />

          {/* Human Resources */}
          <DropdownSection
            isOpen={isOpen}
            pathname={pathname}
            active={isHRActive}
            open={isHROpen}
            toggle={() => toggleDropdown(setIsHROpen)}
            icon={HRIcon}
            label="Human Resources"
            items={hrSubItems}
          />

          {/* Reports */}
          <DropdownSection
            isOpen={isOpen}
            pathname={pathname}
            active={isReportsActive}
            open={isReportsOpen}
            toggle={() => toggleDropdown(setIsReportsOpen)}
            icon={ReportsIcon}
            label="Reports"
            items={reportsSubItems}
          />

          {/* AI Assistant */}
          <li>
            <Link
              to="/ai-assistant"
              title={!isOpen ? 'AI Assistant' : undefined}
              className={`flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 group ${
                isAssistantActive
                  ? 'bg-[#dcefe5] text-[var(--primary-main)]'
                  : 'hover:bg-[#dcefe5] text-gray-600 hover:text-[#1b7f43]'
              } ${isOpen ? 'justify-between' : 'justify-center'}`}
            >
              <div className="flex items-center min-w-0">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${
                    isAssistantActive
                      ? 'bg-[#cce7d6] text-[var(--primary-main)]'
                      : 'text-gray-400 group-hover:bg-[#cce7d6] group-hover:text-[#1b7f43]'
                  }`}
                >
                  <AssistantIcon sx={{ fontSize: 19 }} />
                </div>

                <span
                  className={`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 ${
                    isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'
                  } ${
                    isAssistantActive
                      ? 'text-gray-900 font-bold'
                      : 'text-gray-600 group-hover:text-gray-900 font-medium'
                  }`}
                >
                  AI Assistant
                </span>
              </div>
            </Link>
          </li>

          {/* Hotel Settings */}
          <DropdownSection
            isOpen={isOpen}
            pathname={pathname}
            active={isSettingsActive}
            open={isSettingsOpen}
            toggle={() => toggleDropdown(setIsSettingsOpen)}
            icon={SettingsIcon}
            label="Hotel Settings"
            items={settingsSubItems}
          />

        </ul>
      </nav>
    </aside>
  );
}
