import React, { useState } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import Search from '@mui/icons-material/Search';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import EditOutlined from '@mui/icons-material/EditOutlined';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import FileDownload from '@mui/icons-material/FileDownload';

export default function Guests() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('Daily');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isCustomPopupOpen, setIsCustomPopupOpen] = useState(false);
  
  const allGuests = [
    { id: 'GST64188...', name: 'John Smith', email: 'john.smith@...', phone: '+1234567890', city: 'New York', totalStays: 15, status: 'Active', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 'GST6419F...', name: 'Sarah Joh...', email: 'sarah.johnso...', phone: '+1234567893', city: 'London', totalStays: 28, status: 'Active', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 'GST64198...', name: 'Carlos Ro...', email: 'carlos.rodrig...', phone: '+1234567895', city: 'Madrid', totalStays: 8, status: 'Active', avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: 'GST6419...', name: 'Emma Da...', email: 'emma.davis...', phone: '+1234567897', city: 'Toronto', totalStays: 5, status: 'Active', avatar: 'https://i.pravatar.cc/150?u=4' },
    { id: 'GST6419...', name: 'Michael Br...', email: 'michael.bro...', phone: '+1234567899', city: 'Sydney', totalStays: 12, status: 'Active', avatar: 'https://i.pravatar.cc/150?u=5' },
    { id: 'GST64198...', name: 'Sophia Mil...', email: 'sophia.miller...', phone: '+1234567901', city: 'Berlin', totalStays: 22, status: 'Active', avatar: 'https://i.pravatar.cc/150?u=6' },
    { id: 'GST6419...', name: 'Liam Willi...', email: 'liam.william...', phone: '+1234567903', city: 'Dublin', totalStays: 40, status: 'Active', avatar: 'https://i.pravatar.cc/150?u=7' },
    { id: 'GST6419...', name: 'Ava Marti...', email: 'ava.martinez...', phone: '+1234567905', city: 'Mexico City', totalStays: 18, status: 'Active', avatar: 'https://i.pravatar.cc/150?u=8' },
    { id: 'GST6419...', name: 'David Tayl...', email: 'david.taylor...', phone: '+1234567907', city: 'Cape Town', totalStays: 10, status: 'Active', avatar: 'https://i.pravatar.cc/150?u=9' },
  ];

  return (
    <div className="animate-fade-in pb-8 space-y-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pt-2">
        <h1 className="text-xl font-extrabold text-gray-900 mb-1">All Guests</h1>
        <div className="flex items-center text-sm font-medium text-gray-500 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
          <HomeIcon sx={{ fontSize: 16 }} className="text-[#1b7f43] mr-2" />
          <span className="text-gray-400 mx-1">•</span>
          <span>Guests</span>
          <span className="text-gray-400 mx-1">•</span>
          <span className="text-gray-800">All Guests</span>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col w-full overflow-hidden">
        {/* Card Header */}
        <div className="p-4 border-b border-gray-100 flex flex-row items-center justify-between space-x-2">
          <h3 className="text-gray-800 font-bold text-[14px] lg:text-[15px] whitespace-nowrap">
            Guest Management
          </h3>
          
          <div className="flex flex-row items-center space-x-3">
            {/* Search Bar */}
            <div className="relative w-40 xl:w-64">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" sx={{ fontSize: 18 }} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow bg-gray-50/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                          setIsCustomPopupOpen(true);
                        }
                      } else {
                        setDateFilter(tab);
                        setIsCustomPopupOpen(false);
                      }
                    }}
                    className={`px-3 py-2 text-[13px] font-semibold transition-colors border-r border-gray-200 last:border-r-0 ${
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
                  <p className="text-[13px] font-bold text-gray-700">Custom Date Range</p>
                  <div className="flex flex-col gap-1.5">
                    <input 
                      type="date" 
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[13px] font-medium text-gray-600 focus:outline-none focus:border-[#1b7f43]"
                      value={customStartDate}
                      onChange={e => {
                        const val = e.target.value;
                        setCustomStartDate(val);
                        if (val && customEndDate) {
                          setTimeout(() => setIsCustomPopupOpen(false), 150);
                        }
                      }}
                    />
                    <span className="text-gray-400 text-[11px] font-bold text-center">TO</span>
                    <input 
                      type="date" 
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[13px] font-medium text-gray-600 focus:outline-none focus:border-[#1b7f43]"
                      value={customEndDate}
                      onChange={e => {
                        const val = e.target.value;
                        setCustomEndDate(val);
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
            <button className="flex items-center space-x-1 bg-[#1b7f43] hover:brightness-110 text-white px-3 py-2 rounded-lg text-[13px] font-bold shadow-sm transition-all shrink-0">
              <FileDownload sx={{ fontSize: 18 }} className="text-white" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="inline sm:hidden">CSV</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto hide-scrollbar w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="py-4 px-4 w-12 text-center">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#1b7f43] focus:ring-[#1b7f43]" />
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-gray-700">Guest ID</th>
                <th className="py-4 px-4 text-[13px] font-bold text-gray-700">Full Name</th>
                <th className="py-4 px-4 text-[13px] font-bold text-gray-700">Email</th>
                <th className="py-4 px-4 text-[13px] font-bold text-gray-700 flex items-center">
                  Phone <ArrowUpward sx={{ fontSize: 14 }} className="ml-1 text-gray-500" />
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-gray-700">City</th>
                {/* Loyalty Tier column removed as per instruction */}
                <th className="py-4 px-4 text-[13px] font-bold text-gray-700">Total Stays</th>
                <th className="py-4 px-4 text-[13px] font-bold text-gray-700">Status</th>
                <th className="py-4 px-4 text-[13px] font-bold text-gray-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allGuests.map((guest, index) => (
                <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-center">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#1b7f43] focus:ring-[#1b7f43]" />
                  </td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 font-medium">{guest.id}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <img src={guest.avatar} alt={guest.name} className="w-8 h-8 rounded-full object-cover mr-3 bg-gray-200" />
                      <span className="text-[13px] font-bold text-gray-800">{guest.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center text-[13px] text-gray-600 font-medium">
                      <EmailOutlined className="text-red-500 mr-2" sx={{ fontSize: 16 }} />
                      {guest.email}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center text-[13px] text-gray-600 font-medium">
                      <PhoneOutlined className="text-green-500 mr-2" sx={{ fontSize: 16 }} />
                      {guest.phone}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 font-medium">{guest.city}</td>
                  {/* Loyalty Tier row data removed */}
                  <td className="py-3 px-4 text-[13px] text-gray-600 font-medium">{guest.totalStays}</td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 text-[11px] font-bold rounded-md bg-[#e5f4eb] text-[#1b7f43]">
                      {guest.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button className="text-blue-500 hover:text-blue-700 transition-colors p-1.5 rounded-lg hover:bg-blue-50 border border-blue-100">
                      <EditOutlined fontSize="small" sx={{ fontSize: 16 }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-end space-x-6 text-gray-500 text-[13px]">
          <div className="flex items-center">
            <span className="mr-2 font-medium">Items per page:</span>
            <select className="border border-gray-200 rounded px-2 py-1 outline-none font-medium text-gray-700 bg-white">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
          </div>
          <span className="font-medium">1 - 9 of 9</span>
          <div className="flex items-center space-x-2">
            <button className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50">
              <ChevronLeft fontSize="small" />
            </button>
            <button className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50">
              <ChevronRight fontSize="small" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
