import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search, Refresh, 
  TableChart, PictureAsPdf, Close,
  PersonOutlined, Hotel, CalendarToday,
  EditOutlined, DeleteOutlined, SubjectOutlined, LocalOfferOutlined, FlagOutlined, NotesOutlined, MeetingRoomOutlined, Person,
  AddCircleOutlined, ConfirmationNumberOutlined
} from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import CustomPagination from '../../../components/CustomPagination';
import complaintService from '../../../services/complaintService';
import guestService from '../../../services/guestService';
import roomService from '../../../services/roomService';
import {
  toFrontendComplaint,
  toFrontendComplaintList,
  toBackendComplaintPayload
} from '../adapters/complaintAdapter';

const priorityStyles = {
  Low: 'bg-[#cffafe] text-[#06b6d4]',
  Medium: 'bg-[#ffedd5] text-[#f97316]',
  High: 'bg-[#fce7f3] text-[#ec4899]',
  Critical: 'bg-[#fee2e2] text-[#ef4444]',
  Urgent: 'bg-[#fee2e2] text-[#ef4444]'
};

const statusStyles = {
  Open: 'bg-[#fce7f3] text-[#ec4899]',
  Resolved: 'bg-[#d1fae5] text-[#10b981]',
  'In Progress': 'bg-[#ffedd5] text-[#f97316]',
  Closed: 'bg-gray-100 text-gray-700'
};

export default function GuestComplaint() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available guests & rooms for canonical ID resolution
  const [availableGuests, setAvailableGuests] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);

  const filterMenuRef = useRef(null);

  // Form state
  const [form, setForm] = useState({
    guestId: '',
    guestName: '',
    roomId: '',
    roomNo: '',
    date: new Date().toISOString().split('T')[0], 
    type: 'General',
    priority: 'Low',
    status: 'Open',
    description: ''
  });

  const isFormValid = Boolean(form.guestName.trim() && form.roomNo.trim() && form.description.trim() && form.date);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await complaintService.getComplaints();
      const rawList = Array.isArray(res?.data)
        ? res.data
        : (Array.isArray(res) ? res : (res?.data?.complaints || []));
      const adapted = toFrontendComplaintList(rawList);
      setComplaints(adapted);
    } catch (err) {
      setError(err?.message || 'Failed to load guest complaints from server.');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  useEffect(() => {
    let isMounted = true;
    guestService.getGuests()
      .then(res => {
        if (!isMounted) return;
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.guests || []);
        if (list.length > 0) setAvailableGuests(list);
      })
      .catch(() => {});

    roomService.getRooms()
      .then(res => {
        if (!isMounted) return;
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.rooms || []);
        if (list.length > 0) setAvailableRooms(list);
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowColumnsMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openViewModal = (complaint) => {
    setViewingComplaint(complaint);
    setIsViewModalOpen(true);
  };

  const openNewModal = () => {
    setEditingId(null);
    setModalError(null);
    setForm({
      guestId: '',
      guestName: '',
      roomId: '',
      roomNo: '',
      date: new Date().toISOString().split('T')[0],
      type: 'General',
      priority: 'Low',
      status: 'Open',
      description: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (complaint) => {
    setEditingId(complaint.id || complaint._id);
    setModalError(null);
    let formattedDate = complaint.date || new Date().toISOString().split('T')[0];
    if (formattedDate && formattedDate.includes('/')) {
      const [m, d, y] = formattedDate.split('/');
      formattedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    } else if (formattedDate && formattedDate.includes('T')) {
      formattedDate = formattedDate.split('T')[0];
    }
    
    setForm({
      guestId: complaint.guestId || complaint.guest_id || '',
      guestName: complaint.guestName || '',
      roomId: complaint.roomId || complaint.room_id || '',
      roomNo: complaint.roomNo === '—' ? '' : (complaint.roomNo || ''),
      date: formattedDate,
      type: complaint.type || complaint.category || 'General',
      priority: complaint.priority || complaint.severity || 'Low',
      status: complaint.status || 'Open',
      description: complaint.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    setModalError(null);

    try {
      if (editingId) {
        // Resolve room ID if valid ObjectId
        let resolvedRoomId = form.roomId;
        if (!resolvedRoomId || !/^[0-9a-fA-F]{24}$/.test(String(resolvedRoomId))) {
          const matchRoom = availableRooms.find(r => 
            String(r.room_number || r.roomNo || r.number).trim() === form.roomNo.trim() || r._id === form.roomNo.trim()
          );
          if (matchRoom && /^[0-9a-fA-F]{24}$/.test(String(matchRoom._id))) {
            resolvedRoomId = matchRoom._id;
          } else {
            resolvedRoomId = null;
          }
        }

        const updatePayload = toBackendComplaintPayload({
          roomId: resolvedRoomId,
          type: form.type,
          priority: form.priority,
          status: form.status,
          description: form.description
        }, { isUpdate: true });

        await complaintService.updateComplaint(editingId, updatePayload);
        setIsModalOpen(false);
        await fetchComplaints();
      } else {
        // Resolve guest ID (Required)
        let resolvedGuestId = form.guestId;
        if (!resolvedGuestId || !/^[0-9a-fA-F]{24}$/.test(String(resolvedGuestId))) {
          const matchGuest = availableGuests.find(g => {
            const gName = (g.name || `${g.first_name || ''} ${g.last_name || ''}`).trim().toLowerCase();
            return gName === form.guestName.trim().toLowerCase() || g._id === form.guestName.trim();
          });
          if (matchGuest) {
            resolvedGuestId = matchGuest._id || matchGuest.id;
          }
        }

        if (!resolvedGuestId || !/^[0-9a-fA-F]{24}$/.test(String(resolvedGuestId))) {
          setModalError('Please select a valid registered guest from the system.');
          setIsSubmitting(false);
          return;
        }

        // Resolve room ID (Optional)
        let resolvedRoomId = form.roomId;
        if (!resolvedRoomId || !/^[0-9a-fA-F]{24}$/.test(String(resolvedRoomId))) {
          const matchRoom = availableRooms.find(r => 
            String(r.room_number || r.roomNo || r.number).trim() === form.roomNo.trim() || r._id === form.roomNo.trim()
          );
          if (matchRoom && /^[0-9a-fA-F]{24}$/.test(String(matchRoom._id))) {
            resolvedRoomId = matchRoom._id;
          } else {
            resolvedRoomId = null;
          }
        }

        const createPayload = toBackendComplaintPayload({
          guestId: resolvedGuestId,
          roomId: resolvedRoomId,
          type: form.type,
          priority: form.priority,
          status: form.status,
          description: form.description
        });

        await complaintService.createComplaint(createPayload);
        setIsModalOpen(false);
        await fetchComplaints();
      }
    } catch (err) {
      setModalError(err?.message || 'Failed to save complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (complaint) => {
    setDeleteError(null);
    setComplaintToDelete(complaint);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!complaintToDelete || isSubmitting) return;
    setIsSubmitting(true);
    setDeleteError(null);
    try {
      await complaintService.deleteComplaint(complaintToDelete.id || complaintToDelete._id);
      setIsDeleteModalOpen(false);
      setComplaintToDelete(null);
      await fetchComplaints();
    } catch (err) {
      if (err?.status === 403 || err?.statusCode === 403) {
        setDeleteError('Permission denied: You do not have permission to delete complaints.');
      } else {
        setDeleteError(err?.message || 'Failed to delete complaint.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = () => {
    setSearch('');
    setPage(1);
    fetchComplaints();
  };

  const filteredComplaints = complaints.filter(c => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (c.guestName && c.guestName.toLowerCase().includes(q)) || 
      (c.roomNo && c.roomNo.toLowerCase().includes(q)) ||
      (c.type && c.type.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      (c.complaint_ref && c.complaint_ref.toLowerCase().includes(q))
    );
  });

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
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  const paginatedComplaints = filteredComplaints.slice((page - 1) * 10, page * 10);
  const totalPages = Math.ceil(filteredComplaints.length / 10);

  return (
    <div className="w-full animate-fade-in pb-3 relative">
      
      {/* Error Alert Banner */}
      {error && (
        <div role="alert" className="mb-3 rounded border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchComplaints}
            className="px-2.5 py-1 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition-colors cursor-pointer text-[11px]"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-[6px] shadow-sm border border-gray-100 overflow-hidden relative">
        
        {/* Header Options */}
        <div className="flex flex-col md:flex-row items-center justify-between px-3 py-2 border-b border-gray-100 gap-2">
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <h2 className="text-gray-800 font-bold text-sm whitespace-nowrap">Guest Complaint Management</h2>
            <div className="relative w-full md:w-60 flex-1">
              <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-3 pr-8 py-1 border border-gray-300 rounded-[6px] text-xs text-gray-700 focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)] h-[28px]"
              />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" sx={{ fontSize: 16 }} />
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 relative">
            <button onClick={openNewModal} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-green-50 transition-colors cursor-pointer" title="Add Complaint">
              <AddCircleOutlined sx={{ fontSize: 18 }} className="text-[#1b7f43]" />
            </button>
            <button onClick={handleRefresh} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Refresh">
              <Refresh sx={{ fontSize: 18 }} className="text-[var(--primary-main)]" />
            </button>
            <button onClick={handleExportCSV} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Export CSV">
              <TableChart sx={{ fontSize: 16 }} className="text-[#0ea5e9]" />
            </button>
            <button onClick={handleExportPDF} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer" title="Export PDF">
              <PictureAsPdf sx={{ fontSize: 16 }} className="text-[#ef4444]" />
            </button>
          </div>
        </div>
        
        {/* Table */}
        <div className="w-full overflow-hidden">
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col className="w-[10%]" />
              <col className="w-[14%]" />
              <col className="w-[8%]" />
              <col className="w-[13%]" />
              <col className="w-[30%]" />
              <col className="w-[8%]" />
              <col className="w-[9%]" />
              <col className="w-[8%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/50">
                {visibleColumns['Date'] && <th className="py-2 px-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider select-none truncate">Date</th>}
                {visibleColumns['Guest Name'] && <th className="py-2 px-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider select-none truncate">Guest Name</th>}
                {visibleColumns['Room No'] && <th className="py-2 px-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider select-none truncate">Room No</th>}
                {visibleColumns['Complaint Type'] && <th className="py-2 px-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider select-none truncate">Type</th>}
                {visibleColumns['Description'] && <th className="py-2 px-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider select-none truncate">Description</th>}
                {visibleColumns['Priority'] && <th className="py-2 px-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider select-none truncate">Priority</th>}
                {visibleColumns['Status'] && <th className="py-2 px-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider select-none truncate">Status</th>}
                {visibleColumns['Actions'] && <th className="py-2 px-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider select-none text-center whitespace-nowrap">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="py-12 text-center text-gray-500 text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[var(--primary-main)] border-t-transparent rounded-full animate-spin" />
                      <span>Loading guest complaints...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="py-8 text-center text-red-600 text-xs">
                    Unable to load complaints. {error}
                  </td>
                </tr>
              ) : paginatedComplaints.length === 0 ? (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="py-8 text-center text-gray-400 text-xs">
                    No complaints found.
                  </td>
                </tr>
              ) : (
                paginatedComplaints.map(complaint => (
                  <tr key={complaint.id || complaint._id} onClick={() => openViewModal(complaint)} className="hover:bg-slate-50/70 transition-colors cursor-pointer">
                    {visibleColumns['Date'] && (
                      <td className="py-1.5 px-1.5 text-[10.5px] text-[#475569] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1 whitespace-nowrap">
                          <CalendarToday sx={{ fontSize: 11 }} className="text-gray-400 shrink-0" />
                          <span className="truncate">{complaint.date}</span>
                        </div>
                      </td>
                    )}
                    {visibleColumns['Guest Name'] && (
                      <td className="py-1.5 px-1.5 text-[11px] text-gray-800 font-semibold">
                        <Tooltip title={complaint.guestName} arrow placement="top">
                          <span className="truncate block cursor-default">
                            {complaint.guestName}
                          </span>
                        </Tooltip>
                      </td>
                    )}
                    {visibleColumns['Room No'] && (
                      <td className="py-1.5 px-1.5 text-[10.5px] text-gray-700 font-mono whitespace-nowrap">
                        <span className="inline-block px-1 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-800 border border-gray-200/60 font-mono whitespace-nowrap">
                          {complaint.roomNo}
                        </span>
                      </td>
                    )}
                    {visibleColumns['Complaint Type'] && (
                      <td className="py-1.5 px-1.5 text-[10.5px] text-gray-600">
                        <Tooltip title={complaint.type} arrow placement="top">
                          <span className="truncate block cursor-default">
                            {complaint.type}
                          </span>
                        </Tooltip>
                      </td>
                    )}
                    {visibleColumns['Description'] && (
                      <td className="py-1.5 px-1.5 text-[11px] text-gray-600">
                        <Tooltip title={complaint.description} arrow placement="top">
                          <span className="truncate block cursor-default">
                            {complaint.description}
                          </span>
                        </Tooltip>
                      </td>
                    )}
                    {visibleColumns['Priority'] && (
                      <td className="py-1.5 px-1.5 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold whitespace-nowrap inline-block ${priorityStyles[complaint.priority] || 'bg-gray-100 text-gray-700'}`}>
                          {complaint.priority}
                        </span>
                      </td>
                    )}
                    {visibleColumns['Status'] && (
                      <td className="py-1.5 px-1.5 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold whitespace-nowrap inline-block ${statusStyles[complaint.status] || 'bg-gray-100 text-gray-700'}`}>
                          {complaint.status}
                        </span>
                      </td>
                    )}
                    {visibleColumns['Actions'] && (
                      <td className="py-1.5 px-1 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={(e) => { e.stopPropagation(); openEditModal(complaint); }} className="w-5.5 h-5.5 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer group" title="Edit Complaint">
                            <EditOutlined className="text-[var(--primary-main)]" sx={{ fontSize: 15 }} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); confirmDelete(complaint); }} className="w-5.5 h-5.5 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer group" title="Delete Complaint">
                            <DeleteOutlined className="text-[#f97316] group-hover:text-orange-600" sx={{ fontSize: 15 }} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <CustomPagination
            count={totalPages}
            page={page}
            onChange={(e, p) => setPage(p)}
          />
        )}
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
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-white/80 text-[13px]">{viewingComplaint.status}</span>
                    {viewingComplaint.complaint_ref && (
                      <span className="text-white/90 text-[11px] bg-white/20 px-2 py-0.5 rounded font-mono">
                        {viewingComplaint.complaint_ref}
                      </span>
                    )}
                  </div>
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
                
                {/* Complaint Ref if available */}
                {viewingComplaint.complaint_ref && (
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                    <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                      <ConfirmationNumberOutlined sx={{ fontSize: 20 }} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Complaint Reference</span>
                      <span className="text-[14px] font-bold text-gray-800 font-mono">{viewingComplaint.complaint_ref}</span>
                    </div>
                  </div>
                )}

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
                    <span className={`px-2 py-0.5 rounded-[4px] text-[12px] font-bold mt-0.5 ${priorityStyles[viewingComplaint.priority] || 'bg-gray-100 text-gray-700'}`}>
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
                    <span className={`px-2 py-0.5 rounded-[4px] text-[12px] font-bold mt-0.5 ${statusStyles[viewingComplaint.status] || 'bg-gray-100 text-gray-700'}`}>
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

      {/* New / Edit Complaint Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => !isSubmitting && setIsModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[750px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between">
              <h2 className="text-white text-[17px] font-bold">{editingId ? (form.guestName ? `Edit Complaint — ${form.guestName}` : 'Edit Complaint') : 'New Complaint'}</h2>
              <button disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50">
                <Close sx={{ fontSize: 18 }} />
              </button>
            </div>

            {modalError && (
              <div role="alert" className="mx-6 mt-4 p-2.5 rounded bg-red-50 border border-red-200 text-xs text-red-700">
                {modalError}
              </div>
            )}
            
            <div className="p-6 space-y-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Guest Name */}
                <div className="relative">
                  <label htmlFor="complaint-guest-name" className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Guest Name*</label>
                  <input 
                    id="complaint-guest-name"
                    type="text" 
                    list="guest-names-list"
                    value={form.guestName}
                    disabled={Boolean(editingId) || isSubmitting}
                    onChange={(e) => {
                      const val = e.target.value;
                      const matched = availableGuests.find(g => {
                        const gName = (g.name || `${g.first_name || ''} ${g.last_name || ''}`).trim();
                        return gName.toLowerCase() === val.toLowerCase() || g._id === val || g.id === val;
                      });
                      setForm({
                        ...form,
                        guestName: val,
                        guestId: matched ? (matched._id || matched.id) : (form.guestId && form.guestName === val ? form.guestId : '')
                      });
                    }}
                    placeholder="Search or select guest..."
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md text-[14px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all disabled:bg-gray-100 disabled:cursor-not-allowed" 
                  />
                  <datalist id="guest-names-list">
                    {availableGuests.map(g => {
                      const name = (g.name || `${g.first_name || ''} ${g.last_name || ''}`).trim();
                      return <option key={g._id || g.id} value={name}>{name} {g.guest_ref ? `(${g.guest_ref})` : ''}</option>;
                    })}
                  </datalist>
                  <PersonOutlined className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700" sx={{ fontSize: 20 }} />
                </div>

                {/* Room No */}
                <div className="relative">
                  <label htmlFor="complaint-room-no" className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Room No*</label>
                  <input 
                    id="complaint-room-no"
                    type="text" 
                    list="room-numbers-list"
                    value={form.roomNo}
                    disabled={isSubmitting}
                    onChange={(e) => {
                      const val = e.target.value;
                      const matched = availableRooms.find(r => 
                        String(r.room_number || r.roomNo || r.number).trim() === val.trim() || r._id === val
                      );
                      setForm({
                        ...form,
                        roomNo: val,
                        roomId: matched ? (matched._id || matched.id) : ''
                      });
                    }}
                    placeholder="Enter or select room..."
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md text-[14px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all disabled:bg-gray-100 disabled:cursor-not-allowed" 
                  />
                  <datalist id="room-numbers-list">
                    {availableRooms.map(r => {
                      const rNo = String(r.room_number || r.roomNo || r.number || '');
                      return <option key={r._id || r.id || rNo} value={rNo}>{rNo} {r.roomType ? `(${r.roomType})` : ''}</option>;
                    })}
                  </datalist>
                  <Hotel className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700" sx={{ fontSize: 20 }} />
                </div>

                {/* Date */}
                <div className="relative">
                  <label htmlFor="complaint-date" className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Date*</label>
                  <input 
                    id="complaint-date"
                    type="date" 
                    value={form.date}
                    disabled={isSubmitting}
                    onChange={(e) => setForm({...form, date: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-[14px] focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all text-gray-700 disabled:bg-gray-100" 
                  />
                </div>

                {/* Complaint Type */}
                <div className="relative">
                  <label htmlFor="complaint-type" className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Complaint Type*</label>
                  <select 
                    id="complaint-type"
                    value={form.type}
                    disabled={isSubmitting}
                    onChange={(e) => setForm({...form, type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-[14px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all appearance-none bg-transparent disabled:bg-gray-100"
                  >
                    <option>General</option>
                    <option>Plumbing</option>
                    <option>Electrical</option>
                    <option>Housekeeping</option>
                    <option>Noise</option>
                    <option>Air Conditioning</option>
                    <option>Room Service</option>
                    <option>Amenities Request</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>

                {/* Priority */}
                <div className="relative">
                  <label htmlFor="complaint-priority" className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Priority*</label>
                  <select 
                    id="complaint-priority"
                    value={form.priority}
                    disabled={isSubmitting}
                    onChange={(e) => setForm({...form, priority: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-[14px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all appearance-none bg-transparent disabled:bg-gray-100"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>

                {/* Status */}
                <div className="relative">
                  <label htmlFor="complaint-status" className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Status*</label>
                  <select 
                    id="complaint-status"
                    value={form.status}
                    disabled={isSubmitting}
                    onChange={(e) => setForm({...form, status: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-[14px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all appearance-none bg-transparent disabled:bg-gray-100"
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
                <label htmlFor="complaint-description" className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Description*</label>
                <textarea 
                  id="complaint-description"
                  rows="3" 
                  value={form.description}
                  disabled={isSubmitting}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-[14px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all resize-y disabled:bg-gray-100"
                ></textarea>
              </div>
            </div>

            <div className="px-6 py-4 flex gap-3">
              <button 
                onClick={handleSave}
                disabled={!isFormValid || isSubmitting}
                className="px-6 py-2 rounded-full text-[13.5px] font-bold shadow-sm transition-colors cursor-pointer border"
                style={isFormValid && !isSubmitting ? { backgroundColor: '#ffffff', color: '#1b7f43', borderColor: '#e2e8f0' } : { backgroundColor: '#e2e8f0', color: '#94a3b8', borderColor: 'transparent', cursor: 'not-allowed' }}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
              <button disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-full border border-transparent bg-[#fce7f3] text-[#e11d48] font-bold text-[13.5px] hover:bg-[#fbcfe8] transition-colors cursor-pointer shadow-sm disabled:opacity-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && complaintToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => !isSubmitting && setIsDeleteModalOpen(false)}>
          <div className="bg-[#fcf8fa] rounded-xl shadow-2xl w-[320px] p-6 text-center animate-scale-in border border-gray-100" onClick={e => e.stopPropagation()}>
            <h2 className="text-[22px] font-medium text-gray-800 mb-6 text-left">Are you sure?</h2>
            
            <div className="text-left space-y-3 mb-6 text-[14px] text-gray-700">
              <p>
                Guest: <span className="text-gray-600 font-medium">{complaintToDelete.guestName}</span>
              </p>
              <p>
                Room: <span className="text-gray-600 font-medium">{complaintToDelete.roomNo}</span>
              </p>
              <p>
                Type: <span className="text-gray-600 font-medium">{complaintToDelete.type}</span>
              </p>
            </div>

            {deleteError && (
              <div role="alert" className="mb-6 p-2 rounded bg-red-100 border border-red-200 text-xs text-red-700 text-left">
                {deleteError}
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button
                disabled={isSubmitting}
                onClick={handleDelete}
                className="px-5 py-2 rounded-full bg-[#c23e3e] hover:bg-red-700 text-white font-bold text-[14px] transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2 rounded-full bg-[#0a6c32] hover:bg-green-800 text-white font-bold text-[14px] transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
