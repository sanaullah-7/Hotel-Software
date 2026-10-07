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
  Menu as MenuIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CommandPalette from './CommandPalette';

const Topbar = ({ onMobileNavToggle }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  // State for profile menu
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const isProfileMenuOpen = Boolean(profileAnchorEl);

  const [profileName, setProfileName] = useState(user?.fullName || user?.email || 'Admin');
  const [profileLogo, setProfileLogo] = useState(null);

  // Command Palette State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleStorage = () => {
      setProfileName(user?.fullName || user?.email || 'Admin');
      setProfileLogo(null);
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
          px: { xs: 1.5, sm: 2.5 },
          py: 0.5,
          bgcolor: 'white',
          borderBottom: '1px solid #e5e7eb',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            onClick={onMobileNavToggle}
            sx={{ display: { xs: 'flex', md: 'none' }, color: 'text.secondary', p: 0.5 }}
            size="small"
            aria-label="Toggle Navigation"
          >
            <MenuIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <AppBreadcrumbs />
        </Box>

        {/* Right side container for Search and Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Global search command palette trigger */}
          <Box sx={{ position: 'relative', width: { xs: 130, sm: 230 } }}>
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between px-2.5 py-1 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg cursor-pointer transition-colors hover:bg-white hover:border-slate-300 group"
            >
              <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
                <SearchIcon sx={{ fontSize: 16 }} className="group-hover:text-emerald-500 transition-colors shrink-0" />
                <span className="text-[12px] truncate">Search...</span>
              </div>
              <div className="hidden sm:flex items-center gap-0.5 border border-slate-200 bg-slate-100 rounded px-1 py-0.2 text-[10px] font-bold text-slate-500 shrink-0">
                ⌘K
              </div>
            </button>
          </Box>

          {/* Right Side: Icons and Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            {/* Fullscreen Toggle */}
            <IconButton 
              onClick={toggleFullScreen}
              aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
              aria-pressed={isFullscreen}
              size="small"
              sx={{ color: 'text.secondary', '&:hover': { color: '#16a34a', bgcolor: '#dcfce7' } }}
            >
              {isFullscreen ? <FullscreenExitIcon sx={{ fontSize: 18 }} /> : <FullscreenIcon sx={{ fontSize: 18 }} />}
            </IconButton>

            {/* Profile Menu Trigger */}
            <Box
              component="button"
              type="button"
              onClick={handleProfileClick}
              aria-label={`Profile menu for ${profileName}`}
              aria-haspopup="menu"
              aria-expanded={isProfileMenuOpen}
              aria-controls={isProfileMenuOpen ? 'profile-menu' : undefined}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                cursor: 'pointer',
                ml: 0.5,
                border: 0,
                background: 'transparent',
                p: 0,
                font: 'inherit',
                textAlign: 'left',
              }}
            >
              <Avatar
                src={profileLogo || `https://ui-avatars.com/api/?name=${profileName}&background=random`}
                alt="admin"
                sx={{ width: 28, height: 28 }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '12.5px', color: 'text.primary', display: { xs: 'none', sm: 'block' } }}>
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
                id: 'profile-menu',
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
                <span className="text-[12.5px] font-semibold font-sans leading-tight">Profile</span>
              </MenuItem>
              <MenuItem
                onClick={() => { logout(); handleProfileClose(); navigate('/login'); }}
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
                <span className="text-[12.5px] font-semibold font-sans leading-tight">Logout</span>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Topbar;
