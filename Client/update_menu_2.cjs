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
              sx: { mt: 1, minWidth: 150, borderRadius: 2, overflow: 'hidden' },
            }}
            MenuListProps={{
              sx: { p: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }
            }}
          >
            <MenuItem 
              onClick={() => { handleProfileClose(); navigate('/settings/hotel-profile'); }}
              sx={{ 
                borderRadius: 1,
                py: 1,
                px: 2,
                transition: 'all 0.2s',
                '&:hover': { backgroundColor: '#16a34a', color: 'white', '& .MuiListItemIcon-root': { color: 'white' } } 
              }}
            >
                <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary', transition: 'color 0.2s' }}>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <span className="text-[14px] font-semibold font-sans">Profile</span>
              </MenuItem>
            <MenuItem 
              onClick={() => { localStorage.clear(); handleProfileClose(); navigate('/login'); }}
              sx={{ 
                borderRadius: 1,
                py: 1,
                px: 2,
                transition: 'all 0.2s',
                '&:hover': { backgroundColor: '#dc2626', color: 'white', '& .MuiListItemIcon-root': { color: 'white' } } 
              }}
            >
                <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary', transition: 'color 0.2s' }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <span className="text-[14px] font-semibold font-sans">Logout</span>
              </MenuItem>
          </Menu>`;

content = content.replace(regex, newMenu);
fs.writeFileSync(file, content, 'utf8');
