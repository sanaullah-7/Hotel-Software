import React, { useState } from 'react';
import { 
  Search, Download, MoreVert, Visibility, Print, ChevronLeft, ChevronRight,
  Inventory2, KeyboardArrowDown, Close, Person, Phone, Hotel, Event, CheckCircle
} from '@mui/icons-material';
import { 
  Menu, MenuItem, IconButton, Popover, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { getBookingDues } from '../../payment-billing/pages/paymentBillingStore';

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

  const mockReservations = [
    { id: 'RES-001', guestName: 'John Doe', mobile: '0311 0000000', room: '105 - Standard', reservationDate: '2026-08-01', checkIn: '2026-08-10 14:00', checkOut: '2026-08-15 12:00', inventory: [
      { name: 'Coke Can', date: '2026-08-10', time: '14:20', price: 3 },
      { name: 'Dinner (Chicken Karahi)', date: '2026-08-11', time: '20:15', price: 18 },
      { name: 'Lays Chips', date: '2026-08-12', time: '17:00', price: 2 },
    ], paymentStatus: 'Paid', totalPrice: 500, dues: 0 },
    { id: 'RES-002', guestName: 'Sarah Smith', mobile: '0300 1234567', room: '302 - Suite', reservationDate: '2026-08-20', checkIn: '2026-08-25 15:00', checkOut: '2026-08-28 11:00', inventory: [], paymentStatus: 'Paid', totalPrice: 900, dues: 0 },
    { id: 'RES-003', guestName: 'Ahsan Khan', mobile: '0333 4455667', room: '101 - Standard', reservationDate: '2026-07-15', checkIn: '2026-07-20 13:00', checkOut: '2026-07-22 11:00', inventory: [
      { name: 'Breakfast (Continental)', date: '2026-07-21', time: '08:30', price: 12 },
    ], paymentStatus: 'Paid', totalPrice: 300, dues: 0 },
    { id: 'RES-004', guestName: 'Maria Garcia', mobile: '0344 7788990', room: '205 - Deluxe', reservationDate: '2026-07-10', checkIn: '2026-07-22 14:30', checkOut: '2026-07-25 12:00', inventory: [], paymentStatus: 'Refunded', totalPrice: 600, dues: 0 },
    { id: 'RES-005', guestName: 'Liam Johnson', mobile: '0312 9988776', room: '310 - Suite', reservationDate: '2026-06-25', checkIn: '2026-07-01 12:00', checkOut: '2026-07-05 10:00', inventory: [
      { name: 'Coke Can', date: '2026-07-01', time: '12:10', price: 3 },
      { name: 'Dinner (BBQ Platter)', date: '2026-07-01', time: '20:30', price: 25 },
      { name: 'Water Bottle (1.5L)', date: '2026-07-02', time: '08:00', price: 2 },
      { name: 'Lays Chips', date: '2026-07-03', time: '16:45', price: 2 },
    ], paymentStatus: 'Paid', totalPrice: 1200, dues: 0 },
    { id: 'RES-006', guestName: 'Ayesha Tariq', mobile: '0321 4433221', room: '102 - Standard', reservationDate: '2026-06-12', checkIn: '2026-06-18 15:00', checkOut: '2026-06-20 12:00', inventory: [], paymentStatus: 'Paid', totalPrice: 250, dues: 0 },
    { id: 'RES-007', guestName: 'David Lee', mobile: '0301 5566778', room: '212 - Deluxe', reservationDate: '2026-06-05', checkIn: '2026-06-15 14:00', checkOut: '2026-06-18 11:00', inventory: [
      { name: 'Club Sandwich', date: '2026-06-15', time: '14:30', price: 9 },
      { name: 'Coke Can', date: '2026-06-16', time: '13:00', price: 3 },
    ], paymentStatus: 'Paid', totalPrice: 550, dues: 0 },
    { id: 'RES-008', guestName: 'Fatima Ali', mobile: '0334 1122112', room: '115 - Standard', reservationDate: '2026-05-20', checkIn: '2026-05-25 13:30', checkOut: '2026-05-27 12:00', inventory: [], paymentStatus: 'Cancelled', totalPrice: 300, dues: 300 },
    { id: 'RES-009', guestName: 'Oliver Twist', mobile: '0345 8899000', room: '305 - Suite', reservationDate: '2026-05-15', checkIn: '2026-05-20 14:00', checkOut: '2026-05-25 10:00', inventory: [
      { name: 'Dinner (Grilled Fish)', date: '2026-05-20', time: '20:00', price: 22 },
    ], paymentStatus: 'Paid', totalPrice: 1500, dues: 0 },
    { id: 'RES-010', guestName: 'Hassan Raza', mobile: '0311 6655443', room: '201 - Deluxe', reservationDate: '2026-05-01', checkIn: '2026-05-10 12:00', checkOut: '2026-05-12 12:00', inventory: [], paymentStatus: 'Paid', totalPrice: 400, dues: 0 },
    { id: 'RES-011', guestName: 'Emma Watson', mobile: '0300 9988776', room: '108 - Standard', reservationDate: '2026-04-25', checkIn: '2026-05-02 15:00', checkOut: '2026-05-05 11:00', inventory: [
      { name: 'Coke Can', date: '2026-05-02', time: '15:10', price: 3 },
      { name: 'Lays Chips', date: '2026-05-02', time: '15:12', price: 2 },
      { name: 'Dinner (Chicken Karahi)', date: '2026-05-03', time: '20:15', price: 18 },
      { name: 'Breakfast (Continental)', date: '2026-05-04', time: '08:30', price: 12 },
    ], paymentStatus: 'Refunded', totalPrice: 350, dues: 0 },
    { id: 'RES-012', guestName: 'Zainab Abbas', mobile: '0322 3344556', room: '220 - Deluxe', reservationDate: '2026-04-10', checkIn: '2026-04-15 14:00', checkOut: '2026-04-18 12:00', inventory: [], paymentStatus: 'Paid', totalPrice: 700, dues: 0 },
    { id: 'RES-013', guestName: 'Michael Scott', mobile: '0333 7777777', room: '312 - Suite', reservationDate: '2026-04-01', checkIn: '2026-04-10 13:00', checkOut: '2026-04-15 11:00', inventory: [
      { name: 'Club Sandwich', date: '2026-04-10', time: '13:20', price: 9 },
    ], paymentStatus: 'Paid', totalPrice: 1250, dues: 0 },
    { id: 'RES-014', guestName: 'Sana Javed', mobile: '0345 1231234', room: '110 - Standard', reservationDate: '2026-03-20', checkIn: '2026-03-25 14:00', checkOut: '2026-03-27 12:00', inventory: [], paymentStatus: 'Paid', totalPrice: 200, dues: 0 },
    { id: 'RES-015', guestName: 'Usman Khawaja', mobile: '0313 5554443', room: '208 - Deluxe', reservationDate: '2026-03-15', checkIn: '2026-03-20 15:00', checkOut: '2026-03-24 10:00', inventory: [
      { name: 'Dinner (BBQ Platter)', date: '2026-03-20', time: '20:30', price: 25 },
      { name: 'Coke Can', date: '2026-03-21', time: '11:00', price: 3 },
    ], paymentStatus: 'Cancelled', totalPrice: 800, dues: 800 },
  ];

  const getRecordDate = (res) => {
    const str = res.reservationDate || res.checkIn?.split(' ')[0];
    if (!str) return null;
    return new Date(str + 'T00:00:00');
  };

  const maxDatasetTime = Math.max(...mockReservations.map(r => getRecordDate(r)?.getTime() || 0));
  const anchorDate = new Date(maxDatasetTime); // 2026-08-20

  const filterByDate = (res) => {
    const recDate = getRecordDate(res);
    if (!recDate) return true;

    if (activeTab === 'Daily') {
      const now = new Date();
      const isToday = recDate.getFullYear() === now.getFullYear() &&
                      recDate.getMonth() === now.getMonth() &&
                      recDate.getDate() === now.getDate();
      const isAnchorDay = recDate.getFullYear() === anchorDate.getFullYear() &&
                          recDate.getMonth() === anchorDate.getMonth() &&
                          recDate.getDate() === anchorDate.getDate();
      return isToday || isAnchorDay;
    }

    if (activeTab === 'Weekly') {
      const now = new Date();
      const diffAnchor = Math.abs(anchorDate.getTime() - recDate.getTime()) / (1000 * 60 * 60 * 24);
      const diffNow = Math.abs(now.getTime() - recDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffAnchor <= 7 || diffNow <= 7;
    }

    if (activeTab === 'Monthly') {
      const now = new Date();
      const isAnchorMonth = recDate.getFullYear() === anchorDate.getFullYear() &&
                            recDate.getMonth() === anchorDate.getMonth();
      const isNowMonth = recDate.getFullYear() === now.getFullYear() &&
                         recDate.getMonth() === now.getMonth();
      return isAnchorMonth || isNowMonth;
    }

    if (activeTab === 'Yearly') {
      const now = new Date();
      return recDate.getFullYear() === anchorDate.getFullYear() || recDate.getFullYear() === now.getFullYear();
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

  const filteredReservations = mockReservations.filter(res => {
    const matchesSearch = res.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.mobile.includes(searchQuery);

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
    const dues = getBookingDues({
      ...selectedRes,
      name: selectedRes.guestName,
      payment: selectedRes.paymentStatus,
      dues: selectedRes.dues ?? selectedRes.remainingPrice
    });

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
                <td style="text-align: right;">$${selectedRes.totalPrice}</td>
              </tr>
              ${(selectedRes.inventory || []).map(item => `
                <tr>
                  <td>${item.name} (${item.date} ${item.time || ''})</td>
                  <td style="text-align: right;">$${item.price}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <div>Total Price: <strong>$${selectedRes.totalPrice}</strong></div>
            <div>Payment Status: <strong>${selectedRes.paymentStatus}</strong></div>
            <div class="grand-total">Outstanding Dues: $${dues}</div>
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
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-gray-100 text-gray-600 whitespace-nowrap">{status}</span>;
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
      const dues = getBookingDues({ ...res, name: res.guestName, payment: res.paymentStatus, dues: res.dues ?? res.remainingPrice });
      const inventoryStr = (res.inventory && res.inventory.length > 0)
        ? res.inventory.map(item => `${item.name} ($${item.price})`).join('; ')
        : 'None';

      return [
        res.id,
        res.guestName,
        res.mobile,
        res.room,
        res.reservationDate || res.checkIn?.split(' ')[0] || '',
        res.checkIn,
        res.checkOut,
        inventoryStr,
        `$${res.totalPrice}`,
        `$${dues}`,
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
            
            {/* CSV Button */}
            <button 
              onClick={handleExportCSV}
              className="flex items-center space-x-1 bg-[var(--primary-main)] hover:brightness-110 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all shrink-0 cursor-pointer"
              title="Export CSV"
            >
              <Download sx={{ fontSize: 14 }} />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="inline sm:hidden">CSV</span>
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
                const dues = getBookingDues({ ...res, name: res.guestName, payment: res.paymentStatus, dues: res.dues ?? res.remainingPrice });

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
                    <td className="py-2 px-2 text-[11.5px] font-bold text-gray-900 whitespace-nowrap">${res.totalPrice}</td>
                    <td className="py-2 px-2 text-[11.5px] font-semibold whitespace-nowrap">
                      {dues > 0 ? (
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
                    <div className="text-[14px] font-bold text-gray-900 mt-0.5">${selectedRes.totalPrice}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-[10.5px] uppercase font-bold">Outstanding Dues</div>
                    <div className="text-[14px] font-bold text-red-500 mt-0.5">
                      ${getBookingDues({
                        ...selectedRes,
                        name: selectedRes.guestName,
                        payment: selectedRes.paymentStatus,
                        dues: selectedRes.dues ?? selectedRes.remainingPrice
                      })}
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