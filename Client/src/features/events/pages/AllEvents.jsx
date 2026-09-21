import React, { useState, useMemo } from'react';
import {
 HomeOutlined as HomeIcon,
 Search as SearchIcon,
 FilterList as FilterIcon,
 Add as AddIcon,
 Refresh as RefreshIcon,
 GridView as GridIcon,
 TableRows as TableIcon,
 PictureAsPdf as PdfIcon,
 CalendarMonth as CalendarIcon,
 LocationOn as LocationIcon,
 People as PeopleIcon,
 AttachMoney as MoneyIcon,
 Close as CloseIcon,
 EditOutlined as EditIcon,
 Delete as DeleteIcon,
 VisibilityOutlined as ViewIcon,
 Check as CheckIcon,
 FileDownload as DownloadIcon,
 EventOutlined as EventOutlinedIcon,
 CheckCircleOutlineOutlined as CheckCircleOutlineIcon,
 PendingActionsOutlined as PendingActionsIcon,
 PeopleOutlined as PeopleOutlinedIcon,
 AttachMoneyOutlined as AttachMoneyOutlinedIcon
} from'@mui/icons-material';
import jsPDF from'jspdf';
import autoTable from'jspdf-autotable';
import * as XLSX from'xlsx';

// Initial Event Data from Luxuria template
const INITIAL_EVENTS = [
 {
 id:'EVT31232CFL',
 name:'Johnson Wedding',
 type:'Wedding',
 client:'Sarah Johnson',
 phone:'+1 (555) 234-5678',
 email:'sarah.j@example.com',
 date:'2024-01-15',
 displayDate:'01/15/2024',
 startTime:'16:00',
 endTime:'23:00',
 venue:'Grand Ballroom',
 guests: 150,
 amount: 15000,
 advanceAmount: 8000,
 balanceAmount: 7000,
 catering:'Plated Dinner',
 status:'Confirmed',
 specialRequests:'Pastel floral table centrepieces and white carpet aisle.',
 notes:'Bride requested Grand Piano entrance accompaniment.'
 },
 {
 id:'EVT3123I1K2',
 name:'Tech Conference 2024',
 type:'Conference',
 client:'TechCorp Ltd',
 phone:'+1 (555) 876-5432',
 email:'events@techcorp.io',
 date:'2024-01-20',
 displayDate:'01/20/2024',
 startTime:'09:00',
 endTime:'18:00',
 venue:'Conference Hall A',
 guests: 200,
 amount: 25000,
 advanceAmount: 15000,
 balanceAmount: 10000,
 catering:'Buffet',
 status:'Confirmed',
 specialRequests:'High-speed dedicated Wi-Fi access and live webcast rig.',
 notes:'Dual 4K laser projectors and 8 wireless lapel mics.'
 },
 {
 id:'EVT31230X5B',
 name:'Birthday Celebration',
 type:'Birthday Party',
 client:'Mike Wilson',
 phone:'+1 (555) 345-6789',
 email:'mike.wilson@email.com',
 date:'2024-01-25',
 displayDate:'01/25/2024',
 startTime:'19:00',
 endTime:'00:00',
 venue:'Rooftop Terrace',
 guests: 50,
 amount: 8000,
 advanceAmount: 4000,
 balanceAmount: 4000,
 catering:'Cocktail & Canapés',
 status:'Pending',
 specialRequests:'Custom Belgian chocolate fountain and DJ booth setup.',
 notes:'Outdoor fire pits and heated lamps on patio.'
 },
 {
 id:'EVT3123D2FW',
 name:'Anderson Anniversary',
 type:'Anniversary',
 client:'Laura Anderson',
 phone:'+1 (555) 456-7890',
 email:'laura.a@andersonlaw.com',
 date:'2024-02-10',
 displayDate:'02/10/2024',
 startTime:'18:30',
 endTime:'22:30',
 venue:'Garden Lounge',
 guests: 80,
 amount: 12000,
 advanceAmount: 12000,
 balanceAmount: 0,
 catering:'Plated Dinner',
 status:'Confirmed',
 specialRequests:'Silver theme decorations for 25th wedding anniversary.',
 notes:'String quartet booked for arrival reception.'
 },
 {
 id:'EVT3123YHOW',
 name:'Startup Pitch Night',
 type:'Corporate',
 client:'InnovateX',
 phone:'+1 (555) 567-8901',
 email:'pitch@innovatex.co',
 date:'2024-03-05',
 displayDate:'03/05/2024',
 startTime:'17:00',
 endTime:'21:30',
 venue:'Conference Hall B',
 guests: 120,
 amount: 10000,
 advanceAmount: 5000,
 balanceAmount: 5000,
 catering:'Coffee & Snacks',
 status:'Pending',
 specialRequests:'Pitch podium with countdown timer display.',
 notes:'6 demo table stations with power strips.'
 },
 {
 id:'EVT3123MM1I',
 name:"Children's Art Workshop",
 type:'Workshop',
 client:'Creative Kids',
 phone:'+1 (555) 678-9012',
 email:'art@creativekids.org',
 date:'2024-03-12',
 displayDate:'03/12/2024',
 startTime:'10:00',
 endTime:'14:00',
 venue:'Studio Room 1',
 guests: 40,
 amount: 4000,
 advanceAmount: 4000,
 balanceAmount: 0,
 catering:'Coffee & Snacks',
 status:'Completed',
 specialRequests:'Washable table covers and extra clean-up bins.',
 notes:'Studio 1 sinks prepped with art wash equipment.'
 }
];

const VENUE_OPTIONS = ['Grand Ballroom','Conference Hall A','Conference Hall B','Rooftop Terrace','Garden Lounge','Studio Room 1','Grand Crystal Ballroom','Royal Executive Boardroom'
];

const TYPE_OPTIONS = ['Wedding','Conference','Birthday Party','Anniversary','Corporate','Workshop','Gala','Social Gathering'
];

const STATUS_OPTIONS = ['Pending','Confirmed','In-Progress','Completed'];

const CATERING_OPTIONS = ['Plated Dinner','Buffet','Cocktail & Canapés','Coffee & Snacks','None'
];

// Helper to generate IDs matching EVT... format
function generateEventId() {
 const chars ='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
 let randomStr ='';
 for (let i = 0; i < 8; i++) {
 randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
 }
 return`EVT${randomStr}`;
}

export default function AllEvents() {
 const [events, setEvents] = useState(INITIAL_EVENTS);
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedIds, setSelectedIds] = useState([]);
 const [viewMode, setViewMode] = useState('table'); //'table' |'grid'
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

 // Form State for Add / Edit
 const [formData, setFormData] = useState({
 name:'',
 id: generateEventId(),
 type:'Wedding',
 client:'',
 phone:'',
 email:'',
 date: new Date().toISOString().split('T')[0],
 startTime:'12:00',
 endTime:'18:00',
 venue:'Grand Ballroom',
 guests: 100,
 catering:'Plated Dinner',
 status:'Pending',
 amount: 10000,
 advanceAmount: 3000,
 balanceAmount: 7000,
 specialRequests:'',
 notes:''
 });

 // Calculate Balance dynamically when amount or advance changes
 const handleAmountChange = (field, val) => {
 const numVal = parseFloat(val) || 0;
 setFormData(prev => {
 const updated = { ...prev, [field]: numVal };
 const total = field ==='amount' ? numVal : prev.amount;
 const advance = field ==='advanceAmount' ? numVal : prev.advanceAmount;
 updated.balanceAmount = Math.max(0, total - advance);
 return updated;
 });
 };

 // Reset form to defaults
 const resetForm = () => {
 setFormData({
 name:'',
 id: generateEventId(),
 type:'Wedding',
 client:'',
 phone:'',
 email:'',
 date: new Date().toISOString().split('T')[0],
 startTime:'12:00',
 endTime:'18:00',
 venue:'Grand Ballroom',
 guests: 100,
 catering:'Plated Dinner',
 status:'Pending',
 amount: 10000,
 advanceAmount: 3000,
 balanceAmount: 7000,
 specialRequests:'',
 notes:''
 });
 };

 // Open Add Modal
 const handleOpenAddModal = () => {
 resetForm();
 setIsAddModalOpen(true);
 };

 // Open Edit Modal
 const handleOpenEditModal = (evt) => {
 setActiveEvent(evt);
 setFormData({
 name: evt.name,
 id: evt.id,
 type: evt.type,
 client: evt.client,
 phone: evt.phone ||'',
 email: evt.email ||'',
 date: evt.date,
 startTime: evt.startTime ||'12:00',
 endTime: evt.endTime ||'18:00',
 venue: evt.venue,
 guests: evt.guests,
 catering: evt.catering ||'Plated Dinner',
 status: evt.status,
 amount: evt.amount,
 advanceAmount: evt.advanceAmount || 0,
 balanceAmount: evt.balanceAmount || 0,
 specialRequests: evt.specialRequests ||'',
 notes: evt.notes ||''
 });
 setIsEditModalOpen(true);
 };

 // Open View Modal
 const handleOpenViewModal = (evt) => {
 setActiveEvent(evt);
 setIsViewModalOpen(true);
 };

 // Save New Event
 const handleSaveNewEvent = (e) => {
 e.preventDefault();
 if (!formData.name || !formData.client) {
 alert('Please fill in required fields (Event Name and Client Name)');
 return;
 }

 const dateParts = formData.date.split('-');
 const displayDate = dateParts.length === 3 ?`${dateParts[1]}/${dateParts[2]}/${dateParts[0]}` : formData.date;

 const newEvt = {
 ...formData,
 displayDate,
 guests: parseInt(formData.guests, 10) || 0,
 amount: parseFloat(formData.amount) || 0,
 advanceAmount: parseFloat(formData.advanceAmount) || 0,
 balanceAmount: parseFloat(formData.balanceAmount) || 0
 };

 setEvents(prev => [newEvt, ...prev]);
 setIsAddModalOpen(false);
 resetForm();
 };

 // Save Edited Event
 const handleSaveEditEvent = (e) => {
 e.preventDefault();
 if (!formData.name || !formData.client) {
 alert('Please fill in required fields');
 return;
 }

 const dateParts = formData.date.split('-');
 const displayDate = dateParts.length === 3 ?`${dateParts[1]}/${dateParts[2]}/${dateParts[0]}` : formData.date;

 setEvents(prev => prev.map(item => {
 if (item.id === activeEvent.id) {
 return {
 ...item,
 ...formData,
 displayDate,
 guests: parseInt(formData.guests, 10) || 0,
 amount: parseFloat(formData.amount) || 0,
 advanceAmount: parseFloat(formData.advanceAmount) || 0,
 balanceAmount: parseFloat(formData.balanceAmount) || 0
 };
 }
 return item;
 }));

 setIsEditModalOpen(false);
 };

 // Delete Event
 const handleDeleteEvent = (id) => {
 if (window.confirm('Are you sure you want to delete this event?')) {
 setEvents(prev => prev.filter(e => e.id !== id));
 setSelectedIds(prev => prev.filter(selId => selId !== id));
 }
 };

 // Bulk Delete
 const handleBulkDelete = () => {
 if (selectedIds.length === 0) return;
 if (window.confirm(`Delete selected ${selectedIds.length} event(s)?`)) {
 setEvents(prev => prev.filter(e => !selectedIds.includes(e.id)));
 setSelectedIds([]);
 }
 };

 // Checkbox Selection
 const handleSelectAll = (e) => {
 if (e.target.checked) {
 setSelectedIds(filteredEvents.map(ev => ev.id));
 } else {
 setSelectedIds([]);
 }
 };

 const handleSelectRow = (id) => {
 setSelectedIds(prev =>
 prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
 );
 };

 // Filtering Logic
 const filteredEvents = useMemo(() => {
 return events.filter(evt => {
 const q = searchQuery.toLowerCase().trim();
 const matchesSearch = !q || (
 evt.name.toLowerCase().includes(q) ||
 evt.id.toLowerCase().includes(q) ||
 evt.client.toLowerCase().includes(q) ||
 evt.venue.toLowerCase().includes(q) ||
 evt.type.toLowerCase().includes(q) ||
 evt.status.toLowerCase().includes(q)
 );

 const matchesType = filterType ==='All' || evt.type === filterType;
 const matchesVenue = filterVenue ==='All' || evt.venue === filterVenue;
 const matchesStatus = filterStatus ==='All' || evt.status === filterStatus;

 return matchesSearch && matchesType && matchesVenue && matchesStatus;
 });
 }, [events, searchQuery, filterType, filterVenue, filterStatus]);

 // Pagination Slice
 const totalPages = Math.ceil(filteredEvents.length / itemsPerPage) || 1;
 const paginatedEvents = useMemo(() => {
 const start = (currentPage - 1) * itemsPerPage;
 return filteredEvents.slice(start, start + itemsPerPage);
 }, [filteredEvents, currentPage, itemsPerPage]);

 // ── Summary Cards (calculated from full`events` array, unaffected by search/filter) ──
 const eventSummary = useMemo(() => {
 const today = new Date();
 today.setHours(0, 0, 0, 0);
 return {
 totalEvents: events.length,
 confirmedEvents: events.filter(e => e.status ==='Confirmed').length,
 pendingEvents: events.filter(e => e.status ==='Pending').length,
 upcomingEvents: events.filter(e => {
 if (!e.date) return false;
 const evtDate = new Date(e.date);
 evtDate.setHours(0, 0, 0, 0);
 return evtDate >= today;
 }).length,
 totalGuests: events.reduce((sum, e) => sum + (parseInt(e.guests, 10) || 0), 0),
 totalRevenue: events.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
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
 doc.text('Luxuria Hotel & Resorts - All Events Report', 14, 15);
 doc.setFontSize(10);
 doc.setTextColor(100, 116, 139);
 doc.text(`Generated on: ${new Date().toLocaleDateString()} | Total Events: ${filteredEvents.length}`, 14, 22);

 const tableData = filteredEvents.map(e => [
 e.id,
 e.name,
 e.type,
 e.client,
 e.displayDate,
 e.venue,
 e.guests,`$${e.amount.toLocaleString()}`,
 e.status
 ]);

 autoTable(doc, {
 startY: 28,
 head: [['Event ID','Event Name','Type','Client','Date','Venue','Guests','Amount','Status']],
 body: tableData,
 theme:'grid',
 headStyles: { fillColor: [27, 127, 67], textColor: [255, 255, 255], fontStyle:'bold' },
 alternateRowStyles: { fillColor: [248, 250, 252] },
 styles: { fontSize: 9 }
 });

 doc.save(`Luxuria_All_Events_${new Date().toISOString().split('T')[0]}.pdf`);
 };

 // Export to Excel / CSV
 const handleExportExcel = () => {
 const exportData = filteredEvents.map(e => ({'Event ID': e.id,'Event Name': e.name,'Event Type': e.type,'Client Name': e.client,'Phone': e.phone,'Email': e.email,'Event Date': e.displayDate,'Venue': e.venue,'Expected Guests': e.guests,'Total Amount': e.amount,'Advance Paid': e.advanceAmount,'Balance Remaining': e.balanceAmount,'Status': e.status,'Catering': e.catering
 }));

 const worksheet = XLSX.utils.json_to_sheet(exportData);
 const workbook = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(workbook, worksheet,'Events');
 XLSX.writeFile(workbook,`Luxuria_Events_${new Date().toISOString().split('T')[0]}.xlsx`);
 };

 // Style badge helper
 const getTypeBadgeStyle = (type) => {
 switch (type) {
 case'Wedding':
 return'bg-pink-50 text-pink-700 border border-pink-200';
 case'Conference':
 return'bg-blue-50 text-blue-700 border border-blue-200';
 case'Birthday Party':
 return'bg-amber-50 text-amber-700 border border-amber-200';
 case'Anniversary':
 return'bg-purple-50 text-purple-700 border border-purple-200';
 case'Corporate':
 return'bg-indigo-50 text-indigo-700 border border-indigo-200';
 case'Workshop':
 return'bg-teal-50 text-teal-700 border border-teal-200';
 default:
 return'bg-slate-50 text-slate-700 border border-slate-200';
 }
 };

 const getStatusBadgeStyle = (status) => {
 switch (status) {
 case'Confirmed':
 return'bg-emerald-50 text-emerald-700 border border-emerald-200';
 case'Pending':
 return'bg-amber-50 text-amber-700 border border-amber-200';
 case'In-Progress':
 return'bg-blue-50 text-blue-700 border border-blue-200';
 case'Completed':
 return'bg-slate-100 text-slate-700 border border-slate-200';
 default:
 return'bg-gray-100 text-gray-700 border border-gray-200';
 }
 };

 const eventCards = [
 {
 id:'total-events',
 title:'Total Events',
 value: eventSummary.totalEvents,
 subtext:'All registered',
 icon: EventOutlinedIcon,
 iconBg:'bg-[var(--primary-main)]/10',
 iconColor:'text-[var(--primary-main)]',
 },
 {
 id:'confirmed',
 title:'Confirmed',
 value: eventSummary.confirmedEvents,
 subtext:'Bookings',
 icon: CheckCircleOutlineIcon,
 iconBg:'bg-emerald-50',
 iconColor:'text-emerald-600',
 },
 {
 id:'pending',
 title:'Pending',
 value: eventSummary.pendingEvents,
 subtext:'Awaiting confirm',
 icon: PendingActionsIcon,
 iconBg:'bg-amber-50',
 iconColor:'text-amber-600',
 },
 {
 id:'upcoming',
 title:'Upcoming',
 value: eventSummary.upcomingEvents,
 subtext:'Scheduled',
 icon: CalendarIcon,
 iconBg:'bg-blue-50',
 iconColor:'text-blue-600',
 },
 {
 id:'guests',
 title:'Expected Guests',
 value: eventSummary.totalGuests.toLocaleString(),
 subtext:'Total attendees',
 icon: PeopleOutlinedIcon,
 iconBg:'bg-indigo-50',
 iconColor:'text-indigo-600',
 },
 {
 id:'revenue',
 title:'Total Revenue',
 value:`$${eventSummary.totalRevenue.toLocaleString()}`,
 subtext:'Contract value',
 icon: AttachMoneyOutlinedIcon,
 iconBg:'bg-[var(--primary-main)]/10',
 iconColor:'text-[var(--primary-main)]',
 },
 ];

 return (
 <div className="w-full p-0">
 {/* ── Event Summary Cards ── */}
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full mb-2">
 {eventCards.map((card) => {
 const IconComp = card.icon;
 return (
 <div
 key={card.id}
 className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] px-3 py-2 flex flex-col justify-between hover:border-[var(--primary-main)]/30 transition-colors"
 >
 <div className="flex items-center gap-1.5 min-w-0">
 <div className={`p-1 rounded-md ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0`}>
 <IconComp sx={{ fontSize: 15 }} />
 </div>
 <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider truncate">
 {card.title}
 </span>
 </div>
 <div className="flex items-baseline justify-between mt-1">
 <span className="text-xl font-bold text-[var(--text-primary)] leading-none">
 {card.value}
 </span>
 {card.subtext && (
 <span className="text-[10px] text-[var(--text-secondary)] font-normal hidden xl:inline">
 {card.subtext}
 </span>
 )}
 </div>
 </div>
 );
 })}
 </div>

 {/* Main Card Container */}
 <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
 {/* Card Header & Action Toolbar */}
 <div className="p-2 sm:p-2.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
 {/* Left Side: Search Bar Input & Bulk Actions */}
 <div className="flex items-center gap-2 flex-1 max-w-md">
 <div className="relative w-full sm:w-72">
 <input
 type="text"
 placeholder="Search..."
 value={searchQuery}
 onChange={(e) => {
 setSearchQuery(e.target.value);
 setCurrentPage(1);
 }}
 className="w-full pl-3 pr-8 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7f43]/20 focus:border-[#1b7f43] transition-all"
 />
 <SearchIcon
 sx={{ fontSize: 16 }}
 className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
 />
 </div>

 {selectedIds.length > 0 && (
 <button
 onClick={handleBulkDelete}
 className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
 >
 <DeleteIcon sx={{ fontSize: 15 }} />
 Delete Selected ({selectedIds.length})
 </button>
 )}
 </div>

 {/* Right Side: Action Icons */}
 <div className="flex items-center flex-wrap gap-1.5">
 {/* Filter Toggle Button */}
 <button
 onClick={() => setIsFilterOpen(!isFilterOpen)}
 title="Filter Events"
 className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
 filterType !=='All' || filterVenue !=='All' || filterStatus !=='All'
 ?'bg-blue-50 border-blue-200 text-blue-600'
 :'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
 }`}
 >
 <FilterIcon sx={{ fontSize: 18 }} />
 </button>

 {/* View Mode Toggle: Table View */}
 <button
 onClick={() => setViewMode('table')}
 title="Table View"
 className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
 viewMode ==='table'
 ?'bg-[#1b7f43] border-[#1b7f43] text-white shadow-xs'
 :'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
 }`}
 >
 <TableIcon sx={{ fontSize: 18 }} />
 </button>

 {/* View Mode Toggle: Grid View */}
 <button
 onClick={() => setViewMode('grid')}
 title="Grid View"
 className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
 viewMode ==='grid'
 ?'bg-[#1b7f43] border-[#1b7f43] text-white shadow-xs'
 :'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
 }`}
 >
 <GridIcon sx={{ fontSize: 18 }} />
 </button>

 {/* Reload / Refresh Button */}
 <button
 onClick={handleRefresh}
 title="Refresh"
 className="p-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
 >
 <RefreshIcon sx={{ fontSize: 18 }} />
 </button>

 {/* PDF Export Button */}
 <button
 onClick={handleExportPDF}
 title="Export PDF"
 className="p-1.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl transition-all cursor-pointer"
 >
 <PdfIcon sx={{ fontSize: 18 }} />
 </button>

 {/* Excel Export Button */}
 <button
 onClick={handleExportExcel}
 title="Export Excel"
 className="p-1.5 bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all cursor-pointer"
 >
 <DownloadIcon sx={{ fontSize: 18 }} />
 </button>
 </div>
 </div>

 {/* Collapsible Filter Bar */}
 {isFilterOpen && (
 <div className="p-2.5 bg-slate-50 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5 animate-fadeIn">
 <div>
 <label className="block text-xs font-semibold text-slate-600 mb-1">Event Type</label>
 <select
 value={filterType}
 onChange={(e) => {
 setFilterType(e.target.value);
 setCurrentPage(1);
 }}
 className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1b7f43]/20"
 >
 <option value="All">All Types</option>
 {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
 </select>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-600 mb-1">Venue</label>
 <select
 value={filterVenue}
 onChange={(e) => {
 setFilterVenue(e.target.value);
 setCurrentPage(1);
 }}
 className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1b7f43]/20"
 >
 <option value="All">All Venues</option>
 {VENUE_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
 </select>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
 <select
 value={filterStatus}
 onChange={(e) => {
 setFilterStatus(e.target.value);
 setCurrentPage(1);
 }}
 className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1b7f43]/20"
 >
 <option value="All">All Statuses</option>
 {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
 </select>
 </div>
 </div>
 )}

 {/* View Mode: Table View */}
 {viewMode ==='table' ? (
 <div className="">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-600 text-xs font-bold uppercase tracking-wider select-none">
 <th className="py-2 px-2.5 w-10 text-center">
 <input
 type="checkbox"
 checked={
 paginatedEvents.length > 0 &&
 paginatedEvents.every(ev => selectedIds.includes(ev.id))
 }
 onChange={handleSelectAll}
 className="w-4 h-4 rounded border-slate-300 text-[#1b7f43] focus:ring-[#1b7f43]/20 cursor-pointer"
 />
 </th>
 <th className="py-2 px-2.5 font-bold">Event ID</th>
 <th className="py-2 px-2.5 font-bold">Event Name</th>
 <th className="py-2 px-2.5 font-bold">Type</th>
 <th className="py-2 px-2.5 font-bold">Client</th>
 <th className="py-2 px-2.5 font-bold">Date</th>
 <th className="py-2 px-2.5 font-bold">Venue</th>
 <th className="py-2 px-2.5 font-bold">Guests</th>
 <th className="py-2 px-2.5 font-bold">Amount</th>
 <th className="py-2 px-2.5 font-bold">Status</th>
 <th className="py-2 px-2.5 font-bold text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-sm">
 {paginatedEvents.length === 0 ? (
 <tr>
 <td colSpan="11" className="py-8 text-center text-slate-400">
 No events found matching your search or filters.
 </td>
 </tr>
 ) : (
 paginatedEvents.map((evt) => {
 const isChecked = selectedIds.includes(evt.id);
 return (
 <tr
 key={evt.id}
 className={`hover:bg-slate-50/80 transition-colors ${
 isChecked ?'bg-emerald-50/30' :''
 }`}
 >
 <td className="py-1.5 px-2.5 text-center">
 <input
 type="checkbox"
 checked={isChecked}
 onChange={() => handleSelectRow(evt.id)}
 className="w-4 h-4 rounded border-slate-300 text-[#1b7f43] focus:ring-[#1b7f43]/20 cursor-pointer"
 />
 </td>
 <td className="py-1.5 px-2.5 font-medium text-slate-700 font-mono text-xs">
 {evt.id}
 </td>
 <td className="py-1.5 px-2.5 font-semibold text-slate-900">
 {evt.name}
 </td>
 <td className="py-1.5 px-2.5">
 <span
 className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getTypeBadgeStyle(
 evt.type
 )}`}
 >
 {evt.type}
 </span>
 </td>
 <td className="py-1.5 px-2.5 text-slate-700 font-medium">
 {evt.client}
 </td>
 <td className="py-1.5 px-2.5 text-slate-600">
 <div className="flex items-center gap-1">
 <CalendarIcon sx={{ fontSize: 15 }} className="text-slate-400" />
 <span>{evt.displayDate}</span>
 </div>
 </td>
 <td className="py-1.5 px-2.5 text-slate-700">
 {evt.venue}
 </td>
 <td className="py-1.5 px-2.5 text-slate-800 font-medium">
 {evt.guests}
 </td>
 <td className="py-1.5 px-2.5 text-slate-900 font-bold">
 ${evt.amount.toLocaleString()}
 </td>
 <td className="py-1.5 px-2.5">
 <span
 className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeStyle(
 evt.status
 )}`}
 >
 {evt.status}
 </span>
 </td>
 <td className="py-1.5 px-2.5 text-right">
 <div className="flex items-center justify-end gap-1">
 <button
 onClick={() => handleOpenViewModal(evt)}
 title="View Details"
 className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
 >
 <ViewIcon sx={{ fontSize: 16 }} />
 </button>
 <button
 onClick={() => handleOpenEditModal(evt)}
 title="Edit Event"
 className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
 >
 <EditIcon sx={{ fontSize: 16 }} />
 </button>
 <button
 onClick={() => handleDeleteEvent(evt.id)}
 title="Delete Event"
 className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
 >
 <DeleteIcon sx={{ fontSize: 16 }} />
 </button>
 </div>
 </td>
 </tr>
 );
 })
 )}
 </tbody>
 </table>
 </div>
 ) : (
 /* View Mode: Grid Cards View */
 <div className="p-2.5 sm:p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
 {paginatedEvents.map((evt) => (
 <div
 key={evt.id}
 className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
 >
 <div>
 <div className="flex items-start justify-between gap-2 mb-2">
 <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
 {evt.id}
 </span>
 <span
 className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${getStatusBadgeStyle(
 evt.status
 )}`}
 >
 {evt.status}
 </span>
 </div>

 <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">
 {evt.name}
 </h3>
 <div className="flex items-center gap-1.5 mb-2">
 <span
 className={`px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${getTypeBadgeStyle(
 evt.type
 )}`}
 >
 {evt.type}
 </span>
 <span className="text-xs text-slate-500">• {evt.client}</span>
 </div>

 <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
 <div className="flex items-center gap-1.5">
 <CalendarIcon sx={{ fontSize: 14 }} className="text-slate-400" />
 <span>{evt.displayDate} ({evt.startTime} - {evt.endTime})</span>
 </div>
 <div className="flex items-center gap-1.5">
 <LocationIcon sx={{ fontSize: 14 }} className="text-slate-400" />
 <span className="truncate">{evt.venue}</span>
 </div>
 <div className="flex items-center gap-1.5">
 <PeopleIcon sx={{ fontSize: 14 }} className="text-slate-400" />
 <span>{evt.guests} Expected Guests</span>
 </div>
 </div>
 </div>

 <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
 <div>
 <span className="text-[11px] text-slate-400 block">Total Contract</span>
 <span className="text-sm font-bold text-slate-900">
 ${evt.amount.toLocaleString()}
 </span>
 </div>

 <div className="flex items-center gap-1">
 <button
 onClick={() => handleOpenViewModal(evt)}
 className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
 title="View Details"
 >
 <ViewIcon sx={{ fontSize: 16 }} />
 </button>
 <button
 onClick={() => handleOpenEditModal(evt)}
 className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
 title="Edit Event"
 >
 <EditIcon sx={{ fontSize: 16 }} />
 </button>
 <button
 onClick={() => handleDeleteEvent(evt.id)}
 className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
 title="Delete Event"
 >
 <DeleteIcon sx={{ fontSize: 16 }} />
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Pagination Footer matching Luxuria */}
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
 ?'0 - 0 of 0'
 :`${(currentPage - 1) * itemsPerPage + 1} – ${Math.min(
 currentPage * itemsPerPage,
 filteredEvents.length
 )} of ${filteredEvents.length}`}
 </span>

 <div className="flex items-center gap-1">
 <button
 disabled={currentPage === 1}
 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
 className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
 >
 &lsaquo;
 </button>
 <button
 disabled={currentPage >= totalPages}
 onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
 className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
 >
 &rsaquo;
 </button>
 </div>
 </div>
 </div>
 </div>

 {/* NEW EVENT MODAL (100% Matching Luxuria Template Structure) */}
 {isAddModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
 <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp">
 {/* Modal Header Bar in Purple/Blue Luxuria Style */}
 <div className="bg-[#5c67f2] px-6 py-4 flex items-center justify-between text-white">
 <h3 className="text-lg font-bold tracking-tight">New Event</h3>
 <button
 onClick={() => setIsAddModalOpen(false)}
 className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
 >
 <CloseIcon sx={{ fontSize: 18 }} />
 </button>
 </div>

 {/* Modal Form Scrollable Body */}
 <form onSubmit={handleSaveNewEvent} className="p-6 overflow-y-auto space-y-4 flex-1">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {/* Event Name */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 Event Name*
 </label>
 <input
 type="text"
 required
 placeholder="e.g. Royal Wedding Gala"
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2]"
 />
 </div>

 {/* Event ID */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 Event ID
 </label>
 <input
 type="text"
 readOnly
 value={formData.id}
 className="w-full text-sm bg-slate-50 border border-slate-200 text-slate-500 rounded-xl px-3.5 py-2.5 font-mono select-none"
 />
 </div>

 {/* Event Type */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 Event Type*
 </label>
 <select
 value={formData.type}
 onChange={(e) => setFormData({ ...formData, type: e.target.value })}
 className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2]"
 >
 {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
 </select>
 </div>

 {/* Client Name */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 Client Name*
 </label>
 <input
 type="text"
 required
 placeholder="e.g. Sarah Johnson"
 value={formData.client}
 onChange={(e) => setFormData({ ...formData, client: e.target.value })}
 className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2]"
 />
 </div>

 {/* Client Phone */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 Client Phone*
 </label>
 <input
 type="tel"
 required
 placeholder="+1 (555) 000-0000"
 value={formData.phone}
 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
 className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2]"
 />
 </div>

 {/* Client Email */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 Client Email*
 </label>
 <input
 type="email"
 required
 placeholder="client@example.com"
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2]"
 />
 </div>

 {/* Event Date */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 Event Date*
 </label>
 <input
 type="date"
 required
 value={formData.date}
 onChange={(e) => setFormData({ ...formData, date: e.target.value })}
 className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2]"
 />
 </div>

 {/* Time Range */}
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 Start Time*
 </label>
 <input
 type="time"
 value={formData.startTime}
 onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
 className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20"
 />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 End Time*
 </label>
 <input
 type="time"
 value={formData.endTime}
 onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
 className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20"
 />
 </div>
 </div>

 {/* Venue */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 Venue*
 </label>
 <select
 value={formData.venue}
 onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
 className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2]"
 >
 {VENUE_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
 </select>
 </div>

 {/* Expected Guests */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 Expected Guests*
 </label>
 <input
 type="number"
 min="1"
 required
 value={formData.guests}
 onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
 className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2]"
 />
 </div>

 {/* Catering Type */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 Catering Type
 </label>
 <select
 value={formData.catering}
 onChange={(e) => setFormData({ ...formData, catering: e.target.value })}
 className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2]"
 >
 {CATERING_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
 </select>
 </div>

 {/* Status */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 Status*
 </label>
 <select
 value={formData.status}
 onChange={(e) => setFormData({ ...formData, status: e.target.value })}
 className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2]"
 >
 {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
 </select>
 </div>

 {/* Total Amount */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 Total Amount ($)*
 </label>
 <input
 type="number"
 min="0"
 required
 value={formData.amount}
 onChange={(e) => handleAmountChange('amount', e.target.value)}
 className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2]"
 />
 </div>

 {/* Advance Amount */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 Advance Amount ($)
 </label>
 <input
 type="number"
 min="0"
 value={formData.advanceAmount}
 onChange={(e) => handleAmountChange('advanceAmount', e.target.value)}
 className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2]"
 />
 </div>

 {/* Balance Amount (Auto calculated) */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 Balance Amount ($)
 </label>
 <input
 type="number"
 readOnly
 value={formData.balanceAmount}
 className="w-full text-sm bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-3.5 py-2.5 font-semibold"
 />
 </div>
 </div>

 {/* Special Requests */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 Special Requests
 </label>
 <textarea
 rows="2"
 placeholder="Special setup, floral, stage, dietary notes..."
 value={formData.specialRequests}
 onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
 className="w-full text-sm bg-white border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2]"
 ></textarea>
 </div>

 {/* Notes */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 Notes
 </label>
 <textarea
 rows="2"
 placeholder="Internal coordinator notes..."
 value={formData.notes}
 onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
 className="w-full text-sm bg-white border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2]"
 ></textarea>
 </div>

 {/* Footer Actions matching Luxuria */}
 <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
 <button
 type="submit"
 className="px-6 py-2.5 bg-[#5c67f2] hover:bg-[#4b55e0] text-white text-sm font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
 >
 Save
 </button>
 <button
 type="button"
 onClick={() => setIsAddModalOpen(false)}
 className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-rose-600 text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
 >
 Cancel
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* EDIT EVENT MODAL */}
 {isEditModalOpen && activeEvent && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
 <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp">
 <div className="bg-[#1b7f43] px-6 py-4 flex items-center justify-between text-white">
 <h3 className="text-lg font-bold tracking-tight">Edit Event: {activeEvent.name}</h3>
 <button
 onClick={() => setIsEditModalOpen(false)}
 className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
 >
 <CloseIcon sx={{ fontSize: 18 }} />
 </button>
 </div>

 <form onSubmit={handleSaveEditEvent} className="p-6 overflow-y-auto space-y-4 flex-1">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">Event Name*</label>
 <input
 type="text"
 required
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1b7f43]/20 focus:border-[#1b7f43]"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">Event ID</label>
 <input
 type="text"
 readOnly
 value={formData.id}
 className="w-full text-sm bg-slate-50 border border-slate-200 text-slate-500 rounded-xl px-3.5 py-2.5 font-mono"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">Event Type*</label>
 <select
 value={formData.type}
 onChange={(e) => setFormData({ ...formData, type: e.target.value })}
 className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1b7f43]/20"
 >
 {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
 </select>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">Client Name*</label>
 <input
 type="text"
 required
 value={formData.client}
 onChange={(e) => setFormData({ ...formData, client: e.target.value })}
 className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1b7f43]/20"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">Venue*</label>
 <select
 value={formData.venue}
 onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
 className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1b7f43]/20"
 >
 {VENUE_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
 </select>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">Status*</label>
 <select
 value={formData.status}
 onChange={(e) => setFormData({ ...formData, status: e.target.value })}
 className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1b7f43]/20"
 >
 {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
 </select>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">Total Amount ($)*</label>
 <input
 type="number"
 min="0"
 required
 value={formData.amount}
 onChange={(e) => handleAmountChange('amount', e.target.value)}
 className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1b7f43]/20"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">Advance Amount ($)</label>
 <input
 type="number"
 min="0"
 value={formData.advanceAmount}
 onChange={(e) => handleAmountChange('advanceAmount', e.target.value)}
 className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1b7f43]/20"
 />
 </div>
 </div>

 <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
 <button
 type="submit"
 className="px-6 py-2.5 bg-[#1b7f43] hover:bg-[#166534] text-white text-sm font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
 >
 Update Event
 </button>
 <button
 type="button"
 onClick={() => setIsEditModalOpen(false)}
 className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
 >
 Cancel
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* VIEW DETAILS MODAL */}
 {isViewModalOpen && activeEvent && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
 <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp">
 <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
 <div>
 <span className="text-xs font-mono text-slate-400 block">{activeEvent.id}</span>
 <h3 className="text-lg font-bold tracking-tight">{activeEvent.name}</h3>
 </div>
 <button
 onClick={() => setIsViewModalOpen(false)}
 className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
 >
 <CloseIcon sx={{ fontSize: 18 }} />
 </button>
 </div>

 <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700">
 <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
 <div>
 <span className="text-xs text-slate-400 block">Event Type</span>
 <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${getTypeBadgeStyle(activeEvent.type)}`}>
 {activeEvent.type}
 </span>
 </div>
 <div>
 <span className="text-xs text-slate-400 block">Current Status</span>
 <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${getStatusBadgeStyle(activeEvent.status)}`}>
 {activeEvent.status}
 </span>
 </div>
 <div>
 <span className="text-xs text-slate-400 block">Client</span>
 <span className="font-semibold text-slate-900">{activeEvent.client}</span>
 <div className="text-xs text-slate-500 mt-0.5">{activeEvent.phone} • {activeEvent.email}</div>
 </div>
 <div>
 <span className="text-xs text-slate-400 block">Venue &amp; Capacity</span>
 <span className="font-semibold text-slate-900">{activeEvent.venue}</span>
 <div className="text-xs text-slate-500 mt-0.5">{activeEvent.guests} Expected Guests</div>
 </div>
 <div>
 <span className="text-xs text-slate-400 block">Date &amp; Schedule</span>
 <span className="font-semibold text-slate-900">{activeEvent.displayDate}</span>
 <div className="text-xs text-slate-500 mt-0.5">{activeEvent.startTime} – {activeEvent.endTime}</div>
 </div>
 <div>
 <span className="text-xs text-slate-400 block">Catering Service</span>
 <span className="font-semibold text-slate-900">{activeEvent.catering}</span>
 </div>
 </div>

 {/* Financial Breakdown */}
 <div className="bg-slate-50 p-4 rounded-xl space-y-2">
 <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Financial Summary</h4>
 <div className="flex justify-between items-center text-xs">
 <span>Total Amount:</span>
 <span className="font-bold text-slate-900">${activeEvent.amount.toLocaleString()}</span>
 </div>
 <div className="flex justify-between items-center text-xs">
 <span>Advance Paid:</span>
 <span className="font-semibold text-emerald-600">${activeEvent.advanceAmount?.toLocaleString() || 0}</span>
 </div>
 <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
 <span className="font-bold text-slate-800">Remaining Balance:</span>
 <span className="font-bold text-rose-600">${activeEvent.balanceAmount?.toLocaleString() || 0}</span>
 </div>
 </div>

 {activeEvent.specialRequests && (
 <div>
 <span className="text-xs text-slate-400 block font-semibold">Special Requests</span>
 <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg">{activeEvent.specialRequests}</p>
 </div>
 )}

 {activeEvent.notes && (
 <div>
 <span className="text-xs text-slate-400 block font-semibold">Coordinator Notes</span>
 <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg">{activeEvent.notes}</p>
 </div>
 )}
 </div>

 <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
 <button
 onClick={() => setIsViewModalOpen(false)}
 className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
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
