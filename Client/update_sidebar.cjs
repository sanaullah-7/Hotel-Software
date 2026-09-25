const fs = require('fs');

// 1. Update HotelProfile.jsx handleSave
let profile = fs.readFileSync('src/features/settings/pages/HotelProfile.jsx', 'utf8');
profile = profile.replace(
  /const handleSave = \(e\) => \{[\s\S]*?setIsEditing\(false\);\n  \};/,
  `const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('fullName', formData.shayan);
    localStorage.setItem('hotelName', formData.hotelName);
    
    if (ownerLogoPreview && ownerLogoPreview.url) {
      localStorage.setItem('ownerLogo', ownerLogoPreview.url);
    } else {
      localStorage.removeItem('ownerLogo');
    }
    
    if (logoPreview && logoPreview.url) {
      localStorage.setItem('hotelLogo', logoPreview.url);
    } else {
      localStorage.removeItem('hotelLogo');
    }
    
    window.dispatchEvent(new Event('storage'));
    showToast('Hotel profile saved successfully!');
    setIsEditing(false);
  };`
);
fs.writeFileSync('src/features/settings/pages/HotelProfile.jsx', profile, 'utf8');

// 2. Update Sidebar.jsx
let sidebar = fs.readFileSync('src/layouts/DashboardLayout/Sidebar.jsx', 'utf8');

if (!sidebar.includes('hotelLogoState')) {
  // Add state for hotel name and logo
  sidebar = sidebar.replace(
    /const Sidebar = \(\{ isOpen, toggleSidebar \}\) => \{/,
    `const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [hotelNameState, setHotelNameState] = useState(localStorage.getItem('hotelName') || null);
  const [hotelLogoState, setHotelLogoState] = useState(localStorage.getItem('hotelLogo') || null);

  import('react').then(({ useEffect }) => {
    useEffect(() => {
      const handleStorage = () => {
        setHotelNameState(localStorage.getItem('hotelName') || null);
        setHotelLogoState(localStorage.getItem('hotelLogo') || null);
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }, []);
  });`
  );

  // Note: we can't do dynamic import for useEffect nicely like that if it isn't imported.
  // Wait, let's just make sure useEffect is imported.
  if (!sidebar.includes('useEffect')) {
    sidebar = sidebar.replace(/import \{ useState \} from 'react';/, `import { useState, useEffect } from 'react';`);
  }
  
  // Actually let's use standard useEffect if we imported it
  sidebar = sidebar.replace(
    /const Sidebar = \(\{ isOpen, toggleSidebar \}\) => \{/,
    `const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [hotelNameState, setHotelNameState] = useState(localStorage.getItem('hotelName') || null);
  const [hotelLogoState, setHotelLogoState] = useState(localStorage.getItem('hotelLogo') || null);

  useEffect(() => {
    const handleStorage = () => {
      setHotelNameState(localStorage.getItem('hotelName') || null);
      setHotelLogoState(localStorage.getItem('hotelLogo') || null);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);`
  );

  // Replace Logo HTML
  sidebar = sidebar.replace(
    /\{\/\* Logo \*\/\}\n\s*<div className="h-16 flex items-center justify-center border-b border-transparent overflow-hidden mt-2">\n\s*<h1 className="font-bold tracking-wide text-gray-800 whitespace-nowrap transition-all duration-300">[\s\S]*?<\/h1>\n\s*<\/div>/,
    `{/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-transparent overflow-hidden mt-2 px-2 gap-2">
        {hotelLogoState && (
          <img src={hotelLogoState} alt="Logo" className={\`object-contain transition-all duration-300 \${isOpen ? 'w-8 h-8' : 'w-7 h-7'}\`} />
        )}
        <h1 className="font-bold tracking-wide text-gray-800 whitespace-nowrap transition-all duration-300">
          {isOpen ? (
            <span className="text-xl sm:text-2xl">
              {hotelNameState ? (
                <>
                  {hotelNameState.split(' ')[0]}<span className="text-[#1b7f43]">{hotelNameState.split(' ').slice(1).join(' ')}</span>
                </>
              ) : (
                <>Hotel<span className="text-[#1b7f43]">Admin</span></>
              )}
            </span>
          ) : (
            !hotelLogoState && (
              <span className="text-xl text-[#1b7f43]">
                HA
              </span>
            )
          )}
        </h1>
      </div>`
  );

  // Just to be safe, cleanup the dynamic import trick if it was accidentally applied
  sidebar = sidebar.replace(/import\('react'\)\.then\(\(\{ useEffect \}\) => \{[\s\S]*?\}\);\n/, '');

  fs.writeFileSync('src/layouts/DashboardLayout/Sidebar.jsx', sidebar, 'utf8');
}
