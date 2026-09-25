const fs = require('fs');
let file = 'src/layouts/DashboardLayout/Topbar.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\{\/\* Profile Dropdown Menu \*\/\}\s*<Menu[\s\S]*?<\/Menu>/;
const newMenu = `{/* Profile Dropdown Menu */}
          <Menu
            anchorEl={profileAnchorEl}
            open={isProfileMenuOpen}
            onClose={handleProfileClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 3,
              sx: { mt: 1, minWidth: 140, borderRadius: 2, overflow: 'hidden' },
            }}
            MenuListProps={{
              sx: { p: 0, display: 'flex', flexDirection: 'column' }
            }}
          >
            <MenuItem 
              onClick={() => { handleProfileClose(); navigate('/settings/hotel-profile'); }}
              sx={{ 
                py: 1.5,
                px: 2,
                transition: 'all 0.2s',
                '&:hover': { backgroundColor: '#dcfce7', color: '#16a34a', '& .MuiListItemIcon-root': { color: '#16a34a' } } 
              }}
            >
                <ListItemIcon sx={{ minWidth: 28, color: 'text.secondary', transition: 'color 0.2s' }}>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <span className="text-[14px] font-semibold font-sans">Profile</span>
              </MenuItem>
            <MenuItem 
              onClick={() => { localStorage.clear(); handleProfileClose(); navigate('/login'); }}
              sx={{ 
                py: 1.5,
                px: 2,
                transition: 'all 0.2s',
                '&:hover': { backgroundColor: '#fee2e2', color: '#dc2626', '& .MuiListItemIcon-root': { color: '#dc2626' } } 
              }}
            >
                <ListItemIcon sx={{ minWidth: 28, color: 'text.secondary', transition: 'color 0.2s' }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <span className="text-[14px] font-semibold font-sans">Logout</span>
              </MenuItem>
          </Menu>`;

content = content.replace(regex, newMenu);
fs.writeFileSync(file, content, 'utf8');
