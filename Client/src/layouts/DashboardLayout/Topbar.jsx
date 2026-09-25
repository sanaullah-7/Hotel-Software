import React, { useEffect, useState } from 'react';
import AppBreadcrumbs from './AppBreadcrumbs';
import {
  Box,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CommandPalette from './CommandPalette';

const Topbar = () => {
  const navigate = useNavigate();
  // State for profile menu
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const isProfileMenuOpen = Boolean(profileAnchorEl);

  const [profileName, setProfileName] = useState(localStorage.getItem('fullName') || 'Admin');
  const [profileLogo, setProfileLogo] = useState(localStorage.getItem('ownerLogo') || null);

  // Command Palette State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleStorage = () => {
      setProfileName(localStorage.getItem('fullName') || 'Admin');
      setProfileLogo(localStorage.getItem('ownerLogo') || null);
    };

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleProfileClick = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <>
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />

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

        {/* Right side container for Search and Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Global search command palette trigger */}
          <Box sx={{ position: 'relative', width: 260 }}>
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg cursor-pointer transition-colors hover:bg-white hover:border-slate-300 group"
          >
            <div className="flex items-center gap-2 text-slate-400">
              <SearchIcon sx={{ fontSize: 18 }} className="group-hover:text-emerald-500 transition-colors" />
              <span className="text-[13px]">Search rooms, guests, actions...</span>
            </div>
            <div className="flex items-center gap-1 border border-slate-200 bg-slate-100 rounded px-1.5 py-0.5 text-[11px] font-bold text-slate-500">
              ⌘K
            </div>
          </button>
        </Box>

        {/* Right Side: Icons and Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

          {/* Fullscreen Toggle */}
          <IconButton 
            onClick={toggleFullScreen}
            sx={{ color: 'text.secondary', '&:hover': { color: '#16a34a', bgcolor: '#dcfce7' } }}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
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
              src={profileLogo || `https://ui-avatars.com/api/?name=${profileName}&background=random`}
              alt="admin"
              sx={{ width: 32, height: 32 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
              {profileName}
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
      elevation: 3,
      sx: { mt: 0, minWidth: 0, width: 'auto', borderRadius: 2, overflow: 'hidden' },
    }}
    MenuListProps={{
      sx: { py: 0, px: 0, display: 'flex', flexDirection: 'column' },
      disablePadding: true
    }}
  >
    <MenuItem
      onClick={() => { handleProfileClose(); navigate('/settings/hotel-profile'); }}
      sx={{
        py: 0.25,
        px: 1,
        minHeight: 'auto',
        lineHeight: 1.2,
        transition: 'all 0.2s',
        '&:hover': { backgroundColor: '#dcfce7', color: '#16a34a', '& .MuiListItemIcon-root': { color: '#16a34a' } }
      }}
    >
      <ListItemIcon sx={{ minWidth: 24, color: 'text.secondary', transition: 'color 0.2s' }}>
        <PersonIcon sx={{ fontSize: 16 }} />
      </ListItemIcon>
      <span className="text-[13px] font-semibold font-sans leading-tight">Profile</span>
    </MenuItem>
    <MenuItem
      onClick={() => { localStorage.clear(); handleProfileClose(); navigate('/login'); }}
      sx={{
        py: 0.25,
        px: 1,
        minHeight: 'auto',
        lineHeight: 1.2,
        transition: 'all 0.2s',
        '&:hover': { backgroundColor: '#fee2e2', color: '#dc2626', '& .MuiListItemIcon-root': { color: '#dc2626' } }
      }}
    >
      <ListItemIcon sx={{ minWidth: 24, color: 'text.secondary', transition: 'color 0.2s' }}>
        <LogoutIcon sx={{ fontSize: 16 }} />
      </ListItemIcon>
      <span className="text-[13px] font-semibold font-sans leading-tight">Logout</span>
    </MenuItem>
  </Menu>
        </Box>
      </Box>
    </Box>
  </>
  );
};

export default Topbar;
