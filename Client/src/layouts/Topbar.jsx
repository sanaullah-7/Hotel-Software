import React, { useState } from 'react';
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

const Topbar = ({ children }) => {
  // State for profile menu
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const isProfileMenuOpen = Boolean(profileAnchorEl);

  // State for language
  const [language, setLanguage] = useState('en');

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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f3f4f6' }}>
      {/* Top Bar */}
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
        }}
      >
        {/* Left Side: Search */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#f3f4f6',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            width: 350,
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <InputBase
            placeholder="Search rooms, guests, actions..."
            sx={{ flex: 1, fontSize: '0.875rem' }}
          />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#e5e7eb',
              borderRadius: 1,
              px: 1,
              py: 0.5,
              ml: 1,
              color: 'text.secondary',
              fontSize: '0.75rem',
              fontWeight: 'bold',
            }}
          >
            ⌘K
          </Box>
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

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Topbar;
