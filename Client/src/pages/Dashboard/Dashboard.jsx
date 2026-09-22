import React, { useState } from 'react';
import { 
  MoreHoriz, Phone, Edit, Delete, Logout, Cancel,
  PersonAdd, Login, AttachMoney, Bed, CreditCard,
  Search, ChevronLeft, ChevronRight, Hotel, FileDownload,
  Notifications, LocalCafe, Build, CleaningServices, Schedule, Warning,
  CheckCircle, BuildCircle, Badge, Close, Inventory2, Add, KeyboardArrowDown,
  TrendingUp, RoomService
} from '@mui/icons-material';
import { Popover } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';

import { People } from '@mui/icons-material';
import AllBookings from '../../features/reservations/pages/AllReservations';
import { getReservations, RESERVATIONS_UPDATED_EVENT } from '../../features/reservations/state/reservationStore';
import { getRooms } from '../../features/housekeeping/pages/hkStore';
import { getRooms as getRoomInventory, ROOM_UPDATED_EVENT } from '../../features/rooms/state/roomStore';

function InventoryCell({ items = [] }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  if (!items || items.length === 0) {
    return <span className="text-[12px] text-gray-400">—</span>;
  }

  const total = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  return (
    <>
      <button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        className="flex items-center gap-1 px-2.5 py-1 bg-[#e5f4eb] text-[#1b7f43] rounded-md text-[11px] font-semibold cursor-pointer hover:brightness-95 transition"
      >
        <Inventory2 sx={{ fontSize: 13 }} />
        {items.length} {items.length === 1 ? 'Item' : 'Items'}
        <KeyboardArrowDown sx={{ fontSize: 14 }} />
      </button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <div className="p-3 min-w-[260px] max-w-[300px]">
          <div className="flex items-center gap-1.5 mb-2.5 text-gray-700">
            <Inventory2 sx={{ fontSize: 15 }} />
            <span className="text-[12px] font-bold">Full Inventory ({items.length})</span>
          </div>

          <div className="flex flex-col divide-y divide-gray-50">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between gap-2 py-2 first:pt-0">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="text-[11px] font-bold text-gray-400 shrink-0 pt-0.5">{idx + 1}.</span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-gray-800 truncate">{item.name}</p>
                    <p className="text-[10.5px] text-gray-400">
                      {item.date} {item.time && `• ${item.time}`}
                    </p>
                  </div>
                </div>
                <span className="text-[12px] font-bold text-gray-900 shrink-0">${item.price || 0}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-gray-100">
            <span className="text-[12px] font-bold text-gray-700">Total</span>
            <span className="text-[13px] font-bold text-[#1b7f43]">${total}</span>
          </div>
        </div>
      </Popover>
    </>
  );
}

const recentStaffAttendance = [
  { id: 1, name: 'Alice Smith', role: 'Receptionist', shift: 'Morning', timeIn: '08:00 AM', status: 'Present' },
  { id: 2, name: 'John Doe', role: 'Housekeeping', shift: 'Morning', timeIn: '08:15 AM', status: 'Late' },
  { id: 3, name: 'Emma Wilson', role: 'Chef', shift: 'Morning', timeIn: '--:--', status: 'Absent' },
  { id: 4, name: 'Michael Brown', role: 'Security', shift: 'Night', timeIn: '10:00 PM', status: 'Present' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [hkRooms, setHkRooms] = useState(getRooms());
  const [roomInventory, setRoomInventory] = useState(getRoomInventory());
  const [reservations, setReservations] = useState(getReservations());

  React.useEffect(() => {
    const syncData = () => setHkRooms(getRooms());
    window.addEventListener('storage', syncData);
    window.addEventListener('hk_update', syncData);
    return () => {
      window.removeEventListener('storage', syncData);
      window.removeEventListener('hk_update', syncData);
    };
  }, []);

  React.useEffect(() => {
    const syncRoomInventory = () => setRoomInventory(getRoomInventory());
    window.addEventListener(ROOM_UPDATED_EVENT, syncRoomInventory);
    window.addEventListener('storage', syncRoomInventory);
    return () => {
      window.removeEventListener(ROOM_UPDATED_EVENT, syncRoomInventory);
      window.removeEventListener('storage', syncRoomInventory);
    };
  }, []);

  React.useEffect(() => {
    const syncReservations = () => setReservations(getReservations());
    window.addEventListener('storage', syncReservations);
    window.addEventListener(RESERVATIONS_UPDATED_EVENT, syncReservations);
    return () => {
      window.removeEventListener('storage', syncReservations);
      window.removeEventListener(RESERVATIONS_UPDATED_EVENT, syncReservations);
    };
  }, []);

  const hkStats = {
    dirty: hkRooms.filter(r => r.status === 'Dirty').length,
    assigned: hkRooms.filter(r => r.status === 'Assigned').length,
    cleaning: hkRooms.filter(r => r.status === 'Cleaning').length,
    inspection: hkRooms.filter(r => r.status === 'Inspection Required').length,
    clean: hkRooms.filter(r => r.status === 'Clean / Ready').length,
    occupied: hkRooms.filter(r => r.stayStatus === 'Occupied').length,
    maintenance: hkRooms.filter(r => r.status === 'Maintenance' || r.status === 'Out of Order').length,
    dnd: hkRooms.filter(r => r.status === 'DND').length,
  };

  const reservationStats = {
    active: reservations.filter((reservation) => reservation.status !== 'Cancelled').length,
    checkedIn: reservations.filter((reservation) => ['CheckIn', 'Checked In'].includes(reservation.status)).length,
    checkedOut: reservations.filter((reservation) => ['CheckOut', 'Checked Out'].includes(reservation.status)).length,
    booked: reservations.filter((reservation) => reservation.status === 'Booked').length,
    pendingPayments: reservations.filter((reservation) => reservation.payment !== 'Paid').length,
  };

  const handleNavigateHk = (label) => {
    if (label === 'Inspection Required') navigate('/housekeeping/inspection', { state: { highlightStatus: label } });
    else navigate('/housekeeping/rooms-cleaning', { state: { highlightStatus: label } });
  };

  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('Daily');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isCustomPopupOpen, setIsCustomPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Extended dummy data to demonstrate pagination
  const allBookings = [
    { room: '501', name: 'Ali Khan', checkIn: '10/01/2023', checkOut: '10/05/2023', mobile: '0300 1234567', status: 'Booked' },
    { room: '502', name: 'Fatima Ahmed', checkIn: '10/02/2023', checkOut: '10/06/2023', mobile: '0333 9876543', status: 'Booked' },
    { room: '503', name: 'Ayesha Tariq', checkIn: '10/03/2023', checkOut: '10/07/2023', mobile: '0312 5551234', status: 'CheckOut' },
    { room: '504', name: 'Usman Baloch', checkIn: '10/04/2023', checkOut: '10/08/2023', mobile: '0345 4449876', status: 'Booked' },
    { room: '505', name: 'Zainab Raza', checkIn: '10/05/2023', checkOut: '10/09/2023', mobile: '0301 7776543', status: 'CheckIn' },
    { room: '506', name: 'Bilal Qureshi', checkIn: '10/06/2023', checkOut: '10/10/2023', mobile: '0321 8887654', status: 'Cancelled' },
    { room: '507', name: 'Sana Malik', checkIn: '10/07/2023', checkOut: '10/11/2023', mobile: '0302 3332221', status: 'Booked' },
    { room: '101', name: 'Kamran Akmal', checkIn: '10/08/2023', checkOut: '10/12/2023', mobile: '0311 1122334', status: 'CheckIn' },
    { room: '102', name: 'Hira Mani', checkIn: '10/08/2023', checkOut: '10/15/2023', mobile: '0333 4455667', status: 'Booked' },
    { room: '105', name: 'Fawad Khan', checkIn: '10/09/2023', checkOut: '10/14/2023', mobile: '0300 9988776', status: 'Booked' },
    { room: '201', name: 'Mahira Khan', checkIn: '10/09/2023', checkOut: '10/10/2023', mobile: '0321 6655443', status: 'CheckOut' },
    { room: '205', name: 'Sajal Ali', checkIn: '10/10/2023', checkOut: '10/16/2023', mobile: '0345 1122334', status: 'Booked' },
    { room: '304', name: 'Atif Aslam', checkIn: '10/11/2023', checkOut: '10/12/2023', mobile: '0301 5566778', status: 'CheckIn' },
    { room: '308', name: 'Saba Qamar', checkIn: '10/12/2023', checkOut: '10/15/2023', mobile: '0333 9998887', status: 'Booked' },
  ];

  // Filtering Logic
  const filteredBookings = allBookings.filter(booking => {
    const matchesSearch = booking.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          booking.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter === 'Custom' && customStartDate && customEndDate) {
      const bDate = new Date(booking.checkIn);
      const sDate = new Date(customStartDate);
      const eDate = new Date(customEndDate);
      matchesDate = bDate >= sDate && bDate <= eDate;
    }
    
    return matchesSearch && matchesDate;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredBookings.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredBookings.slice(indexOfFirstRow, indexOfLastRow);

  // Staff Attendance State
  const [staffActionMenuOpen, setStaffActionMenuOpen] = useState(null);
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [staffDateFilter, setStaffDateFilter] = useState('Daily');
  const [staffCustomStartDate, setStaffCustomStartDate] = useState('');
  const [staffCustomEndDate, setStaffCustomEndDate] = useState('');
  const [isStaffCustomPopupOpen, setIsStaffCustomPopupOpen] = useState(false);
  const [staffCurrentPage, setStaffCurrentPage] = useState(1);
  const staffRowsPerPage = 8;

  // Extended dummy data for Staff Attendance
  const allStaffAttendance = [
    { staffId: 'ST-101', name: 'Hamza Malik', checkIn: '09:00 AM', checkOut: '05:00 PM', mobile: '0300 1122334', status: 'Present' },
    { staffId: 'ST-102', name: 'Zubair Tariq', checkIn: '08:30 AM', checkOut: '04:30 PM', mobile: '0321 4455667', status: 'Present' },
    { staffId: 'ST-103', name: 'Ayesha Siddiqui', checkIn: '09:15 AM', checkOut: '05:15 PM', mobile: '0333 7788990', status: 'Present' },
    { staffId: 'ST-104', name: 'Bilal Khan', checkIn: '--', checkOut: '--', mobile: '0345 2233445', status: 'Absent' },
    { staffId: 'ST-105', name: 'Nida Yasir', checkIn: '09:00 AM', checkOut: 'In Shift', mobile: '0301 6677889', status: 'Present' },
    { staffId: 'ST-106', name: 'Kashif Raza', checkIn: '--', checkOut: '--', mobile: '0312 9900112', status: 'Leave' },
    { staffId: 'ST-107', name: 'Tariq Mehmood', checkIn: '08:45 AM', checkOut: '05:00 PM', mobile: '0303 5544332', status: 'Present' },
    { staffId: 'ST-108', name: 'Sana Javed', checkIn: '09:05 AM', checkOut: '05:00 PM', mobile: '0344 1122998', status: 'Present' },
    { staffId: 'ST-109', name: 'Usman Ghani', checkIn: '--', checkOut: '--', mobile: '0322 8877665', status: 'Leave' },
    { staffId: 'ST-110', name: 'Farhan Ali', checkIn: '09:30 AM', checkOut: '06:00 PM', mobile: '0315 3344556', status: 'Present' },
    { staffId: 'ST-111', name: 'Rabia Basri', checkIn: '09:00 AM', checkOut: 'In Shift', mobile: '0331 9988776', status: 'Present' },
    { staffId: 'ST-112', name: 'Mohsin Naqvi', checkIn: '--', checkOut: '--', mobile: '0305 7766554', status: 'Absent' },
  ];

  // Filtering Logic for Staff
  const filteredStaff = allStaffAttendance.filter(staff => {
    const matchesSearch = staff.staffId.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                          staff.name.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                          staff.status.toLowerCase().includes(staffSearchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination Logic for Staff
  const staffTotalPages = Math.ceil(filteredStaff.length / staffRowsPerPage);
  const staffIndexOfLastRow = staffCurrentPage * staffRowsPerPage;
  const staffIndexOfFirstRow = staffIndexOfLastRow - staffRowsPerPage;
  const staffCurrentRows = filteredStaff.slice(staffIndexOfFirstRow, staffIndexOfLastRow);

  // CSV Exporters
  const handleExportBookingsCSV = () => {
    const headers = ["Room No", "Guest Name", "Check In", "Check Out", "Mobile", "Status"];
    const rows = filteredBookings.map(b => [b.room, `"${b.name}"`, b.checkIn, b.checkOut, `"${b.mobile}"`, b.status]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `current_bookings_${dateFilter.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportStaffCSV = () => {
    const headers = ["Staff ID", "Staff Name", "Check In", "Check Out", "Mobile", "Status"];
    const rows = filteredStaff.map(s => [s.staffId, `"${s.name}"`, s.checkIn, s.checkOut, `"${s.mobile}"`, s.status]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `staff_attendance_${staffDateFilter.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Guest List State & Data (matching mockup)
  // Note: inventory is now an array of { name, date, time } entries instead of a plain
  // string, so the "Add Inventory" shortcut can push new items directly into a guest's record.
  const initialGuestList = [
    {
      id: 'GST-001',
      name: 'Cara Stevens',
      room: 'Room:102',
      roomNum: '102',
      roomType: 'Deluxe Suite',
      date: "12 June '20",
      time: '09:00-10:00',
      checkIn: '10/01/2023',
      checkOut: '10/05/2023',
      inventory: [
        { name: 'Bathrobe', date: '2023-10-01', time: '10:00' },
        { name: 'Extra Pillow', date: '2023-10-01', time: '10:05' },
      ],
      mobile: '0300 1234567',
      email: 'cara.stevens@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      status: 'Checked In',
      payment: 'Paid',
      totalAmount: '$450',
      remainingPrice: '$0',
      breakfast: 'Yes',
      occupants: 2,
      customerId: 'CUST-1021',
      idCard: '42101-1234567-1',
      notes: 'Prefers quiet corner room on higher floor, extra towels requested.'
    },
    {
      id: 'GST-002',
      name: 'Airi Satou',
      room: 'Room:105',
      roomNum: '105',
      roomType: 'Executive Suite',
      date: "13 June '20",
      time: '11:00-12:00',
      checkIn: '10/02/2023',
      checkOut: '10/06/2023',
      inventory: [],
      mobile: '0333 9876543',
      email: 'airi.satou@example.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      status: 'Booked',
      payment: 'Pending',
      totalAmount: '$380',
      remainingPrice: '$380',
      breakfast: 'No',
      occupants: 1,
      customerId: 'CUST-1022',
      idCard: '42201-9876543-2',
      notes: 'Late check-in expected around 11:30 PM. Airport pickup arranged.'
    },
    {
      id: 'GST-003',
      name: 'Jens Brincker',
      room: 'Room:302',
      roomNum: '302',
      roomType: 'Standard King',
      date: "15 June '20",
      time: '09:30-10:30',
      checkIn: '10/03/2023',
      checkOut: '10/07/2023',
      inventory: [
        { name: 'Water Bottle', date: '2023-10-03', time: '09:00' },
      ],
      mobile: '0312 5551234',
      email: 'jens.brincker@example.com',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
      status: 'Checked In',
      payment: 'Paid',
      totalAmount: '$260',
      remainingPrice: '$0',
      breakfast: 'Yes',
      occupants: 2,
      customerId: 'CUST-1023',
      idCard: '42301-5551234-3',
      notes: 'Corporate guest, requested fast Wi-Fi and work desk setup.'
    },
    {
      id: 'GST-004',
      name: 'Angelica Ramos',
      room: 'Room:507',
      roomNum: '507',
      roomType: 'Presidential Suite',
      date: "16 June '20",
      time: '14:00-15:00',
      checkIn: '10/04/2023',
      checkOut: '10/08/2023',
      inventory: [
        { name: 'Coke Can', date: '2023-10-04', time: '14:30' },
        { name: 'Dinner', date: '2023-10-04', time: '20:00' },
        { name: 'Bathrobe', date: '2023-10-05', time: '09:00' },
      ],
      mobile: '0345 4449876',
      email: 'angelica.ramos@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      status: 'Checked In',
      payment: 'Paid',
      totalAmount: '$890',
      remainingPrice: '$0',
      breakfast: 'Yes',
      occupants: 4,
      customerId: 'CUST-1024',
      idCard: '42401-4449876-4',
      notes: 'VIP guest. Welcome fruit basket and complimentary drinks arranged.'
    },
    {
      id: 'GST-005',
      name: 'Cara Stevens',
      room: 'Room:804',
      roomNum: '804',
      roomType: 'Deluxe Twin',
      date: "18 June '20",
      time: '11:00-12:30',
      checkIn: '10/05/2023',
      checkOut: '10/09/2023',
      inventory: [],
      mobile: '0321 8887654',
      email: 'cara.s2@example.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
      status: 'Booked',
      payment: 'Partial',
      totalAmount: '$310',
      remainingPrice: '$110',
      breakfast: 'No',
      occupants: 3,
      customerId: 'CUST-1025',
      idCard: '42501-8887654-5',
      notes: 'Family booking with children. Baby cot requested.'
    },
  ];

  const [guestList, setGuestList] = useState(initialGuestList);
  const [guestDateFilter, setGuestDateFilter] = useState('Daily');
  const [guestCustomStartDate, setGuestCustomStartDate] = useState('');
  const [guestCustomEndDate, setGuestCustomEndDate] = useState('');
  const [isGuestCustomPopupOpen, setIsGuestCustomPopupOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  const handleOpenGuestModal = (guest) => {
    setSelectedGuest(guest);
    setIsGuestModalOpen(true);
  };

  const handleExportGuestCSV = () => {
    const headers = ["Guest Name", "Room", "Room Type", "Date", "Time Slot", "Mobile", "Email", "Status", "Payment", "Amount"];
    const rows = guestList.map(g => [
      `"${g.name}"`,
      `"${g.roomNum}"`,
      `"${g.roomType}"`,
      `"${g.date}"`,
      `"${g.time}"`,
      `"${g.mobile}"`,
      `"${g.email}"`,
      g.status,
      g.payment,
      g.totalAmount
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `guest_list_${guestDateFilter.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Add Inventory shortcut (replaces the old Room Status widget) ---
  const todayStr = new Date().toISOString().split('T')[0];
  const nowStr = new Date().toTimeString().slice(0, 5);

  const [invGuestId, setInvGuestId] = useState('');
  const [invGuestDropdownOpen, setInvGuestDropdownOpen] = useState(false);
  const [invGuestSearch, setInvGuestSearch] = useState('');
  const [invItemName, setInvItemName] = useState('');
  const [invItemPrice, setInvItemPrice] = useState('');
  const [invDate, setInvDate] = useState(todayStr);
  const [invTime, setInvTime] = useState(nowStr);
  const [invSuccessMsg, setInvSuccessMsg] = useState('');

  // Only guests who are actually checked in can have inventory added
  const checkedInGuests = guestList.filter(g => g.status === 'Checked In');
  
  const filteredInvGuests = checkedInGuests.filter(g => 
    g.name.toLowerCase().includes(invGuestSearch.toLowerCase()) || 
    g.room.toLowerCase().includes(invGuestSearch.toLowerCase())
  );

  const handleAddInventory = () => {
    if (!invGuestId || !invItemName.trim() || !invItemPrice.trim()) return;

    const guest = guestList.find(g => g.id === invGuestId);
    const newItem = { name: invItemName.trim(), price: invItemPrice.trim(), date: invDate, time: invTime };

    setGuestList(prev => prev.map(g =>
      g.id === invGuestId
        ? { ...g, inventory: [...(Array.isArray(g.inventory) ? g.inventory : []), newItem] }
        : g
    ));

    setInvSuccessMsg(`Added "${newItem.name}" ($${newItem.price}) to ${guest?.name}'s inventory`);
    setInvItemName('');
    setInvItemPrice('');
    setTimeout(() => setInvSuccessMsg(''), 3000);
  };

  return (
    <div className="animate-fade-in pb-8 space-y-4">
      
      {/* 6 SIMPLE CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Reservation Today</span>
            <PersonAdd className="text-blue-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <span className="text-lg font-bold text-gray-900">{reservations.length}</span>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Occupied Rooms</span>
            <Bed className="text-teal-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <span className="text-lg font-bold text-gray-900">{roomInventory.filter(room => room.status === 'Booked').length}</span>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Check-in Today</span>
            <Login className="text-green-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <span className="text-lg font-bold text-gray-900">{reservations.filter(reservation => reservation.status === 'CheckIn').length}</span>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Checkout Today</span>
            <Logout className="text-orange-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <span className="text-lg font-bold text-gray-900">{reservations.filter(reservation => reservation.status === 'CheckOut').length}</span>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Revenue Today</span>
            <AttachMoney className="text-purple-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <span className="text-lg font-bold text-gray-900">$1,250</span>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Payments Today</span>
            <CreditCard className="text-indigo-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <span className="text-lg font-bold text-gray-900">{reservations.filter(reservation => reservation.payment === 'Paid').length}</span>
        </div>
      </div>

      
      {/* SECOND ROW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] truncate pr-1">Rooms Dirty</span>
            <Warning className="text-red-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <span className="text-lg font-bold text-gray-900">12</span>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] truncate pr-1">Rooms Available</span>
            <CleaningServices className="text-teal-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <span className="text-lg font-bold text-gray-900">{roomInventory.filter(room => room.status === 'Open').length}</span>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] truncate pr-1">Staff Absent</span>
            <Cancel className="text-orange-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <span className="text-lg font-bold text-gray-900">3</span>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] truncate pr-1">Under Maintenance</span>
            <Build className="text-gray-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <span className="text-lg font-bold text-gray-900">4</span>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] truncate pr-1">Late Checkouts</span>
            <Schedule className="text-purple-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <span className="text-lg font-bold text-gray-900">8</span>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] truncate pr-1">Pending Payments</span>
            <CreditCard className="text-red-400 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <span className="text-lg font-bold text-gray-900">15</span>
        </div>
      </div>

      {/* ALL RESERVATIONS TABLE */}
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-4">
          <AllBookings title="Current Booking" showDateFilter={true} />
        </div>
      </div>

      {/* STAFF ATTENDANCE AND WIDGETS ROW */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Side: Staff Attendance Table */}
        <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-[15px] font-bold text-gray-700">Today's Staff Attendance</h2>
            <Link to="/hr/attendance/todays-attendance" className="text-[12px] text-[#1b7f43] font-bold hover:underline bg-[#e5f4eb] px-3 py-1 rounded-full">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100">
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Shift</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Time In</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentStaffAttendance.map((staff, idx) => (
                  <tr key={staff.id} className={`hover:bg-gray-50 transition-colors ${idx !== recentStaffAttendance.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-gray-800">{staff.name}</span>
                        <span className="text-[11px] font-medium text-gray-500">{staff.role}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[13px] text-gray-600 font-medium">{staff.shift}</td>
                    <td className="py-3 px-4 text-[13px] text-gray-600 font-medium">{staff.timeIn}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${
                        staff.status === 'Present' ? 'bg-[#e5f4eb] text-[#1b7f43]' :
                        staff.status === 'Late' ? 'bg-orange-50 text-orange-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {staff.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Important Cards */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          {/* Card 1: Revenue summary */}
          <div className="bg-gradient-to-br from-[#1b7f43] to-[#125d30] rounded-2xl p-5 text-white shadow-sm flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
              <TrendingUp sx={{ fontSize: 80 }} />
            </div>
            <h3 className="text-white/80 text-[13px] font-medium mb-1">Today's Revenue</h3>
            <div className="text-[28px] font-bold mb-4">$8,450.00</div>
            <div className="flex justify-between items-center text-[12px]">
              <span className="bg-white/20 px-2 py-1 rounded text-white font-medium">+15% from yesterday</span>
            </div>
          </div>
          
          {/* Card 2: Upcoming tasks */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col flex-1">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[14px] font-bold text-gray-700">Pending Operations</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <CleaningServices sx={{ fontSize: 16 }} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-gray-700">5 Rooms to Clean</span>
                  <span className="text-[11px] text-gray-500">Housekeeping</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                  <RoomService sx={{ fontSize: 16 }} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-gray-700">3 Room Service Orders</span>
                  <span className="text-[11px] text-gray-500">Restaurant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
