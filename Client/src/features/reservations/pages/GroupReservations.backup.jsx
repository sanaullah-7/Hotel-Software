import React, { useState, useRef, useEffect } from'react';
import { FormControl, InputLabel, Select, MenuItem, TextField } from'@mui/material';
import {
 Search, FilterList, AddCircleOutlined, Refresh,
 TableChart, PictureAsPdf, Close,
 EditOutlined, DeleteOutlined,
 CalendarTodayOutlined, PhoneOutlined, EmailOutlined,
 BusinessOutlined, PersonOutlined, MeetingRoomOutlined,
 GroupsOutlined, LocalOfferOutlined, AttachMoneyOutlined
} from'@mui/icons-material';

const initialGroups = [
 { id: 1, groupName:'Corporate Conference', contactPerson:'John Smith', email:'john.smith@company.com', phone:'1234567890', checkIn:'02/15/2024', checkOut:'02/20/2024', rooms: 15, guests: 30, status:'Confirmed', totalPrice:'15000', roomTypes:'', specialRequests:'Meeting room required, early check-in' },
 { id: 2, groupName:'Wedding Party', contactPerson:'Sarah Johnson', email:'sarah.johnson@email.com', phone:'9987654321', checkIn:'03/10/2024', checkOut:'03/12/2024', rooms: 8, guests: 20, status:'Pending', totalPrice:'8000', roomTypes:'', specialRequests:'' },
 { id: 3, groupName:'Family Reunion', contactPerson:'Robert Davis', email:'robert.davis@email.com', phone:'1122334455', checkIn:'04/05/2024', checkOut:'04/08/2024', rooms: 5, guests: 12, status:'Confirmed', totalPrice:'4500', roomTypes:'', specialRequests:'' },
 { id: 4, groupName:'Business Trip', contactPerson:'Emily Chen', email:'emily.chen@email.com', phone:'2233445566', checkIn:'02/25/2024', checkOut:'03/02/2024', rooms: 3, guests: 3, status:'Confirmed', totalPrice:'2100', roomTypes:'', specialRequests:'' },
 { id: 5, groupName:'Graduation Celebration', contactPerson:'Michael Wilson', email:'michael.wilson@email.com', phone:'3344556677', checkIn:'05/15/2024', checkOut:'05/18/2024', rooms: 6, guests: 15, status:'Pending', totalPrice:'3600', roomTypes:'', specialRequests:'' },
 { id: 6, groupName:'Anniversary Trip', contactPerson:'Jennifer Brown', email:'jennifer.brown@email.com', phone:'4455667788', checkIn:'06/10/2024', checkOut:'06/15/2024', rooms: 2, guests: 2, status:'Confirmed', totalPrice:'3200', roomTypes:'', specialRequests:'' },
 { id: 7, groupName:'Team Building', contactPerson:'David Taylor', email:'david.taylor@email.com', phone:'5566778899', checkIn:'03/20/2024', checkOut:'03/24/2024', rooms: 10, guests: 20, status:'Confirmed', totalPrice:'6800', roomTypes:'', specialRequests:'' },
 { id: 8, groupName:'Music Festival', contactPerson:'Lisa Anderson', email:'lisa.anderson@email.com', phone:'6677889900', checkIn:'07/01/2024', checkOut:'07/05/2024', rooms: 12, guests: 24, status:'Pending', totalPrice:'7200', roomTypes:'', specialRequests:'' },
 { id: 9, groupName:'Educational Tour', contactPerson:'Thomas Moore', email:'thomas.moore@email.com', phone:'7788990011', checkIn:'04/22/2024', checkOut:'04/28/2024', rooms: 20, guests: 40, status:'Confirmed', totalPrice:'12000', roomTypes:'', specialRequests:'' },
 { id: 10, groupName:'Retreat Workshop', contactPerson:'Amanda White', email:'amanda.white@email.com', phone:'8899001122', checkIn:'05/01/2024', checkOut:'05/05/2024', rooms: 7, guests: 14, status:'Pending', totalPrice:'5600', roomTypes:'', specialRequests:'' },
];

const statusStyles = {
 Confirmed:'bg-[#e5f4eb] text-[#1b7f43]',
 Pending:'bg-orange-100 text-orange-500'
};

export default function GroupReservations() {
 const [groups, setGroups] = useState(initialGroups);
 const [search, setSearch] = useState('');
 
 // Columns Menu state
 const [visibleColumns, setVisibleColumns] = useState({
 Checkbox: true,'Group Name': true,'Contact Person': true, Email: true,
 Phone: true,'Check In': true,'Check Out': true, Rooms: true,
 Guests: true, Status: true,'Total Price': true, Actions: true
 });
 const [showColumnsMenu, setShowColumnsMenu] = useState(false);
 const filterMenuRef = useRef(null);
 
 // Selected Rows
 const [selectedRows, setSelectedRows] = useState([]);
 
 // Modals state
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingId, setEditingId] = useState(null);
 
 const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
 const [groupToDelete, setGroupToDelete] = useState(null);

 const [isViewModalOpen, setIsViewModalOpen] = useState(false);
 const [viewingGroup, setViewingGroup] = useState(null);
 
 // Form State
 const [form, setForm] = useState({
 groupName:'', contactPerson:'', email:'', phone:'',
 checkIn:'', checkOut:'', rooms: 0, guests: 0,
 roomTypes:'', status:'Pending', totalPrice: 0, specialRequests:''
 });

 // Close menus when clicking outside
 useEffect(() => {
 function handleClickOutside(event) {
 if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
 setShowColumnsMenu(false);
 }
 }
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 const handleRefresh = () => {
 setSearch('');
 setGroups(initialGroups);
 setSelectedRows([]);
 setVisibleColumns({
 Checkbox: true,'Group Name': true,'Contact Person': true, Email: true,
 Phone: true,'Check In': true,'Check Out': true, Rooms: true,
 Guests: true, Status: true,'Total Price': true, Actions: true
 });
 };

 const handleExportCSV = () => {
 const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !=='Actions' && col !=='Checkbox');
 let csvContent = activeCols.join(',') +'\n';
 
 filteredGroups.forEach(g => {
 const row = activeCols.map(col => {
 let val ='';
 if (col ==='Group Name') val = g.groupName;
 else if (col ==='Contact Person') val = g.contactPerson;
 else if (col ==='Email') val = g.email;
 else if (col ==='Phone') val = g.phone;
 else if (col ==='Check In') val = g.checkIn;
 else if (col ==='Check Out') val = g.checkOut;
 else if (col ==='Rooms') val = g.rooms;
 else if (col ==='Guests') val = g.guests;
 else if (col ==='Status') val = g.status;
 else if (col ==='Total Price') val = g.totalPrice;
 return`"${(val ||'').toString().replace(/"/g,'""')}"`;
 });
 csvContent += row.join(',') +'\n';
 });
 
 const blob = new Blob([csvContent], { type:'text/csv;charset=utf-8;' });
 const link = document.createElement('a');
 link.href = URL.createObjectURL(blob);
 link.download ='group_reservations.csv';
 link.click();
 };

 const handleExportPDF = () => {
 const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !=='Actions' && col !=='Checkbox');
 let html =`
 <html>
 <head>
 <title>Group Reservations</title>
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
 <h2>Group Reservations Report</h2>
 <div class="meta">Generated on: ${new Date().toLocaleDateString()}</div>
 <table>
 <thead>
 <tr>${activeCols.map(c =>`<th>${c}</th>`).join('')}</tr>
 </thead>
 <tbody>`;
 
 filteredGroups.forEach(g => {
 html +='<tr>';
 activeCols.forEach(col => {
 let val ='';
 if (col ==='Group Name') val = g.groupName;
 else if (col ==='Contact Person') val = g.contactPerson;
 else if (col ==='Email') val = g.email;
 else if (col ==='Phone') val = g.phone;
 else if (col ==='Check In') val = g.checkIn;
 else if (col ==='Check Out') val = g.checkOut;
 else if (col ==='Rooms') val = g.rooms;
 else if (col ==='Guests') val = g.guests;
 else if (col ==='Status') val = g.status;
 else if (col ==='Total Price') val = g.totalPrice;
 html +=`<td>${val}</td>`;
 });
 html +='</tr>';
 });
 
 html +=`
 </tbody>
 </table>
 <script>
 window.onload = () => { window.print(); setTimeout(() => window.close(), 500); };
 </script>
 </body>
 </html>`;
 
 const printWindow = window.open('','_blank');
 printWindow.document.write(html);
 printWindow.document.close();
 };

 const filteredGroups = groups.filter(g => 
 g.groupName.toLowerCase().includes(search.toLowerCase()) ||
 g.contactPerson.toLowerCase().includes(search.toLowerCase()) || 
 g.email.toLowerCase().includes(search.toLowerCase())
 );

 const toggleColumn = (col) => {
 setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
 };

 const handleSelectAll = (e) => {
 if (e.target.checked) {
 setSelectedRows(filteredGroups.map(g => g.id));
 } else {
 setSelectedRows([]);
 }
 };

 const handleSelectRow = (id) => {
 setSelectedRows(prev => 
 prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
 );
 };

 const openNewModal = () => {
 setEditingId(null);
 setForm({
 groupName:'', contactPerson:'', email:'', phone:'',
 checkIn:'', checkOut:'', rooms: 0, guests: 0,
 roomTypes:'', status:'Pending', totalPrice: 0, specialRequests:''
 });
 setIsModalOpen(true);
 };

 const openEditModal = (group) => {
 setEditingId(group.id);
 setForm({
 groupName: group.groupName,
 contactPerson: group.contactPerson,
 email: group.email,
 phone: group.phone,
 checkIn: group.checkIn,
 checkOut: group.checkOut,
 rooms: group.rooms,
 guests: group.guests,
 roomTypes: group.roomTypes ||'',
 status: group.status,
 totalPrice: group.totalPrice,
 specialRequests: group.specialRequests ||''
 });
 setIsModalOpen(true);
 };

 const openViewModal = (group) => {
 setViewingGroup(group);
 setIsViewModalOpen(true);
 };

 const handleSaveModal = (e) => {
 e.preventDefault();
 if (editingId) {
 setGroups(groups.map(g => g.id === editingId ? { ...g, ...form } : g));
 } else {
 setGroups([...groups, { ...form, id: groups.length + 1 }]);
 }
 setIsModalOpen(false);
 };

 const confirmDelete = (group) => {
 setGroupToDelete(group);
 setIsDeleteModalOpen(true);
 };

 const handleDelete = () => {
 setGroups(groups.filter(g => g.id !== groupToDelete.id));
 setIsDeleteModalOpen(false);
 setGroupToDelete(null);
 };

 const muiInputSx = {'& .MuiOutlinedInput-root': {
 borderRadius:'8px',
 backgroundColor:'#ffffff',
 fontSize:'13px',
 color:'#1f2937','& fieldset': { borderColor:'#e2e8f0', borderWidth:'1px' },'&:hover fieldset': { borderColor:'#cbd5e1' },'&.Mui-focused fieldset': { borderColor:'var(--primary-main)', borderWidth:'1.5px' },
 },'& .MuiInputLabel-root': {
 fontSize:'13px',
 color:'#64748b','&.Mui-focused': { color:'var(--primary-main)' }
 }
 };

 return (
 <div className="w-full h-full flex flex-col p-6 min-h-screen">
 
 {/* Top Header */}
 <div className="bg-white rounded-t-xl p-4 flex items-center justify-between border-b border-gray-100">
 <div className="flex items-center gap-4">
 <h1 className="text-[16px] font-bold text-gray-700">Group Reservations</h1>
 <div className="relative">
 <input 
 type="text" 
 placeholder="Search..." 
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="pl-3 pr-10 py-1.5 border border-gray-200 rounded-md text-[13px] w-[200px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)] transition-colors"
 />
 <Search className="absolute right-2.5 top-2 text-gray-400" sx={{ fontSize: 18 }} />
 </div>
 </div>
 
 <div className="flex items-center gap-2">
 <div className="relative" ref={filterMenuRef}>
 <button onClick={() => setShowColumnsMenu(!showColumnsMenu)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Filter">
 <FilterList sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
 </button>
 {showColumnsMenu && (
 <div className="absolute right-0 top-10 w-48 bg-[#f8f9fa] shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-md border border-gray-100 z-50 py-2 animate-fade-in">
 <div className="px-4 py-2 border-b border-gray-100 text-[12px] font-bold text-gray-700">Show/Hide Column</div>
 <div className="max-h-[250px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
 {Object.keys(visibleColumns).map(col => (
 <label key={col} className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer gap-3 text-[13px] text-gray-700 transition-colors">
 <input 
 type="checkbox" 
 checked={visibleColumns[col]} 
 onChange={() => toggleColumn(col)} 
 className="w-4 h-4 accent-[#1b7f43] cursor-pointer rounded-sm" 
 />
 {col}
 </label>
 ))}
 </div>
 </div>
 )}
 </div>
 <button onClick={openNewModal} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="New Group Reservation">
 <AddCircleOutlined sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
 </button>
 <button onClick={handleRefresh} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Refresh">
 <Refresh sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
 </button>
 <button onClick={handleExportCSV} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Export CSV">
 <TableChart sx={{ fontSize: 18 }} className="text-[#0ea5e9]" />
 </button>
 <button onClick={handleExportPDF} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer" title="Export PDF">
 <PictureAsPdf sx={{ fontSize: 18 }} className="text-[#ef4444]" />
 </button>
 </div>
 </div>

 {/* Table Section */}
 <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
 <div className="flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
 <table className="w-full text-left min-w-max">
 <thead>
 <tr className="border-b border-gray-100 bg-white">
 {visibleColumns['Checkbox'] && (
 <th className="py-4 px-6 w-10">
 <input type="checkbox" className="w-4 h-4 accent-[#1b7f43] cursor-pointer rounded-sm"
 checked={selectedRows.length === filteredGroups.length && filteredGroups.length > 0}
 onChange={handleSelectAll}
 />
 </th>
 )}
 {visibleColumns['Group Name'] && <th className="py-4 px-6 text-[13px] font-bold text-[#1e293b]">Group Name</th>}
 {visibleColumns['Contact Person'] && <th className="py-4 px-6 text-[13px] font-bold text-[#1e293b]">Contact Person</th>}
 {visibleColumns['Email'] && <th className="py-4 px-6 text-[13px] font-bold text-[#1e293b]">Email</th>}
 {visibleColumns['Phone'] && <th className="py-4 px-6 text-[13px] font-bold text-[#1e293b]">Phone</th>}
 {visibleColumns['Check In'] && <th className="py-4 px-6 text-[13px] font-bold text-[#1e293b]">Check In</th>}
 {visibleColumns['Check Out'] && <th className="py-4 px-6 text-[13px] font-bold text-[#1e293b]">Check Out</th>}
 {visibleColumns['Rooms'] && <th className="py-4 px-6 text-[13px] font-bold text-[#1e293b]">Rooms</th>}
 {visibleColumns['Guests'] && <th className="py-4 px-6 text-[13px] font-bold text-[#1e293b]">Guests</th>}
 {visibleColumns['Status'] && <th className="py-4 px-6 text-[13px] font-bold text-[#1e293b]">Status</th>}
 {visibleColumns['Total Price'] && <th className="py-4 px-6 text-[13px] font-bold text-[#1e293b]">Total Price</th>}
 {visibleColumns['Actions'] && <th className="py-4 px-6 text-[13px] font-bold text-[#1e293b]">Actions</th>}
 </tr>
 </thead>
 <tbody>
 {filteredGroups.map((group) => (
 <tr key={group.id} onClick={() => openViewModal(group)} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer">
 {visibleColumns['Checkbox'] && (
 <td className="py-3 px-6" onClick={(e) => e.stopPropagation()}>
 <input 
 type="checkbox" 
 checked={selectedRows.includes(group.id)}
 onChange={() => handleSelectRow(group.id)}
 className="w-4 h-4 accent-[#1b7f43] cursor-pointer rounded-sm"
 />
 </td>
 )}
 {visibleColumns['Group Name'] && <td className="py-3 px-6 text-[13px] text-gray-700">{group.groupName}</td>}
 {visibleColumns['Contact Person'] && <td className="py-3 px-6 text-[13px] text-gray-700">{group.contactPerson}</td>}
 {visibleColumns['Email'] && (
 <td className="py-3 px-6 text-[13px] text-gray-600 flex items-center gap-1.5">
 <EmailOutlined sx={{ fontSize: 16 }} className="text-[#ef4444]" />
 <span className="truncate max-w-[120px]">{group.email}</span>
 </td>
 )}
 {visibleColumns['Phone'] && (
 <td className="py-3 px-6 text-[13px] text-gray-600">
 <div className="flex items-center gap-1.5">
 <PhoneOutlined sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
 {group.phone}
 </div>
 </td>
 )}
 {visibleColumns['Check In'] && (
 <td className="py-3 px-6 text-[13px] text-gray-600">
 <div className="flex items-center gap-1.5">
 <CalendarTodayOutlined sx={{ fontSize: 14 }} className="text-gray-400" />
 {group.checkIn}
 </div>
 </td>
 )}
 {visibleColumns['Check Out'] && (
 <td className="py-3 px-6 text-[13px] text-gray-600">
 <div className="flex items-center gap-1.5">
 <CalendarTodayOutlined sx={{ fontSize: 14 }} className="text-gray-400" />
 {group.checkOut}
 </div>
 </td>
 )}
 {visibleColumns['Rooms'] && <td className="py-3 px-6 text-[13px] text-gray-600">{group.rooms}</td>}
 {visibleColumns['Guests'] && <td className="py-3 px-6 text-[13px] text-gray-600">{group.guests}</td>}
 {visibleColumns['Status'] && (
 <td className="py-3 px-6">
 <span className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold block w-max ${statusStyles[group.status]}`}>
 {group.status}
 </span>
 </td>
 )}
 {visibleColumns['Total Price'] && <td className="py-3 px-6 text-[13px] text-gray-700">{group.totalPrice}</td>}
 {visibleColumns['Actions'] && (
 <td className="py-3 px-6 relative">
 <div className="flex items-center gap-3">
 <button onClick={(e) => { e.stopPropagation(); openEditModal(group); }} className="text-[var(--primary-main)] hover:text-green-700 transition-colors cursor-pointer" title="Edit">
 <EditOutlined sx={{ fontSize: 18 }} />
 </button>
 <button onClick={(e) => { e.stopPropagation(); confirmDelete(group); }} className="text-orange-500 hover:text-orange-600 transition-colors cursor-pointer" title="Delete">
 <DeleteOutlined sx={{ fontSize: 18 }} />
 </button>
 </div>
 </td>
 )}
 </tr>
 ))}
 {filteredGroups.length === 0 && (
 <tr>
 <td colSpan="12" className="py-8 text-center text-gray-500 text-sm">
 No group reservations found.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 
 {/* Pagination placeholder */}
 <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-white gap-4">
 <div className="flex items-center gap-2">
 <span className="text-[12px] text-gray-500">Items per page:</span>
 <select className="border border-gray-200 rounded px-2 py-1 text-[12px] text-gray-700 outline-none">
 <option>10</option>
 <option>20</option>
 <option>50</option>
 </select>
 </div>
 <span className="text-[12px] text-gray-500">1 - {filteredGroups.length} of {filteredGroups.length}</span>
 <div className="flex items-center gap-1">
 <button className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:bg-gray-50">&lt;</button>
 <button className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:bg-gray-50">&gt;</button>
 </div>
 </div>
 </div>

 {/* Edit/New Booking Modal */}
 {isModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}>
 <div className="bg-white rounded-lg shadow-2xl w-full max-w-[800px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
 <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between">
 <h2 className="text-white text-[17px] font-bold">
 {editingId ?`Edit Group Reservation ${form.groupName}` :'New Group Reservation'}
 </h2>
 <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
 <Close sx={{ fontSize: 18 }} />
 </button>
 </div>
 
 <form onSubmit={handleSaveModal} className="p-6 overflow-y-auto max-h-[80vh]">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
 
 <TextField required label="Group Name" name="groupName" value={form.groupName} onChange={(e)=>setForm({...form, groupName: e.target.value})} sx={muiInputSx} size="small" fullWidth />
 <TextField required label="Contact Person" name="contactPerson" value={form.contactPerson} onChange={(e)=>setForm({...form, contactPerson: e.target.value})} sx={muiInputSx} size="small" fullWidth />
 
 <TextField required label="Email" type="email" name="email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} sx={muiInputSx} size="small" fullWidth />
 <TextField required label="Phone" name="phone" value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} sx={muiInputSx} size="small" fullWidth />

 <TextField required type="date" label="Check In Date" name="checkIn" value={form.checkIn} onChange={(e)=>setForm({...form, checkIn: e.target.value})} sx={muiInputSx} size="small" fullWidth InputLabelProps={{ shrink: true }} />
 <TextField required type="date" label="Check Out Date" name="checkOut" value={form.checkOut} onChange={(e)=>setForm({...form, checkOut: e.target.value})} sx={muiInputSx} size="small" fullWidth InputLabelProps={{ shrink: true }} />

 <TextField required type="number" label="Number of Rooms" name="rooms" value={form.rooms} onChange={(e)=>setForm({...form, rooms: e.target.value})} sx={muiInputSx} size="small" fullWidth />
 <TextField required type="number" label="Number of Guests" name="guests" value={form.guests} onChange={(e)=>setForm({...form, guests: e.target.value})} sx={muiInputSx} size="small" fullWidth />

 <FormControl size="small" fullWidth sx={muiInputSx}>
 <InputLabel>Room Types</InputLabel>
 <Select name="roomTypes" value={form.roomTypes} label="Room Types" onChange={(e)=>setForm({...form, roomTypes: e.target.value})}>
 <MenuItem value=""><em>None</em></MenuItem>
 <MenuItem value="Standard">Standard</MenuItem>
 <MenuItem value="Delux">Delux</MenuItem>
 <MenuItem value="Suite">Suite</MenuItem>
 </Select>
 </FormControl>

 <FormControl size="small" fullWidth sx={muiInputSx}>
 <InputLabel>Status*</InputLabel>
 <Select name="status" value={form.status} label="Status*" onChange={(e)=>setForm({...form, status: e.target.value})}>
 <MenuItem value="Pending">Pending</MenuItem>
 <MenuItem value="Confirmed">Confirmed</MenuItem>
 </Select>
 </FormControl>

 <TextField label="Total Price" type="number" name="totalPrice" value={form.totalPrice} onChange={(e)=>setForm({...form, totalPrice: e.target.value})} sx={muiInputSx} size="small" fullWidth />
 
 <TextField label="Special Requests" name="specialRequests" value={form.specialRequests} onChange={(e)=>setForm({...form, specialRequests: e.target.value})} sx={muiInputSx} size="small" fullWidth multiline rows={2} />
 </div>
 
 <div className="flex items-center gap-3 mt-8">
 <button type="submit" disabled={!form.groupName || !form.contactPerson} className="px-6 py-2 rounded-full bg-green-50 text-[var(--primary-main)] border border-green-200 font-bold text-[13.5px] hover:bg-green-100 transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
 Save
 </button>
 <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-full border border-transparent bg-[#fce7f3] text-[#e11d48] font-bold text-[13.5px] hover:bg-[#fbcfe8] transition-colors cursor-pointer shadow-sm">
 Cancel
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Delete Confirmation Modal */}
 {isDeleteModalOpen && groupToDelete && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsDeleteModalOpen(false)}>
 <div className="bg-white rounded-2xl shadow-xl w-full max-w-[360px] p-6 text-center" onClick={e => e.stopPropagation()}>
 <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-left">Are you sure?</h3>
 <div className="text-left space-y-3 mb-8">
 <p className="text-sm text-gray-600 font-medium grid grid-cols-[100px_1fr]"><span className="text-gray-500">Group Name:</span> <span className="text-gray-800">{groupToDelete.groupName}</span></p>
 <p className="text-sm text-gray-600 font-medium grid grid-cols-[100px_1fr]"><span className="text-gray-500">Contact Person:</span> <span className="text-gray-800">{groupToDelete.contactPerson}</span></p>
 </div>
 
 <div className="flex justify-center gap-3">
 <button onClick={handleDelete} className="px-6 py-2.5 rounded-full bg-[#c0392b] text-white font-bold text-sm hover:bg-[#a93226] transition-colors cursor-pointer">
 Delete
 </button>
 <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2.5 rounded-full bg-[#1b7f43] text-white font-bold text-sm hover:bg-[#156736] transition-colors cursor-pointer">
 Cancel
 </button>
 </div>
 </div>
 </div>
 )}

 {/* View Modal */}
 {isViewModalOpen && viewingGroup && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsViewModalOpen(false)}>
 <div className="bg-white rounded-lg shadow-2xl w-full max-w-[800px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
 {/* Header */}
 <div className="bg-[var(--primary-main)] px-6 py-5 flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-full border-2 border-white bg-transparent flex items-center justify-center text-white text-xl font-bold">
 {viewingGroup.groupName.charAt(0).toUpperCase()}
 </div>
 <div className="flex flex-col">
 <h2 className="text-white text-[20px] font-bold leading-tight">Group Reservations</h2>
 <span className="text-white/80 text-[13px]">{viewingGroup.email}</span>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <button 
 onClick={() => { setIsViewModalOpen(false); openEditModal(viewingGroup); }} 
 className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
 title="Edit"
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
 
 {/* Group Name */}
 <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
 <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
 <BusinessOutlined sx={{ fontSize: 20 }} />
 </div>
 <div className="flex flex-col">
 <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Group Name</span>
 <span className="text-[14px] font-bold text-gray-800">{viewingGroup.groupName}</span>
 </div>
 </div>

 {/* Contact Person */}
 <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
 <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
 <PersonOutlined sx={{ fontSize: 20 }} />
 </div>
 <div className="flex flex-col">
 <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Contact Person</span>
 <span className="text-[14px] font-bold text-gray-800">{viewingGroup.contactPerson}</span>
 </div>
 </div>

 {/* Email */}
 <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
 <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
 <EmailOutlined sx={{ fontSize: 20 }} />
 </div>
 <div className="flex flex-col">
 <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Email</span>
 <span className="text-[14px] font-bold text-gray-800">{viewingGroup.email}</span>
 </div>
 </div>

 {/* Phone */}
 <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
 <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
 <PhoneOutlined sx={{ fontSize: 20 }} />
 </div>
 <div className="flex flex-col">
 <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Phone</span>
 <span className="text-[14px] font-bold text-gray-800">{viewingGroup.phone}</span>
 </div>
 </div>

 {/* Check In */}
 <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
 <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
 <CalendarTodayOutlined sx={{ fontSize: 20 }} />
 </div>
 <div className="flex flex-col">
 <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Check In</span>
 <span className="text-[14px] font-bold text-gray-800">{viewingGroup.checkIn}</span>
 </div>
 </div>

 {/* Check Out */}
 <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
 <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
 <CalendarTodayOutlined sx={{ fontSize: 20 }} />
 </div>
 <div className="flex flex-col">
 <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Check Out</span>
 <span className="text-[14px] font-bold text-gray-800">{viewingGroup.checkOut}</span>
 </div>
 </div>

 {/* Rooms */}
 <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
 <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
 <MeetingRoomOutlined sx={{ fontSize: 20 }} />
 </div>
 <div className="flex flex-col">
 <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Rooms</span>
 <span className="text-[14px] font-bold text-gray-800">{viewingGroup.rooms}</span>
 </div>
 </div>

 {/* Guests */}
 <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
 <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
 <GroupsOutlined sx={{ fontSize: 20 }} />
 </div>
 <div className="flex flex-col">
 <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Guests</span>
 <span className="text-[14px] font-bold text-gray-800">{viewingGroup.guests}</span>
 </div>
 </div>

 {/* Status */}
 <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
 <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
 <LocalOfferOutlined sx={{ fontSize: 20 }} />
 </div>
 <div className="flex flex-col items-start">
 <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Status</span>
 <span className={`px-2 py-0.5 rounded-[4px] text-[12px] font-bold mt-0.5 ${statusStyles[viewingGroup.status]}`}>
 {viewingGroup.status}
 </span>
 </div>
 </div>

 {/* Total Price */}
 <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
 <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
 <AttachMoneyOutlined sx={{ fontSize: 20 }} />
 </div>
 <div className="flex flex-col items-start">
 <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Total Price</span>
 <span className="text-[14px] font-bold text-gray-800">{viewingGroup.totalPrice}</span>
 </div>
 </div>

 </div>
 </div>
 </div>
 </div>
 )}
 
 </div>
 );
}

