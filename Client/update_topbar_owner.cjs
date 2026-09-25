const fs = require('fs');
let file = 'src/layouts/DashboardLayout/Topbar.jsx';
let content = fs.readFileSync(file, 'utf8');

const stateRegex = /const \[profileAnchorEl, setProfileAnchorEl\] = useState\(null\);\n  const isProfileMenuOpen = Boolean\(profileAnchorEl\);/m;
const newStates = `const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const isProfileMenuOpen = Boolean(profileAnchorEl);
  
  const [profileName, setProfileName] = useState(localStorage.getItem('fullName') || 'Admin');
  const [profileLogo, setProfileLogo] = useState(localStorage.getItem('ownerLogo') || null);

  useEffect(() => {
    const handleStorage = () => {
      setProfileName(localStorage.getItem('fullName') || 'Admin');
      setProfileLogo(localStorage.getItem('ownerLogo') || null);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);`;

content = content.replace(stateRegex, newStates);

const avatarRegex = /<Avatar\n\s*src=\{\`https:\/\/ui-avatars\.com\/api\/\?name=\$\{localStorage\.getItem\('fullName'\) \|\| 'Admin'\}&background=random\`\}\n\s*alt="admin"\n\s*sx=\{\{ width: 32, height: 32 \}\}\n\s*\/>\n\s*<Typography variant="body2" sx=\{\{ fontWeight: 500, color: 'text\.primary' \}\}>\n\s*\{localStorage\.getItem\('fullName'\) \|\| 'Admin'\}\n\s*<\/Typography>/m;
const newAvatar = `<Avatar
              src={profileLogo || \`https://ui-avatars.com/api/?name=\${profileName}&background=random\`}
              alt="admin"
              sx={{ width: 32, height: 32 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
              {profileName}
            </Typography>`;

content = content.replace(avatarRegex, newAvatar);

// Ensure useEffect is imported in Topbar.jsx
if (!content.includes('useEffect')) {
  content = content.replace(/import React, \{ useState \} from 'react';/, "import React, { useState, useEffect } from 'react';");
}

fs.writeFileSync(file, content, 'utf8');
