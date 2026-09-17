import React, { useState, useRef, useEffect } from 'react';
import {
  Search, FilterList, AddCircleOutlined, Refresh, 
  TableChart, PictureAsPdf, Close,
  PersonOutlined, Hotel, CalendarToday,
  EditOutlined, DeleteOutlined, SubjectOutlined, LocalOfferOutlined, FlagOutlined, NotesOutlined, MeetingRoomOutlined, Person
} from '@mui/icons-material';
import React, { useState } from 'react';
import ReportProblem from '@mui/icons-material/ReportProblem';
import CheckCircle from '@mui/icons-material/CheckCircle';
import PendingActions from '@mui/icons-material/PendingActions';
import Search from '@mui/icons-material/Search';
import FileDownload from '@mui/icons-material/FileDownload';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import Add from '@mui/icons-material/Add';
import SentimentVeryDissatisfied from '@mui/icons-material/SentimentVeryDissatisfied';
import Room from '@mui/icons-material/Room';
import Person from '@mui/icons-material/Person';
import Phone from '@mui/icons-material/Phone';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import AccessTime from '@mui/icons-material/AccessTime';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';

const initialComplaints = [
  { id: 1, date: '05/20/2024', guestName: 'John Doe', roomNo: '101', type: 'Plumbing', description: 'Leaking tap ...', priority: 'Medium', status: 'Open' },
  { id: 2, date: '05/19/2024', guestName: 'Jane Smith', roomNo: '205', type: 'Housekeeping', description: 'Towels not r...', priority: 'Low', status: 'Resolved' },
  { id: 3, date: '05/18/2024', guestName: 'Robert Brown', roomNo: '302', type: 'Electrical', description: 'Waitlight not...', priority: 'High', status: 'In Progress' },
  { id: 4, date: '05/21/2024', guestName: 'Emily Johns...', roomNo: '105', type: 'Noise', description: 'Loud noise f...', priority: 'Medium', status: 'Open' },
  { id: 5, date: '05/22/2024', guestName: 'Michael Wils...', roomNo: '210', type: 'Air Conditio...', description: 'AC not cooli...', priority: 'High', status: 'In Progress' },
  { id: 6, date: '05/23/2024', guestName: 'Sarah Miller', roomNo: '315', type: 'Housekeeping', description: 'Room not cl...', priority: 'Medium', status: 'Open' },
  { id: 7, date: '05/24/2024', guestName: 'David Ander...', roomNo: '118', type: 'Plumbing', description: 'Shower drai...', priority: 'High', status: 'Resolved' }
];

const priorityStyles = {
  Low: 'bg-[#cffafe] text-[#06b6d4]',
  Medium: 'bg-[#ffedd5] text-[#f97316]',
  High: 'bg-[#fce7f3] text-[#ec4899]'
};

const statusStyles = {
  Open: 'bg-[#fce7f3] text-[#ec4899]',
  Resolved: 'bg-[#d1fae5] text-[#10b981]',
  'In Progress': 'bg-[#ffedd5] text-[#f97316]'
};

export default function GuestComplaint() {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [search, setSearch] = useState('');
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    Date: true,
    'Guest Name': true,
    'Room No': true,
    'Complaint Type': true,
    Description: true,
    Priority: true,
    Status: true,
    Actions: true
  });
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingComplaint, setViewingComplaint] = useState(null);

  const openViewModal = (complaint) => {
    setViewingComplaint(complaint);
    setIsViewModalOpen(true);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const filterMenuRef = useRef(null);

  // Form state
  const [form, setForm] = useState({
    guestName: '', roomNo: '', date: new Date().toISOString().split('T')[0], 
    type: 'General', priority: 'Low', status: 'Open', description: ''
  });

  const isFormValid = form.guestName.trim() && form.roomNo.trim() && form.description.trim() && form.date;

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowColumnsMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleColumn = (col) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const openNewModal = () => {
    setEditingId(null);
    setForm({ guestName: '', roomNo: '', date: new Date().toISOString().split('T')[0], type: 'General', priority: 'Low', status: 'Open', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (complaint) => {
    setEditingId(complaint.id);
    // Convert MM/DD/YYYY to YYYY-MM-DD for date input
    const [m, d, y] = complaint.date.split('/');
    const formattedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    
    setForm({
      guestName: complaint.guestName,
      roomNo: complaint.roomNo,
      date: formattedDate,
      type: complaint.type,
      priority: complaint.priority,
      status: complaint.status,
      description: complaint.description
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!isFormValid) return;
    
    const [y, m, d] = form.date.split('-');
    const formattedDate = `${m.padStart(2, '0')}/${d.padStart(2, '0')}/${y}`;
    
    if (editingId) {
      setComplaints(complaints.map(c => 
        c.id === editingId ? {
          ...c,
          date: formattedDate,
          guestName: form.guestName,
          roomNo: form.roomNo,
          type: form.type,
          priority: form.priority,
          status: form.status,
          description: form.description
        } : c
      ));
    } else {
      const newId = complaints.length ? Math.max(...complaints.map(c => c.id)) + 1 : 1;
      setComplaints([
        {
          id: newId,
          date: formattedDate,
          guestName: form.guestName,
          roomNo: form.roomNo,
          type: form.type,
          priority: form.priority,
          status: form.status,
          description: form.description
        },
        ...complaints
      ]);
    }
    setIsModalOpen(false);
  };

  const handleRefresh = () => {
    setSearch('');
    setComplaints(initialComplaints);
    setVisibleColumns({
      Date: true, 'Guest Name': true, 'Room No': true,
      'Complaint Type': true, Description: true,
      Priority: true, Status: true, Actions: true
    });
  };

  const handleExportCSV = () => {
    const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !== 'Actions');
    let csvContent = activeCols.join(',') + '\n';
    
    filteredComplaints.forEach(c => {
      const row = activeCols.map(col => {
        let val = '';
        if (col === 'Date') val = c.date;
        else if (col === 'Guest Name') val = c.guestName;
        else if (col === 'Room No') val = c.roomNo;
        else if (col === 'Complaint Type') val = c.type;
        else if (col === 'Description') val = c.description;
        else if (col === 'Priority') val = c.priority;
        else if (col === 'Status') val = c.status;
        return `"${(val || '').toString().replace(/"/g, '""')}"`;
      });
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'guest_complaints.csv';
    link.click();
  };

  const handleExportPDF = () => {
    const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !== 'Actions');
    let html = `
      <html>
        <head>
          <title>Guest Complaints Report</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; }
            th { background-color: #f8fafc; font-weight: 600; color: #1e293b; }
            h2 { color: #0f172a; margin-bottom: 5px; }
            .meta { color: #64748b; font-size: 13px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h2>Guest Complaints Report</h2>
          <div class="meta">Generated on: ${new Date().toLocaleDateString()}</div>
          <table>
            <thead>
              <tr>${activeCols.map(c => `<th>${c}</th>`).join('')}</tr>
            </thead>
            <tbody>
    `;
    
    filteredComplaints.forEach(c => {
      html += '<tr>';
      activeCols.forEach(col => {
        let val = '';
        if (col === 'Date') val = c.date;
        else if (col === 'Guest Name') val = c.guestName;
        else if (col === 'Room No') val = c.roomNo;
        else if (col === 'Complaint Type') val = c.type;
        else if (col === 'Description') val = c.description;
        else if (col === 'Priority') val = c.priority;
        else if (col === 'Status') val = c.status;
        html += `<td>${val}</td>`;
      });
      html += '</tr>';
    });
    
    html += `
            </tbody>
          </table>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const filteredComplaints = complaints.filter(c => 
    c.guestName.toLowerCase().includes(search.toLowerCase()) || 
    c.roomNo.toLowerCase().includes(search.toLowerCase()) ||
    c.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 w-full max-w-[1400px] mx-auto animate-fade-in relative min-h-screen">
      
      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible relative">
        
        {/* Header Options */}
        <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b border-gray-100 gap-4 overflow-visible">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <h2 className="text-gray-600 font-semibold text-[17px] whitespace-nowrap">Guest Complaint Management</h2>
            <div className="relative w-full md:w-64 flex-1">
              <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-400 rounded-md text-[13px] text-gray-700 focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer" sx={{ fontSize: 20 }} />
            </div>
          </div>
          
          <div className="flex items-center gap-2 relative">
            <div className="relative" ref={filterMenuRef}>
              <button 
                onClick={() => setShowColumnsMenu(!showColumnsMenu)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
                title="Show/Hide Column"
              >
                <FilterList className="text-[var(--primary-main)]" sx={{ fontSize: 20 }} />
              </button>
              
              {showColumnsMenu && (
                <div className="absolute right-0 top-12 mt-1 w-52 bg-[#f8f9fa] shadow-xl border border-gray-200 rounded z-50 overflow-hidden flex flex-col max-h-80">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <span className="text-[13px] font-bold text-gray-800">Show/Hide Column</span>
                  </div>
                  <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
                    {Object.keys(visibleColumns).map(col => (
                      <label key={col} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer">
                        <div className={`w-4 h-4 rounded-sm flex items-center justify-center border ${visibleColumns[col] ? 'bg-[#1b7f43] border-[#1b7f43]' : 'bg-white border-gray-300'}`}>
                          {visibleColumns[col] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className="text-[14px] text-gray-700">{col}</span>
                        <input type="checkbox" checked={visibleColumns[col]} onChange={() => toggleColumn(col)} className="hidden" />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button onClick={openNewModal} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-green-50 transition-colors cursor-pointer">
              <AddCircleOutlined sx={{ fontSize: 24 }} className="text-[#1b7f43]" />
            </button>
            <button onClick={handleRefresh} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Refresh">
              <Refresh sx={{ fontSize: 24 }} className="text-[var(--primary-main)]" />
            </button>
            <button onClick={handleExportCSV} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Export CSV">
              <TableChart sx={{ fontSize: 22 }} className="text-[#0ea5e9]" />
            </button>
            <button onClick={handleExportPDF} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer" title="Export PDF">
              <PictureAsPdf sx={{ fontSize: 22 }} className="text-[#ef4444]" />
            </button>
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto w-full pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-left whitespace-nowrap min-w-max">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                {visibleColumns['Date'] && <th className="py-5 px-6 text-[13px] font-bold text-[#1e293b]">Date</th>}
                {visibleColumns['Guest Name'] && <th className="py-5 px-6 text-[13px] font-bold text-[#1e293b]">Guest Name</th>}
                {visibleColumns['Room No'] && <th className="py-5 px-6 text-[13px] font-bold text-[#1e293b]">Room No</th>}
                {visibleColumns['Complaint Type'] && <th className="py-5 px-6 text-[13px] font-bold text-[#1e293b]">Complaint Type</th>}
                {visibleColumns['Description'] && <th className="py-5 px-6 text-[13px] font-bold text-[#1e293b]">Description</th>}
                {visibleColumns['Priority'] && <th className="py-5 px-6 text-[13px] font-bold text-[#1e293b]">Priority</th>}
                {visibleColumns['Status'] && <th className="py-5 px-6 text-[13px] font-bold text-[#1e293b]">Status</th>}
                {visibleColumns['Actions'] && <th className="py-5 px-6 text-[13px] font-bold text-[#1e293b] text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map(complaint => (
                <tr key={complaint.id} onClick={() => openViewModal(complaint)} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer">
                  {visibleColumns['Date'] && (
                    <td className="py-4 px-6 text-[13.5px] text-[#475569] font-medium flex items-center gap-2">
                      <CalendarToday sx={{ fontSize: 16 }} className="text-gray-700" />
                      {complaint.date}
                    </td>
                  )}
                  {visibleColumns['Guest Name'] && <td className="py-4 px-6 text-[13.5px] text-[#475569] font-medium">{complaint.guestName}</td>}
                  {visibleColumns['Room No'] && <td className="py-4 px-6 text-[13.5px] text-[#475569] font-medium">{complaint.roomNo}</td>}
                  {visibleColumns['Complaint Type'] && <td className="py-4 px-6 text-[13.5px] text-[#475569] font-medium">{complaint.type}</td>}
                  {visibleColumns['Description'] && <td className="py-4 px-6 text-[13.5px] text-[#475569] font-medium">{complaint.description}</td>}
                  {visibleColumns['Priority'] && (
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1.5 rounded-md text-[12px] font-bold ${priorityStyles[complaint.priority]}`}>
                        {complaint.priority}
                      </span>
                    </td>
                  )}
                  {visibleColumns['Status'] && (
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1.5 rounded-md text-[12px] font-bold ${statusStyles[complaint.status]}`}>
                        {complaint.status}
                      </span>
                    </td>
                  )}
                  {visibleColumns['Actions'] && (
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-4">
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(complaint); }} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer group">
                          <EditOutlined className="text-[var(--primary-main)] group-hover:text-[var(--primary-main)]" sx={{ fontSize: 20 }} />
                        </button>
                        <button onClick={(e) => e.stopPropagation()} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer group">
                          <DeleteOutlined className="text-[#f97316] group-hover:text-orange-600" sx={{ fontSize: 20 }} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredComplaints.length === 0 && (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="py-8 text-center text-gray-400 text-[14px]">
                    No complaints found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
            {/* View Complaint Modal */}
      {isViewModalOpen && viewingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsViewModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[800px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-[var(--primary-main)] px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-white bg-green-400 flex items-center justify-center text-white shadow-sm">
                  <Person sx={{ fontSize: 24 }} />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-white text-[20px] font-bold leading-tight">{viewingComplaint.guestName}</h2>
                  <span className="text-white/80 text-[13px]">{viewingComplaint.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setIsViewModalOpen(false); openEditModal(viewingComplaint); }} 
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Edit Complaint"
                >
                  <EditOutlined sx={{ fontSize: 16 }} />
                </button>
                <button 
                  onClick={() => setIsViewModalOpen(false)} 
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Close"
                >
                  <Close sx={{ fontSize: 18 }} />
                </button>
              </div>
            </div>
            
            {/* Body Cards */}
            <div className="p-6 bg-white max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Complaint Type */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <SubjectOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Complaint Type</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingComplaint.type}</span>
                  </div>
                </div>
                
                {/* Room No */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <MeetingRoomOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Room No</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingComplaint.roomNo}</span>
                  </div>
                </div>

                {/* Priority */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <FlagOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Priority</span>
                    <span className={`px-2 py-0.5 rounded-[4px] text-[12px] font-bold mt-0.5 ${priorityStyles[viewingComplaint.priority]}`}>
                      {viewingComplaint.priority}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <LocalOfferOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Status</span>
                    <span className={`px-2 py-0.5 rounded-[4px] text-[12px] font-bold mt-0.5 ${statusStyles[viewingComplaint.status]}`}>
                      {viewingComplaint.status}
                    </span>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <CalendarToday sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Date</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingComplaint.date}</span>
                  </div>
                </div>

                {/* Description (spans full width) */}
                <div className="col-span-1 md:col-span-2 flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0 mt-1">
                    <NotesOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Description</span>
                    <span className="text-[14px] font-medium text-gray-700 whitespace-pre-wrap">{viewingComplaint.description}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Complaint Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[750px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between">
              <h2 className="text-white text-[17px] font-bold">{editingId ? form.guestName || 'Edit Complaint' : 'New Complaint'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
                <Close sx={{ fontSize: 18 }} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Guest Name */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Guest Name*</label>
                  <input 
                    type="text" 
                    value={form.guestName}
                    onChange={(e) => setForm({...form, guestName: e.target.value})}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md text-[14px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all" 
                  />
                  <PersonOutlined className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700" sx={{ fontSize: 20 }} />
                </div>
                {/* Room No */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Room No*</label>
                  <input 
                    type="text"
                    value={form.roomNo}
                    onChange={(e) => setForm({...form, roomNo: e.target.value})}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md text-[14px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all" 
                  />
                  <Hotel className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700" sx={{ fontSize: 20 }} />
                </div>
                {/* Date */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Date*</label>
                  <input 
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({...form, date: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-[14px] focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all text-gray-700" 
                  />
                </div>
                {/* Complaint Type */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Complaint Type*</label>
                  <select 
                    value={form.type}
                    onChange={(e) => setForm({...form, type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-[14px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all appearance-none bg-transparent"
                  >
                    <option>General</option>
                    <option>Plumbing</option>
                    <option>Electrical</option>
                    <option>Housekeeping</option>
                    <option>Noise</option>
                    <option>Air Conditioning</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
                {/* Priority */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Priority*</label>
                  <select 
                    value={form.priority}
                    onChange={(e) => setForm({...form, priority: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-[14px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all appearance-none bg-transparent"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
                {/* Status */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Status*</label>
                  <select 
                    value={form.status}
                    onChange={(e) => setForm({...form, status: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-[14px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all appearance-none bg-transparent"
                  >
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
              {/* Description */}
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Description*</label>
                <textarea 
                  rows="3" 
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-[14px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all resize-y"
                ></textarea>
              </div>
            </div>

            <div className="px-6 py-4 flex gap-3">
              <button 
                onClick={handleSave}
                disabled={!isFormValid}
                className="px-6 py-2 rounded-full text-[13.5px] font-bold shadow-sm transition-colors cursor-pointer border"
                style={isFormValid ? { backgroundColor: '#ffffff', color: '#1b7f43', borderColor: '#e2e8f0' } : { backgroundColor: '#e2e8f0', color: '#94a3b8', borderColor: 'transparent', cursor: 'not-allowed' }}
              >
                Save
              </button>
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-full border border-transparent bg-[#fce7f3] text-[#e11d48] font-bold text-[13.5px] hover:bg-[#fbcfe8] transition-colors cursor-pointer shadow-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}





