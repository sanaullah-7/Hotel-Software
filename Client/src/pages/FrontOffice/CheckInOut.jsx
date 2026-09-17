import Search from '@mui/icons-material/Search';
import FileDownload from '@mui/icons-material/FileDownload';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Login from '@mui/icons-material/Login';
import Logout from '@mui/icons-material/Logout';
import HourglassEmpty from '@mui/icons-material/HourglassEmpty';
import BookmarkBorder from '@mui/icons-material/BookmarkBorder';
import Phone from '@mui/icons-material/Phone';
import React, { useState, useMemo } from 'react';
import { TextField, InputAdornment, FormControl, InputLabel, Select as MuiSelect, MenuItem } from '@mui/material';
import {
  Groups as GroupsIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  PendingActions as PendingActionsIcon,
  Search as SearchIcon,
  ChecklistRtl as ChecklistRtlIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Bookmark as BookmarkIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  MeetingRoom as MeetingRoomIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  CreditCard as CreditCardIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  Layers as LayersIcon,
  Info as InfoIcon,
  Receipt as ReceiptIcon,
  Work as WorkIcon,
  CloudUpload as CloudUploadIcon,
  Bed as BedIcon,
  Assignment as AssignmentIcon,
  VpnKey as VpnKeyIcon,
  CleaningServices as CleaningServicesIcon
} from '@mui/icons-material';

const PRIMARY = 'var(--primary-main)';

const STATUS_STYLES = {
  Pending: 'bg-[#fee2e2] text-[#dc2626]',
  'Checked In': 'bg-[#dcfce7] text-[#16a34a]',
  'Checked Out': 'bg-[#dbeafe] text-[#2563eb]',
  Reserved: 'bg-[#fef3c7] text-[#d97706]',
};

const STATUS_ICONS = {
  Pending: PendingActionsIcon,
  'Checked In': LoginIcon,
  'Checked Out': LogoutIcon,
  Reserved: BookmarkIcon,
};

const avatarUrl = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`;

const initialGuests = [
  { id: 'BK-1001', name: 'John Doe', email: 'john.doe@example.com', room: '101', roomType: 'Deluxe', checkIn: '5/20/24', checkOut: '5/22/24', status: 'Pending' },
  { id: 'BK-1002', name: 'Jane Smith', email: 'jane.smith@example.com', room: '205', roomType: 'Suite', checkIn: '5/19/24', checkOut: '5/21/24', status: 'Checked In' },
  { id: 'BK-1003', name: 'Robert Brown', email: 'robert.brown@example.com', room: '302', roomType: 'Standard', checkIn: '5/18/24', checkOut: '5/19/24', status: 'Checked Out' },
  { id: 'BK-1004', name: 'Emily Johnson', email: 'emily.johnson@example.com', room: '105', roomType: 'Deluxe', checkIn: '5/21/24', checkOut: '5/24/24', status: 'Reserved' },
  { id: 'BK-1005', name: 'Michael Wilson', email: 'michael.wilson@example.com', room: '210', roomType: 'Executive', checkIn: '5/22/24', checkOut: '5/25/24', status: 'Pending' },
  { id: 'BK-1006', name: 'Sarah Davis', email: 'sarah.davis@example.com', room: '112', roomType: 'Standard', checkIn: '5/16/24', checkOut: '5/18/24', status: 'Checked Out' },
  { id: 'BK-1007', name: 'David Lee', email: 'david.lee@example.com', room: '308', roomType: 'Suite', checkIn: '5/23/24', checkOut: '5/27/24', status: 'Checked In' },
  { id: 'BK-1008', name: 'Laura Martinez', email: 'laura.martinez@example.com', room: '406', roomType: 'Deluxe', checkIn: '5/24/24', checkOut: '5/26/24', status: 'Reserved' },
  { id: 'BK-1009', name: 'Chris Anderson', email: 'chris.anderson@example.com', room: '118', roomType: 'Standard', checkIn: '5/15/24', checkOut: '5/17/24', status: 'Checked Out' },
  { id: 'BK-1010', name: 'Olivia Taylor', email: 'olivia.taylor@example.com', room: '221', roomType: 'Executive', checkIn: '5/25/24', checkOut: '5/28/24', status: 'Pending' },
  { id: 'BK-1011', name: 'Daniel Thomas', email: 'daniel.thomas@example.com', room: '133', roomType: 'Deluxe', checkIn: '5/17/24', checkOut: '5/20/24', status: 'Checked In' },
  { id: 'BK-1012', name: 'Sophia White', email: 'sophia.white@example.com', room: '409', roomType: 'Suite', checkIn: '5/26/24', checkOut: '5/29/24', status: 'Reserved' },
];

function ViewGuestModal({ guest, onClose, onEdit }) {
  if (!guest) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="bg-[var(--primary-main)] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <img src={avatarUrl(guest.name)} alt={guest.name} className="w-12 h-12 rounded-full border-2 border-white/20 shadow-sm" />
            <div className="flex flex-col">
              <h2 className="text-white text-[20px] font-bold leading-tight">{guest.name}</h2>
              <p className="text-emerald-100 text-[12px] font-medium leading-tight mt-0.5">{guest.id} • Room {guest.room}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
            <CloseIcon sx={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Guest Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <PersonIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
              <h3 className="text-[var(--primary-main)] text-[11px] font-bold uppercase tracking-wider">Guest Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <WorkIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase font-bold">Full Name</span>
                  <span className="text-gray-800 text-[13px] font-semibold">{guest.name}</span>
                </div>
              </div>
              <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <EmailIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase font-bold">Email</span>
                  <span className="text-gray-800 text-[13px] font-semibold">{guest.email}</span>
                </div>
              </div>
              <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <PhoneIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase font-bold">Phone</span>
                  <span className="text-gray-800 text-[13px] font-semibold">{guest.phone || '+1-234-567-8901'}</span>
                </div>
              </div>
              <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <CreditCardIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase font-bold">Passport</span>
                  <span className="text-gray-800 text-[13px] font-semibold">{guest.passport || 'P12345678'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ConfirmationNumberIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
              <h3 className="text-[var(--primary-main)] text-[11px] font-bold uppercase tracking-wider">Booking Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <ConfirmationNumberIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase font-bold">Booking ID</span>
                  <span className="text-gray-800 text-[13px] font-semibold">{guest.id}</span>
                </div>
              </div>
              <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <MeetingRoomIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase font-bold">Room</span>
                  <span className="text-gray-800 text-[13px] font-semibold">{guest.room} • {guest.roomType}</span>
                </div>
              </div>
              <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <LayersIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase font-bold">Floor</span>
                  <span className="text-gray-800 text-[13px] font-semibold">{guest.floor || '1'}</span>
                </div>
              </div>
              <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <GroupsIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase font-bold">Guest Count</span>
                  <span className="text-gray-800 text-[13px] font-semibold">{guest.guestCount || '2'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stay Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <EventIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
              <h3 className="text-[var(--primary-main)] text-[11px] font-bold uppercase tracking-wider">Stay Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <LoginIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase font-bold">Check-In Date</span>
                  <span className="text-gray-800 text-[13px] font-semibold">{guest.checkIn}</span>
                </div>
              </div>
              <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <LogoutIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase font-bold">Check-Out Date</span>
                  <span className="text-gray-800 text-[13px] font-semibold">{guest.checkOut}</span>
                </div>
              </div>
              <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <InfoIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase font-bold">Status</span>
                  <span className={`inline-block font-bold text-[10px] px-2 py-0.5 rounded-md mt-0.5 ${STATUS_STYLES[guest.status]}`}>{guest.status}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-start gap-3 mt-3">
              <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                <ReceiptIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
              </div>
              <div className="flex flex-col mt-0.5">
                <span className="text-gray-400 text-[10px] uppercase font-bold">Special Requests</span>
                <span className="text-gray-800 text-[13px] font-semibold">{guest.specialRequests || 'Early check-in requested'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end items-center gap-4 shrink-0">
          <button onClick={onClose} className="text-gray-500 text-[13px] font-semibold hover:text-gray-700 transition-colors cursor-pointer">
            Close
          </button>
          <button onClick={onEdit} className="flex items-center gap-2 bg-[var(--primary-main)] hover:bg-[#059669] text-white px-5 py-2 rounded-lg text-[13px] font-bold transition-colors cursor-pointer shadow-sm">
            <EditIcon sx={{ fontSize: 16 }} /> Edit Guest
          </button>
        </div>

      </div>
    </div>
  );
}

function GuestFormModal({ onClose, onSave, initialData }) {
  const [form, setForm] = useState(() => {
    if (initialData) {
      const [firstName, ...rest] = (initialData.name || '').split(' ');
      return {
        ...initialData,
        firstName: firstName || '',
        lastName: rest.join(' ') || '',
        guestCount: initialData.guestCount || '1',
        idType: initialData.idType || 'Passport',
        status: initialData.status || 'Pending'
      };
    }
    return { 
      firstName: '', lastName: '', email: '', phone: '', bookingId: '', 
      room: '', roomType: 'Standard', roomFloor: '', checkIn: '', checkOut: '', 
      guestCount: '1', specialRequests: '', idType: 'Passport', idNumber: '', status: 'Pending' 
    };
  });
  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const [documents, setDocuments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setDocuments(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setDocuments(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeDocument = (index, e) => {
    e.stopPropagation();
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!form.firstName.trim() || !form.room.trim()) return;
    onSave({ ...form, name: `${form.firstName} ${form.lastName}`.trim(), documents });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[650px] overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/30">
              <img src={avatarUrl(initialData ? initialData.name : 'New')} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-white text-[15px] font-bold leading-tight">
              {initialData ? `Edit ${initialData.name}` : 'New Check-in/out Record'}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Row 1 */}
            <TextField 
              fullWidth label="First Name*" variant="outlined" size="small"
              value={form.firstName} onChange={(e) => set('firstName')(e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end"><PersonIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
            />
            <TextField 
              fullWidth label="Last Name*" variant="outlined" size="small"
              value={form.lastName} onChange={(e) => set('lastName')(e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end"><PersonIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
            />

            {/* Row 2 */}
            <TextField 
              fullWidth label="Email*" variant="outlined" size="small"
              value={form.email} onChange={(e) => set('email')(e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end"><EmailIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
            />
            <TextField 
              fullWidth label="Phone*" variant="outlined" size="small"
              value={form.phone} onChange={(e) => set('phone')(e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end"><PhoneIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
            />

            {/* Row 3 */}
            <TextField 
              fullWidth label="Booking ID" variant="outlined" size="small"
              value={form.bookingId} onChange={(e) => set('bookingId')(e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end"><ConfirmationNumberIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
            />
            <TextField 
              fullWidth label="Room No*" variant="outlined" size="small"
              value={form.room} onChange={(e) => set('room')(e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end"><BedIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
            />

            {/* Row 4 */}
            <FormControl fullWidth size="small">
              <InputLabel>Room Type*</InputLabel>
              <MuiSelect label="Room Type*" value={form.roomType} onChange={(e) => set('roomType')(e.target.value)}>
                <MenuItem value="Standard">Standard</MenuItem>
                <MenuItem value="Deluxe">Deluxe</MenuItem>
                <MenuItem value="Suite">Suite</MenuItem>
                <MenuItem value="Executive">Executive</MenuItem>
              </MuiSelect>
            </FormControl>
            <TextField 
              fullWidth label="Room Floor" variant="outlined" size="small"
              value={form.roomFloor} onChange={(e) => set('roomFloor')(e.target.value)}
            />

            {/* Row 5 */}
            <TextField 
              fullWidth label="Check-in Date*" variant="outlined" size="small" type="date"
              InputLabelProps={{ shrink: true }}
              value={form.checkIn} onChange={(e) => set('checkIn')(e.target.value)}
            />
            <TextField 
              fullWidth label="Check-out Date*" variant="outlined" size="small" type="date"
              InputLabelProps={{ shrink: true }}
              value={form.checkOut} onChange={(e) => set('checkOut')(e.target.value)}
            />

            {/* Row 6 */}
            <TextField 
              fullWidth label="Guest Count" variant="outlined" size="small"
              value={form.guestCount} onChange={(e) => set('guestCount')(e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end"><GroupsIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
            />
            <TextField 
              fullWidth label="Special Requests" variant="outlined" size="small"
              value={form.specialRequests} onChange={(e) => set('specialRequests')(e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end"><ReceiptIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
            />

            {/* Row 7 */}
            <FormControl fullWidth size="small">
              <InputLabel>ID Type</InputLabel>
              <MuiSelect label="ID Type" value={form.idType} onChange={(e) => set('idType')(e.target.value)}>
                <MenuItem value="Passport">Passport</MenuItem>
                <MenuItem value="National ID">National ID</MenuItem>
                <MenuItem value="Driver's License">Driver's License</MenuItem>
              </MuiSelect>
            </FormControl>
            <TextField 
              fullWidth label="ID Number" variant="outlined" size="small"
              value={form.idNumber} onChange={(e) => set('idNumber')(e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end"><BadgeIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
            />
          </div>

          {/* Document Upload */}
          <div>
            <label className="text-[12px] font-semibold text-gray-500 block mb-2">Document Upload</label>
            <div 
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${isDragging ? 'border-[var(--primary-main)] bg-emerald-50/50' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                multiple 
                className="hidden" 
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              />
              <CloudUploadIcon className={isDragging ? "text-[var(--primary-main)] mb-2" : "text-gray-400 mb-2"} sx={{ fontSize: 32 }} />
              <span className="text-[var(--primary-main)] text-[13px] font-bold">Click to upload documents or drag and drop</span>
              <span className="text-gray-400 text-[11px] mt-1">Supports JPG, PNG, PDF, DOC, DOCX (Max 5MB each)</span>
            </div>
            
            {documents.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {documents.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 rounded-lg p-2.5">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <ReceiptIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)] shrink-0" />
                      <span className="text-[12px] font-medium text-gray-700 truncate">{file.name}</span>
                    </div>
                    <button 
                      onClick={(e) => removeDocument(idx, e)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-full transition-colors cursor-pointer shrink-0"
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="relative">
            <FormControl fullWidth size="small">
              <InputLabel>Status*</InputLabel>
              <MuiSelect label="Status*" value={form.status} onChange={(e) => set('status')(e.target.value)}>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Checked In">Checked In</MenuItem>
                <MenuItem value="Checked Out">Checked Out</MenuItem>
                <MenuItem value="Reserved">Reserved</MenuItem>
              </MuiSelect>
            </FormControl>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-start gap-4 shrink-0">
          <button
            onClick={handleSubmit}
            disabled={!form.firstName.trim() || !form.room.trim()}
            className="px-6 py-2 rounded-full bg-[#e2e8f0] text-gray-400 text-[13px] font-bold disabled:opacity-70 transition-colors"
            style={form.firstName.trim() && form.room.trim() ? { backgroundColor: 'var(--primary-main)', color: 'white' } : {}}
          >
            {initialData ? 'Update Record' : 'Save Record'}
          </button>
          <button onClick={onClose} className="text-red-500 text-[13px] font-bold hover:text-red-600 transition-colors cursor-pointer">
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

function CheckInActionModal({ guest, onClose, onComplete }) {
  const [idVerification, setIdVerification] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [roomKey, setRoomKey] = useState('');

  const isReady = idVerification && paymentStatus && roomKey.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between shrink-0">
          <h2 className="text-white text-[15px] font-bold leading-tight">Check-in Guest</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          
          {/* Welcome Box */}
          <div className="bg-[#f8f9fc] border border-emerald-100 rounded-lg p-4 flex flex-col">
            <h3 className="text-[var(--primary-main)] text-[14px] font-bold mb-1">Welcome, {guest.name}</h3>
            <span className="text-gray-500 text-[12px] font-medium leading-relaxed">Booking ID: {guest.id}</span>
            <span className="text-gray-500 text-[12px] font-medium leading-relaxed">Room {guest.room} ({guest.roomType})</span>
          </div>

          {/* Verify Information Box */}
          <div className="bg-[#f8f9fc] border border-emerald-100 rounded-lg p-4 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--primary-main)] flex items-center justify-center shrink-0 shadow-sm">
                <AssignmentIcon className="text-white" sx={{ fontSize: 16 }} />
              </div>
              <h3 className="text-gray-900 text-[13px] font-bold">Verify Guest Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormControl fullWidth size="small">
                <InputLabel>ID Verification*</InputLabel>
                <MuiSelect label="ID Verification*" value={idVerification} onChange={(e) => setIdVerification(e.target.value)} className="bg-white">
                  <MenuItem value="Passport Verified">Passport Verified</MenuItem>
                  <MenuItem value="ID Card Verified">ID Card Verified</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                </MuiSelect>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Payment Status*</InputLabel>
                <MuiSelect label="Payment Status*" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="bg-white">
                  <MenuItem value="Paid in Full">Paid in Full</MenuItem>
                  <MenuItem value="Card Pre-authorized">Card Pre-authorized</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                </MuiSelect>
              </FormControl>
            </div>
          </div>

          {/* Room Assignment Box */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--primary-main)] flex items-center justify-center shrink-0 shadow-sm">
                <VpnKeyIcon className="text-white" sx={{ fontSize: 16 }} />
              </div>
              <h3 className="text-gray-900 text-[13px] font-bold">Room Assignment</h3>
            </div>
            <TextField 
              fullWidth label="Room Key/Card*" variant="outlined" size="small"
              value={roomKey} onChange={(e) => setRoomKey(e.target.value)}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 pb-5 flex items-center justify-start gap-3 shrink-0 rounded-b-xl">
          <button
            onClick={() => onComplete(guest.id)}
            disabled={!isReady}
            className="px-5 py-2 rounded-full bg-[#e2e8f0] text-gray-400 text-[13px] font-bold disabled:opacity-70 transition-colors"
            style={isReady ? { backgroundColor: 'var(--primary-main)', color: 'white' } : {}}
          >
            Complete Check-in
          </button>
          <button onClick={onClose} className="px-6 py-2 rounded-full border border-gray-200 text-red-500 text-[13px] font-bold hover:bg-gray-50 transition-colors cursor-pointer bg-white">
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

function CheckOutActionModal({ guest, onClose, onComplete }) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [roomInspection, setRoomInspection] = useState('');

  const isReady = paymentMethod && roomInspection;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[400px] overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between shrink-0">
          <h2 className="text-white text-[15px] font-bold leading-tight">Check-out Guest</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          
          {/* Welcome Box */}
          <div className="bg-[#f8f9fc] border border-emerald-100 rounded-lg p-4 flex flex-col">
            <h3 className="text-[var(--primary-main)] text-[13px] font-bold mb-1">Checking Out, {guest.name}</h3>
            <span className="text-gray-500 text-[11px] font-medium leading-relaxed">Booking ID: {guest.id}</span>
            <span className="text-gray-500 text-[11px] font-medium leading-relaxed">Room {guest.room} ({guest.roomType})</span>
            <span className="text-gray-500 text-[11px] font-medium leading-relaxed">Stay: {guest.checkIn} - {guest.checkOut}</span>
          </div>

          {/* Final Billing Box */}
          <div className="bg-[#f8f9fc] border border-emerald-100 rounded-lg p-4 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--primary-main)] flex items-center justify-center shrink-0 shadow-sm">
                <ReceiptIcon className="text-white" sx={{ fontSize: 16 }} />
              </div>
              <h3 className="text-gray-900 text-[13px] font-bold">Final Billing</h3>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-md p-3 mb-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500 text-[11px] font-medium">Room Charges:</span>
                <span className="text-gray-700 text-[12px] font-medium">$450.00</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-500 text-[11px] font-medium">Additional Services:</span>
                <span className="text-gray-700 text-[12px] font-medium">$75.50</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
                <span className="text-[var(--primary-main)] text-[13px] font-bold">Total Amount:</span>
                <span className="text-[var(--primary-main)] text-[14px] font-bold">$525.50</span>
              </div>
            </div>

            <FormControl fullWidth size="small">
              <InputLabel>Payment Method*</InputLabel>
              <MuiSelect label="Payment Method*" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="bg-white">
                <MenuItem value="Credit Card">Credit Card</MenuItem>
                <MenuItem value="Debit Card">Debit Card</MenuItem>
                <MenuItem value="Cash">Cash</MenuItem>
              </MuiSelect>
            </FormControl>
          </div>

          {/* Room Condition Box */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--primary-main)] flex items-center justify-center shrink-0 shadow-sm">
                <CleaningServicesIcon className="text-white" sx={{ fontSize: 16 }} />
              </div>
              <h3 className="text-gray-900 text-[13px] font-bold">Room Condition</h3>
            </div>
            <FormControl fullWidth size="small">
              <InputLabel>Room Inspection*</InputLabel>
              <MuiSelect label="Room Inspection*" value={roomInspection} onChange={(e) => setRoomInspection(e.target.value)} className="bg-white">
                <MenuItem value="Cleared">Cleared (No Damages)</MenuItem>
                <MenuItem value="Damages Reported">Damages Reported</MenuItem>
                <MenuItem value="Pending Inspection">Pending Inspection</MenuItem>
              </MuiSelect>
            </FormControl>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 pb-5 flex items-center justify-start gap-3 shrink-0 rounded-b-xl">
          <button
            onClick={() => onComplete(guest.id)}
            disabled={!isReady}
            className="px-5 py-2 rounded-full bg-[#e2e8f0] text-gray-400 text-[12px] font-bold disabled:opacity-70 transition-colors"
            style={isReady ? { backgroundColor: 'var(--primary-main)', color: 'white' } : {}}
          >
            Complete Check-out
          </button>
          <button onClick={onClose} className="px-6 py-2 rounded-full border border-gray-200 text-red-500 text-[12px] font-bold hover:bg-gray-50 transition-colors cursor-pointer bg-white">
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

function DeleteGuestModal({ guest, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[450px] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="bg-[#f43f5e] px-5 py-4 flex items-start gap-4">
          <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 border border-white/40 bg-white/10">
            <DeleteIcon className="text-white" sx={{ fontSize: 22 }} />
          </div>
          <div className="flex-1 mt-0.5">
            <h2 className="text-white text-[17px] font-bold leading-tight">Delete Check-in Record</h2>
            <p className="text-white/80 text-[13px] mt-0.5 font-medium">This action cannot be undone</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center text-white hover:bg-black/20 transition-colors cursor-pointer">
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-500 text-[14px] font-medium mb-4">Are you sure you want to delete the following check-in record?</p>
          <div className="bg-rose-50 border border-rose-100 rounded-lg p-3.5 flex items-center gap-3">
            <PersonIcon className="text-[#f43f5e]" sx={{ fontSize: 20 }} />
            <span className="text-slate-800 text-[14px] font-bold">{guest.name}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end items-center gap-3 rounded-b-xl">
          <button onClick={onClose} className="px-5 py-2 text-[13px] font-bold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-5 py-2.5 rounded-lg bg-[#b91c1c] hover:bg-[#991b1b] text-white text-[13px] font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer">
            <DeleteIcon sx={{ fontSize: 16 }} /> Delete
          </button>
        </div>

      </div>
    </div>
  );
}

export default function CheckInOut() {

  // --- INJECTED MISSING VARIABLES ---
  const [activeTab, setActiveTab] = useState('All');
  
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [checkInData, setCheckInData] = useState([]);
  
  const handleExportCSV = () => {};
  const getStatusBadge = () => <span className="text-xs">Status</span>;
  const handleStatusChange = () => {};
  
  // Use alerts if it exists (OperationsAlerts), else use checkInData (CheckInOut)
      
  
  
  // ----------------------------------
  
  const [guests, setGuests] = useState(initialGuests);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [viewGuest, setViewGuest] = useState(null);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [checkInActionModal, setCheckInActionModal] = useState(null);
  const [checkOutActionModal, setCheckOutActionModal] = useState(null);
  const [editGuest, setEditGuest] = useState(null);
  const [deleteGuest, setDeleteGuest] = useState(null);

  const totalGuests = guests.length;
  const checkedInCount = guests.filter(g => g.status === 'Checked In').length;
  const checkedOutCount = guests.filter(g => g.status === 'Checked Out').length;
  const pendingCount = guests.filter(g => g.status === 'Pending').length;

  const filteredGuests = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return guests;
    return guests.filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.room.toLowerCase().includes(q) ||
      g.id.toLowerCase().includes(q)
    );
  }, [guests, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredGuests.length / rowsPerPage));
  const indexOfFirstRow = (currentPage - 1) * rowsPerPage;
  const indexOfLastRow = indexOfFirstRow + rowsPerPage;
  const currentRows = filteredGuests.slice(indexOfFirstRow, indexOfLastRow);

  const allVisibleSelected = currentRows.length > 0 && currentRows.every(g => selectedIds.includes(g.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(prev => prev.filter(id => !currentRows.some(g => g.id === id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...currentRows.map(g => g.id)])]);
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleCheckIn = (id) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, status: 'Checked In' } : g));
  };

  const handleCheckOut = (id) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, status: 'Checked Out' } : g));
  };

  const handleDelete = (id) => {
    setGuests(prev => prev.filter(g => g.id !== id));
    setSelectedIds(prev => prev.filter(x => x !== id));
  };

  const handleEdit = (guest) => {
    setEditGuest(guest);
  };

  const handleSaveEdit = (form) => {
    setGuests(prev => prev.map(g => g.id === editGuest.id ? { ...g, ...form } : g));
    setEditGuest(null);
  };

  const handleAddGuest = (form) => {
    const nextNum = guests.length ? Math.max(...guests.map(g => parseInt(g.id.split('-')[1], 10))) + 1 : 1001;
    const newGuest = {
      id: `BK-${nextNum}`,
      name: form.name.trim(),
      email: form.email.trim() || `${form.name.trim().toLowerCase().replace(/\s+/g, '.')}@example.com`,
      room: form.room.trim(),
      roomType: form.roomType,
      checkIn: form.checkIn || '—',
      checkOut: form.checkOut || '—',
      status: form.status,
    };
    setGuests(prev => [newGuest, ...prev]);
    setCheckInModalOpen(false);
  };

  return (
    <div className="animate-fade-in pb-8 space-y-4">
      {/* Spacer to replace missing header and maintain consistent gap from breadcrumbs */}
      <div className="h-2"></div>

      {/* Small Compact Cards matching Dashboard.jsx */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {/* Card 1: Check In */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Check In</span>
            <Login className="text-emerald-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-gray-900">
              {checkInData.filter(c => c.status === 'Check In').length}
            </span>
            <span className="text-[10px] text-[#1b7f43] font-medium truncate ml-1">In House</span>
          </div>
        </div>

        {/* Card 2: Check Out */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Check Out</span>
            <Logout className="text-purple-600 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-gray-900">
              {checkInData.filter(c => c.status === 'Check Out').length}
            </span>
            <span className="text-[10px] text-purple-600 font-medium truncate ml-1">Cleared</span>
          </div>
        </div>

        {/* Card 3: Pending */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Pending</span>
            <HourglassEmpty className="text-amber-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-amber-600">
              {checkInData.filter(c => c.status === 'Pending').length}
            </span>
            <span className="text-[10px] text-gray-400 truncate ml-1">Awaiting key</span>
          </div>
        </div>

        {/* Card 4: Reserved */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Reserved</span>
            <BookmarkBorder className="text-blue-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-blue-600">
              {checkInData.filter(c => c.status === 'Reserved').length}
            </span>
            <span className="text-[10px] text-gray-400 truncate ml-1">Confirmed</span>
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f3e8ff] flex items-center justify-center shrink-0">
            <GroupsIcon className="text-[#a855f7]" sx={{ fontSize: 20 }} />
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 font-semibold text-[11px]">Total Guests</span>
            <span className="text-lg font-bold text-gray-900 leading-tight">{totalGuests}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#dcfce7] flex items-center justify-center shrink-0">
            <LoginIcon className="text-[#16a34a]" sx={{ fontSize: 20 }} />
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 font-semibold text-[11px]">Checked In</span>
            <span className="text-lg font-bold text-gray-900 leading-tight">{checkedInCount}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#e0e7ff] flex items-center justify-center shrink-0">
            <LogoutIcon className="text-[#4f46e5]" sx={{ fontSize: 20 }} />
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 font-semibold text-[11px]">Checked Out</span>
            <span className="text-lg font-bold text-gray-900 leading-tight">{checkedOutCount}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fef3c7] flex items-center justify-center shrink-0">
            <PendingActionsIcon className="text-[#d97706]" sx={{ fontSize: 20 }} />
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 font-semibold text-[11px]">Pending</span>
            <span className="text-lg font-bold text-gray-900 leading-tight">{pendingCount}</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col w-full overflow-visible">
        {/* Table Top Controls matching Dashboard table header */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-visible">
          <h3 className="text-gray-800 font-bold text-[14px] lg:text-[15px] whitespace-nowrap">
            Guest Check-In / Check-Out
          </h3>

          <div className="flex flex-row items-center space-x-2 ml-auto">
            {/* Search Bar matching Dashboard.jsx */}
            <div className="relative w-28 md:w-40 xl:w-52 shrink">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" sx={{ fontSize: 16 }} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow truncate"
              />
            </div>

            {/* Segmented Filter Control matching Dashboard.jsx */}
            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shrink-0">
              {['All', 'Check In', 'Check Out', 'Pending', 'Reserved'].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
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
              onClick={handleExportCSV}
              className="flex items-center space-x-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <FileDownload sx={{ fontSize: 14 }} className="text-gray-500" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="inline sm:hidden">CSV</span>
            </button>

            <button className="bg-[var(--primary-main)] hover:brightness-110 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all flex items-center cursor-pointer shrink-0">
              + Express Check-In
            </button>
          </div>
        </div>

        {/* Table Content without horizontal side-scrolling */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-full table-auto">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-2.5 px-3 text-[11px] font-bold text-gray-700 whitespace-nowrap">Room No</th>
                <th className="py-2.5 px-3 text-[11px] font-bold text-gray-700 whitespace-nowrap">Guest Name</th>
                <th className="py-2.5 px-3 text-[11px] font-bold text-gray-700 whitespace-nowrap">Mobile</th>
                <th className="py-2.5 px-3 text-[11px] font-bold text-gray-700 whitespace-nowrap">Check In Time</th>
                <th className="py-2.5 px-3 text-[11px] font-bold text-gray-700 whitespace-nowrap">Check Out Time</th>
                <th className="py-2.5 px-3 text-[11px] font-bold text-gray-700 whitespace-nowrap text-center">Key Card</th>
                <th className="py-2.5 px-3 text-[11px] font-bold text-gray-700 whitespace-nowrap text-center">Status</th>
                <th className="py-2.5 px-2 text-[11px] font-bold text-gray-700 whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.length > 0 ? (
                currentRows.map((row, index) => {
                  const globalIdx = indexOfFirstRow + index;
                  return (
                    <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      {/* Room */}
                      <td className="py-2.5 px-3 font-bold text-[12px] text-gray-800 whitespace-nowrap">
                        {row.room}
                      </td>

                      {/* Guest */}
                      <td className="py-2.5 px-3 font-semibold text-[12px] text-gray-900 whitespace-nowrap">
                        {row.guest}
                      </td>

                      {/* Mobile */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center text-[11px] text-gray-600 font-medium">
                          <Phone className="text-[#1b7f43] mr-1" sx={{ fontSize: 12 }} />
                          {row.mobile}
                        </div>
                      </td>

                      {/* Check-in Time */}
                      <td className="py-2.5 px-3 text-[11px] text-gray-600 whitespace-nowrap">
                        {row.checkInTime}
                      </td>

                      {/* Check-out Time */}
                      <td className="py-2.5 px-3 text-[11px] text-gray-600 whitespace-nowrap">
                        {row.checkOutTime}
                      </td>

                      {/* Key Card Status */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                          row.keyCard === 'Issued' ? 'bg-green-50 text-green-700 border border-green-200' :
                          row.keyCard === 'Returned' ? 'bg-gray-100 text-gray-600' : 
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {row.keyCard}
                        </span>
                      </td>

                      {/* Status: Check In, Check Out, Pending, Reserved */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${getStatusBadge(row.status)}`}>
                          {row.status}
                        </span>
                      </td>

                      {/* Actions with Popup: Check In, Check Out, Edit, Delete */}
                      <td className="py-2.5 px-2 text-center relative whitespace-nowrap">
                        <button 
                          onClick={() => setActionMenuOpen(actionMenuOpen === globalIdx ? null : globalIdx)} 
                          className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                        >
                          <MoreHoriz fontSize="small" />
                        </button>

                        {actionMenuOpen === globalIdx && (
                          <div className="absolute right-4 top-2 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 rounded-xl w-36 z-50 py-1 flex flex-col overflow-hidden animate-fade-in text-left">
                            {/* Check In Action */}
                            <button 
                              onClick={() => handleStatusChange(globalIdx, 'Check In')}
                              className="flex items-center px-3 py-1.5 text-[11px] font-medium text-[#1b7f43] hover:bg-gray-50 cursor-pointer"
                            >
                              <Login className="mr-2 text-[#1b7f43]" sx={{ fontSize: 14 }} /> Check In
                            </button>

                            {/* Check Out Action */}
                            <button 
                              onClick={() => handleStatusChange(globalIdx, 'Check Out')}
                              className="flex items-center px-3 py-1.5 text-[11px] font-medium text-purple-600 hover:bg-gray-50 cursor-pointer"
                            >
                              <Logout className="mr-2 text-purple-600" sx={{ fontSize: 14 }} /> Check Out
                            </button>

                            {/* Edit Action */}
                            <button 
                              onClick={() => {
                                alert(`Edit details for guest: ${row.guest} (Room ${row.room})`);
                                setActionMenuOpen(null);
                              }}
                              className="flex items-center px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              <Edit className="mr-2 text-gray-500" sx={{ fontSize: 14 }} /> Edit
                            </button>

                            {/* Delete Action */}
                            <button 
                              onClick={() => handleDelete(globalIdx)}
                              className="flex items-center px-3 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <Delete className="mr-2 text-red-500" sx={{ fontSize: 14 }} /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500 text-[12px]">
                    No check-in/out records found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
      </div>
      </div>
      </div>
      </div>
      </div>
      </div>
  );
}