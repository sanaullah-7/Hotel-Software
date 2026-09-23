import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CreditCard as CreditCardIcon,
  LocationOn as LocationOnIcon,
  Flag as FlagIcon,
  CalendarMonth as CalendarMonthIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  Store as StoreIcon,
  Payment as PaymentIcon,
  AttachMoney as AttachMoneyIcon,
  Notes as NotesIcon,
  Star as StarIcon,
  WorkspacePremium as VipIcon,
  Bed as BedIcon,
  BookmarkBorder as BookmarkIcon,
} from '@mui/icons-material';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#f8f9ff',
    fontSize: '13px',
  },
  '& .MuiInputLabel-root': { fontSize: '13px' },
};

export default function CreateGuestModal({ open, onClose, onSave, room }) {
  const [tab, setTab] = useState(0);
  const roomLabel = room ? `${room.type} - Room ${room.number}` : '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    id: '',
    address: '',
    nationality: '',
    checkIn: '',
    checkOut: '',
    bookingRef: '',
    bookingSource: 'direct',
    paymentStatus: 'pending',
    totalAmount: '',
    specialRequests: '',
    loyaltyPoints: 0,
    vip: false,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: room?.guest?.name || '',
        email: room?.guest?.email || '',
        phone: room?.guest?.phone || '',
        id: room?.guest?.id || '',
        address: room?.guest?.address || '',
        nationality: room?.guest?.nationality || '',
        checkIn: room?.guest?.checkIn || '',
        checkOut: room?.guest?.checkOut || '',
        bookingRef: room?.guest?.bookingRef || '',
        bookingSource: room?.guest?.bookingSource || 'direct',
        paymentStatus: room?.guest?.paymentStatus || 'pending',
        totalAmount: room?.guest?.totalAmount || '',
        specialRequests: room?.guest?.specialRequests || '',
        loyaltyPoints: room?.guest?.loyaltyPoints || 0,
        vip: room?.guest?.vip || false,
      });
      setTab(0);
    }
  }, [open, room]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    } else {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(92,103,242,0.18)',
        },
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
          px: 3,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PersonIcon sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '16px', lineHeight: 1.2 }}>
              {room?.guest ? 'Edit Guest Details' : 'Add New Guest'}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px' }}>
              {roomLabel}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* TABS */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          px: 2,
          backgroundColor: 'white',
          borderBottom: '1px solid #e8eaf6',
          '& .MuiTab-root': { fontSize: '13px', textTransform: 'none', fontWeight: 500, minWidth: 0, color: '#6b7280', py: 1.5 },
          '& .Mui-selected': { color: '#5c67f2', fontWeight: 600 },
          '& .MuiTabs-indicator': { backgroundColor: '#5c67f2', height: '2px' },
        }}
      >
        <Tab label="Personal Information" />
        <Tab label="Reservation Details" />
        <Tab label="Additional Details" />
      </Tabs>

      <DialogContent sx={{ px: 3, py: 2.5, backgroundColor: '#f5f6ff', minHeight: 380 }}>
        {/* TAB 0: PERSONAL INFORMATION */}
        {tab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <PersonIcon sx={{ fontSize: 16, color: '#5c67f2' }} />
              <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#1f2937' }}>Personal Details</Typography>
            </Box>

            <TextField
              fullWidth label="Full Name*" size="small" sx={inputSx}
              value={formData.name} onChange={handleChange('name')}
              InputProps={{ endAdornment: <InputAdornment position="end"><BadgeIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment> }}
            />

            <TextField
              fullWidth label="Email Address*" size="small" sx={inputSx}
              value={formData.email} onChange={handleChange('email')}
              InputProps={{ endAdornment: <InputAdornment position="end"><EmailIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment> }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth label="Phone Number*" size="small" sx={inputSx}
                value={formData.phone} onChange={handleChange('phone')}
                InputProps={{ endAdornment: <InputAdornment position="end"><PhoneIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment> }}
              />
              <TextField
                fullWidth label="ID Number" size="small" sx={inputSx}
                value={formData.id} onChange={handleChange('id')}
                InputProps={{ endAdornment: <InputAdornment position="end"><CreditCardIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment> }}
              />
            </Box>

            <TextField
              fullWidth label="Address*" size="small" multiline rows={3} sx={inputSx}
              value={formData.address} onChange={handleChange('address')}
              InputProps={{ endAdornment: <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1 }}><LocationOnIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment> }}
            />

            <TextField
              select label="Nationality" size="small" value={formData.nationality} onChange={handleChange('nationality')} sx={{ width: '50%', ...inputSx }}
              InputProps={{ endAdornment: <InputAdornment position="end"><FlagIcon sx={{ fontSize: 18, color: '#9ca3af', mr: 2 }} /></InputAdornment> }}
            >
              <MenuItem value="">Select</MenuItem>
              <MenuItem value="Pakistani">Pakistani</MenuItem>
              <MenuItem value="American">American</MenuItem>
              <MenuItem value="British">British</MenuItem>
              <MenuItem value="Emirati">Emirati</MenuItem>
              <MenuItem value="Indian">Indian</MenuItem>
            </TextField>
          </Box>
        )}

        {/* TAB 1: RESERVATION DETAILS */}
        {tab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <BookmarkIcon sx={{ fontSize: 16, color: '#5c67f2' }} />
              <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#1f2937' }}>Booking Information</Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <div className="flex flex-col gap-1 w-full">
                <span className="text-[10px] font-semibold text-gray-500 pl-0.5">Check-in Date*</span>
                <TextField
                  fullWidth type="date" size="small" sx={inputSx}
                  value={formData.checkIn} onChange={handleChange('checkIn')}
                  InputProps={{ endAdornment: <InputAdornment position="end"><CalendarMonthIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment> }}
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <span className="text-[10px] font-semibold text-gray-500 pl-0.5">Check-out Date*</span>
                <TextField
                  fullWidth type="date" size="small" sx={inputSx}
                  value={formData.checkOut} onChange={handleChange('checkOut')}
                  InputProps={{ endAdornment: <InputAdornment position="end"><CalendarMonthIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment> }}
                />
              </div>
            </Box>

            <TextField
              fullWidth label="Booking Reference" size="small" value={formData.bookingRef} onChange={handleChange('bookingRef')} sx={inputSx}
              InputProps={{ endAdornment: <InputAdornment position="end"><ConfirmationNumberIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment> }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select fullWidth label="Booking Source" size="small" value={formData.bookingSource} onChange={handleChange('bookingSource')} sx={inputSx}
              >
                <MenuItem value="direct">Direct</MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="agent">Travel Agent</MenuItem>
                <MenuItem value="walkin">Walk-in</MenuItem>
              </TextField>
              <TextField
                select fullWidth label="Payment Status" size="small" value={formData.paymentStatus} onChange={handleChange('paymentStatus')} sx={inputSx}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="partial">Partial</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </TextField>
            </Box>

            <TextField
              label="Total Amount" size="small" type="number" value={formData.totalAmount} onChange={handleChange('totalAmount')}
              sx={{ width: '50%', ...inputSx }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: 13, color: '#6b7280' }}>$</Typography></InputAdornment>,
                endAdornment: <InputAdornment position="end"><AttachMoneyIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment>
              }}
            />
          </Box>
        )}

        {/* TAB 2: ADDITIONAL DETAILS */}
        {tab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Box sx={{ display: 'flex', gap: 0.4 }}>
                {[0, 1, 2].map(i => <Box key={i} sx={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#5c67f2' }} />)}
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#1f2937' }}>Additional Information</Typography>
            </Box>

            <TextField
              fullWidth label="Special Requests" size="small" multiline rows={4} sx={inputSx}
              value={formData.specialRequests} onChange={handleChange('specialRequests')}
              InputProps={{ endAdornment: <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1 }}><NotesIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment> }}
            />

            <TextField
              label="Loyalty Points" size="small" type="number" value={formData.loyaltyPoints} onChange={handleChange('loyaltyPoints')}
              sx={{ width: '45%', ...inputSx }}
              InputProps={{ endAdornment: <InputAdornment position="end"><StarIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment> }}
            />

            <FormControlLabel
              control={<Checkbox size="small" checked={formData.vip} onChange={(e) => setFormData({ ...formData, vip: e.target.checked })} sx={{ color: '#5c67f2', '&.Mui-checked': { color: '#5c67f2' } }} />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VipIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                  <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>VIP Guest Status</Typography>
                </Box>
              }
            />
          </Box>
        )}
      </DialogContent>

      {/* FOOTER */}
      <DialogActions
        sx={{
          px: 3,
          py: 1.5,
          borderTop: '1px solid #e8eaf6',
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BedIcon sx={{ fontSize: 16, color: '#5c67f2' }} />
          <Typography sx={{ fontSize: '12px', color: '#5c67f2', fontWeight: 600 }}>{roomLabel}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button
            onClick={onClose}
            size="small"
            startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
            sx={{ textTransform: 'none', fontSize: '13px', color: '#ef4444', fontWeight: 500 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<BadgeIcon sx={{ fontSize: 14 }} />}
            onClick={handleSave}
            sx={{
              textTransform: 'none',
              fontSize: '13px',
              backgroundColor: '#2e7d32',
              color: 'white',
              fontWeight: 500,
              borderRadius: '8px',
              px: 2,
              boxShadow: 'none', '&:hover': { backgroundColor: '#1b5e20', boxShadow: 'none' }
            }}
          >
            Save Guest Details
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
