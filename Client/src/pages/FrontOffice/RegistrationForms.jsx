import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Description from '@mui/icons-material/Description';
import Search from '@mui/icons-material/Search';
import FileDownload from '@mui/icons-material/FileDownload';
import Add from '@mui/icons-material/Add';
import Print from '@mui/icons-material/Print';
import Visibility from '@mui/icons-material/Visibility';

export default function RegistrationForms() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const initialForms = [
    { formNo: 'REG-2023-089', guest: 'Kamran Akmal', idType: 'CNIC', idNumber: '42101-1122334-1', room: '101', date: '10/08/2023', status: 'Signed & Verified' },
    { formNo: 'REG-2023-088', guest: 'Cara Stevens', idType: 'Passport', idNumber: 'USA-9988221', room: '102', date: '10/01/2023', status: 'Signed & Verified' },
    { formNo: 'REG-2023-087', guest: 'Airi Satou', idType: 'Passport', idNumber: 'JPN-4455112', room: '105', date: '10/02/2023', status: 'Pending Signature' },
    { formNo: 'REG-2023-086', guest: 'Mahira Khan', idType: 'CNIC', idNumber: '42201-6655443-2', room: '201', date: '10/09/2023', status: 'Signed & Verified' },
    { formNo: 'REG-2023-085', guest: 'Jens Brincker', idType: 'Passport', idNumber: 'GER-8833119', room: '302', date: '10/03/2023', status: 'Signed & Verified' },
  ];

  const [formsList, setFormsList] = useState(() => {
    try {
      const saved = localStorage.getItem('hotel_registration_forms');
      return saved ? JSON.parse(saved) : initialForms;
    } catch (e) {
      return initialForms;
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hotel_registration_forms');
      if (saved) {
        setFormsList(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error reading localStorage:', e);
    }
  }, []);

  const filteredForms = formsList.filter(form => {
    const matchesSearch = form.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          form.formNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          form.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          form.idNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' ? true :
                       activeTab === 'Verified' ? form.status.includes('Verified') :
                       form.status.includes('Pending');
    return matchesSearch && matchesTab;
  });

  return (
    <div className="animate-fade-in pb-8 space-y-4">
      {/* Spacer to replace missing header and maintain consistent gap from breadcrumbs */}
      <div className="h-2"></div>

      {/* REGISTRATION FORMS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col w-full overflow-visible">
        {/* Table Top Controls matching Dashboard table header */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-visible">
          <h3 className="text-gray-800 font-bold text-[14px] lg:text-[15px] whitespace-nowrap">
            Registration Forms List
          </h3>

          <div className="flex flex-row items-center space-x-2 ml-auto">
            {/* Search Bar matching Dashboard.jsx */}
            <div className="relative w-28 md:w-40 xl:w-52 shrink">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" sx={{ fontSize: 16 }} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow truncate"
              />
            </div>

            {/* Segmented Filter Control matching Dashboard.jsx */}
            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shrink-0">
              {['All', 'Verified', 'Pending'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 py-1.5 text-[11px] font-semibold transition-colors border-r border-gray-200 last:border-r-0 cursor-pointer ${
                    activeTab === tab 
                      ? 'bg-[#e5f4eb] text-[#1b7f43] border-[#1b7f43]/20 relative z-10 font-bold' 
                      : 'text-gray-500 hover:bg-[#e5f4eb] hover:text-[#1b7f43]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* CSV Export Button matching Dashboard.jsx */}
            <button 
              className="flex items-center space-x-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <FileDownload sx={{ fontSize: 14 }} className="text-gray-500" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="inline sm:hidden">CSV</span>
            </button>
            
            <button 
              onClick={() => navigate('/front-office/registration-forms/new')}
              className="bg-[var(--primary-main)] hover:brightness-110 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all flex items-center cursor-pointer shrink-0"
            >
              <Add sx={{ fontSize: 14 }} className="mr-1" /> New Registration
            </button>
          </div>
        </div>

        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left whitespace-nowrap min-w-max">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Form ID</th>
                <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Guest Name</th>
                <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">ID Type</th>
                <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Document No</th>
                <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Allocated Room</th>
                <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Registration Date</th>
                <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Status</th>
                <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredForms.length > 0 ? (
                filteredForms.map((form, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5 px-4 font-bold text-[12px] text-gray-800">{form.formNo}</td>
                    <td className="py-2.5 px-4 font-semibold text-[12px] text-gray-900">{form.guest}</td>
                    <td className="py-2.5 px-4 text-[12px] text-gray-600">{form.idType}</td>
                    <td className="py-2.5 px-4 text-[12px] text-gray-600">{form.idNumber}</td>
                    <td className="py-2.5 px-4 font-semibold text-[12px] text-gray-800">Room {form.room}</td>
                    <td className="py-2.5 px-4 text-[12px] text-gray-500">{form.date}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        form.status.includes('Verified') ? 'bg-[#e2f8e9] text-[#1b7f43]' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {form.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer mr-1">
                        <Print sx={{ fontSize: 16 }} />
                      </button>
                      <button className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer">
                        <Visibility sx={{ fontSize: 16 }} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500 text-[12px]">
                    No registration forms found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
