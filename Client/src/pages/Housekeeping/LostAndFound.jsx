import React, { useState } from 'react';
import { 
  Inventory2Outlined, SearchOutlined, CheckCircleOutlined, DeleteOutlineOutlined,
  LocationOnOutlined, CalendarTodayOutlined, PersonOutlined, EventNoteOutlined, 
  EditOutlined, DeleteOutlined, Close, CardGiftcardOutlined
} from '@mui/icons-material';
import { TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment } from '@mui/material';

const initialItems = [
  {
    id: 1,
    itemName: 'iPhone 13 Charger',
    location: '101',
    status: 'Found',
    foundDate: '2026-02-01',
    finderName: 'John Doe',
    description: 'White color Apple charger'
  },
  {
    id: 2,
    itemName: 'Gold Bracelet',
    location: '205',
    status: 'Returned',
    foundDate: '2026-01-28',
    finderName: 'Jane Smith',
    description: 'Thin gold bracelet'
  },
  {
    id: 3,
    itemName: 'Blue Sunglasses',
    location: 'Pool Area',
    status: 'Found',
    foundDate: '2026-02-02',
    finderName: 'Robert Brown',
    description: 'Ray-Ban sunglasses'
  },
  {
    id: 4,
    itemName: 'Leather Wallet',
    location: 'Lobby',
    status: 'Claimed',
    foundDate: '2026-01-30',
    finderName: 'Maria Garcia',
    description: 'Brown leather wallet with ID cards'
  },
  {
    id: 5,
    itemName: 'Silver Watch',
    location: 'Gym',
    status: 'Found',
    foundDate: '2026-02-05',
    finderName: 'Alice Green',
    description: 'Men\'s silver wristwatch'
  },
  {
    id: 6,
    itemName: 'Black Backpack',
    location: 'Lobby',
    status: 'Claimed',
    foundDate: '2026-02-04',
    finderName: 'David Lee',
    description: 'Contains books and a water bottle'
  },
  {
    id: 7,
    itemName: 'Diamond Ring',
    location: '402',
    status: 'Returned',
    foundDate: '2026-02-01',
    finderName: 'Sarah Connor',
    description: 'Gold ring with small diamond'
  },
  {
    id: 8,
    itemName: 'Winter Coat',
    location: 'Restaurant',
    status: 'Disposed',
    foundDate: '2025-11-20',
    finderName: 'Tom White',
    description: 'Unclaimed over 60 days'
  },
  {
    id: 9,
    itemName: 'Laptop Charger',
    location: 'Conference Room',
    status: 'Found',
    foundDate: '2026-02-06',
    finderName: 'Maria Garcia',
    description: 'Black Dell 65W charger'
  },
  {
    id: 10,
    itemName: 'AirPods Pro',
    location: 'Pool Area',
    status: 'Claimed',
    foundDate: '2026-02-05',
    finderName: 'John Doe',
    description: 'White case with blue cover'
  },
  {
    id: 11,
    itemName: 'Umbrella',
    location: 'Lobby',
    status: 'Returned',
    foundDate: '2026-02-03',
    finderName: 'Alice Green',
    description: 'Large black golf umbrella'
  },
  {
    id: 12,
    itemName: 'Reading Glasses',
    location: 'Restaurant',
    status: 'Found',
    foundDate: '2026-02-07',
    finderName: 'Tom White',
    description: 'Black frame, left on table 12'
  }
];

export default function LostAndFound() {
  const [items, setItems] = useState(initialItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [form, setForm] = useState({
    itemName: '',
    location: '',
    status: 'Found',
    foundDate: '',
    finderName: '',
    description: ''
  });

  // Derived Summary Stats
  const totalCount = items.length;
  const unclaimedCount = items.filter(t => t.status === 'Found').length;
  const claimedReturnedCount = items.filter(t => t.status === 'Claimed' || t.status === 'Returned').length;
  const disposedCount = items.filter(t => t.status === 'Disposed').length;

  const handleOpenNew = () => {
    setEditingId(null);
    setForm({ itemName: '', location: '', status: 'Found', foundDate: '', finderName: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setForm({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      setItems(items.map(t => t.id === editingId ? { ...t, ...form } : t));
    } else {
      setItems([...items, { ...form, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleOpenDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    setItems(items.filter(t => t.id !== itemToDelete.id));
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

    const getStatusBorderColor = (status) => {
    switch (status) {
      case 'Found': return '#3b82f6';
      case 'Returned': return '#16a34a';
      case 'Claimed': return '#ea580c';
      case 'Disposed': return '#64748b';
      default: return '#9ca3af';
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Found': return 'bg-[#eff6ff] text-[#3b82f6]';
      case 'Returned': return 'bg-[#f0fdf4] text-[#16a34a]';
      case 'Claimed': return 'bg-[#fff7ed] text-[#ea580c]';
      case 'Disposed': return 'bg-[#f1f5f9] text-[#64748b]';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const muiInputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      fontSize: '13px',
      color: '#1f2937',
      '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1px' },
      '&:hover fieldset': { borderColor: '#cbd5e1' },
      '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)', borderWidth: '1.5px' },
    },
    '& .MuiInputLabel-root': {
      fontSize: '13px',
      color: '#64748b',
      '&.Mui-focused': { color: 'var(--primary-main)' }
    }
  };

  return (
    <div className="w-full bg-transparent pt-1 flex flex-col gap-1.5">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-gray-800">Lost & Found Management</h1>
        </div>
        <button 
          onClick={handleOpenNew}
          className="bg-[var(--primary-main)] text-white px-2 py-1.5 rounded-md text-[13px] font-bold shadow-sm hover:bg-green-700 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>+</span> Add New Item
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
        
        {/* Total Items */}
        <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#f3e8ff] flex items-center justify-center text-[#9333ea]">
            <Inventory2Outlined />
          </div>
          <div>
            <p className="text-[12px] font-bold text-gray-500">Total Items</p>
            <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{totalCount}</p>
          </div>
        </div>

        {/* Unclaimed */}
        <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#3b82f6]">
            <SearchOutlined />
          </div>
          <div>
            <p className="text-[12px] font-bold text-gray-500">Unclaimed</p>
            <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{unclaimedCount}</p>
          </div>
        </div>

        {/* Claimed / Returned */}
        <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#f0fdf4] flex items-center justify-center text-[#16a34a]">
            <CheckCircleOutlined />
          </div>
          <div>
            <p className="text-[12px] font-bold text-gray-500">Claimed / Returned</p>
            <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{claimedReturnedCount}</p>
          </div>
        </div>

        {/* Disposed / Expired */}
        <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b]">
            <DeleteOutlineOutlined />
          </div>
          <div>
            <p className="text-[12px] font-bold text-gray-500">Disposed / Expired</p>
            <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{disposedCount}</p>
          </div>
        </div>

      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-[6px] shadow-sm border border-gray-100 p-3.5 flex flex-col relative h-fit border-t-[4px]" style={{ borderTopColor: getStatusBorderColor(item.status) }}>
            
            <div className="flex items-start justify-between mb-2.5">
              <div>
                <h3 className="text-[15px] font-bold text-gray-800">{item.itemName}</h3>
                <p className="text-[12px] text-gray-500 mt-1 flex items-center gap-1">
                  <LocationOnOutlined sx={{ fontSize: 14 }} /> Room/Loc: {item.location}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusStyles(item.status)}`}>
                {item.status}
              </span>
            </div>

            <div className="border-t border-gray-50 pt-2.5 space-y-2.5  mt-1">
              
              <div className="flex gap-2.5 items-start">
                <CalendarTodayOutlined className="text-gray-400" sx={{ fontSize: 18 }} />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Found Date</p>
                  <p className="text-[13px] font-bold text-gray-700">{item.foundDate || '-'}</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <PersonOutlined className="text-gray-400" sx={{ fontSize: 18 }} />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Finder</p>
                  <p className="text-[13px] font-bold text-gray-700">
                    {item.finderName || '-'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <EventNoteOutlined className="text-gray-400" sx={{ fontSize: 18 }} />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</p>
                  <p className="text-[13px] font-medium text-gray-500 italic line-clamp-2">
                    {item.description || 'No description available'}
                  </p>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 mt-2.5 pt-2.5 border-t border-gray-50">
              <button onClick={() => handleOpenEdit(item)} className="text-gray-400 hover:text-blue-500 transition-colors cursor-pointer">
                <EditOutlined sx={{ fontSize: 20 }} />
              </button>
              <button onClick={() => handleOpenDelete(item)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                <DeleteOutlined sx={{ fontSize: 20 }} />
              </button>
            </div>
            
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-500 text-[14px]">
            No lost and found items recorded.
          </div>
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[700px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between">
              <h2 className="text-white text-[16px] font-bold">
                {editingId ? `Edit Item: ${form.itemName}` : 'New Lost & Found Item'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
                <Close sx={{ fontSize: 18 }} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                
                <TextField 
                  required 
                  label="Item Name*" 
                  value={form.itemName} 
                  onChange={e => setForm({...form, itemName: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <CardGiftcardOutlined sx={{ fontSize: 18, color: '#64748b' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField 
                  required 
                  label="Location/Room No*" 
                  value={form.location} 
                  onChange={e => setForm({...form, location: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <LocationOnOutlined sx={{ fontSize: 18, color: '#64748b' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField 
                  required
                  type="date" 
                  label="Found Date*" 
                  value={form.foundDate} 
                  onChange={e => setForm({...form, foundDate: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                  InputLabelProps={{ shrink: true }} 
                />

                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Status*</InputLabel>
                  <Select 
                    value={form.status} 
                    label="Status*" 
                    onChange={e => setForm({...form, status: e.target.value})}
                  >
                    <MenuItem value="Found">Found</MenuItem>
                    <MenuItem value="Claimed">Claimed</MenuItem>
                    <MenuItem value="Returned">Returned</MenuItem>
                    <MenuItem value="Disposed">Disposed</MenuItem>
                  </Select>
                </FormControl>

                <div className="md:col-span-2">
                  <TextField 
                    required
                    label="Finder Name*" 
                    value={form.finderName} 
                    onChange={e => setForm({...form, finderName: e.target.value})} 
                    sx={muiInputSx} 
                    size="small" 
                    fullWidth 
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <PersonOutlined sx={{ fontSize: 18, color: '#64748b' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>

                <div className="md:col-span-2">
                  <TextField 
                    label="Description" 
                    value={form.description} 
                    onChange={e => setForm({...form, description: e.target.value})} 
                    sx={muiInputSx} 
                    size="small" 
                    fullWidth 
                    multiline 
                    rows={3} 
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-8">
                <button type="submit" className="px-6 py-2 rounded-full bg-green-50 text-[var(--primary-main)] border border-green-200 font-bold text-[13.5px] hover:bg-green-100 transition-colors cursor-pointer shadow-sm">
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
      {isDeleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[400px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between">
              <h2 className="text-white text-[16px] font-bold">Confirm Delete?</h2>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
                <Close sx={{ fontSize: 18 }} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-[14px] text-gray-700 font-medium">
                Are you sure you want to delete item: {itemToDelete.itemName}?
              </p>
              
              <div className="flex justify-center gap-3 mt-8">
                <button onClick={handleDelete} className="px-6 py-2 rounded-full border border-transparent bg-[#fce7f3] text-[#e11d48] font-bold text-[13.5px] hover:bg-[#fbcfe8] transition-colors cursor-pointer shadow-sm">
                  Delete
                </button>
                <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2 rounded-full bg-green-50 text-[var(--primary-main)] border border-green-200 font-bold text-[13.5px] hover:bg-green-100 transition-colors cursor-pointer shadow-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
