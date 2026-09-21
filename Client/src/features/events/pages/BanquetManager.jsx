import React, { useState } from'react';
import {
 HomeOutlined as HomeIcon,
 Celebration as CelebrationIcon,
 EventSeat as SeatIcon,
 Apartment as VenueIcon,
 Receipt as SpendIcon,
 LocationOn as LocationIcon,
 Schedule as ScheduleIcon,
 People as PeopleIcon,
 RestaurantMenu as MenuIcon,
 ArticleOutlined as BeoIcon,
 Search as SearchIcon,
 Refresh as RefreshIcon,
 FileDownload as DownloadIcon,
 Add as AddIcon,
 Close as CloseIcon,
 CheckCircle as CheckCircleIcon,
 Print as PrintIcon
} from'@mui/icons-material';

// Initial BEO Events list matching the Luxuria template exactly
const INITIAL_EVENTS = [
 {
 id:'BEO-401',
 title:'Vance & Sterling Royal Wedding Gala',
 client:'Baroness Evelyn Vance â€¢ Vance Family Trust',
 venue:'Grand Crystal Ballroom',
 status:'Confirmed & Deposit Paid',
 statusType:'confirmed',
 schedule:'Oct 28, 2026 (18:00 â€“ 23:30)',
 attendance:'320 Guests (Round Table Banquet (10-top))',
 catering:'6-Course Michelin Gala Dinner & Vintage Champagne Toast',
 totalPrice:'$68,500',
 depositPaid:'$35,000',
 avSetup:'Full Line Array Audio, 4K LED Backdrop & Stage Spotlight',
 coordinator:'Marcella Dubois (Senior Event Director)',
 },
 {
 id:'BEO-402',
 title:'Global Private Wealth & Tech Summit 2026',
 client:'Julian Thorne â€¢ Thorne Capital Partners',
 venue:'Grand Crystal Ballroom',
 status:'BEO In Preparation',
 statusType:'in-prep',
 schedule:'Nov 04, 2026 (08:30 â€“ 17:00)',
 attendance:'380 Guests (Theater Keynote & Stage)',
 catering:'Executive All-Day Coffee Bar & Gourmet Buffet Luncheon',
 totalPrice:'$42,000',
 depositPaid:'$20,000',
 avSetup:'Dual Projectors, Live Webcast Rig & 8 Wireless Lapel Mics',
 coordinator:'Jonathan Sterling (Conference Lead)',
 },
 {
 id:'BEO-403',
 title:'Haute Horlogerie Luxury Watch Showcase',
 client:'Genevieve Moreau â€¢ Vacheron & Patek Guild',
 venue:'Skyline Rooftop Pavilion',
 status:'In-Progress Live Event',
 statusType:'in-progress',
 schedule:'Today (19:00 â€“ 23:00)',
 attendance:'140 Guests (Cocktail Reception Standing)',
 catering:'Beluga Caviar Tasting, Truffle CanapÃ©s & Sommelier Wine Pairing',
 totalPrice:'$29,800',
 depositPaid:'$29,800',
 avSetup:'Ambient DJ Sound System & Museum-Grade Vitrine Lighting',
 coordinator:'Elena Rostova (VIP Hospitality)',
 },
 {
 id:'BEO-404',
 title:'Diplomatic Corps Autumn Ambassadorial Dinner',
 client:'Ambassador Henri Zhao â€¢ Consular Diplomatic Mission',
 venue:'Royal Executive Boardroom',
 status:'Confirmed & Deposit Paid',
 statusType:'confirmed',
 schedule:'Oct 30, 2026 (19:30 â€“ 22:30)',
 attendance:'28 Guests (U-Shape Executive)',
 catering:'Private Chef 5-Course State Banquet with Wine Pairing',
 totalPrice:'$12,400',
 depositPaid:'$12,400',
 avSetup:'Encrypted Video Teleconference & Interpretation Booths',
 coordinator:'Marcella Dubois (Senior Event Director)',
 },
 {
 id:'BEO-405',
 title:'Luminis Biotech European Board Meeting',
 client:'Dr. Aris Thorne â€¢ Luminis Therapeutics',
 venue:'Botanical Garden Terrace',
 status:'BEO In Preparation',
 statusType:'in-prep',
 schedule:'Nov 12, 2026 (11:00 â€“ 16:00)',
 attendance:'160 Guests (Classroom & Workshop)',
 catering:'Farm-to-Table Organic Garden Lunch & Artisan Gelato Bar',
 totalPrice:'$24,800',
 depositPaid:'$10,000',
 avSetup:'High-Brightness Laser Displays & Polycom Hybrid Audio',
 coordinator:'Jonathan Sterling (Conference Lead)',
 },
];

const VENUE_FILTERS = [
 { id:'all', label:'All Venues', icon: VenueIcon },
 { id:'grand-crystal', label:'Grand Crystal Ballroom', pax:'450 Pax' },
 { id:'skyline-rooftop', label:'Skyline Rooftop Pavilion', pax:'180 Pax' },
 { id:'royal-executive', label:'Royal Executive Boardroom', pax:'35 Pax' },
 { id:'botanical-garden', label:'Botanical Garden Terrace', pax:'220 Pax' },
];

const STATUS_FILTERS = ['All Statuses','Confirmed & Deposit Paid','BEO In Preparation','In-Progress Live Event','Completed & Invoiced',
];

export default function BanquetManager() {
 const [events, setEvents] = useState(INITIAL_EVENTS);
 const [selectedVenue, setSelectedVenue] = useState('all');
 const [selectedStatus, setSelectedStatus] = useState('All Statuses');
 const [searchQuery, setSearchQuery] = useState('');

 // Modal states
 const [activeBeoSheet, setActiveBeoSheet] = useState(null);
 const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
 const [toastMessage, setToastMessage] = useState(null);

 // New BEO Form state
 const [newBEO, setNewBEO] = useState({
 title:'',
 client:'',
 venue:'Grand Crystal Ballroom',
 status:'Confirmed & Deposit Paid',
 schedule:'',
 attendance:'',
 catering:'',
 totalPrice:'',
 depositPaid:'',
 });

 const showToast = (message) => {
 setToastMessage(message);
 setTimeout(() => setToastMessage(null), 3500);
 };

 const handleResetFilters = () => {
 setSelectedVenue('all');
 setSelectedStatus('All Statuses');
 setSearchQuery('');
 showToast('Filters reset.');
 };

 const handleExportCSV = () => {
 const headers = ['BEO ID','Event Title','Client','Venue','Status','Schedule','Total Price','Deposit Paid'];
 const rows = filteredEvents.map(e => [
 e.id,`"${e.title}"`,`"${e.client}"`,`"${e.venue}"`,`"${e.status}"`,`"${e.schedule}"`,`"${e.totalPrice}"`,`"${e.depositPaid}"`
 ]);
 const csvContent ='data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
 const encodedUri = encodeURI(csvContent);
 const link = document.createElement('a');
 link.setAttribute('href', encodedUri);
 link.setAttribute('download','BEO_Banquet_Events.csv');
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 showToast('BEO export downloaded successfully!');
 };

 const handleCreateBEO = (e) => {
 e.preventDefault();
 if (!newBEO.title || !newBEO.client) return;

 const created = {
 id:`BEO-${400 + events.length + 1}`,
 title: newBEO.title,
 client: newBEO.client,
 venue: newBEO.venue,
 status: newBEO.status,
 statusType: newBEO.status.includes('Confirmed') ?'confirmed' :'in-prep',
 schedule: newBEO.schedule ||'Upcoming Scheduled Date',
 attendance: newBEO.attendance ||'100 Guests (Standard Banquet)',
 catering: newBEO.catering ||'Chef Tasting Menu & Beverage Package',
 totalPrice: newBEO.totalPrice.startsWith('$') ? newBEO.totalPrice :`$${newBEO.totalPrice}`,
 depositPaid: newBEO.depositPaid.startsWith('$') ? newBEO.depositPaid :`$${newBEO.depositPaid}`,
 avSetup:'Standard Stage, Podium Mic & Ambient Lighting',
 coordinator:'Marcella Dubois (Senior Event Director)',
 };

 setEvents(prev => [created, ...prev]);
 setIsGenerateModalOpen(false);
 setNewBEO({
 title:'',
 client:'',
 venue:'Grand Crystal Ballroom',
 status:'Confirmed & Deposit Paid',
 schedule:'',
 attendance:'',
 catering:'',
 totalPrice:'',
 depositPaid:'',
 });
 showToast(`New Banquet Order ${created.id} generated!`);
 };

 // Filter logic
 const filteredEvents = events.filter((item) => {
 const matchesVenue =
 selectedVenue ==='all' ||
 item.venue.toLowerCase().includes(selectedVenue.replace('-',''));

 const matchesStatus =
 selectedStatus ==='All Statuses' || item.status === selectedStatus;

 const matchesSearch =
 searchQuery.trim() ==='' ||
 item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
 item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
 item.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
 item.id.toLowerCase().includes(searchQuery.toLowerCase());

 return matchesVenue && matchesStatus && matchesSearch;
 });

 return (
 <div className="w-full space-y-2 pb-1" style={{ fontFamily:'Inter, sans-serif' }}>

 {/* â”€â”€ Toast Notification â”€â”€ */}
 {toastMessage && (
 <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-[var(--text-primary)] text-white px-3 py-2 rounded-xl shadow-xl text-xs font-medium">
 <CheckCircleIcon sx={{ fontSize: 16, color:'var(--primary-main)' }} />
 <span>{toastMessage}</span>
 </div>
 )}

 {/* â”€â”€ 1. KPI Cards â”€â”€ */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
 {/* Card 1: Monthly Banquet Revenue */}
 <div className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-2 sm:p-2.5 hover:border-[var(--primary-main)]/30 transition-colors">
 <div className="flex items-start justify-between">
 <div>
 <span className="text-[11px] font-semibold text-[var(--text-secondary)] tracking-wider uppercase block">
 Monthly Revenue
 </span>
 <div className="text-lg font-bold text-[var(--text-primary)] tracking-tight mt-0.5 mb-1">
 $184,500
 </div>
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className="rounded-full px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
 +18.4% vs Last Month
 </span>
 <span className="rounded-full px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium">
 F&B + AV Included
 </span>
 </div>
 </div>
 <div className="w-8 h-8 rounded-lg bg-[var(--primary-main)]/10 text-[var(--primary-main)] flex items-center justify-center shrink-0">
 <CelebrationIcon sx={{ fontSize: 17 }} />
 </div>
 </div>
 </div>

 {/* Card 2: Active Functions & BEOs */}
 <div className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-2 sm:p-2.5 hover:border-[var(--primary-main)]/30 transition-colors">
 <div className="flex items-start justify-between">
 <div>
 <span className="text-[11px] font-semibold text-[var(--text-secondary)] tracking-wider uppercase block">
 Active Functions
 </span>
 <div className="text-lg font-bold text-[var(--text-primary)] tracking-tight mt-0.5 mb-1">
 14 Events
 </div>
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className="rounded-full px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium">
 Weddings & Galas
 </span>
 <span className="rounded-full px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium">
 Corporate Summits
 </span>
 </div>
 </div>
 <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
 <SeatIcon sx={{ fontSize: 17 }} />
 </div>
 </div>
 </div>

 {/* Card 3: Venue Utilization */}
 <div className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-2 sm:p-2.5 hover:border-[var(--primary-main)]/30 transition-colors">
 <div className="flex items-start justify-between">
 <div>
 <span className="text-[11px] font-semibold text-[var(--text-secondary)] tracking-wider uppercase block">
 Venue Utilization
 </span>
 <div className="text-lg font-bold text-[var(--text-primary)] tracking-tight mt-0.5 mb-1">
 88%
 </div>
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className="rounded-full px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium">
 4 Luxury Venues
 </span>
 <span className="rounded-full px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium">
 Peak Weekend Par
 </span>
 </div>
 </div>
 <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
 <VenueIcon sx={{ fontSize: 17 }} />
 </div>
 </div>
 </div>

 {/* Card 4: Avg Spend Per Guest */}
 <div className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-2 sm:p-2.5 hover:border-[var(--primary-main)]/30 transition-colors">
 <div className="flex items-start justify-between">
 <div>
 <span className="text-[11px] font-semibold text-[var(--text-secondary)] tracking-wider uppercase block">
 Avg Spend / Guest
 </span>
 <div className="text-lg font-bold text-[var(--text-primary)] tracking-tight mt-0.5 mb-1 flex items-baseline">
 $285 <span className="text-xs font-normal text-[var(--text-secondary)] ml-1">/ Pax</span>
 </div>
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className="rounded-full px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium">
 Michelin Plated
 </span>
 <span className="rounded-full px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium">
 Sommelier Packages
 </span>
 </div>
 </div>
 <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
 <SpendIcon sx={{ fontSize: 17 }} />
 </div>
 </div>
 </div>
 </div>

 {/* â”€â”€ 2. Venue Filter Pills â”€â”€ */}
 <div className="flex items-center gap-1.5 pb-0.5 pt-0.5 no-scrollbar">
 {VENUE_FILTERS.map((venue) => {
 const isSelected = selectedVenue === venue.id;
 const IconComp = venue.icon;
 return (
 <button
 key={venue.id}
 onClick={() => setSelectedVenue(venue.id)}
 className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
 isSelected
 ?'bg-[var(--primary-main)] text-white border-[var(--primary-main)] shadow-sm'
 :'bg-white border-slate-200 text-[var(--text-secondary)] hover:border-[var(--primary-main)]/40 hover:text-[var(--primary-main)]'
 }`}
 >
 {IconComp && <IconComp sx={{ fontSize: 14 }} />}
 <span>{venue.label}</span>
 {venue.pax && (
 <span className={`text-[10px] font-medium ${isSelected ?'text-white/70' :'text-slate-400'}`}>
 {venue.pax}
 </span>
 )}
 </button>
 );
 })}
 </div>

 {/* â”€â”€ 3. Status Filter Pills â”€â”€ */}
 <div className="flex items-center gap-1 pb-0.5 no-scrollbar">
 {STATUS_FILTERS.map((status) => {
 const isSelected = selectedStatus === status;
 return (
 <button
 key={status}
 onClick={() => setSelectedStatus(status)}
 className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer font-medium ${
 isSelected
 ?'bg-[var(--primary-main)]/10 text-[var(--primary-main)] font-semibold'
 :'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-100'
 }`}
 >
 {status}
 </button>
 );
 })}
 </div>

 {/* â”€â”€ 4. Search & Actions Toolbar â”€â”€ */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
 {/* Search */}
 <div className="relative w-full sm:w-80">
 <SearchIcon sx={{ fontSize: 15 }} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search event, client, venue, BEO #..."
 className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-[var(--text-primary)] placeholder-slate-400 focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]/20 transition"
 />
 </div>

 {/* Buttons */}
 <div className="flex items-center gap-1.5">
 <button
 onClick={handleResetFilters}
 title="Reset Filters"
 className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-[var(--primary-main)] hover:border-[var(--primary-main)]/40 rounded-lg transition cursor-pointer"
 >
 <RefreshIcon sx={{ fontSize: 16 }} />
 </button>

 <button
 onClick={handleExportCSV}
 className="px-2.5 py-1.5 bg-white border border-slate-200 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-50 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
 >
 <DownloadIcon sx={{ fontSize: 15 }} />
 Export BEOs
 </button>

 <button
 onClick={() => setIsGenerateModalOpen(true)}
 className="px-3 py-1.5 bg-[var(--primary-main)] hover:bg-[var(--primary-dark)] text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1 cursor-pointer"
 >
 <AddIcon sx={{ fontSize: 15 }} />
 Generate New BEO
 </button>
 </div>
 </div>

 {/* â”€â”€ 5. Event / BEO Cards Grid â”€â”€ */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
 {filteredEvents.map((event) => {
 const isConfirmed = event.statusType ==='confirmed';
 const isInProgress = event.statusType ==='in-progress';

 return (
 <div
 key={event.id}
 className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-2.5 sm:p-3 hover:border-[var(--primary-main)]/20 hover:shadow-sm transition-all flex flex-col justify-between"
 >
 <div>
 {/* Card Header */}
 <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
 <span className="text-xs font-bold text-slate-400 tracking-wider">
 {event.id}
 </span>

 <div className="flex items-center gap-1.5 flex-wrap justify-end">
 {/* Venue Badge */}
 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
 <LocationIcon sx={{ fontSize: 11 }} />
 {event.venue}
 </span>

 {/* Status Badge */}
 <span
 className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
 isConfirmed
 ?'bg-emerald-50 text-emerald-700'
 : isInProgress
 ?'bg-[var(--primary-main)]/10 text-[var(--primary-main)]'
 :'bg-amber-50 text-amber-700'
 }`}
 >
 {event.status}
 </span>
 </div>
 </div>

 {/* Title & Client */}
 <h3 className="text-sm font-bold text-[var(--text-primary)] leading-snug mb-0.5">
 {event.title}
 </h3>
 <p className="text-xs text-[var(--text-secondary)] mb-2 leading-relaxed">
 {event.client}
 </p>

 {/* Schedule & Attendance */}
 <div className="space-y-1 text-xs mb-2">
 <div className="flex items-center justify-between">
 <span className="text-[var(--text-secondary)] flex items-center gap-1">
 <ScheduleIcon sx={{ fontSize: 13 }} className="text-slate-300" />
 Schedule
 </span>
 <span className="font-semibold text-[var(--text-primary)]">
 {event.schedule}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-[var(--text-secondary)] flex items-center gap-1">
 <PeopleIcon sx={{ fontSize: 13 }} className="text-slate-300" />
 Attendance
 </span>
 <span className="font-semibold text-[var(--primary-main)]">
 {event.attendance}
 </span>
 </div>
 </div>

 {/* Catering Banner */}
 <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
 <MenuIcon sx={{ fontSize: 14, color:'var(--primary-main)' }} className="shrink-0" />
 <span className="line-clamp-1">{event.catering}</span>
 </div>
 </div>

 {/* Card Footer */}
 <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
 <div>
 <span className="text-base font-bold text-[var(--text-primary)]">
 {event.totalPrice}
 </span>
 <span className="text-xs font-medium text-emerald-600 ml-2">
 Deposit: {event.depositPaid}
 </span>
 </div>

 <button
 type="button"
 onClick={() => setActiveBeoSheet(event)}
 className="text-xs font-semibold text-[var(--primary-main)] hover:text-[var(--primary-dark)] flex items-center gap-1 transition cursor-pointer"
 >
 <BeoIcon sx={{ fontSize: 14 }} />
 View BEO Sheet
 </button>
 </div>
 </div>
 );
 })}
 </div>

 {/* â”€â”€ 6. Footer â”€â”€ */}
 <div className="pt-1 text-left text-xs text-slate-400 font-normal">
 Copyright Â© 2026 Design By <span className="text-slate-600 font-semibold">Luxuria</span>
 </div>

 {/* â”€â”€ Modal: View BEO Sheet â”€â”€ */}
 {activeBeoSheet && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
 <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-100 max-h-[90vh] overflow-y-auto">
 {/* Modal Header */}
 <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-lg bg-[var(--primary-main)]/10 text-[var(--primary-main)] flex items-center justify-center">
 <BeoIcon sx={{ fontSize: 20 }} />
 </div>
 <div>
 <h3 className="text-sm font-bold text-[var(--text-primary)]">
 Banquet Event Order â€” {activeBeoSheet.id}
 </h3>
 <p className="text-xs text-[var(--text-secondary)]">Official Production Specification Sheet</p>
 </div>
 </div>
 <button
 onClick={() => setActiveBeoSheet(null)}
 className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
 >
 <CloseIcon sx={{ fontSize: 18 }} />
 </button>
 </div>

 {/* Modal Body */}
 <div className="px-5 py-4 space-y-4 text-sm">
 {/* Event & Client Banner */}
 <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 border border-slate-100">
 <h4 className="text-sm font-bold text-[var(--text-primary)] leading-snug">{activeBeoSheet.title}</h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[var(--text-secondary)]">
 <p><span className="font-semibold text-[var(--text-primary)]">Client:</span> {activeBeoSheet.client}</p>
 <p><span className="font-semibold text-[var(--text-primary)]">Venue:</span> {activeBeoSheet.venue}</p>
 <p><span className="font-semibold text-[var(--text-primary)]">Date & Time:</span> {activeBeoSheet.schedule}</p>
 <p><span className="font-semibold text-[var(--text-primary)]">Coordinator:</span> {activeBeoSheet.coordinator}</p>
 </div>
 </div>

 {/* Room Configuration */}
 <div>
 <h5 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
 Room Configuration & Attendance
 </h5>
 <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs space-y-1">
 <p className="font-semibold text-[var(--text-primary)]">{activeBeoSheet.attendance}</p>
 <p className="text-[var(--text-secondary)]">AV & Staging: {activeBeoSheet.avSetup}</p>
 </div>
 </div>

 {/* Culinary & Bar */}
 <div>
 <h5 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
 Culinary & Bar Specifications
 </h5>
 <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-xs">
 <p className="font-semibold text-emerald-800">{activeBeoSheet.catering}</p>
 <p className="text-emerald-700 mt-1">Special Dietary: Kosher & Halal options pre-flagged with Banquet Captain.</p>
 </div>
 </div>

 {/* Financials */}
 <div>
 <h5 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
 Financials & Billing
 </h5>
 <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
 <div>
 <span className="text-xs text-[var(--text-secondary)]">Contract Total</span>
 <p className="text-xl font-bold text-[var(--text-primary)] leading-tight">{activeBeoSheet.totalPrice}</p>
 </div>
 <div>
 <span className="text-xs text-[var(--text-secondary)]">Deposit Received</span>
 <p className="text-xl font-bold text-emerald-600 leading-tight">{activeBeoSheet.depositPaid}</p>
 </div>
 </div>
 </div>
 </div>

 {/* Modal Footer */}
 <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
 <button
 onClick={() => {
 window.print();
 showToast('Preparing BEO Document for Print...');
 }}
 className="px-4 py-1.5 border border-slate-200 text-[var(--text-secondary)] text-xs font-semibold rounded-lg hover:bg-slate-50 hover:text-[var(--text-primary)] transition flex items-center gap-1.5 cursor-pointer"
 >
 <PrintIcon sx={{ fontSize: 15 }} />
 Print BEO Sheet
 </button>
 <button
 onClick={() => setActiveBeoSheet(null)}
 className="px-5 py-1.5 bg-[var(--primary-main)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--primary-dark)] transition cursor-pointer"
 >
 Close
 </button>
 </div>
 </div>
 </div>
 )}

 {/* â”€â”€ Modal: Generate New BEO â”€â”€ */}
 {isGenerateModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
 <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-100 max-h-[90vh] overflow-y-auto">
 {/* Modal Header */}
 <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
 <div className="flex items-center gap-2.5">
 <div className="w-9 h-9 rounded-lg bg-[var(--primary-main)] text-white flex items-center justify-center">
 <AddIcon sx={{ fontSize: 19 }} />
 </div>
 <h4 className="font-bold text-[var(--text-primary)] text-sm">
 Generate New Banquet Event Order
 </h4>
 </div>
 <button
 onClick={() => setIsGenerateModalOpen(false)}
 className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
 >
 <CloseIcon sx={{ fontSize: 18 }} />
 </button>
 </div>

 <form onSubmit={handleCreateBEO} className="px-5 py-4 space-y-3.5 text-xs">
 {/* Event Title */}
 <div>
 <label className="block font-semibold text-[var(--text-primary)] mb-1">
 Event Title <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 required
 placeholder="e.g. Cambridge Tech Gala & Reception"
 value={newBEO.title}
 onChange={(e) => setNewBEO({ ...newBEO, title: e.target.value })}
 className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-[var(--text-primary)] placeholder-slate-400 focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]/20 transition"
 />
 </div>

 {/* Client */}
 <div>
 <label className="block font-semibold text-[var(--text-primary)] mb-1">
 Client / Sponsor <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 required
 placeholder="e.g. Lady Clara Sterling â€¢ Sterling Foundation"
 value={newBEO.client}
 onChange={(e) => setNewBEO({ ...newBEO, client: e.target.value })}
 className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-[var(--text-primary)] placeholder-slate-400 focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]/20 transition"
 />
 </div>

 {/* Venue & Status */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block font-semibold text-[var(--text-primary)] mb-1">Venue</label>
 <select
 value={newBEO.venue}
 onChange={(e) => setNewBEO({ ...newBEO, venue: e.target.value })}
 className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]/20 bg-white transition"
 >
 <option value="Grand Crystal Ballroom">Grand Crystal Ballroom (450 Pax)</option>
 <option value="Skyline Rooftop Pavilion">Skyline Rooftop Pavilion (180 Pax)</option>
 <option value="Royal Executive Boardroom">Royal Executive Boardroom (35 Pax)</option>
 <option value="Botanical Garden Terrace">Botanical Garden Terrace (220 Pax)</option>
 </select>
 </div>
 <div>
 <label className="block font-semibold text-[var(--text-primary)] mb-1">Status</label>
 <select
 value={newBEO.status}
 onChange={(e) => setNewBEO({ ...newBEO, status: e.target.value })}
 className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]/20 bg-white transition"
 >
 <option value="Confirmed & Deposit Paid">Confirmed & Deposit Paid</option>
 <option value="BEO In Preparation">BEO In Preparation</option>
 <option value="In-Progress Live Event">In-Progress Live Event</option>
 </select>
 </div>
 </div>

 {/* Schedule & Attendance */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block font-semibold text-[var(--text-primary)] mb-1">Schedule</label>
 <input
 type="text"
 placeholder="Nov 18, 2026 (18:00 â€“ 23:00)"
 value={newBEO.schedule}
 onChange={(e) => setNewBEO({ ...newBEO, schedule: e.target.value })}
 className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-[var(--text-primary)] placeholder-slate-400 focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]/20 transition"
 />
 </div>
 <div>
 <label className="block font-semibold text-[var(--text-primary)] mb-1">Attendance</label>
 <input
 type="text"
 placeholder="250 Guests (Round Table 10-top)"
 value={newBEO.attendance}
 onChange={(e) => setNewBEO({ ...newBEO, attendance: e.target.value })}
 className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-[var(--text-primary)] placeholder-slate-400 focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]/20 transition"
 />
 </div>
 </div>

 {/* Catering */}
 <div>
 <label className="block font-semibold text-[var(--text-primary)] mb-1">Food & Beverage Menu</label>
 <input
 type="text"
 placeholder="5-Course Plated Dinner & Open Bar"
 value={newBEO.catering}
 onChange={(e) => setNewBEO({ ...newBEO, catering: e.target.value })}
 className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-[var(--text-primary)] placeholder-slate-400 focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]/20 transition"
 />
 </div>

 {/* Pricing */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block font-semibold text-[var(--text-primary)] mb-1">Total Contract Price ($)</label>
 <input
 type="text"
 placeholder="$35,000"
 value={newBEO.totalPrice}
 onChange={(e) => setNewBEO({ ...newBEO, totalPrice: e.target.value })}
 className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-[var(--text-primary)] placeholder-slate-400 focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]/20 transition"
 />
 </div>
 <div>
 <label className="block font-semibold text-[var(--text-primary)] mb-1">Deposit Paid ($)</label>
 <input
 type="text"
 placeholder="$15,000"
 value={newBEO.depositPaid}
 onChange={(e) => setNewBEO({ ...newBEO, depositPaid: e.target.value })}
 className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-[var(--text-primary)] placeholder-slate-400 focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]/20 transition"
 />
 </div>
 </div>

 {/* Form Actions */}
 <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
 <button
 type="button"
 onClick={() => setIsGenerateModalOpen(false)}
 className="px-4 py-1.5 border border-slate-200 text-[var(--text-secondary)] text-xs font-semibold rounded-lg hover:bg-slate-50 hover:text-[var(--text-primary)] transition cursor-pointer"
 >
 Cancel
 </button>
 <button
 type="submit"
 className="px-5 py-1.5 bg-[var(--primary-main)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--primary-dark)] transition shadow-sm cursor-pointer"
 >
 Generate BEO
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}

