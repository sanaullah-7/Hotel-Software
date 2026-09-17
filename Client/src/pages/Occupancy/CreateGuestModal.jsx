import React, { useState } from 'react';
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
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FlagIcon from '@mui/icons-material/Flag';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import StoreIcon from '@mui/icons-material/Store';
import PaymentIcon from '@mui/icons-material/Payment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NotesIcon from '@mui/icons-material/Notes';
import StarIcon from '@mui/icons-material/Star';
import VipIcon from '@mui/icons-material/WorkspacePremium';
import BedIcon from '@mui/icons-material/Bed';
import BookmarkIcon from '@mui/icons-material/BookmarkBorder';

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

  const [formData, setFormData] = React.useState({
    name: '',
    id: '',
    vip: false,
  });

  React.useEffect(() => {
    if (open) {
      setFormData({
        name: room?.guest?.name || '',
        id: room?.guest?.id || '',
        vip: room?.guest?.vip || false,
      });
      setTab(0);
    }
  }, [open, room]);

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
          py: 2,
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
          '& .Mui-selected': { color: '#2e7d32', fontWeight: 600 },
          '& .MuiTabs-indicator': { backgroundColor: '#2e7d32', height: '2px' },
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
              <PersonIcon sx={{ fontSize: 16, color: '#2e7d32' }} />
              <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#1f2937' }}>Personal Details</Typography>
            </Box>

            <TextField
              fullWidth label="Full Name*" size="small" sx={inputSx}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              InputProps={{ endAdornment: <InputAdornment position="end"><BadgeIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment> }}
            />

            <TextField
              fullWidth label="Email Address*" size="small" sx={inputSx}
              defaultValue={room?.guest?.name ? `${room.guest.name.toLowerCase().replace(' ','')}@example.com` : ''}
              InputProps={{ endAdornment: <InputAdornment position="end"><EmailIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment> }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth label="Phone Number*" size="small" sx={inputSx}
                defaultValue={room?.guest?.name ? '+1-555-1234' : ''}
                InputProps={{ endAdornment: <InputAdornment position="end"><PhoneIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment> }}
              />
              <TextField
                fullWidth label="ID Number" size="small" sx={inputSx}
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                InputProps={{ endAdornment: <InputAdornment position="end"><CreditCardIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment> }}
              />
            </Box>

            <TextField
              fullWidth label="Address*" size="small" multiline rows={3} sx={inputSx}
              defaultValue={room?.guest?.name ? '123 Elm Street, Springfield' : ''}
              InputProps={{ endAdornment: <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1 }}><LocationOnIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment> }}
            />

            <TextField
              select label="Nationality" size="small" defaultValue={room?.guest?.name ? 'us' : ''} sx={{ width: '50%', ...inputSx }}
              InputProps={{ endAdornment: <InputAdornment position="end"><FlagIcon sx={{ fontSize: 18, color: '#9ca3af', mr: 2 }} /></InputAdornment> }}
            >
              <MenuItem value="">Select</MenuItem>
              <MenuItem value="pk">Pakistani</MenuItem>
              <MenuItem value="us">American</MenuItem>
              <MenuItem value="uk">British</MenuItem>
              <MenuItem value="ae">Emirati</MenuItem>
              <MenuItem value="in">Indian</MenuItem>
            </TextField>
          </Box>
        )}

        {/* TAB 1: RESERVATION DETAILS */}
        {tab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <BookmarkIcon sx={{ fontSize: 16, color: '#2e7d32' }} />
              <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#1f2937' }}>Booking Information</Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <div className="flex flex-col gap-1 w-full">
                <span className="text-[10px] font-semibold text-gray-500 pl-0.5">
                  Check-in Date*
                </span>
                <TextField
                  fullWidth type="date" size="small"
                  sx={inputSx}
                  InputProps={{ endAdornment: <InputAdornment position="end"><CalendarMonthIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment> }}
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <span className="text-[10px] font-semibold text-gray-500 pl-0.5">
                  Check-out Date*
                </span>
                <TextField
                  fullWidth type="date" size="small"
                  sx={inputSx}
                  InputProps={{ endAdornment: <InputAdornment position="end"><CalendarMonthIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment> }}
                />
              </div>
            </Box>

            <TextField
              fullWidth label="Booking Reference" size="small" defaultValue="BKXZD9TYFE9" sx={inputSx}
              InputProps={{ endAdornment: <InputAdornment position="end"><ConfirmationNumberIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment> }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select fullWidth label="Booking Source" size="small" defaultValue="direct" sx={inputSx}
              >
                <MenuItem value="direct">Direct</MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="agent">Travel Agent</MenuItem>
                <MenuItem value="walkin">Walk-in</MenuItem>
              </TextField>
              <TextField
                select fullWidth label="Payment Status" size="small" defaultValue="pending" sx={inputSx}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="partial">Partial</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </TextField>
            </Box>

            <TextField
              label="Total Amount" size="small" defaultValue="280" type="number"
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
                {[0,1,2].map(i => <Box key={i} sx={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#2e7d32' }} />)}
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#1f2937' }}>Additional Information</Typography>
            </Box>

            <TextField
              fullWidth label="Special Requests" size="small" multiline rows={4} sx={inputSx}
              InputProps={{ endAdornment: <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1 }}><NotesIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment> }}
            />

            <TextField
              label="Loyalty Points" size="small" defaultValue="0" type="number"
              sx={{ width: '45%', ...inputSx }}
              InputProps={{ endAdornment: <InputAdornment position="end"><StarIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment> }}
            />

            <FormControlLabel
              control={<Checkbox size="small" sx={{ color: '#2e7d32', '&.Mui-checked': { color: '#2e7d32' } }} />}
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
          <BedIcon sx={{ fontSize: 16, color: '#2e7d32' }} />
          <Typography sx={{ fontSize: '12px', color: '#2e7d32', fontWeight: 600 }}>{roomLabel}</Typography>
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
              boxShadow: 'none',
              '&:hover': { backgroundColor: '#1b5e20', boxShadow: 'none' }
            }}
          >
            Save Guest Details
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
