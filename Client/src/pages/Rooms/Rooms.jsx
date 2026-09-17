import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Hotel, CheckCircle, Bed, CleaningServices, BuildCircle,
  Search, FormatListBulleted, GridView, Add,
  Wifi, Tv, AcUnit, MoreVert, LocalBar, ViewCompact,
  Person, SquareFoot, KingBed, SingleBed, Star,
  Edit, Delete, ChevronLeft, ChevronRight
} from '@mui/icons-material';
import { IconButton } from '@mui/material';

const initialRooms = [
  { id: '101', type: 'Standard Single', status: 'Available', price: 120, floor: '1st Floor', amenities: ['wifi', 'tv', 'ac'], capacity: 1, size: 220, bedType: 'Twin', rating: 4.2 },
  { id: '102', type: 'Standard Double', status: 'Occupied', price: 150, floor: '1st Floor', amenities: ['wifi', 'tv', 'ac'], capacity: 2, size: 260, bedType: 'Queen', rating: 4.3 },
  { id: '103', type: 'Standard Double', status: 'Cleaning', price: 150, floor: '1st Floor', amenities: ['wifi', 'tv'], capacity: 2, size: 260, bedType: 'Queen', rating: 4.1 },
  { id: '104', type: 'Deluxe Suite', status: 'Maintenance', price: 250, floor: '1st Floor', amenities: ['wifi', 'tv', 'ac', 'minibar'], capacity: 3, size: 420, bedType: 'King', rating: 4.6 },
  { id: '105', type: 'Standard Single', status: 'Available', price: 120, floor: '1st Floor', amenities: ['wifi', 'tv'], capacity: 1, size: 220, bedType: 'Twin', rating: 4.0 },

  { id: '201', type: 'Deluxe Double', status: 'Occupied', price: 180, floor: '2nd Floor', amenities: ['wifi', 'tv', 'ac'], capacity: 2, size: 320, bedType: 'King', rating: 4.5 },
  { id: '202', type: 'Presidential Suite', status: 'Available', price: 500, floor: '2nd Floor', amenities: ['wifi', 'tv', 'ac', 'minibar', 'view'], capacity: 4, size: 650, bedType: 'King', rating: 4.9 },
  { id: '203', type: 'Standard Double', status: 'Available', price: 150, floor: '2nd Floor', amenities: ['wifi', 'tv', 'ac'], capacity: 2, size: 260, bedType: 'Queen', rating: 4.2 },
  { id: '204', type: 'Standard Single', status: 'Cleaning', price: 120, floor: '2nd Floor', amenities: ['wifi', 'ac'], capacity: 1, size: 220, bedType: 'Twin', rating: 3.9 },
  { id: '205', type: 'Deluxe Suite', status: 'Occupied', price: 250, floor: '2nd Floor', amenities: ['wifi', 'tv', 'ac'], capacity: 3, size: 420, bedType: 'King', rating: 4.6 },

  { id: '301', type: 'Standard Double', status: 'Available', price: 150, floor: '3rd Floor', amenities: ['wifi', 'tv', 'ac'], capacity: 2, size: 260, bedType: 'Queen', rating: 4.3 },
  { id: '302', type: 'Standard Single', status: 'Maintenance', price: 120, floor: '3rd Floor', amenities: ['wifi', 'tv'], capacity: 1, size: 220, bedType: 'Twin', rating: 3.8 },
  { id: '303', type: 'Deluxe Double', status: 'Occupied', price: 180, floor: '3rd Floor', amenities: ['wifi', 'tv', 'ac', 'minibar'], capacity: 2, size: 320, bedType: 'King', rating: 4.4 },
  { id: '304', type: 'Premium Suite', status: 'Available', price: 350, floor: '3rd Floor', amenities: ['wifi', 'tv', 'ac', 'view'], capacity: 4, size: 580, bedType: 'King', rating: 4.8 },
  { id: '305', type: 'Standard Double', status: 'Available', price: 150, floor: '3rd Floor', amenities: ['wifi', 'tv', 'ac'], capacity: 2, size: 260, bedType: 'Queen', rating: 4.2 },
];

// Status -> accent treatment for the glass pill on the header image
const STATUS_CONFIG = {
  Available:   { dot: 'bg-emerald-500', text: 'text-emerald-700' },
  Occupied:    { dot: 'bg-blue-500',    text: 'text-blue-700' },
  Cleaning:    { dot: 'bg-amber-500',   text: 'text-amber-700' },
  Maintenance: { dot: 'bg-red-500',     text: 'text-red-700' },
};

// Room category -> header gradient + watermark tint. Keeps tiers visually distinct at a glance.
function getCategoryTheme(type) {
  if (/suite|presidential|premium/i.test(type)) {
    return { gradient: 'bg-gradient-to-br from-amber-500 to-orange-600', iconTint: 'text-amber-200' };
  }
  if (/deluxe/i.test(type)) {
    return { gradient: 'bg-gradient-to-br from-indigo-500 to-violet-600', iconTint: 'text-indigo-200' };
  }
  return { gradient: 'bg-gradient-to-br from-slate-600 to-slate-800', iconTint: 'text-slate-300' };
}

const AMENITY_ICONS = {
  wifi: { Icon: Wifi, label: 'Free Wi-Fi' },
  tv: { Icon: Tv, label: 'Smart TV' },
  ac: { Icon: AcUnit, label: 'Air Conditioning' },
  minibar: { Icon: LocalBar, label: 'Mini Bar' },
  view: { Icon: ViewCompact, label: 'Great View' },
};

const BED_ICON = {
  King: KingBed,
  Queen: KingBed,
  Twin: SingleBed,
};

export default function Rooms() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredRooms = initialRooms.filter(room => {
    const matchesTab = activeTab === 'All' || room.status === activeTab;
    const matchesSearch = room.id.includes(searchQuery) || room.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const paginatedRooms = filteredRooms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when tab or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  return (
    <div className="animate-fade-in pb-8 space-y-4 max-w-[1600px] mx-auto">
      {/* Spacer to maintain gap from breadcrumbs */}
      <div className="h-2"></div>
      
      {/* 5 ROOM STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
        {/* Total Rooms */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Total Rooms</span>
            <Hotel className="text-indigo-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-gray-900">120</span>
          </div>
        </div>

        {/* Available */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Available</span>
            <CheckCircle className="text-emerald-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-gray-900">45</span>
          </div>
        </div>

        {/* Occupied */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Occupied</span>
            <Bed className="text-blue-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-gray-900">62</span>
          </div>
        </div>

        {/* Cleaning */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Cleaning</span>
            <CleaningServices className="text-amber-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-gray-900">8</span>
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Maintenance</span>
            <BuildCircle className="text-red-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-gray-900">5</span>
          </div>
        </div>
      </div>
      
      {/* ROOMS CONTROL BAR */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        
        {/* Left Side: Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-full sm:w-56 shrink-0">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" sx={{ fontSize: 16 }} />
            <input 
              type="text" 
              placeholder="Search Rooms..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow truncate"
            />
          </div>

          {/* Segmented Filters */}
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-x-auto hide-scrollbar shrink-0">
            {['All', 'Available', 'Occupied', 'Cleaning', 'Maintenance'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-[11px] font-semibold transition-colors border-r border-gray-200 last:border-r-0 cursor-pointer whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-[#e5f4eb] text-[#1b7f43] border-[#1b7f43]/20 relative z-10' 
                    : 'text-gray-500 hover:bg-[#e5f4eb] hover:text-[#1b7f43]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: View Toggle & Add Button */}
        <div className="flex items-center gap-3 self-end xl:self-auto">
          {/* View Toggle */}
          <div className="flex items-center bg-[#f5f4f0] p-1 rounded-full border border-gray-100 shadow-inner">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-800 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <FormatListBulleted sx={{ fontSize: 18 }} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                viewMode === 'grid' 
                  ? 'bg-white text-[#d4b773] shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <GridView sx={{ fontSize: 18 }} />
            </button>
          </div>

          {/* Add Room Button */}
          <button onClick={() => navigate('/rooms/new')} className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold text-white bg-[var(--primary-main)] rounded-xl hover:brightness-110 shadow-sm transition-all cursor-pointer">
            <Add sx={{ fontSize: 16 }} />
            Add Room
          </button>
        </div>
      </div>

      {/* ROOMS GRID */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2">
          {filteredRooms.map((room) => {
            const cfg = STATUS_CONFIG[room.status] || STATUS_CONFIG.Available;
            const theme = getCategoryTheme(room.type);
            const BedTypeIcon = BED_ICON[room.bedType] || Bed;

            return (
              <div
                key={room.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col"
              >
                {/* Visual header — swap this block for an <img src={room.imageUrl} /> + a
                    bg-black/20 scrim once real room photos are available from the backend */}
                <div className={`relative h-28 ${theme.gradient} overflow-hidden flex items-end p-3`}>
                  <Hotel
                    sx={{ fontSize: 100 }}
                    className={`absolute -right-4 -top-4 ${theme.iconTint} opacity-25 rotate-12 pointer-events-none`}
                  />

                  {/* Status glass pill */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-white/90 backdrop-blur px-2 py-1 rounded-full shadow-sm">
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                    <span className={`text-[10px] font-semibold ${cfg.text}`}>{room.status}</span>
                  </div>

                  {/* Room number */}
                  <div className="relative z-10">
                    <div className="text-3xl font-bold text-white tabular-nums leading-none drop-shadow-sm">
                      {room.id}
                    </div>
                    <div className="text-[11px] text-white/80 font-medium mt-0.5">{room.floor}</div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-gray-900 leading-snug">{room.type}</h3>
                    <div className="flex items-center gap-0.5 shrink-0 text-amber-500">
                      <Star sx={{ fontSize: 14 }} />
                      <span className="text-[11px] font-semibold text-gray-700">{room.rating}</span>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="flex items-center gap-3 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Person sx={{ fontSize: 14 }} className="text-gray-400" />
                      {room.capacity} Guests
                    </span>
                    <span className="flex items-center gap-1">
                      <SquareFoot sx={{ fontSize: 14 }} className="text-gray-400" />
                      {room.size} sqft
                    </span>
                    <span className="flex items-center gap-1">
                      <BedTypeIcon sx={{ fontSize: 14 }} className="text-gray-400" />
                      {room.bedType}
                    </span>
                  </div>

                  {/* Amenities as chips */}
                  <div className="flex items-center gap-1.5 pt-2.5 border-t border-gray-50">
                    {room.amenities.map((key) => {
                      const entry = AMENITY_ICONS[key];
                      if (!entry) return null;
                      const { Icon, label } = entry;
                      return (
                        <span
                          key={key}
                          title={label}
                          className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 border border-gray-100 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        >
                          <Icon sx={{ fontSize: 14 }} titleAccess={label} />
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Footer: price + menu */}
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold text-gray-900">${room.price}</span>
                    <span className="text-[10px] text-gray-400">/night</span>
                  </div>
                  <div className="flex gap-1">
                    <IconButton size="small" onClick={() => navigate(`/rooms/edit/${room.id}`)}>
                      <Edit sx={{ fontSize: 16, color: '#3b82f6' }} />
                    </IconButton>
                    <IconButton size="small" sx={{ '&:hover': { backgroundColor: '#fef2f2', color: '#dc2626' } }}>
                      <Delete sx={{ fontSize: 16, color: '#ef4444' }} />
                    </IconButton>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredRooms.length === 0 && (
            <div className="col-span-full py-10 text-center text-gray-500">
              No rooms found matching your criteria.
            </div>
          )}
        </div>
      )}

      {/* List View Table */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Room No</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Floor</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Capacity</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Bed</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Size</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Amenities</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Price/Night</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedRooms.map((room) => {
                  const cfg = STATUS_CONFIG[room.status] || STATUS_CONFIG.Available;
                  const BedTypeIcon = BED_ICON[room.bedType] || Bed;
                  return (
                    <tr key={room.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-4 text-[13px] font-bold text-gray-800 whitespace-nowrap">{room.id}</td>
                      <td className="py-2.5 px-4 text-[13px] font-semibold text-gray-700 whitespace-nowrap">{room.type}</td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          room.status === 'Available' ? 'bg-[#e5f4eb] text-[#1b7f43] border border-[#1b7f43]/20' :
                          room.status === 'Occupied' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                          room.status === 'Cleaning' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                          'bg-red-50 text-red-600 border border-red-200'
                        }`}>
                          {room.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-[13px] text-gray-600 whitespace-nowrap">{room.floor}</td>
                      
                      {/* Detailed Columns */}
                      <td className="py-2.5 px-4 text-[13px] text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Person sx={{ fontSize: 14 }} className="text-gray-400" />
                          {room.capacity}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-[13px] text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <BedTypeIcon sx={{ fontSize: 14 }} className="text-gray-400" />
                          {room.bedType}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-[13px] text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <SquareFoot sx={{ fontSize: 14 }} className="text-gray-400" />
                          {room.size} sqft
                        </div>
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-gray-400">
                          {room.amenities.map((key) => {
                            const entry = AMENITY_ICONS[key];
                            if (!entry) return null;
                            const { Icon, label } = entry;
                            return <Icon key={key} sx={{ fontSize: 16 }} titleAccess={label} />;
                          })}
                        </div>
                      </td>

                      <td className="py-2.5 px-4 text-[13px] font-bold text-gray-900 whitespace-nowrap">${room.price}</td>
                      <td className="py-2.5 px-4 whitespace-nowrap text-right">
                        <div className="flex gap-1 justify-end">
                          <IconButton size="small" onClick={() => navigate(`/rooms/edit/${room.id}`)}>
                            <Edit sx={{ fontSize: 16, color: '#3b82f6' }} />
                          </IconButton>
                          <IconButton size="small" sx={{ '&:hover': { backgroundColor: '#fef2f2', color: '#dc2626' } }}>
                            <Delete sx={{ fontSize: 16, color: '#ef4444' }} />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedRooms.length === 0 && (
                  <tr>
                    <td colSpan="10" className="py-8 text-center text-sm text-gray-500">
                      No rooms found matching your search.
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
                Showing <span className="font-semibold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-700">{Math.min(currentPage * itemsPerPage, filteredRooms.length)}</span> of <span className="font-semibold text-gray-700">{filteredRooms.length}</span>
              </span>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronLeft fontSize="small" />
                </button>
                
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
      )}
    </div>
  );
}