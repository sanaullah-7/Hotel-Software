import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Dashboard as DashboardIcon, 
  Laptop as FrontOfficeIcon,
  EventNote as BookingIcon,
  Bed as RoomIcon,
  ChevronRight as ChevronRightIcon, 
  ChevronLeft as ChevronLeftIcon,
  CleaningServices as HousekeepingIcon,
  Build as MaintenanceIcon,
  People as HRIcon,
  BarChart as ReportsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

export default function Sidebar() {
  const location = useLocation();
  const isFrontOfficePath = location.pathname.startsWith('/front-office');
  const isReservationPath = location.pathname.startsWith('/reservation');
  const isRoomsPath = location.pathname.startsWith('/rooms');
  const isHousekeepingPath = location.pathname.startsWith('/housekeeping');
  const isMaintenancePath = location.pathname.startsWith('/maintenance');
  const isHRPath = location.pathname.startsWith('/hr');
  const isReportsPath = location.pathname.startsWith('/reports');
  const isSettingsPath = location.pathname.startsWith('/settings');

  // State to manage if the sidebar is open or closed
  const [isOpen, setIsOpen] = useState(true);
  const [isFrontOfficeOpen, setIsFrontOfficeOpen] = useState(isFrontOfficePath);
  const [isReservationOpen, setIsReservationOpen] = useState(isReservationPath);
  const [isHousekeepingOpen, setIsHousekeepingOpen] = useState(isHousekeepingPath);
  const [isHROpen, setIsHROpen] = useState(isHRPath);
  const [isReportsOpen, setIsReportsOpen] = useState(isReportsPath);
  const [isSettingsOpen, setIsSettingsOpen] = useState(isSettingsPath);

  const isDashboardActive = location.pathname === '/';
  const isFrontOfficeActive = isFrontOfficePath;
  const isReservationActive = isReservationPath;
  const isRoomsActive = isRoomsPath;
  const isHousekeepingActive = isHousekeepingPath;
  const isMaintenanceActive = isMaintenancePath;
  const isHRActive = isHRPath;
  const isReportsActive = isReportsPath;
  const isSettingsActive = isSettingsPath;

  const frontOfficeSubItems = [
    { label: 'Operations Alerts', id: 'operations-alerts', path: '/front-office/operations-alerts' },
    { label: 'Check-in/Check-out', id: 'check-in-out', path: '/front-office/check-in-out' },
    { label: 'Registration Forms', id: 'registration-forms', path: '/front-office/registration-forms' },
    { label: 'Guest Complaint', id: 'guest-complaint', path: '/front-office/guest-complaint' },
  ];

  const reservationSubItems = [
    { label: 'Add New Reservation', id: 'add-new-reservation', path: '/reservation/new' },
    { label: 'All Reservations', id: 'all-reservations', path: '/reservation/all' },
    { label: 'Reservation History', id: 'reservation-history', path: '/reservation/history' },
  ];

  const housekeepingSubItems = [
    { label: 'Rooms & Cleaning', id: 'rooms-cleaning', path: '/housekeeping/rooms-cleaning' },
    { label: 'Inspection', id: 'inspection', path: '/housekeeping/inspection' },
    { label: 'Staff Assignment', id: 'staff-assignment', path: '/housekeeping/staff-assignment' },
  ];

  const hrSubItems = [
    { label: 'All Staff', id: 'all-staff', path: '/hr/staff' },
    { label: 'Add Staff', id: 'add-staff', path: '/hr/staff/add' },
    { label: 'Leave Requests', id: 'leave-requests', path: '/hr/leave-requests' },
    { label: 'Attendance Sheet', id: 'attendance-sheet', path: '/hr/attendance' },
    { label: 'Today\'s Attendance', id: 'todays-attendance', path: '/hr/attendance/today' },
    { label: 'Employee Salary', id: 'employee-salary', path: '/hr/employee-salary' },
  ];

  const reportsSubItems = [
    { label: 'Stock', id: 'stock', path: '/reports/stock' },
    { label: 'Expense', id: 'expense', path: '/reports/expense' },
    { label: 'Revenue Report', id: 'revenue', path: '/reports/revenue' },
    { label: 'Occupancy Report', id: 'occupancy', path: '/reports/occupancy' },
    { label: 'Expense Vs Revenue', id: 'expense-vs-revenue', path: '/reports/expense-vs-revenue' },
  ];

  const settingsSubItems = [
    { label: 'Hotel Profile', id: 'hotel-profile', path: '/settings/hotel-profile' },
    { label: 'Policies', id: 'policies', path: '/settings/policies' },
  ];

  const handleToggleFrontOffice = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsFrontOfficeOpen(true);
    } else {
      setIsFrontOfficeOpen(prev => !prev);
    }
  };

  const handleToggleReservation = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsReservationOpen(true);
    } else {
      setIsReservationOpen(prev => !prev);
    }
  };

  const handleToggleHousekeeping = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsHousekeepingOpen(true);
    } else {
      setIsHousekeepingOpen(prev => !prev);
    }
  };

  const handleToggleHR = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsHROpen(true);
    } else {
      setIsHROpen(prev => !prev);
    }
  };

  const handleToggleReports = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsReportsOpen(true);
    } else {
      setIsReportsOpen(prev => !prev);
    }
  };

  const handleToggleSettings = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsSettingsOpen(true);
    } else {
      setIsSettingsOpen(prev => !prev);
    }
  };


  return (
    <aside className={`${isOpen ? 'w-60' : 'w-20'} h-screen border-r border-gray-100 flex flex-col sticky top-0 bg-white shadow-sm transition-all duration-300 relative z-40 shrink-0 select-none`}>
      
      {/* Toggle Open/Close Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3.5 top-9 bg-white border-2 border-[#1b7f43] text-[#1b7f43] rounded-full w-7 h-7 flex items-center justify-center cursor-pointer shadow-sm hover:bg-gray-50 transition-colors z-50"
      >
        {isOpen ? (
          <ChevronLeftIcon sx={{ fontSize: 18 }} />
        ) : (
          <ChevronRightIcon sx={{ fontSize: 18 }} />
        )}
      </button>

      {/* Brand / Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-transparent overflow-hidden mt-2">
        <h1 className="font-bold tracking-wide text-gray-800 whitespace-nowrap transition-all duration-300">
          {isOpen ? (
            <span className="text-2xl">Hotel<span className="text-[#1b7f43]">Admin</span></span>
          ) : (
            <span className="text-xl text-[#1b7f43]">HA</span>
          )}
        </h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 pt-2 pb-6 overflow-y-auto overflow-x-hidden hide-scrollbar">
        <ul className="space-y-1.5">
          {/* Dashboard Tab */}
          <li>
            <Link 
              to="/"
              onClick={() => {
                setActiveMainTab('dashboard');
              }}
              title={!isOpen ? "Dashboard" : undefined}
              className={`flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 group ${
                isDashboardActive 
                  ? 'bg-[#f4f9f6] text-[#1b7f43]' 
                  : 'hover:bg-gray-50 text-gray-600'
              } ${isOpen ? 'justify-between' : 'justify-center'}`}
            >
              <div className="flex items-center min-w-0">
                <div className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-colors ${
                  isDashboardActive 
                    ? 'bg-[#e5f4eb] text-[#1b7f43]' 
                    : 'text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'
                }`}>
                  <DashboardIcon sx={{ fontSize: 19 }} />
                </div>
                
                <span className={`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 ${
                  isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'
                } ${isDashboardActive ? 'text-gray-900 font-bold' : 'text-gray-600 group-hover:text-gray-900 font-medium'}`}>
                  Dashboard
                </span>
              </div>
            </Link>
          </li>


          {/* Front Office Dropdown Menu Item */}
          <li>
            {/* Front Office Header Button */}
            <button
              onClick={handleToggleFrontOffice}
              title={!isOpen ? "Front Office" : undefined}
              className={`w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer border-none text-left ${
                isFrontOfficeActive 
                  ? 'bg-[#f0f9f4]' 
                  : 'hover:bg-gray-50'
              } ${isOpen ? 'justify-between' : 'justify-center'}`}
            >
              <div className="flex items-center min-w-0">
                <div className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors ${
                  isFrontOfficeActive 
                    ? 'bg-[#e5f4eb] text-[#1b7f43]' 
                    : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'
                }`}>
                  <FrontOfficeIcon sx={{ fontSize: 20 }} />
                </div>

                <span className={`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 ${
                  isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'
                } ${isFrontOfficeActive ? 'font-bold text-gray-900' : 'text-gray-600 font-medium'}`}>
                  Front Office
                </span>
              </div>

              {isOpen && (
                <div className="pr-1 shrink-0">
                  <ChevronRightIcon 
                    fontSize="small" 
                    className={`transition-transform duration-300 ease-in-out ${
                      isFrontOfficeActive ? 'text-[#1b7f43]' : 'text-gray-400'
                    } ${isFrontOfficeOpen ? 'rotate-90' : 'rotate-0'}`} 
                  />
                </div>
              )}
            </button>

            {/* Smooth Animated Sub-Items Dropdown List */}
            <div 
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen && isFrontOfficeOpen 
                  ? 'grid-rows-[1fr] opacity-100 mt-1' 
                  : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden">
                <div className="bg-[#f0f4fa] rounded-2xl p-1.5 space-y-1">
                  {frontOfficeSubItems.map((subItem) => {
                    const isSelected = location.pathname === subItem.path || 
                      (subItem.id === 'operations-alerts' && location.pathname === '/front-office') ||
                      (subItem.id === 'registration-forms' && location.pathname.startsWith('/front-office/registration-forms'));

                    return (
                      <Link
                        key={subItem.id}
                        to={subItem.path}
                        className={`flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer no-underline ${
                          isSelected 
                            ? 'bg-[#dcefe5] text-[#1b7f43]' 
                            : 'hover:bg-white/60 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {/* Left Dot Bullet */}
                        {isSelected ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#1b7f43] ring-3 ring-[#1b7f43]/20 mr-3 shrink-0 transition-all duration-200"></div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-[#3b82f6] mr-3 shrink-0 ml-0.5 transition-all duration-200"></div>
                        )}

                        {/* Sub-item Label */}
                        <span className={`text-[13px] whitespace-nowrap truncate ${
                          isSelected ? 'font-bold text-[#1b7f43]' : 'font-semibold'
                        }`}>
                          {subItem.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </li>

          {/* Reservation Dropdown Menu Item */}
          <li>
            {/* Reservation Header Button */}
            <button
              onClick={handleToggleReservation}
              title={!isOpen ? "Reservation" : undefined}
              className={`w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer border-none text-left ${
                isReservationActive 
                  ? 'bg-[#f0f9f4]' 
                  : 'hover:bg-gray-50'
              } ${isOpen ? 'justify-between' : 'justify-center'}`}
            >
              <div className="flex items-center min-w-0">
                <div className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors ${
                  isReservationActive 
                    ? 'bg-[#e5f4eb] text-[#1b7f43]' 
                    : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'
                }`}>
                  <BookingIcon sx={{ fontSize: 20 }} />
                </div>

                <span className={`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 ${
                  isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'
                } ${isReservationActive ? 'font-bold text-gray-900' : 'text-gray-600 font-medium'}`}>
                  Reservation
                </span>
              </div>

              {isOpen && (
                <div className="pr-1 shrink-0">
                  <ChevronRightIcon 
                    fontSize="small" 
                    className={`transition-transform duration-300 ease-in-out ${
                      isReservationActive ? 'text-[#1b7f43]' : 'text-gray-400'
                    } ${isReservationOpen ? 'rotate-90' : 'rotate-0'}`} 
                  />
                </div>
              )}
            </button>

            {/* Smooth Animated Sub-Items Dropdown List */}
            <div 
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen && isReservationOpen 
                  ? 'grid-rows-[1fr] opacity-100 mt-1' 
                  : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden">
                <div className="bg-[#f0f4fa] rounded-2xl p-1.5 space-y-1">
                  {reservationSubItems.map((subItem) => {
                    const isSelected = location.pathname === subItem.path || 
                      (subItem.id === 'add-new-reservation' && location.pathname.startsWith('/reservation/new'));

                    return (
                      <Link
                        key={subItem.id}
                        to={subItem.path}
                        className={`flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer no-underline ${
                          isSelected 
                            ? 'bg-[#dcefe5] text-[#1b7f43]' 
                            : 'hover:bg-white/60 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {/* Left Dot Bullet */}
                        {isSelected ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#1b7f43] ring-3 ring-[#1b7f43]/20 mr-3 shrink-0 transition-all duration-200"></div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-[#3b82f6] mr-3 shrink-0 ml-0.5 transition-all duration-200"></div>
                        )}

                        {/* Sub-item Label */}
                        <span className={`text-[13px] whitespace-nowrap truncate ${
                          isSelected ? 'font-bold text-[#1b7f43]' : 'font-semibold'
                        }`}>
                          {subItem.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </li>

          {/* Rooms Tab */}
          <li>
            <Link 
              to="/rooms"
              title={!isOpen ? "Rooms" : undefined}
              className={`flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 group ${
                isRoomsActive 
                  ? 'bg-[#f4f9f6] text-[#1b7f43]' 
                  : 'hover:bg-gray-50 text-gray-600'
              } ${isOpen ? 'justify-between' : 'justify-center'}`}
            >
              <div className="flex items-center min-w-0">
                <div className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-colors ${
                  isRoomsActive 
                    ? 'bg-[#e5f4eb] text-[#1b7f43]' 
                    : 'text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'
                }`}>
                  <RoomIcon sx={{ fontSize: 19 }} />
                </div>
                
                <span className={`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 ${
                  isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'
                } ${isRoomsActive ? 'text-gray-900 font-bold' : 'text-gray-600 group-hover:text-gray-900 font-medium'}`}>
                  Rooms
                </span>
              </div>
            </Link>
          </li>

          {/* Housekeeping Dropdown Menu Item */}
          <li>
            <button
              onClick={handleToggleHousekeeping}
              title={!isOpen ? "Housekeeping" : undefined}
              className={`w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer border-none text-left ${
                isHousekeepingActive 
                  ? 'bg-[#f0f9f4]' 
                  : 'hover:bg-gray-50'
              } ${isOpen ? 'justify-between' : 'justify-center'}`}
            >
              <div className="flex items-center min-w-0">
                <div className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors ${
                  isHousekeepingActive 
                    ? 'bg-[#e5f4eb] text-[#1b7f43]' 
                    : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'
                }`}>
                  <HousekeepingIcon sx={{ fontSize: 20 }} />
                </div>

                <span className={`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 ${
                  isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'
                } ${isHousekeepingActive ? 'font-bold text-gray-900' : 'text-gray-600 font-medium'}`}>
                  Housekeeping
                </span>
              </div>

              {isOpen && (
                <div className="pr-1 shrink-0">
                  <ChevronRightIcon 
                    fontSize="small" 
                    className={`transition-transform duration-300 ease-in-out ${
                      isHousekeepingActive ? 'text-[#1b7f43]' : 'text-gray-400'
                    } ${isHousekeepingOpen ? 'rotate-90' : 'rotate-0'}`} 
                  />
                </div>
              )}
            </button>

            {/* Smooth Animated Sub-Items Dropdown List */}
            <div 
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen && isHousekeepingOpen 
                  ? 'grid-rows-[1fr] opacity-100 mt-1' 
                  : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden">
                <div className="bg-[#f0f4fa] rounded-2xl p-1.5 space-y-1">
                  {housekeepingSubItems.map((subItem) => {
                    const isSelected = location.pathname === subItem.path || 
                      (subItem.id === 'rooms-cleaning' && location.pathname.startsWith('/housekeeping/rooms-cleaning'));
                    
                    return (
                      <Link
                        key={subItem.id}
                        to={subItem.path}
                        className={`flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer no-underline ${
                          isSelected 
                            ? 'bg-[#dcefe5] text-[#1b7f43]' 
                            : 'hover:bg-white/60 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {/* Left Dot Bullet */}
                        {isSelected ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#1b7f43] ring-3 ring-[#1b7f43]/20 mr-3 shrink-0 transition-all duration-200"></div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-[#3b82f6] mr-3 shrink-0 ml-0.5 transition-all duration-200"></div>
                        )}

                        {/* Sub-item Label */}
                        <span className={`text-[13px] whitespace-nowrap truncate ${
                          isSelected ? 'font-bold text-[#1b7f43]' : 'font-semibold'
                        }`}>
                          {subItem.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </li>

          {/* HR Dropdown Menu Item */}
          <li>
            <button
              onClick={handleToggleHR}
              title={!isOpen ? "Human Resources" : undefined}
              className={`w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer border-none text-left ${
                isHRActive 
                  ? 'bg-[#f0f9f4]' 
                  : 'hover:bg-gray-50'
              } ${isOpen ? 'justify-between' : 'justify-center'}`}
            >
              <div className="flex items-center min-w-0">
                <div className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors ${
                  isHRActive 
                    ? 'bg-[#e5f4eb] text-[#1b7f43]' 
                    : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'
                }`}>
                  <HRIcon sx={{ fontSize: 20 }} />
                </div>

                <span className={`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 ${
                  isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'
                } ${isHRActive ? 'font-bold text-gray-900' : 'text-gray-600 font-medium'}`}>
                  Human Resources
                </span>
              </div>

              {isOpen && (
                <div className="pr-1 shrink-0">
                  <ChevronRightIcon 
                    fontSize="small" 
                    className={`transition-transform duration-300 ease-in-out ${
                      isHRActive ? 'text-[#1b7f43]' : 'text-gray-400'
                    } ${isHROpen ? 'rotate-90' : 'rotate-0'}`} 
                  />
                </div>
              )}
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${
                isOpen && isHROpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
              }`}>
              <div className="overflow-hidden">
                <div className="bg-[#f0f4fa] rounded-2xl p-1.5 space-y-1">
                  {hrSubItems.map((subItem) => {
                    const isSelected = location.pathname === subItem.path;
                    return (
                      <Link key={subItem.id} to={subItem.path} className={`flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer no-underline ${
                          isSelected ? 'bg-[#dcefe5] text-[#1b7f43]' : 'hover:bg-white/60 text-slate-600 hover:text-slate-900'
                        }`}>
                        {isSelected ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#1b7f43] ring-3 ring-[#1b7f43]/20 mr-3 shrink-0 transition-all duration-200"></div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-[#3b82f6] mr-3 shrink-0 ml-0.5 transition-all duration-200"></div>
                        )}
                        <span className={`text-[13px] whitespace-nowrap truncate ${isSelected ? 'font-bold text-[#1b7f43]' : 'font-semibold'}`}>
                          {subItem.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </li>

          {/* Reports Dropdown Menu Item */}
          <li>
            <button
              onClick={handleToggleReports}
              title={!isOpen ? "Reports" : undefined}
              className={`w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer border-none text-left ${
                isReportsActive 
                  ? 'bg-[#f0f9f4]' 
                  : 'hover:bg-gray-50'
              } ${isOpen ? 'justify-between' : 'justify-center'}`}
            >
              <div className="flex items-center min-w-0">
                <div className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors ${
                  isReportsActive 
                    ? 'bg-[#e5f4eb] text-[#1b7f43]' 
                    : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'
                }`}>
                  <ReportsIcon sx={{ fontSize: 20 }} />
                </div>

                <span className={`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 ${
                  isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'
                } ${isReportsActive ? 'font-bold text-gray-900' : 'text-gray-600 font-medium'}`}>
                  Reports
                </span>
              </div>

              {isOpen && (
                <div className="pr-1 shrink-0">
                  <ChevronRightIcon 
                    fontSize="small" 
                    className={`transition-transform duration-300 ease-in-out ${
                      isReportsActive ? 'text-[#1b7f43]' : 'text-gray-400'
                    } ${isReportsOpen ? 'rotate-90' : 'rotate-0'}`} 
                  />
                </div>
              )}
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${
                isOpen && isReportsOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
              }`}>
              <div className="overflow-hidden">
                <div className="bg-[#f0f4fa] rounded-2xl p-1.5 space-y-1">
                  {reportsSubItems.map((subItem) => {
                    const isSelected = location.pathname === subItem.path;
                    return (
                      <Link key={subItem.id} to={subItem.path} className={`flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer no-underline ${
                          isSelected ? 'bg-[#dcefe5] text-[#1b7f43]' : 'hover:bg-white/60 text-slate-600 hover:text-slate-900'
                        }`}>
                        {isSelected ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#1b7f43] ring-3 ring-[#1b7f43]/20 mr-3 shrink-0 transition-all duration-200"></div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-[#3b82f6] mr-3 shrink-0 ml-0.5 transition-all duration-200"></div>
                        )}
                        <span className={`text-[13px] whitespace-nowrap truncate ${isSelected ? 'font-bold text-[#1b7f43]' : 'font-semibold'}`}>
                          {subItem.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </li>

          {/* Hotel Settings Dropdown Menu Item */}
          <li>
            <button
              onClick={handleToggleSettings}
              title={!isOpen ? "Hotel Settings" : undefined}
              className={`w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer border-none text-left ${
                isSettingsActive 
                  ? 'bg-[#f0f9f4]' 
                  : 'hover:bg-gray-50'
              } ${isOpen ? 'justify-between' : 'justify-center'}`}
            >
              <div className="flex items-center min-w-0">
                <div className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors ${
                  isSettingsActive 
                    ? 'bg-[#e5f4eb] text-[#1b7f43]' 
                    : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'
                }`}>
                  <SettingsIcon sx={{ fontSize: 20 }} />
                </div>

                <span className={`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 ${
                  isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'
                } ${isSettingsActive ? 'font-bold text-gray-900' : 'text-gray-600 font-medium'}`}>
                  Hotel Settings
                </span>
              </div>

              {isOpen && (
                <div className="pr-1 shrink-0">
                  <ChevronRightIcon 
                    fontSize="small" 
                    className={`transition-transform duration-300 ease-in-out ${
                      isSettingsActive ? 'text-[#1b7f43]' : 'text-gray-400'
                    } ${isSettingsOpen ? 'rotate-90' : 'rotate-0'}`} 
                  />
                </div>
              )}
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${
                isOpen && isSettingsOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
              }`}>
              <div className="overflow-hidden">
                <div className="bg-[#f0f4fa] rounded-2xl p-1.5 space-y-1">
                  {settingsSubItems.map((subItem) => {
                    const isSelected = location.pathname === subItem.path;
                    return (
                      <Link key={subItem.id} to={subItem.path} className={`flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer no-underline ${
                          isSelected ? 'bg-[#dcefe5] text-[#1b7f43]' : 'hover:bg-white/60 text-slate-600 hover:text-slate-900'
                        }`}>
                        {isSelected ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#1b7f43] ring-3 ring-[#1b7f43]/20 mr-3 shrink-0 transition-all duration-200"></div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-[#3b82f6] mr-3 shrink-0 ml-0.5 transition-all duration-200"></div>
                        )}
                        <span className={`text-[13px] whitespace-nowrap truncate ${isSelected ? 'font-bold text-[#1b7f43]' : 'font-semibold'}`}>
                          {subItem.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </li>

        </ul>
      </nav>
    </aside>
  );
}
