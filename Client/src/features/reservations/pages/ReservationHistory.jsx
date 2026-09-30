import React, { useState, useEffect } from 'react';
import { 
  Search, Download, MoreVert, Visibility, Print, ChevronLeft, ChevronRight,
  Inventory2, KeyboardArrowDown, Close, Person, Phone, Hotel, Event, CheckCircle,
  TableChart
} from '@mui/icons-material';
import { 
  Menu, MenuItem, IconButton, Popover, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { getReservations, RESERVATIONS_UPDATED_EVENT } from '../state/reservationStore';
import { normalizeBookingStatus } from '../state/bookingRules';
import { getGuestById, resolveGuestForBooking } from '../../guests/state/guestStore';
import { getRoomById, getRoomByRoomNo } from '../../rooms/state/roomStore';
import { getBookingDues, getInvoices } from '../../payment-billing/pages/paymentBillingStore';
import { getGuestCharges } from '../../inventory/pages/inventoryStore';

function parseReservationDate(value) {
  if (!value) return null;
  const str = String(value).trim();
  const datePart = str.split(' ')[0].split('T')[0];

  const isoMatch = datePart.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  const usMatch = datePart.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (usMatch) {
    let [, m, d, y] = usMatch;
    let year = Number(y);
    if (year < 100) year += year < 50 ? 2000 : 1900;
    return new Date(year, Number(m) - 1, Number(d));
  }

  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function normalizeToDateOnly(d) {
  if (!d || isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function isChargeWithinStay(charge, booking) {
  const chargeDateVal = charge.date || charge.reportedDate;
  if (!chargeDateVal) return false;
  const cParsed = parseReservationDate(chargeDateVal);
  const inParsed = parseReservationDate(booking.checkIn);
  const outParsed = parseReservationDate(booking.checkOut);

  if (!cParsed || !inParsed || !outParsed) return false;

  const cTime = normalizeToDateOnly(cParsed);
  const inTime = normalizeToDateOnly(inParsed);
  const outTime = normalizeToDateOnly(outParsed);

  if (cTime === null || inTime === null || outTime === null) return false;
  return cTime >= inTime && cTime <= outTime;
}

function isChargeAssociatedWithBooking(charge, booking, guestName, roomNo) {
  if (!charge || typeof charge !== 'object' || !booking || typeof booking !== 'object') {
    return false;
  }

  // 1. Explicit bookingId priority
  if (charge.bookingId !== undefined && charge.bookingId !== null && String(charge.bookingId).trim() !== '') {
    return String(charge.bookingId).trim() === String(booking.id).trim();
  }

  // 2. guestId priority (with verified stay boundaries and room consistency)
  if (charge.guestId !== undefined && charge.guestId !== null && String(charge.guestId).trim() !== '') {
    if (!booking.guestId || String(charge.guestId).trim() !== String(booking.guestId).trim()) {
      return false;
    }
    if (charge.roomNumber && roomNo && roomNo !== '—') {
      if (String(charge.roomNumber).trim() !== String(roomNo).trim()) {
        return false;
      }
    }
    return isChargeWithinStay(charge, booking);
  }

  // 3. Unambiguous existing relationship with verified stay boundaries
  const cName = charge.guestName ? String(charge.guestName).trim().toLowerCase() : '';
  const bName = guestName ? String(guestName).trim().toLowerCase() : '';
  if (!cName || !bName || cName === 'guest' || bName === 'guest') {
    return false;
  }
  if (cName !== bName) {
    return false;
  }

  const cRoom = charge.roomNumber ? String(charge.roomNumber).trim() : '';
  const bRoom = roomNo && roomNo !== '—' ? String(roomNo).trim() : '';
  if (!cRoom || !bRoom || cRoom !== bRoom) {
    return false;
  }

  return isChargeWithinStay(charge, booking);
}

function mapCanonicalToHistoryRow(booking, invoices = [], charges = []) {
  const guest = booking.guestId ? getGuestById(booking.guestId) : resolveGuestForBooking(booking);
  const guestName = guest?.name || booking.name || booking.guestName || 'Guest';
  const mobile = guest?.phone || booking.mobile || booking.phone || '—';
  const email = guest?.email || booking.email || booking.guestEmail || '—';

  const room = booking.roomId ? getRoomById(booking.roomId) : (booking.roomNo ? getRoomByRoomNo(booking.roomNo) : null);
  const roomNo = room?.roomNo || booking.roomNo || booking.roomNumber || (typeof booking.room === 'string' && booking.room.includes(' - ') ? booking.room.split(' - ')[0] : booking.room) || '—';
  const roomType = room?.roomType || booking.roomType || (typeof booking.room === 'string' && booking.room.includes(' - ') ? booking.room.split(' - ')[1] : '') || '';
  const roomDisplay = roomType ? `${roomNo} - ${roomType}` : (roomNo || '—');

  const linkedInvoice = invoices.find((inv) => String(inv.bookingId) === String(booking.id));
  let totalPrice = null;
  if (linkedInvoice) {
    if (linkedInvoice.totalAmount !== undefined && linkedInvoice.totalAmount !== null && !isNaN(Number(linkedInvoice.totalAmount))) {
      totalPrice = Number(linkedInvoice.totalAmount);
    }
  } else if (booking.totalPrice !== undefined && booking.totalPrice !== null && !isNaN(Number(booking.totalPrice))) {
    totalPrice = Number(booking.totalPrice);
  }

  let paymentStatus = '';
  if (linkedInvoice) {
    paymentStatus = linkedInvoice.status || '';
  } else if (booking.paymentStatus) {
    paymentStatus = booking.paymentStatus;
  } else if (booking.payment) {
    paymentStatus = booking.payment;
  } else {
    paymentStatus = normalizeBookingStatus(booking.status) === 'Cancelled' ? 'Cancelled' : 'Unpaid';
  }

  let inventory = [];
  if (charges.length > 0) {
    const matchedCharges = charges.filter((c) => isChargeAssociatedWithBooking(c, booking, guestName, roomNo));
    if (matchedCharges.length > 0) {
      inventory = matchedCharges.map((c) => ({
        name: c.itemName || 'Incidental Charge',
        date: c.date || c.reportedDate || '',
        time: '',
        price: Number(c.amount || c.unitPrice || 0)
      }));
    }
  }

  const reservationDate = booking.reservationDate || booking.createdAt || (booking.checkIn ? String(booking.checkIn).split(' ')[0] : '—');
  const checkIn = booking.checkIn || '—';
  const checkOut = booking.checkOut || '—';

  return {
    ...booking,
    id: booking.id,
    guestName,
    mobile,
    email,
    room: roomDisplay,
    roomNo,
    roomType,
    reservationDate,
    checkIn,
    checkOut,
    inventory,
    totalPrice,
    paymentStatus,
    normalizedStatus: normalizeBookingStatus(booking.status)
  };
}

// Column shows a dropdown trigger — clicking it opens the full numbered
// inventory list with date, time, price, and a total at the bottom.
function InventoryCell({ items = [] }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  if (!items || items.length === 0) {
    return <span className="text-[11px] text-gray-400">—</span>;
  }

  const total = items.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
        className="flex items-center gap-1 px-2 py-0.5 bg-[#e5f4eb] text-[#1b7f43] rounded text-[10.5px] font-semibold cursor-pointer hover:brightness-95 transition whitespace-nowrap"
      >
        <Inventory2 sx={{ fontSize: 12 }} />
        {items.length} {items.length === 1 ? 'Item' : 'Items'}
        <KeyboardArrowDown sx={{ fontSize: 13 }} />
      </button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <div className="p-3 min-w-[240px] max-w-[280px]">
          <div className="flex items-center gap-1.5 mb-2 text-gray-700">
            <Inventory2 sx={{ fontSize: 14 }} />
            <span className="text-[11px] font-bold">Full Inventory ({items.length})</span>
          </div>

          <div className="flex flex-col divide-y divide-gray-50 max-h-[220px] overflow-y-auto">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between gap-2 py-1.5 first:pt-0">
                <div className="flex items-start gap-1.5 min-w-0">
                  <span className="text-[10px] font-bold text-gray-400 shrink-0 pt-0.5">{idx + 1}.</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-gray-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-400">
                      {item.date} {item.time && `• ${item.time}`}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-gray-900 shrink-0">${item.price}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-700">Total</span>
            <span className="text-[12px] font-bold text-[#1b7f43]">${total}</span>
          </div>
        </div>
      </Popover>
    </>
  );
}

export default function ReservationHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Daily');
  const [isCustomPopupOpen, setIsCustomPopupOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Action Menu & Modal States
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedRes, setSelectedRes] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Canonical reservations state
  const [rawBookings, setRawBookings] = useState(() => getReservations());

  useEffect(() => {
    const syncReservations = () => setRawBookings(getReservations());
    window.addEventListener('storage', syncReservations);
    window.addEventListener(RESERVATIONS_UPDATED_EVENT, syncReservations);
    return () => {
      window.removeEventListener('storage', syncReservations);
      window.removeEventListener(RESERVATIONS_UPDATED_EVENT, syncReservations);
    };
  }, []);

  const invoices = getInvoices();
  let charges = [];
  try {
    charges = getGuestCharges();
  } catch {}

  const historicalReservations = rawBookings
    .filter((booking) => {
      const status = normalizeBookingStatus(booking.status);
      return status === 'Checked Out' || status === 'Cancelled';
    })
    .map((booking) => mapCanonicalToHistoryRow(booking, invoices, charges));

  const getRecordDate = (res) => {
    return parseReservationDate(res.checkOut || res.cancellationDate || res.checkIn || res.reservationDate);
  };

  const filterByDate = (res) => {
    const recDate = getRecordDate(res);
    if (!recDate) {
      return activeTab === 'Custom' && !customStartDate && !customEndDate;
    }

    const now = new Date();

    if (activeTab === 'Daily') {
      return recDate.getFullYear() === now.getFullYear() &&
             recDate.getMonth() === now.getMonth() &&
             recDate.getDate() === now.getDate();
    }

    if (activeTab === 'Weekly') {
      const diffNow = Math.abs(now.getTime() - recDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffNow <= 7;
    }

    if (activeTab === 'Monthly') {
      return recDate.getFullYear() === now.getFullYear() &&
             recDate.getMonth() === now.getMonth();
    }

    if (activeTab === 'Yearly') {
      return recDate.getFullYear() === now.getFullYear();
    }

    if (activeTab === 'Custom') {
      if (!customStartDate && !customEndDate) return true;
      const recTime = recDate.getTime();
      if (customStartDate) {
        const start = new Date(customStartDate + 'T00:00:00').getTime();
        if (recTime < start) return false;
      }
      if (customEndDate) {
        const end = new Date(customEndDate + 'T23:59:59').getTime();
        if (recTime > end) return false;
      }
      return true;
    }

    return true;
  };

  const filteredReservations = historicalReservations.filter((res) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      String(res.guestName || '').toLowerCase().includes(q) ||
      String(res.id || '').toLowerCase().includes(q) ||
      String(res.room || '').toLowerCase().includes(q) ||
      String(res.mobile || '').includes(searchQuery);

    return matchesSearch && filterByDate(res);
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedReservations = filteredReservations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleActionClick = (event, res) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedRes(res);
  };

  const handleActionClose = () => {
    setMenuAnchorEl(null);
  };

  const handleViewDetails = () => {
    setIsDetailsModalOpen(true);
    handleActionClose();
  };

  const handlePrintInvoice = () => {
    if (!selectedRes) return;
    const dues = getBookingDues(selectedRes);
    const duesDisplay = dues === null ? 'Unverified' : `$${dues}`;
    const totalPriceDisplay = selectedRes.totalPrice !== null ? `$${selectedRes.totalPrice}` : '—';

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      handleActionClose();
      return;
    }

    const html = `
      <html>
        <head>
          <title>Invoice - ${selectedRes.id}</title>
          <style>
            body { font-family: sans-serif; padding: 25px; color: #1e293b; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1b7f43; padding-bottom: 12px; margin-bottom: 20px; }
            .title { font-size: 20px; font-weight: bold; color: #1b7f43; margin: 0; }
            .section { margin-bottom: 20px; font-size: 13px; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; font-size: 13px; }
            th { background-color: #f8fafc; font-weight: 600; }
            .totals { margin-top: 20px; text-align: right; font-size: 14px; }
            .grand-total { font-size: 16px; font-weight: bold; color: #1b7f43; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">Booking Invoice</h1>
              <div style="font-size: 13px; color: #64748b;">Statement & Details</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: bold;">${selectedRes.id}</div>
              <div style="font-size: 12px; color: #64748b;">${selectedRes.reservationDate}</div>
            </div>
          </div>
          <div class="section">
            <div><strong>Guest Name:</strong> ${selectedRes.guestName}</div>
            <div><strong>Mobile:</strong> ${selectedRes.mobile}</div>
            <div><strong>Room / Type:</strong> ${selectedRes.room}</div>
            <div><strong>Stay:</strong> ${selectedRes.checkIn} to ${selectedRes.checkOut}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Room Stay (${selectedRes.room})</td>
                <td style="text-align: right;">${totalPriceDisplay}</td>
              </tr>
              ${(selectedRes.inventory || []).map(item => `
                <tr>
                  <td>${item.name} (${item.date || ''} ${item.time ? '• ' + item.time : ''})</td>
                  <td style="text-align: right;">$${item.price}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <div>Total Price: <strong>${totalPriceDisplay}</strong></div>
            <div>Payment Status: <strong>${selectedRes.paymentStatus}</strong></div>
            <div class="grand-total">Outstanding Dues: ${duesDisplay}</div>
          </div>
          <script>
            window.onload = () => { window.print(); };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    handleActionClose();
  };

  const getPaymentStatusBadge = (status) => {
    switch(status) {
      case 'Paid':
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#e5f4eb] text-[#1b7f43] border border-[#1b7f43]/20 whitespace-nowrap">Paid</span>;
      case 'Cancelled':
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-red-50 text-red-600 border border-red-200 whitespace-nowrap">Cancelled</span>;
      case 'Refunded':
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-600 border border-amber-200 whitespace-nowrap">Refunded</span>;
      case 'Partially Paid':
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-600 border border-blue-200 whitespace-nowrap">Partially Paid</span>;
      case 'Unpaid':
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-gray-100 text-gray-600 whitespace-nowrap">Unpaid</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-gray-100 text-gray-600 whitespace-nowrap">{status || '—'}</span>;
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Reservation ID',
      'Guest Name',
      'Mobile No',
      'Room',
      'Reservation Date',
      'Check-In',
      'Check-Out',
      'Inventory Items',
      'Total Price',
      'Dues',
      'Payment Status'
    ];

    const rows = filteredReservations.map((res) => {
      const dues = getBookingDues(res);
      const duesDisplay = dues === null ? 'Unverified' : `$${dues}`;
      const priceDisplay = res.totalPrice !== null ? `$${res.totalPrice}` : '—';
      const inventoryStr = (res.inventory && res.inventory.length > 0)
        ? res.inventory.map(item => `${item.name} ($${item.price})`).join('; ')
        : 'None';

      return [
        res.id,
        res.guestName,
        res.mobile,
        res.room,
        res.reservationDate || '',
        res.checkIn,
        res.checkOut,
        inventoryStr,
        priceDisplay,
        duesDisplay,
        res.paymentStatus
      ];
    });

    const csvContent = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    let url = '';
    let isObjectUrl = false;
    if (typeof window !== 'undefined' && window.URL && typeof window.URL.createObjectURL === 'function') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      url = window.URL.createObjectURL(blob);
      isObjectUrl = true;
    } else {
      url = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    }

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reservation_history_${activeTab.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (isObjectUrl && window.URL && typeof window.URL.revokeObjectURL === 'function') {
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-4 animate-fade-in">
      {/* Data Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-1 overflow-hidden">
        {/* Table Top Controls */}
        <div className="p-3 sm:p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-gray-800 font-bold text-[14px] lg:text-[15px] whitespace-nowrap">
            Booking History
          </h3>

          <div className="flex flex-row items-center space-x-2 ml-auto">
            {/* Search Bar */}
            <div className="relative w-28 md:w-40 xl:w-52 shrink">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" sx={{ fontSize: 16 }} />
              <input 
                type="text" 
                placeholder="Search history..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow truncate bg-white"
              />
            </div>
            
            {/* Segmented Filter Control & Custom Popup */}
            <div className="relative flex bg-white border border-gray-200 rounded-lg shrink-0">
              {['Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom'].map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                    if (tab === 'Custom') {
                      setIsCustomPopupOpen(!isCustomPopupOpen);
                    } else {
                      setIsCustomPopupOpen(false);
                    }
                  }}
                  className={`px-2.5 py-1.5 text-[11px] font-semibold transition-colors border-r border-gray-200 last:border-r-0 cursor-pointer ${
                    activeTab === tab 
                      ? 'bg-[#e5f4eb] text-[#1b7f43] border-[#1b7f43]/20 relative z-10 font-bold' 
                      : 'text-gray-500 hover:bg-[#e5f4eb] hover:text-[#1b7f43]'
                  }`}
                >
                  {tab}
                </button>
              ))}

              {/* Floating Custom Date Picker Popup */}
              {activeTab === 'Custom' && isCustomPopupOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] z-[100] bg-white shadow-[0_10px_25px_rgba(0,0,0,0.1)] border border-gray-100 rounded-xl p-3 flex flex-col gap-2 min-w-[200px] animate-fade-in">
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
            
            {/* Export CSV Button */}
            <button 
              onClick={handleExportCSV}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer shrink-0"
              title="Export CSV"
              aria-label="Export CSV"
            >
              <TableChart sx={{ fontSize: 18 }} className="text-[#0ea5e9]" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="w-full overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="py-2.5 px-2 text-[10.5px] font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Res ID</th>
                <th className="py-2.5 px-2 text-[10.5px] font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Guest Name</th>
                <th className="py-2.5 px-2 text-[10.5px] font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Mobile No</th>
                <th className="py-2.5 px-2 text-[10.5px] font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Room / Type</th>
                <th className="py-2.5 px-2 text-[10.5px] font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Reservation Date</th>
                <th className="py-2.5 px-2 text-[10.5px] font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Check-In</th>
                <th className="py-2.5 px-2 text-[10.5px] font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Check-Out</th>
                <th className="py-2.5 px-2 text-[10.5px] font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Inventory</th>
                <th className="py-2.5 px-2 text-[10.5px] font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Total Price</th>
                <th className="py-2.5 px-2 text-[10.5px] font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Dues</th>
                <th className="py-2.5 px-2 text-[10.5px] font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Payment</th>
                <th className="py-2.5 px-2 text-[10.5px] font-bold text-gray-700 uppercase tracking-wider text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedReservations.map((res) => {
                const dues = getBookingDues(res);

                return (
                  <tr key={res.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2 px-2 text-[11.5px] font-bold text-gray-800 whitespace-nowrap">{res.id}</td>
                    <td className="py-2 px-2 text-[11.5px] font-semibold text-gray-700 whitespace-nowrap">{res.guestName}</td>
                    <td className="py-2 px-2 text-[11px] text-gray-600 whitespace-nowrap">{res.mobile}</td>
                    <td className="py-2 px-2 text-[11px] text-gray-600 whitespace-nowrap">{res.room}</td>
                    <td className="py-2 px-2 text-[11px] text-gray-600 whitespace-nowrap">{res.reservationDate}</td>
                    <td className="py-2 px-2 text-[11px] text-gray-600 whitespace-nowrap">{res.checkIn}</td>
                    <td className="py-2 px-2 text-[11px] text-gray-600 whitespace-nowrap">{res.checkOut}</td>
                    <td className="py-2 px-2 whitespace-nowrap">
                      <InventoryCell items={res.inventory} />
                    </td>
                    <td className="py-2 px-2 text-[11.5px] font-bold text-gray-900 whitespace-nowrap">
                      {res.totalPrice !== null ? `$${res.totalPrice}` : '—'}
                    </td>
                    <td className="py-2 px-2 text-[11.5px] font-semibold whitespace-nowrap">
                      {dues === null ? <span className="text-amber-600">Unverified</span> : dues > 0 ? (
                        <span className="text-red-500 font-bold">${dues}</span>
                      ) : (
                        <span className="text-gray-400 font-normal">$0</span>
                      )}
                    </td>
                    <td className="py-2 px-2 whitespace-nowrap">{getPaymentStatusBadge(res.paymentStatus)}</td>
                    <td className="py-2 px-2 text-center relative whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleActionClick(e, res)}
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-7 h-7 inline-flex items-center justify-center transition-colors cursor-pointer"
                        title="Actions"
                        aria-label="Reservation actions"
                      >
                        <MoreVert sx={{ fontSize: 16 }} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {paginatedReservations.length === 0 && (
                <tr>
                  <td colSpan="12" className="py-8 text-center text-[12px] text-gray-500">
                    No reservations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 0 && (
          <div className="p-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-500">
              Showing <span className="font-semibold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-700">{Math.min(currentPage * itemsPerPage, filteredReservations.length)}</span> of <span className="font-semibold text-gray-700">{filteredReservations.length}</span>
            </span>
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronLeft fontSize="small" />
              </button>
              
              {/* Page Numbers */}
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-6 h-6 rounded-md text-[11px] font-medium flex items-center justify-center transition-colors cursor-pointer ${
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
                aria-label="Next page"
                className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronRight fontSize="small" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Menu Popup */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleActionClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: { mt: 0.5, minWidth: 140, borderRadius: '10px', padding: '4px' }
        }}
      >
        <MenuItem onClick={handleViewDetails} sx={{ fontSize: '12px', py: 0.8, borderRadius: '6px', mb: 0.5 }}>
          <Visibility sx={{ fontSize: 15, mr: 1.5, color: '#3b82f6' }} /> View Details
        </MenuItem>
        <MenuItem onClick={handlePrintInvoice} sx={{ fontSize: '12px', py: 0.8, borderRadius: '6px' }}>
          <Print sx={{ fontSize: 15, mr: 1.5, color: '#6b7280' }} /> Print Invoice
        </MenuItem>
      </Menu>

      {/* View Details Modal */}
      <Dialog
        open={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '12px' }
        }}
      >
        {selectedRes && (
          <>
            <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #f1f5f9' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800 text-[16px]">Booking Details</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#e5f4eb] text-[#1b7f43]">
                    {selectedRes.id}
                  </span>
                </div>
                <IconButton size="small" onClick={() => setIsDetailsModalOpen(false)}>
                  <Close fontSize="small" />
                </IconButton>
              </div>
            </DialogTitle>

            <DialogContent sx={{ py: 2.5 }}>
              <div className="space-y-4">
                {/* Guest & Stay Info Cards */}
                <div className="grid grid-cols-2 gap-3 bg-gray-50/75 p-3 rounded-lg border border-gray-100 text-[12px]">
                  <div>
                    <div className="text-gray-400 text-[10.5px] uppercase font-bold mb-0.5">Guest Info</div>
                    <div className="font-bold text-gray-800">{selectedRes.guestName}</div>
                    <div className="text-gray-500 text-[11.5px]">{selectedRes.mobile}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-[10.5px] uppercase font-bold mb-0.5">Room & Stay</div>
                    <div className="font-bold text-gray-800">{selectedRes.room}</div>
                    <div className="text-gray-500 text-[11px]">Check-in: {selectedRes.checkIn}</div>
                    <div className="text-gray-500 text-[11px]">Check-out: {selectedRes.checkOut}</div>
                  </div>
                </div>

                {/* Financial Overview */}
                <div className="grid grid-cols-3 gap-2 border border-gray-100 p-3 rounded-lg text-center">
                  <div>
                    <div className="text-gray-400 text-[10.5px] uppercase font-bold">Total Price</div>
                    <div className="text-[14px] font-bold text-gray-900 mt-0.5">
                      {selectedRes.totalPrice !== null ? `$${selectedRes.totalPrice}` : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-[10.5px] uppercase font-bold">Outstanding Dues</div>
                    <div className="text-[14px] font-bold text-red-500 mt-0.5">
                      {(() => {
                        const dues = getBookingDues(selectedRes);
                        return dues === null ? <span className="text-amber-600 font-medium">Unverified</span> : `$${dues}`;
                      })()}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-[10.5px] uppercase font-bold">Status</div>
                    <div className="mt-1">{getPaymentStatusBadge(selectedRes.paymentStatus)}</div>
                  </div>
                </div>

                {/* Inventory Breakdown */}
                {selectedRes.inventory && selectedRes.inventory.length > 0 && (
                  <div>
                    <div className="text-[11.5px] font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                      <Inventory2 sx={{ fontSize: 14 }} className="text-[#1b7f43]" />
                      Itemized Inventory ({selectedRes.inventory.length})
                    </div>
                    <div className="border border-gray-100 rounded-lg overflow-hidden divide-y divide-gray-50 text-[11.5px]">
                      {selectedRes.inventory.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center px-3 py-1.5 bg-white">
                          <div>
                            <span className="font-semibold text-gray-800">{item.name}</span>
                            <span className="text-gray-400 text-[10.5px] ml-2">{item.date} {item.time || ''}</span>
                          </div>
                          <span className="font-bold text-gray-900">${item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5, borderTop: '1px solid #f1f5f9' }}>
              <button
                onClick={handlePrintInvoice}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-[12px] font-semibold hover:bg-gray-50 transition cursor-pointer"
              >
                <Print sx={{ fontSize: 15 }} /> Print Statement
              </button>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-1.5 bg-[#1b7f43] text-white rounded-lg text-[12px] font-semibold hover:brightness-105 transition cursor-pointer ml-auto"
              >
                Close
              </button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}
