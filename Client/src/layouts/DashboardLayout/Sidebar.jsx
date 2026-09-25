import { useState, useEffect } from 'react';
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
  HistoryToggleOff as AuditIcon,
  LocalParking as CarParkingIcon,
} from '@mui/icons-material';

import {
  frontOfficeSubItems,
  reservationSubItems,
  roomsSubItems,
  housekeepingSubItems,
  inventorySubItems,
  ratesPricingSubItems,
  paymentBillingSubItems,
  hrSubItems,
  restaurantSubItems,
  reportsSubItems,
  eventsSubItems,
  settingsSubItems,
} from './sidebarConfig';
import { DropdownSection } from './components/DropdownSection';
import { NavGroupHeader } from './components/NavGroupHeader';

export default function Sidebar({ mobileOpen = false, onMobileClose }) {
  const [hotelNameState, setHotelNameState] = useState(localStorage.getItem('hotelName') || null);
  const [hotelLogoState, setHotelLogoState] = useState(localStorage.getItem('hotelLogo') || null);

  useEffect(() => {
    const handleStorage = () => {
      setHotelNameState(localStorage.getItem('hotelName') || null);
      setHotelLogoState(localStorage.getItem('hotelLogo') || null);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
  const location = useLocation();
  const pathname = location.pathname;

  // Active paths
  const isDashboardActive = pathname === '/';
  const isOccupancyActive = pathname.startsWith('/occupancy');
  const isFrontOfficeActive = pathname.startsWith('/front-office');
  const isReservationActive = pathname.startsWith('/reservation');
  const isRoomsActive = pathname.startsWith('/rooms');
  const isGuestsActive = pathname.startsWith('/guests');
  const isCarParkingActive = pathname.startsWith('/car-parking');
  const isHousekeepingActive = pathname.startsWith('/housekeeping');
  const isInventoryActive = pathname.startsWith('/inventory');
  const isRatesPricingActive = pathname.startsWith('/rates-pricing');
  const isPaymentBillingActive = pathname.startsWith('/payment-billing');
  const isHRActive = pathname.startsWith('/hr');
  const isReportsActive = pathname.startsWith('/reports');
  const isSettingsActive = pathname.startsWith('/settings');
  const isRestaurantActive = pathname.startsWith('/restaurant');
  const isEventsActive = pathname.startsWith('/events');
  const isAuditActive = pathname.startsWith('/audit-log');
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
      } h-screen border-r border-gray-100 flex flex-col bg-white shadow-sm transition-all duration-300 relative z-40 shrink-0 select-none ${
        mobileOpen ? 'fixed top-0 left-0 z-50 shadow-2xl flex' : 'hidden md:flex md:sticky md:top-0'
      }`}
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
      <div className="min-h-[4rem] py-2 flex flex-col items-center justify-center border-b border-transparent pt-0.5 px-2 text-center w-full overflow-hidden">
        {hotelLogoState && (
          <img src={hotelLogoState} alt="Logo" className={`object-contain transition-all duration-300 ${isOpen ? 'w-10 h-10' : 'w-7 h-7'}`} />
        )}
        <h1 className="font-bold tracking-wide text-gray-800 transition-all duration-300 flex items-center justify-center break-words w-full">
          {isOpen ? (
            <span className="text-lg sm:text-xl flex flex-wrap items-center justify-center leading-tight">
              {hotelNameState ? (
                <>
                  <span className="mr-1">{hotelNameState.split(' ')[0]}</span>
                  <span className="text-[#1b7f43]">{hotelNameState.split(' ').slice(1).join(' ')}</span>
                </>
              ) : (
                <>Hotel<span className="text-[#1b7f43]">Admin</span></>
              )}
            </span>
          ) : (
            !hotelLogoState && (
              <span className="text-xl text-[#1b7f43]">
                HA
              </span>
            )
          )}
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 -pt-0.5 pb-6 overflow-y-auto overflow-x-hidden hide-scrollbar">
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
            label="Booking"
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

          {/* Car Parking */}
          <li>
            <Link
              to="/car-parking"
              title={!isOpen ? 'Car Parking' : undefined}
              className={`flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 group ${
                isCarParkingActive
                  ? 'bg-[#f4f9f6] text-[#1b7f43]'
                  : 'hover:bg-[#dcefe5] text-gray-600 hover:text-[#1b7f43]'
              } ${isOpen ? 'justify-between' : 'justify-center'}`}
            >
              <div className="flex items-center min-w-0">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${
                    isCarParkingActive
                      ? 'bg-[#e5f4eb] text-[#1b7f43]'
                      : 'text-gray-400 group-hover:bg-[#cce7d6] group-hover:text-[#1b7f43]'
                  }`}
                >
                  <CarParkingIcon sx={{ fontSize: 19 }} />
                </div>

                <span
                  className={`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 ${
                    isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'
                  } ${
                    isCarParkingActive
                      ? 'text-gray-900 font-bold'
                      : 'text-gray-600 group-hover:text-gray-900 font-medium'
                  }`}
                >
                  Car Parking
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

          {/* Audit Log */}
          <li>
            <Link
              to="/audit-log"
              title={!isOpen ? 'Audit Log' : undefined}
              className={`flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 group ${
                isAuditActive
                  ? 'bg-[#dcefe5] text-[var(--primary-main)]'
                  : 'hover:bg-[#dcefe5] text-gray-600 hover:text-[#1b7f43]'
              } ${isOpen ? 'justify-between' : 'justify-center'}`}
            >
              <div className="flex items-center min-w-0">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${
                    isAuditActive
                      ? 'bg-[#cce7d6] text-[var(--primary-main)]'
                      : 'text-gray-400 group-hover:bg-[#cce7d6] group-hover:text-[#1b7f43]'
                  }`}
                >
                  <AuditIcon sx={{ fontSize: 19 }} />
                </div>

                <span
                  className={`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 ${
                    isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'
                  } ${
                    isAuditActive
                      ? 'text-gray-900 font-bold'
                      : 'text-gray-600 group-hover:text-gray-900 font-medium'
                  }`}
                >
                  Audit Log
                </span>
              </div>
            </Link>
          </li>

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
