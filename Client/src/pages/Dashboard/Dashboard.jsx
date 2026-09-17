import React, { useState } from 'react';
import { 
  MoreHoriz, Phone, Edit, Delete, Logout, Cancel,
  PersonAdd, Login, AttachMoney, Bed, CreditCard,
  Search, ChevronLeft, ChevronRight, Hotel, FileDownload,
  Notifications, LocalCafe, Build, CleaningServices, Schedule, Warning,
  CheckCircle, BuildCircle, Badge, Close, Inventory2, Add, KeyboardArrowDown
} from '@mui/icons-material';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import Phone from '@mui/icons-material/Phone';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Logout from '@mui/icons-material/Logout';
import Cancel from '@mui/icons-material/Cancel';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Login from '@mui/icons-material/Login';
import AttachMoney from '@mui/icons-material/AttachMoney';
import Bed from '@mui/icons-material/Bed';
import CreditCard from '@mui/icons-material/CreditCard';
import Search from '@mui/icons-material/Search';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Hotel from '@mui/icons-material/Hotel';
import FileDownload from '@mui/icons-material/FileDownload';
import Notifications from '@mui/icons-material/Notifications';
import LocalCafe from '@mui/icons-material/LocalCafe';
import Build from '@mui/icons-material/Build';
import CleaningServices from '@mui/icons-material/CleaningServices';
import Schedule from '@mui/icons-material/Schedule';
import Warning from '@mui/icons-material/Warning';
import CheckCircle from '@mui/icons-material/CheckCircle';
import BuildCircle from '@mui/icons-material/BuildCircle';
import Badge from '@mui/icons-material/Badge';
import Close from '@mui/icons-material/Close';
import Inventory2 from '@mui/icons-material/Inventory2';
import Add from '@mui/icons-material/Add';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { Popover } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getRooms } from '../Housekeeping/hkStore';

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

export default function Dashboard() {
  const navigate = useNavigate();
  const [hkRooms, setHkRooms] = useState(getRooms());

  React.useEffect(() => {
    const syncData = () => setHkRooms(getRooms());
    window.addEventListener('storage', syncData);
    window.addEventListener('hk_update', syncData);
    return () => {
      window.removeEventListener('storage', syncData);
      window.removeEventListener('hk_update', syncData);
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
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
        <div>
          <p className="text-sm text-gray-500">Live overview of today's hotel operations</p>
        </div>
        <button className="mt-3 md:mt-0 bg-[var(--primary-main)] hover:brightness-110 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center">
          + New Reservation
        </button>
      </div>

      {/* 6 SIMPLE CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Reservation Today</span>
            <PersonAdd className="text-blue-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <span className="text-lg font-bold text-gray-900">24</span>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Occupied Rooms</span>
            <Bed className="text-teal-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <span className="text-lg font-bold text-gray-900">42</span>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Check-in Today</span>
            <Login className="text-green-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <span className="text-lg font-bold text-gray-900">12</span>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Checkout Today</span>
            <Logout className="text-orange-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <span className="text-lg font-bold text-gray-900">18</span>
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
          <span className="text-lg font-bold text-gray-900">15</span>
        </div>
      </div>

      {/* SECTION 1: CURRENT BOOKINGS (left) + ADD INVENTORY & SERVICE REQUESTS (right) */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        
        {/* Current Booking Table (Main Area) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1 w-full overflow-visible min-w-0">
          <div className="p-4 border-b border-gray-100 flex flex-row items-center justify-between space-x-2 overflow-visible">
            <h3 className="text-gray-800 font-bold text-[14px] lg:text-[15px] whitespace-nowrap">
              {dateFilter === 'Daily' ? 'Current' : dateFilter} Booking
            </h3>
            
            <div className="flex flex-row items-center space-x-2 ml-auto">
              {/* Search Bar */}
              <div className="relative w-28 md:w-40 xl:w-52 shrink">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" sx={{ fontSize: 16 }} />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow truncate"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to page 1 on search
                  }}
                />
              </div>

              {/* Date Filters with Custom Popup Wrapper */}
              <div className="relative shrink-0 flex items-center">
                {/* Segmented Control */}
                <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {['Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => {
                        if (tab === 'Custom') {
                          if (dateFilter === 'Custom') {
                            setIsCustomPopupOpen(!isCustomPopupOpen);
                          } else {
                            setDateFilter(tab);
                            setCurrentPage(1);
                            setIsCustomPopupOpen(true);
                          }
                        } else {
                          setDateFilter(tab);
                          setCurrentPage(1);
                          setIsCustomPopupOpen(false);
                        }
                      }}
                      className={`px-2.5 py-1.5 text-[11px] font-semibold transition-colors border-r border-gray-200 last:border-r-0 ${
                        dateFilter === tab 
                          ? 'bg-[#e5f4eb] text-[#1b7f43] border-[#1b7f43]/20 relative z-10' 
                          : 'text-gray-500 hover:bg-[#e5f4eb] hover:text-[#1b7f43]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Floating Custom Date Picker Popup */}
                {dateFilter === 'Custom' && isCustomPopupOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-50 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.1)] border border-gray-100 rounded-xl p-3 flex flex-col gap-2 min-w-[200px] animate-fade-in">
                    <p className="text-[11px] font-bold text-gray-700">Custom Date Range</p>
                    <div className="flex flex-col gap-1.5">
                      <input 
                        type="date" 
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[11px] font-medium text-gray-600 focus:outline-none focus:border-[#1b7f43]"
                        value={customStartDate}
                        onChange={e => {
                          const val = e.target.value;
                          setCustomStartDate(val);
                          setCurrentPage(1);
                          if (val && customEndDate) {
                            setTimeout(() => setIsCustomPopupOpen(false), 150);
                          }
                        }}
                      />
                      <span className="text-gray-400 text-[10px] font-bold text-center">TO</span>
                      <input 
                        type="date" 
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[11px] font-medium text-gray-600 focus:outline-none focus:border-[#1b7f43]"
                        value={customEndDate}
                        onChange={e => {
                          const val = e.target.value;
                          setCustomEndDate(val);
                          setCurrentPage(1);
                          if (customStartDate && val) {
                            setTimeout(() => setIsCustomPopupOpen(false), 150);
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CSV Export Button */}
              <button 
                onClick={handleExportBookingsCSV}
                className="flex items-center space-x-1 bg-[var(--primary-main)] hover:brightness-110 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all shrink-0 cursor-pointer"
              >
                <FileDownload sx={{ fontSize: 14 }} className="text-white" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="inline sm:hidden">CSV</span>
              </button>
            </div>
          </div>
          
          {/* Table Content */}
          <div className="overflow-x-auto hide-scrollbar w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="py-2.5 px-2 text-[11px] font-bold text-gray-700 leading-tight">Res <br/> ID</th>
                  <th className="py-2.5 px-2 text-[11px] font-bold text-gray-700 leading-tight">Guest <br/> Name</th>
                  <th className="py-2.5 px-2 text-[11px] font-bold text-gray-700 leading-tight">Mobile <br/> No</th>
                  <th className="py-2.5 px-2 text-[11px] font-bold text-gray-700 leading-tight">Room no/ <br/> Type</th>
                  <th className="py-2.5 px-2 text-[11px] font-bold text-gray-700 leading-tight">Reservation <br/> Date</th>
                  <th className="py-2.5 px-2 text-[11px] font-bold text-gray-700 leading-tight">Check-In</th>
                  <th className="py-2.5 px-2 text-[11px] font-bold text-gray-700 leading-tight">Check-Out</th>
                  <th className="py-2.5 px-2 text-[11px] font-bold text-gray-700 leading-tight">Inventory</th>
                  <th className="py-2.5 px-2 text-[11px] font-bold text-gray-700 leading-tight">Total <br/> Price</th>
                  <th className="py-2.5 px-2 text-[11px] font-bold text-gray-700 leading-tight">Remaining</th>
                  <th className="py-2.5 px-2 text-[11px] font-bold text-gray-700 leading-tight">Payment</th>
                  <th className="py-2.5 px-2 text-[11px] font-bold text-gray-700 text-center leading-tight">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((booking, index) => {
                    const start = new Date(booking.checkIn);
                    const end = new Date(booking.checkOut);
                    const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
                    const stayText = days > 0 ? `${days} stay${days > 1 ? 's' : ''}` : 'Same day';

                    return (
                      <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-2.5 px-2 text-[12px] font-bold text-gray-800">{booking.id}</td>
                        <td className="py-2.5 px-2 text-[12px] font-medium text-gray-800">{booking.name}</td>
                        <td className="py-2.5 px-2 text-[12px] text-gray-600">
                          <div className="flex items-center font-medium">
                            <Phone className="text-[#1b7f43] mr-1.5" sx={{ fontSize: 13 }} />
                            {booking.mobile}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-[12px] text-gray-600 font-medium">
                          {booking.room} <br/> <span className="text-[10px] text-gray-400">{booking.roomType}</span>
                        </td>
                        <td className="py-2.5 px-2 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-[12px] text-gray-600">
                              {booking.checkIn} / <br/> {booking.checkOut}
                            </span>
                            <span className="text-[10px] font-medium text-[#1b7f43]">
                              {stayText}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-[12px] text-gray-600">{booking.checkIn}</td>
                        <td className="py-2.5 px-2 text-[12px] text-gray-600">{booking.checkOut}</td>
                        <td className="py-2.5 px-2 text-[12px] font-medium text-gray-700">
                          <InventoryCell items={booking.inventory} />
                        </td>
                        <td className="py-2.5 px-2 text-[12px] font-bold text-gray-900">{booking.totalAmount}</td>
                        <td className="py-2.5 px-2 text-[12px] font-semibold text-red-500">{booking.remainingPrice}</td>
                        <td className="py-2.5 px-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                            booking.payment === 'Paid' ? 'bg-[#e2f8e9] text-[#1b7f43]' :
                            booking.payment === 'Partial' ? 'bg-orange-100 text-orange-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {booking.payment}
                          </span>
                        </td>
                      <td className="py-2.5 px-2 text-center relative">
                        <button 
                          onClick={() => setActionMenuOpen(actionMenuOpen === index ? null : index)} 
                          className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                        >
                          <MoreHoriz fontSize="small" />
                        </button>
                        
                        {/* Action Dropdown Menu */}
                        {actionMenuOpen === index && (
                          <div className="absolute right-[calc(100%-10px)] top-0 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 rounded-xl w-36 z-[100] py-1 flex flex-col overflow-hidden animate-fade-in">
                            <button className="flex items-center px-3 py-1.5 text-[12px] font-medium text-gray-700 hover:bg-gray-50 text-left">
                              <Edit className="mr-2 text-gray-500" sx={{ fontSize: 15 }} /> Edit
                            </button>
                            <button className="flex items-center px-3 py-1.5 text-[12px] text-red-600 hover:bg-red-50 text-left font-medium">
                              <Delete className="mr-2 text-red-500" sx={{ fontSize: 15 }} /> Delete
                            </button>
                            <button className="flex items-center px-3 py-1.5 text-[12px] font-medium text-gray-700 hover:bg-gray-50 text-left">
                              <Logout className="mr-2 text-gray-500" sx={{ fontSize: 15 }} /> Check Out
                            </button>
                            <button className="flex items-center px-3 py-1.5 text-[12px] font-medium text-gray-700 hover:bg-gray-50 text-left">
                              <Cancel className="mr-2 text-gray-500" sx={{ fontSize: 15 }} /> Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
                ) : (
                  <tr>
                    <td colSpan="12" className="py-8 text-center text-gray-500 text-[13px]">
                      No bookings found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 0 && (
            <div className="p-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[12px] text-gray-500">
                Showing <span className="font-semibold text-gray-700">{indexOfFirstRow + 1}</span> to <span className="font-semibold text-gray-700">{Math.min(indexOfLastRow, filteredBookings.length)}</span> of <span className="font-semibold text-gray-700">{filteredBookings.length}</span>
              </span>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronLeft fontSize="small" />
                </button>
                
                {/* Page Numbers */}
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-6 h-6 rounded-md text-[12px] font-medium flex items-center justify-center transition-colors ${
                      currentPage === i + 1 
                        ? 'bg-[#1b7f43] text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronRight fontSize="small" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: nudged down slightly (lg:pt-4) and stretched (h-full) so the
            Service Requests card's bottom edge lines up with the table's bottom edge */}
        <div className="flex flex-col gap-4 w-full lg:w-[240px] shrink-0 lg:pt-4 h-full">
          
          {/* Add Inventory shortcut — replaces the old Room Status widget */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col shrink-0">
            <div className="p-2 border-b border-gray-100 flex items-center gap-2">
              <Inventory2 className="text-[#1b7f43]" sx={{ fontSize: 18 }} />
              <h3 className="text-gray-800 font-bold text-[14px]">Add Inventory</h3>
            </div>

            <div className="p-4 flex flex-col gap-2.5">
              {/* Guest select — Custom Dropdown */}
              <div className="relative">
                <label className="text-[10.5px] font-semibold text-gray-500 block mb-1">Guest</label>
                <div 
                  onClick={() => setInvGuestDropdownOpen(!invGuestDropdownOpen)}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white flex items-center justify-between cursor-pointer hover:border-[#1b7f43] transition-colors"
                >
                  <span className={`text-[11.5px] ${invGuestId ? 'text-gray-800' : 'text-gray-400'}`}>
                    {invGuestId 
                      ? (() => {
                          const g = checkedInGuests.find(x => x.id === invGuestId);
                          return g ? `${g.name} — ${g.room}` : 'Select checked-in guest';
                        })()
                      : 'Select checked-in guest'}
                  </span>
                  <ChevronRight 
                    sx={{ fontSize: 16 }} 
                    className={`text-gray-400 transition-transform ${invGuestDropdownOpen ? 'rotate-90' : ''}`} 
                  />
                </div>
                
                {invGuestDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg flex flex-col">
                    <div className="p-2 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" sx={{ fontSize: 14 }} />
                        <input
                          type="text"
                          placeholder="Search guest or room..."
                          value={invGuestSearch}
                          onChange={(e) => setInvGuestSearch(e.target.value)}
                          className="w-full pl-7 pr-2 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:border-[#1b7f43]"
                        />
                      </div>
                    </div>
                    <div className="max-h-40 overflow-y-auto hide-scrollbar">
                      {filteredInvGuests.map(g => (
                        <div 
                          key={g.id}
                          onClick={() => {
                            setInvGuestId(g.id);
                            setInvGuestSearch('');
                            setInvGuestDropdownOpen(false);
                          }}
                          className="px-3 py-2 flex items-center gap-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                        >
                          <img src={g.avatar} alt={g.name} className="w-6 h-6 rounded-full object-cover" />
                          <div className="flex flex-col">
                            <span className="text-[11.5px] font-bold text-gray-800 leading-tight">{g.name}</span>
                            <span className="text-[9.5px] text-gray-500">{g.room}</span>
                          </div>
                        </div>
                      ))}
                      {filteredInvGuests.length === 0 && (
                        <div className="px-3 py-4 text-center text-[11px] text-gray-500">No matching guests</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Item name and Price */}
              <div className="flex gap-2">
                <div className="flex-[2]">
                  <label className="text-[10.5px] font-semibold text-gray-500 block mb-1">Item</label>
                  <input
                    type="text"
                    value={invItemName}
                    onChange={(e) => setInvItemName(e.target.value)}
                    placeholder="e.g. Coke, Dinner..."
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[11.5px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10.5px] font-semibold text-gray-500 block mb-1">Price</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-[11.5px]">$</span>
                    <input
                      type="number"
                      value={invItemPrice}
                      onChange={(e) => setInvItemPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-5 pr-2 py-1.5 border border-gray-200 rounded-lg text-[11.5px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]"
                    />
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10.5px] font-semibold text-gray-500 block mb-1">Date</label>
                  <input
                    type="date"
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10.5px] font-semibold text-gray-500 block mb-1">Time</label>
                  <input
                    type="time"
                    value={invTime}
                    onChange={(e) => setInvTime(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]"
                  />
                </div>
              </div>

              <button
                onClick={handleAddInventory}
                disabled={!invGuestId || !invItemName.trim()}
                className="mt-1 w-full bg-[var(--primary-main)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-white py-1.5 rounded-lg text-[11.5px] font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Add sx={{ fontSize: 14 }} /> Add to Guest
              </button>

              {invSuccessMsg && (
                <p className="text-[10.5px] font-semibold text-[#1b7f43] flex items-center gap-1 mt-0.5">
                  <CheckCircle sx={{ fontSize: 12 }} /> {invSuccessMsg}
                </p>
              )}
            </div>
          </div>
          
          {/* Housekeeping / Room Operations Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col shrink-0">
            <div className="p-2 border-b border-gray-100 flex items-center gap-2">
              <CleaningServices className="text-[#1b7f43]" sx={{ fontSize: 18 }} />
              <h3 className="text-gray-800 font-bold text-[14px]">Housekeeping</h3>
            </div>
            <div className="p-3 flex flex-col gap-1.5">
              {[
                { label: 'Dirty', count: hkStats.dirty, color: 'text-red-500' },
                { label: 'Assigned', count: hkStats.assigned, color: 'text-orange-500' },
                { label: 'Cleaning', count: hkStats.cleaning, color: 'text-blue-500' },
                { label: 'Inspection Required', count: hkStats.inspection, color: 'text-purple-500' },
                { label: 'Clean / Ready', count: hkStats.clean, color: 'text-[#1b7f43]' },
                { label: 'Occupied', count: hkStats.occupied, color: 'text-blue-600' },
                { label: 'Maintenance', count: hkStats.maintenance, color: 'text-red-600' },
                { label: 'DND', count: hkStats.dnd, color: 'text-gray-400' },
              ].map(stat => (
                <div 
                  key={stat.label}
                  onClick={() => handleNavigateHk(stat.label)}
                  className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 px-1 rounded transition-colors"
                >
                  <span className="text-[11.5px] font-semibold text-gray-600">{stat.label}</span>
                  <span className={`text-[11.5px] font-bold ${stat.color}`}>{String(stat.count).padStart(2, '0')}</span>
                </div>
              ))}
              <button 
                onClick={() => navigate('/housekeeping/rooms-cleaning')}
                className="mt-2 w-full text-[11px] font-bold text-[#1b7f43] hover:underline flex justify-center items-center gap-1"
              >
                View Housekeeping <ChevronRight sx={{ fontSize: 14 }} />
              </button>
            </div>
          </div>
          {/* Service Requests Widget — now flex-1 so it stretches to match the table's height */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1">
            {/* Header */}
            <div className="p-2 border-b border-gray-100">
              <div className="flex items-center">
                <Notifications className="text-orange-500 mr-2" sx={{ fontSize: 20 }} />
                <h3 className="text-gray-800 font-bold text-[15px]">Service Requests</h3>
              </div>
              <p className="text-[11px] text-gray-500 ml-7">Active requests requiring attention</p>
            </div>

            <div className="p-2 flex flex-col gap-4">
              {/* Stats Box */}
              <div className="bg-[#f8f9fa] rounded-xl p-1 flex justify-between items-center text-center">
                <div className="flex flex-col flex-1 border-r border-gray-200 last:border-r-0">
                  <span className="text-xl font-black text-amber-500">3</span>
                  <span className="text-[9px] font-bold text-gray-500 mt-1">PENDING</span>
                </div>
                <div className="flex flex-col flex-1 border-r border-gray-200 last:border-r-0">
                  <span className="text-xl font-black text-[#42a5f5]">2</span>
                  <span className="text-[9px] font-bold text-gray-500 mt-1">IN PROGRESS</span>
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-xl font-black text-[#ef5350]">2</span>
                  <span className="text-[9px] font-bold text-gray-500 mt-1">HIGH PRIORITY</span>
                </div>
              </div>

              {/* Recent Requests List */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-gray-800 font-bold text-[13px]">Recent Requests</h4>
                  <button className="text-blue-500 text-[11px] font-semibold hover:underline bg-transparent border-none cursor-pointer">View All</button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto hide-scrollbar pr-1">
                  {/* Item 1 */}
                  <div className="border border-gray-100 rounded-xl p-2 flex items-start gap-3">
                    <div className="bg-orange-50 text-orange-500 rounded-full p-2 shrink-0">
                      <LocalCafe sx={{ fontSize: 16 }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="text-[12px] font-bold text-gray-700 truncate pr-2">Extra towels and pillows</h5>
                        <span className="bg-[#fef3c7] text-[#b45309] text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0">Pending</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-gray-500">Room 205 &nbsp;&middot;&nbsp; 15m ago</span>
                        <div className="flex items-center text-gray-400 text-[10px]">
                          <Schedule sx={{ fontSize: 12 }} className="mr-0.5" /> 10m
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="border border-gray-100 rounded-xl p-2 flex items-start gap-3">
                    <div className="bg-orange-50 text-orange-500 rounded-full p-2 shrink-0">
                      <Build sx={{ fontSize: 16 }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="text-[12px] font-bold text-gray-700 truncate pr-2">Air conditioning not working</h5>
                        <span className="bg-[#dbeafe] text-[#1e40af] text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0">In_progress</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-gray-500">Room 312 &nbsp;&middot;&nbsp; 30m ago</span>
                        <div className="flex items-center text-gray-400 text-[10px]">
                          <Schedule sx={{ fontSize: 12 }} className="mr-0.5" /> 45m
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="border border-gray-100 rounded-xl p-2 flex items-start gap-3">
                    <div className="bg-orange-50 text-orange-500 rounded-full p-2 shrink-0">
                      <CleaningServices sx={{ fontSize: 16 }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="text-[12px] font-bold text-gray-700 truncate pr-2">Urgent cleaning required</h5>
                        <span className="bg-[#fef3c7] text-[#b45309] text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0">Pending</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-gray-500">Room 105 &nbsp;&middot;&nbsp; 1h ago</span>
                        <div className="flex items-center text-gray-400 text-[10px]">
                          <Schedule sx={{ fontSize: 12 }} className="mr-0.5" /> 1h
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex gap-2">
                <button className="flex-1 relative border border-[#1b7f43] bg-white text-[#1b7f43] hover:bg-[#e5f4eb] transition-colors rounded-lg py-2 flex items-center justify-center gap-1.5 text-[11px] font-bold">
                  <Schedule sx={{ fontSize: 14 }} /> Handle Pending
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">3</span>
                </button>
                <button className="flex-1 relative border border-[#1b7f43] bg-white text-[#1b7f43] hover:bg-[#e5f4eb] transition-colors rounded-lg py-2 flex items-center justify-center gap-1.5 text-[11px] font-bold">
                  <Warning sx={{ fontSize: 14 }} /> Urgent Only
                  <span className="absolute -top-2 -right-2 bg-slate-700 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">2</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: STAFF ATTENDANCE TABLE (left) + GUEST LIST CARD (right) */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        
        {/* Left: Staff Attendance Summary Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1 w-full overflow-visible min-w-0">
          <div className="p-4 border-b border-gray-100 flex flex-row items-center justify-between space-x-2 overflow-visible">
            <div className="flex items-center space-x-2">
              <h3 className="text-gray-800 font-bold text-[14px] lg:text-[15px] whitespace-nowrap">
                Staff Attendance
              </h3>
            </div>
            
            <div className="flex flex-row items-center space-x-2 ml-auto">
              {/* Search Bar */}
              <div className="relative w-28 md:w-40 xl:w-52 shrink">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" sx={{ fontSize: 16 }} />
                <input 
                  type="text" 
                  placeholder="Search staff..." 
                  className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow truncate"
                  value={staffSearchQuery}
                  onChange={(e) => {
                    setStaffSearchQuery(e.target.value);
                    setStaffCurrentPage(1);
                  }}
                />
              </div>

              {/* Date Filters with Custom Popup Wrapper */}
              <div className="relative shrink-0 flex items-center">
                {/* Segmented Control */}
                <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {['Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => {
                        if (tab === 'Custom') {
                          if (staffDateFilter === 'Custom') {
                            setIsStaffCustomPopupOpen(!isStaffCustomPopupOpen);
                          } else {
                            setStaffDateFilter(tab);
                            setStaffCurrentPage(1);
                            setIsStaffCustomPopupOpen(true);
                          }
                        } else {
                          setStaffDateFilter(tab);
                          setStaffCurrentPage(1);
                          setIsStaffCustomPopupOpen(false);
                        }
                      }}
                      className={`px-2.5 py-1.5 text-[11px] font-semibold transition-colors border-r border-gray-200 last:border-r-0 ${
                        staffDateFilter === tab 
                          ? 'bg-[#e5f4eb] text-[#1b7f43] border-[#1b7f43]/20 relative z-10' 
                          : 'text-gray-500 hover:bg-[#e5f4eb] hover:text-[#1b7f43]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Floating Custom Date Picker Popup */}
                {staffDateFilter === 'Custom' && isStaffCustomPopupOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-50 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.1)] border border-gray-100 rounded-xl p-3 flex flex-col gap-2 min-w-[200px] animate-fade-in">
                    <p className="text-[11px] font-bold text-gray-700">Custom Date Range</p>
                    <div className="flex flex-col gap-1.5">
                      <input 
                        type="date" 
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[11px] font-medium text-gray-600 focus:outline-none focus:border-[#1b7f43]"
                        value={staffCustomStartDate}
                        onChange={e => {
                          const val = e.target.value;
                          setStaffCustomStartDate(val);
                          setStaffCurrentPage(1);
                          if (val && staffCustomEndDate) {
                            setTimeout(() => setIsStaffCustomPopupOpen(false), 150);
                          }
                        }}
                      />
                      <span className="text-gray-400 text-[10px] font-bold text-center">TO</span>
                      <input 
                        type="date" 
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[11px] font-medium text-gray-600 focus:outline-none focus:border-[#1b7f43]"
                        value={staffCustomEndDate}
                        onChange={e => {
                          const val = e.target.value;
                          setStaffCustomEndDate(val);
                          setStaffCurrentPage(1);
                          if (staffCustomStartDate && val) {
                            setTimeout(() => setIsStaffCustomPopupOpen(false), 150);
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CSV Export Button */}
              <button 
                onClick={handleExportStaffCSV}
                className="flex items-center space-x-1 bg-[var(--primary-main)] hover:brightness-110 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all shrink-0 cursor-pointer"
              >
                <FileDownload sx={{ fontSize: 14 }} className="text-white" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="inline sm:hidden">CSV</span>
              </button>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto hide-scrollbar w-full">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Staff ID</th>
                  <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Staff Name</th>
                  <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Check In</th>
                  <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Check Out</th>
                  <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Mobile</th>
                  <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Status</th>
                  <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffCurrentRows.length > 0 ? (
                  staffCurrentRows.map((staff, index) => (
                    <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-4 text-[12px] text-gray-700 font-bold">{staff.staffId}</td>
                      <td className="py-2.5 px-4 text-[12px] font-medium text-gray-800">{staff.name}</td>
                      <td className="py-2.5 px-4 text-[12px] text-gray-600 font-medium">{staff.checkIn}</td>
                      <td className="py-2.5 px-4 text-[12px] text-gray-600 font-medium">{staff.checkOut}</td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center text-[12px] text-gray-600 font-medium">
                          <Phone className="text-[#1b7f43] mr-1.5" sx={{ fontSize: 13 }} />
                          {staff.mobile}
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md ${
                          staff.status === 'Present' ? 'bg-[#e2f8e9] text-[#1b7f43]' :
                          staff.status === 'Absent' ? 'bg-red-100 text-red-600' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {staff.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center relative">
                        <button 
                          onClick={() => setStaffActionMenuOpen(staffActionMenuOpen === index ? null : index)} 
                          className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                        >
                          <MoreHoriz fontSize="small" />
                        </button>
                        
                        {/* Action Dropdown Menu */}
                        {staffActionMenuOpen === index && (
                          <div className="absolute right-[calc(100%-10px)] top-0 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 rounded-xl w-36 z-[100] py-1 flex flex-col overflow-hidden animate-fade-in">
                            <button 
                              onClick={() => setStaffActionMenuOpen(null)}
                              className="flex items-center px-3 py-1.5 text-[12px] font-medium text-gray-700 hover:bg-gray-50 text-left cursor-pointer"
                            >
                              <Edit className="mr-2 text-gray-500" sx={{ fontSize: 15 }} /> Edit
                            </button>
                            <button 
                              onClick={() => setStaffActionMenuOpen(null)}
                              className="flex items-center px-3 py-1.5 text-[12px] text-red-600 hover:bg-red-50 text-left font-medium cursor-pointer"
                            >
                              <Delete className="mr-2 text-red-500" sx={{ fontSize: 15 }} /> Delete
                            </button>
                            <button 
                              onClick={() => setStaffActionMenuOpen(null)}
                              className="flex items-center px-3 py-1.5 text-[12px] font-medium text-[#1b7f43] hover:bg-gray-50 text-left cursor-pointer"
                            >
                              <Login className="mr-2 text-[#1b7f43]" sx={{ fontSize: 15 }} /> Check In
                            </button>
                            <button 
                              onClick={() => setStaffActionMenuOpen(null)}
                              className="flex items-center px-3 py-1.5 text-[12px] font-medium text-orange-600 hover:bg-gray-50 text-left cursor-pointer"
                            >
                              <Logout className="mr-2 text-orange-500" sx={{ fontSize: 15 }} /> Check Out
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500 text-[13px]">
                      No staff attendance records found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {staffTotalPages > 0 && (
            <div className="p-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[12px] text-gray-500">
                Showing <span className="font-semibold text-gray-700">{staffIndexOfFirstRow + 1}</span> to <span className="font-semibold text-gray-700">{Math.min(staffIndexOfLastRow, filteredStaff.length)}</span> of <span className="font-semibold text-gray-700">{filteredStaff.length}</span>
              </span>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => setStaffCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={staffCurrentPage === 1}
                  className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
                >
                  <ChevronLeft fontSize="small" />
                </button>
                
                {/* Page Numbers */}
                {[...Array(staffTotalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStaffCurrentPage(i + 1)}
                    className={`w-6 h-6 rounded-md text-[12px] font-medium flex items-center justify-center transition-colors cursor-pointer ${
                      staffCurrentPage === i + 1 
                        ? 'bg-[#1b7f43] text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  onClick={() => setStaffCurrentPage(prev => Math.min(prev + 1, staffTotalPages))}
                  disabled={staffCurrentPage === staffTotalPages}
                  className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
                >
                  <ChevronRight fontSize="small" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Guest List Card (matching table height) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col w-full lg:w-[240px] shrink-0 overflow-visible">
          {/* Header Row: Guest List + View All + CSV */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-gray-900 font-bold text-[15px]">Guest List</h3>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => {
                  if (guestList.length > 0) {
                    handleOpenGuestModal(guestList[0]);
                  }
                }}
                className="text-[#1b7f43] text-[12px] font-bold hover:underline cursor-pointer bg-transparent border-none"
              >
                View All
              </button>
              <button 
                onClick={handleExportGuestCSV}
                className="flex items-center space-x-1 bg-[var(--primary-main)] hover:brightness-110 text-white px-2 py-1 rounded-lg text-[11px] font-bold shadow-sm transition-all cursor-pointer"
                title="Export Guest List CSV"
              >
                <FileDownload sx={{ fontSize: 13 }} className="text-white" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Filter Row: Daily | Weekly | Monthly | Custom in one line below header */}
          <div className="px-3.5 pt-2.5 pb-2 border-b border-gray-100">
            <div className="relative flex items-center w-full">
              <div className="flex bg-gray-50 border border-gray-200 rounded-lg overflow-hidden w-full">
                {['Daily', 'Weekly', 'Monthly', 'Custom'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      if (tab === 'Custom') {
                        if (guestDateFilter === 'Custom') {
                          setIsGuestCustomPopupOpen(!isGuestCustomPopupOpen);
                        } else {
                          setGuestDateFilter(tab);
                          setIsGuestCustomPopupOpen(true);
                        }
                      } else {
                        setGuestDateFilter(tab);
                        setIsGuestCustomPopupOpen(false);
                      }
                    }}
                    className={`flex-1 py-1 text-[10.5px] font-semibold transition-colors border-r border-gray-200 last:border-r-0 text-center ${
                      guestDateFilter === tab 
                        ? 'bg-[#e5f4eb] text-[#1b7f43] font-bold' 
                        : 'text-gray-500 hover:bg-gray-100 hover:text-[#1b7f43]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Floating Custom Date Picker Popup */}
              {guestDateFilter === 'Custom' && isGuestCustomPopupOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.12)] border border-gray-100 rounded-xl p-3 flex flex-col gap-2 min-w-[200px] animate-fade-in">
                  <p className="text-[11px] font-bold text-gray-700">Custom Date Range</p>
                  <div className="flex flex-col gap-1.5">
                    <input 
                      type="date" 
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[11px] font-medium text-gray-600 focus:outline-none focus:border-[#1b7f43]"
                      value={guestCustomStartDate}
                      onChange={e => {
                        const val = e.target.value;
                        setGuestCustomStartDate(val);
                        if (val && guestCustomEndDate) {
                          setTimeout(() => setIsGuestCustomPopupOpen(false), 150);
                        }
                      }}
                    />
                    <span className="text-gray-400 text-[10px] font-bold text-center">TO</span>
                    <input 
                      type="date" 
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[11px] font-medium text-gray-600 focus:outline-none focus:border-[#1b7f43]"
                      value={guestCustomEndDate}
                      onChange={e => {
                        const val = e.target.value;
                        setGuestCustomEndDate(val);
                        if (guestCustomStartDate && val) {
                          setTimeout(() => setIsGuestCustomPopupOpen(false), 150);
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Guest List Items (matching image layout: avatar, name, room, date, time) */}
          <div className="flex-1 overflow-y-auto hide-scrollbar p-3 space-y-2.5 max-h-[460px]">
            {guestList.map((guest) => (
              <div 
                key={guest.id}
                onClick={() => handleOpenGuestModal(guest)}
                className="bg-[#f6f7fb] hover:bg-[#edf1fc] rounded-xl p-2.5 flex items-center justify-between transition-all cursor-pointer group"
              >
                {/* Avatar + Guest Name & Room */}
                <div className="flex items-center space-x-3 min-w-0 pr-2">
                  <img 
                    src={guest.avatar} 
                    alt={guest.name} 
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-white shadow-xs"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(guest.name)}&background=1b7f43&color=fff`;
                    }}
                  />
                  <div className="min-w-0">
                    <h4 className="text-gray-900 font-bold text-[12.5px] leading-snug truncate group-hover:text-[#1b7f43] transition-colors">
                      {guest.name}
                    </h4>
                    <p className="text-gray-400 text-[11px] font-medium leading-none mt-0.5">
                      {guest.room}
                    </p>
                  </div>
                </div>

                {/* Date & Time Slot */}
                <div className="text-right shrink-0">
                  <p className="text-gray-800 font-bold text-[11.5px] leading-tight">
                    {guest.date}
                  </p>
                  <p className="text-gray-400 text-[10px] font-medium leading-none mt-1">
                    {guest.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Guest Details Modal Popup */}
      {isGuestModalOpen && selectedGuest && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsGuestModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1b7f43]"></div>
                <h4 className="font-bold text-gray-800 text-[15px]">Guest Information</h4>
              </div>
              <button 
                onClick={() => setIsGuestModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <Close sx={{ fontSize: 18 }} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto hide-scrollbar">
              {/* Profile Bar */}
              <div className="flex items-center space-x-3.5 bg-[#f6f7fb] p-3.5 rounded-xl">
                <img 
                  src={selectedGuest.avatar} 
                  alt={selectedGuest.name} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                  onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedGuest.name) + '&background=1b7f43&color=fff'; }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-[16px] truncate">{selectedGuest.name}</h3>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-[12px] font-semibold text-[#1b7f43] bg-[#e5f4eb] px-2 py-0.5 rounded-md">
                      {selectedGuest.room}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium">
                      {selectedGuest.roomType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-[12px]">
                <div className="bg-gray-50 p-2.5 rounded-lg">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block mb-0.5">Check-In Date</span>
                  <span className="font-semibold text-gray-800">{selectedGuest.checkIn || selectedGuest.date}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block mb-0.5">Scheduled Slot</span>
                  <span className="font-semibold text-gray-800">{selectedGuest.time}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block mb-0.5">Phone Number</span>
                  <span className="font-semibold text-gray-800">{selectedGuest.mobile}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block mb-0.5">National ID / CNIC</span>
                  <span className="font-semibold text-gray-800">{selectedGuest.idCard}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block mb-0.5">Booking Status</span>
                  <span className="inline-block font-bold text-[10px] px-2 py-0.5 rounded-md bg-[#e2f8e9] text-[#1b7f43]">
                    {selectedGuest.status}
                  </span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block mb-0.5">Payment</span>
                  <span className="font-bold text-gray-800">{selectedGuest.payment} &middot; {selectedGuest.totalAmount}</span>
                </div>
              </div>

              {/* Inventory (populated by the Add Inventory shortcut) */}
              {selectedGuest.inventory && selectedGuest.inventory.length > 0 && (
                <div className="text-[12px] bg-gray-50 p-2.5 rounded-lg">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block mb-1.5">Inventory ({selectedGuest.inventory.length})</span>
                  <div className="flex flex-col divide-y divide-gray-100">
                    {selectedGuest.inventory.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1.5 first:pt-0 last:pb-0">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-700">{item.name}</span>
                          {item.price && <span className="font-bold text-[#1b7f43] text-[10.5px]">${item.price}</span>}
                        </div>
                        <span className="text-gray-400 text-[10.5px]">{item.date} • {item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="text-[12px] bg-gray-50 p-2.5 rounded-lg">
                <span className="text-gray-400 text-[10px] uppercase font-bold block mb-0.5">Email Address</span>
                <span className="font-medium text-gray-700">{selectedGuest.email}</span>
              </div>

              {/* Notes */}
              {selectedGuest.notes && (
                <div className="text-[12px] bg-amber-50/70 border border-amber-100 p-2.5 rounded-lg">
                  <span className="text-amber-800 text-[10px] uppercase font-bold block mb-0.5">Guest Notes</span>
                  <span className="text-amber-900 font-medium text-[11px]">{selectedGuest.notes}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-gray-100 bg-gray-50/50 flex justify-end space-x-2">
              <button 
                onClick={() => setIsGuestModalOpen(false)}
                className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-[12px] font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
