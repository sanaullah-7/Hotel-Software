import React, { useEffect, useMemo, useState } from 'react';
import AppBreadcrumbs from './AppBreadcrumbs';
import {
  Box,
  InputBase,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  ListItemIcon,
  Select,
} from '@mui/material';
import {
  Search as SearchIcon,
  NotificationsNone as NotificationsIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  SettingsBackupRestore as RestoreIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getRooms as getRoomInventory, ROOM_UPDATED_EVENT } from '../../features/rooms/state/roomStore';
import { getReservations, RESERVATIONS_UPDATED_EVENT } from '../../features/reservations/state/reservationStore';
import { getGuests, GUESTS_UPDATED_EVENT } from '../../features/guests/state/guestStore';
import { getStaff } from '../../features/housekeeping/pages/hkStore';
import { getInventoryItems } from '../../features/inventory/pages/inventoryStore';
import { getMenuItems } from '../../features/restaurant/pages/restaurantStore';

const Topbar = () => {
  const navigate = useNavigate();
  // State for profile menu
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const isProfileMenuOpen = Boolean(profileAnchorEl);

  // State for language
  const [language, setLanguage] = useState('en');
  const [searchTerm, setSearchTerm] = useState('');
  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    const refreshSearchIndex = () => setDataVersion((version) => version + 1);
    const events = [
      'storage',
      ROOM_UPDATED_EVENT,
      RESERVATIONS_UPDATED_EVENT,
      GUESTS_UPDATED_EVENT,
      'hk_update',
      'inventory_update',
      'restaurant_update',
    ];
    events.forEach((eventName) => window.addEventListener(eventName, refreshSearchIndex));
    return () => events.forEach((eventName) => window.removeEventListener(eventName, refreshSearchIndex));
  }, []);

  const searchResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return [];

    const results = [
      ...getRoomInventory().map((room) => ({ type: 'Room', title: `Room ${room.roomNo}`, detail: `${room.roomType} • ${room.status}`, path: '/rooms' })),
      ...getReservations().map((reservation) => ({ type: 'Reservation', title: reservation.name || `Reservation ${reservation.id}`, detail: `Room ${reservation.room || 'unassigned'} • ${reservation.status || 'Booked'}`, path: '/reservation/all' })),
      ...getGuests().map((guest) => ({ type: 'Guest', title: guest.name, detail: `${guest.email} • ${guest.city || 'Guest profile'}`, path: '/guests' })),
      ...getStaff().map((staff) => ({ type: 'Staff', title: staff.name, detail: `Housekeeping • ${staff.status}`, path: '/housekeeping/staff-assignment' })),
      ...getInventoryItems().map((item) => ({ type: 'Inventory', title: item.name, detail: `${item.category || 'Stock'} • Qty ${item.quantity ?? 0}`, path: '/inventory/stock' })),
      ...getMenuItems().map((item) => ({ type: 'Menu', title: item.name, detail: `${item.dietary || 'Menu item'} • ${item.availability}`, path: '/restaurant/menu' })),
    ];

    return results
      .filter((result) => `${result.type} ${result.title} ${result.detail}`.toLowerCase().includes(query))
      .slice(0, 10);
  }, [searchTerm, dataVersion]);

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Escape') setSearchTerm('');
    if (event.key === 'Enter' && searchResults[0]) {
      navigate(searchResults[0].path);
      setSearchTerm('');
    }
  };

  const handleProfileClick = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 1.5,
        bgcolor: 'white',
        borderBottom: '1px solid #e5e7eb',
        flexShrink: 0,
      }}
    >
      <AppBreadcrumbs />

      {/* Global search across hotel operations data */}
      <Box sx={{ position: 'relative', flex: 1, maxWidth: 430, mx: 3 }}>
        <SearchIcon sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 20, zIndex: 1 }} />
        <InputBase
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search rooms, guests, reservations, staff..."
          inputProps={{ 'aria-label': 'Search hotel data' }}
          sx={{
            width: '100%',
            bgcolor: '#f8fafc',
            border: '1px solid #e5e7eb',
            borderRadius: 2,
            px: 1.5,
            pl: 5,
            py: 0.7,
            fontSize: 13,
            '&:focus-within': { borderColor: '#1b7f43', bgcolor: '#fff' },
          }}
        />
        {searchTerm.trim() && (
          <Box sx={{ position: 'absolute', left: 0, right: 0, top: 'calc(100% + 8px)', bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 2, boxShadow: '0 12px 30px rgba(15, 23, 42, 0.14)', zIndex: 20, overflow: 'hidden' }}>
            {searchResults.length ? searchResults.map((result, index) => (
              <Box
                key={`${result.type}-${result.title}-${index}`}
                onClick={() => { navigate(result.path); setSearchTerm(''); }}
                sx={{ px: 1.5, py: 1.1, cursor: 'pointer', '&:hover': { bgcolor: '#f0fdf4' }, borderBottom: index < searchResults.length - 1 ? '1px solid #f1f5f9' : 'none' }}
              >
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#1f2937' }}>{result.title}</Typography>
                <Typography sx={{ fontSize: 11, color: '#6b7280', mt: 0.25 }}>{result.type} • {result.detail}</Typography>
              </Box>
            )) : (
              <Typography sx={{ px: 1.5, py: 1.5, fontSize: 12, color: '#6b7280' }}>No matching hotel data found.</Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Right Side: Icons and Profile */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Language Dropdown */}
        <Select
          value={language}
          onChange={handleLanguageChange}
          variant="standard"
          disableUnderline
          MenuProps={{
            PaperProps: {
              elevation: 3,
              sx: { mt: 1.5, borderRadius: 3, minWidth: 140 },
            },
          }}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                src={`https://flagcdn.com/w40/${selected === 'en' ? 'us' : 'pk'}.png`}
                alt={selected}
                sx={{ width: 24, height: 24 }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#1f2937' }}>
                {selected === 'en' ? 'English' : 'Urdu'}
              </Typography>
            </Box>
          )}
          sx={{
            bgcolor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: 5,
            px: 1.5,
            py: 0.5,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 0,
              pr: '24px !important',
            },
            '& .MuiSelect-icon': {
              right: 8,
              color: '#6b7280',
            },
          }}
        >
          <MenuItem value="en" sx={{ gap: 1.5, py: 1 }}>
            <Avatar
              src="https://flagcdn.com/w40/us.png"
              alt="English"
              sx={{ width: 24, height: 24 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#1f2937' }}>
              English
            </Typography>
          </MenuItem>
          <MenuItem value="ur" sx={{ gap: 1.5, py: 1 }}>
            <Avatar
              src="https://flagcdn.com/w40/pk.png"
              alt="Urdu"
              sx={{ width: 24, height: 24 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#1f2937' }}>
              Urdu
            </Typography>
          </MenuItem>
        </Select>

        {/* Notification Icon */}
        <IconButton size="small">
          <Badge color="success" variant="dot">
            <NotificationsIcon sx={{ color: 'text.secondary' }} />
          </Badge>
        </IconButton>

        {/* Profile Menu Trigger */}
        <Box
          onClick={handleProfileClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            ml: 1,
          }}
        >
          <Avatar
            src="https://i.pravatar.cc/150?u=admin"
            alt="admin"
            sx={{ width: 32, height: 32 }}
          />
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
            admin
          </Typography>
        </Box>

        {/* Profile Dropdown Menu */}
        <Menu
          anchorEl={profileAnchorEl}
          open={isProfileMenuOpen}
          onClose={handleProfileClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 2,
            sx: { mt: 1, minWidth: 200, borderRadius: 2 },
          }}
        >
          <MenuItem onClick={handleProfileClose}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={handleProfileClose}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            Edit profile
          </MenuItem>
          <MenuItem onClick={handleProfileClose}>
            <ListItemIcon>
              <RestoreIcon fontSize="small" />
            </ListItemIcon>
            Restore defaults
          </MenuItem>
          <MenuItem onClick={handleProfileClose}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Topbar;
